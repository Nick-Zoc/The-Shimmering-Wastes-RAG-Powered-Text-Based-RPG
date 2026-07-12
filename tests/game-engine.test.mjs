import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const storage = new Map();
const uiEvents = [];
const classList = { add() {}, remove() {}, toggle() {} };

const UI = new Proxy({}, {
    get(_target, method) {
        if (method === "playRegionTransition") {
            return (_name, _level, callback) => callback();
        }
        return (...args) => uiEvents.push({ method, args });
    }
});

const deterministicMath = Object.create(Math);
deterministicMath.random = () => 0.5;

const context = vm.createContext({
    console,
    UI,
    Math: deterministicMath,
    Date,
    JSON,
    Object,
    Array,
    Number,
    String,
    setTimeout: callback => {
        callback();
        return 1;
    },
    clearTimeout() {},
    requestAnimationFrame() { return 1; },
    cancelAnimationFrame() {},
    localStorage: {
        getItem: key => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, String(value)),
        removeItem: key => storage.delete(key)
    },
    document: {
        body: { classList },
        querySelector: () => null,
        getElementById: () => ({ classList, style: {} })
    },
    window: { innerWidth: 1280, innerHeight: 800 }
});

const dataSource = fs.readFileSync(new URL("../frontend/js/data.js", import.meta.url), "utf8");
const gameSource = fs.readFileSync(new URL("../frontend/js/game.js", import.meta.url), "utf8");
vm.runInContext(`${dataSource}\n${gameSource}\nglobalThis.testApi = { GameEngine, ITEMS, ENEMIES };`, context);

const { GameEngine } = context.testApi;
const bruiser = {
    id: "bruiser",
    avatar: "img/avatar_bruiser.png",
    stats: { maxHp: 65, maxMp: 20, str: 7, def: 4, int: 2, agi: 3 }
};

GameEngine.startNewGame("Mara", bruiser);
let state = GameEngine.getState();
assert.equal(state.playerName, "Mara");
assert.equal(state.buildId, "bruiser");
assert.equal(state.maxHp, 75, "equipped padded clothing contributes to maximum HP");
assert.equal(state.hp, state.maxHp);

assert.equal(GameEngine.saveGame(1, { silent: true }), true);
GameEngine.processChoice("buy_potion");
state = GameEngine.getState();
assert.equal(state.coins, 20);
assert.equal(state.inventory.find(item => item.id === "healing_potion").qty, 3);

GameEngine.processChoice("buy_mana");
state = GameEngine.getState();
assert.equal(state.coins, 5);
assert.equal(state.inventory.find(item => item.id === "mana_vial").qty, 1);

GameEngine.processChoice("buy_potion");
state = GameEngine.getState();
assert.equal(state.coins, 5, "an unaffordable purchase does not create negative currency");
assert.equal(state.inventory.find(item => item.id === "healing_potion").qty, 3);

assert.equal(GameEngine.loadGame(1), true);
state = GameEngine.getState();
assert.equal(state.coins, 30);
assert.equal(state.inventory.find(item => item.id === "healing_potion").qty, 2);

GameEngine.processChoice("leave_bastion");
state = GameEngine.getState();
assert.equal(state.currentRegion, "ash_plains");
assert.equal(state.combatActive, true);
assert.equal(state.currentEnemy, "ash_hound");

const hpBeforeGuard = state.hp;
GameEngine.useAbility("guard");
state = GameEngine.getState();
assert.ok(state.hp < hpBeforeGuard, "the enemy still acts against a guarded player");
assert.ok(hpBeforeGuard - state.hp <= 3, "guard materially reduces incoming damage");
assert.equal(state.combatResolving, false);

for (let turn = 0; turn < 8 && GameEngine.getState().combatActive; turn++) {
    GameEngine.useAbility("strike");
}
state = GameEngine.getState();
assert.equal(state.combatActive, false, "dynamic combat reaches victory without scripted combat scenarios");
assert.equal(state.currentEnemy, null);
assert.ok(state.exp >= 25);
assert.ok(state.inventory.some(item => item.id === "scrap_metal"));

assert.equal(GameEngine.autoSave(), true);
const autosave = GameEngine.getSaveSlots().find(slot => slot.id === "auto");
assert.equal(autosave.filled, true);
assert.equal(autosave.playerName, "Mara");

const legacy = JSON.parse(storage.get("tsw_save_auto"));
legacy.schemaVersion = 1;
delete legacy.state.baseMaxHp;
delete legacy.state.baseMaxMp;
legacy.state.playerAvatar = "https://example.invalid/tracker.png";
legacy.state.currentRegion = "missing_region";
legacy.state.timePhase = 99;
legacy.state.inventory.push({ id: "missing_item", qty: 99 });
storage.set("tsw_save_2", JSON.stringify(legacy));
assert.equal(GameEngine.loadGame(2), true);
state = GameEngine.getState();
assert.equal(state.playerAvatar, "img/avatar_bruiser.png");
assert.equal(state.currentRegion, "last_bastion");
assert.equal(state.timePhase, 3);
assert.equal(state.maxHp, 75, "legacy maximum HP is normalized without double-counting equipment");
assert.equal(state.inventory.some(item => item.id === "missing_item"), false);

const fleeSave = JSON.parse(storage.get("tsw_save_auto"));
fleeSave.state.currentRegion = "ash_plains";
fleeSave.state.combatActive = true;
fleeSave.state.currentEnemy = "ash_hound";
fleeSave.state.currentEnemyHp = 30;
fleeSave.state.agi = 20;
storage.set("tsw_save_3", JSON.stringify(fleeSave));
assert.equal(GameEngine.loadGame(3), true);
GameEngine.processChoice("combat_flee");
state = GameEngine.getState();
assert.equal(state.combatActive, false, "high-agility flee resolves through the deterministic combat path");
assert.equal(state.currentEnemy, null);
assert.equal(state.currentRegion, "ash_plains");

const deathSave = JSON.parse(storage.get("tsw_save_auto"));
deathSave.state.currentRegion = "ash_plains";
deathSave.state.combatActive = true;
deathSave.state.currentEnemy = "wastes_colossus";
deathSave.state.currentEnemyHp = 300;
deathSave.state.hp = 1;
deathSave.state.coins = 100;
deathSave.state.day = 7;
storage.set("tsw_save_4", JSON.stringify(deathSave));
assert.equal(GameEngine.loadGame(4), true);
GameEngine.useAbility("guard");
state = GameEngine.getState();
assert.equal(state.combatActive, false, "lethal enemy response ends combat immediately");
assert.equal(state.currentRegion, "last_bastion");
assert.equal(state.day, 8);
assert.equal(state.coins, 80, "death applies the documented twenty-percent carried-coin loss");
assert.equal(state.hp, Math.floor(state.maxHp * 0.5));

console.log("game-engine.test.mjs: all assertions passed");
