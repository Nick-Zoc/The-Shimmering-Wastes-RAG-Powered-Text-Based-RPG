// ============================================================
// THE SHIMMERING WASTES — Game Engine v3.0
// V3 Flow: VN Intro -> Character Creation -> Start Game
// Slash VFX, proper region transitions
// ============================================================

const GameEngine = (() => {
    const SAVE_SCHEMA_VERSION = 2;
    const ACTION_COSTS = {
        buy_potion: 10,
        buy_mana: 15,
        heal_elara: 25
    };
    // ---- Player State ----
    let state = {
        saveSchemaVersion: SAVE_SCHEMA_VERSION,
        playerName: "The Scrapper",
        buildId: "survivor",
        playerAvatar: "img/avatar_survivor.png",
        level: 1,
        hp: 50,
        maxHp: 50,
        baseMaxHp: 50,
        mp: 30,
        maxMp: 30,
        baseMaxMp: 30,
        exp: 0,
        expToLevel: 100,
        str: 5,
        def: 3,
        int: 4,
        agi: 4,
        coins: 30,
        statPoints: 0,
        timePhase: 0,       // 0=Morning, 1=Afternoon, 2=Evening, 3=Night
        day: 1,
        combatActive: false,
        currentEnemy: null,
        currentEnemyHp: 0,
        combatResolving: false,
        guarding: false,
        currentRegion: "last_bastion",
        inventory: [
            { id: "healing_potion", qty: 2 }
        ],
        equipment: {
            head: null,
            chest: "padded_clothing",
            main_hand: "rusted_pipe",
            off_hand: null,
            accessory: null
        },
        dynamicItems: {},
        cooldowns: {},
        gameStarted: false
    };

    // Initialize systems without entering the world yet
    function init() {
        applyTimeTheme();
        ParticleEngine.init();
    }

    // Launch game from VN Intro
    function startNewGame(playerName, buildData) {
        state.playerName = playerName || "The Scrapper";
        state.gameStarted = true;

        if (buildData) {
            state.buildId = buildData.id;
            state.playerAvatar = buildData.avatar;
            state.str = buildData.stats.str;
            state.def = buildData.stats.def;
            state.int = buildData.stats.int;
            state.agi = buildData.stats.agi;
            state.baseMaxHp = buildData.stats.maxHp;
            state.baseMaxMp = buildData.stats.maxMp;
        }

        syncDerivedResources({ restore: true });

        UI.updateHUD(state);
        UI.updateLocation(REGIONS[state.currentRegion]);
        UI.addNarrative(INTRO_NARRATIVE, "gm");

        setTimeout(() => {
            UI.showChoices([
                { id: "explore_bastion", text: "Explore the Bastion", icon: "fa-magnifying-glass" },
                { id: "leave_bastion", text: "Head to the Ash Plains", icon: "fa-person-walking" },
                { id: "check_stats", text: "Check your stats", icon: "fa-clipboard-list" }
            ]);
        }, 800);
    }

    function getExplicitRegionChange(choiceId) {
        if (choiceId === "leave_bastion" || choiceId === "explore_ash") return "ash_plains";
        if (choiceId === "return_bastion" || choiceId === "explore_bastion" || choiceId === "talk_silas" || choiceId === "talk_elara" || choiceId === "walk_away") {
            return "last_bastion";
        }
        return null;
    }

    // ---- Process a Choice ----
    function processChoice(choiceId) {
        if (choiceId === "combat_flee") {
            attemptFlee();
            return;
        }

        if (choiceId === "check_stats") {
            UI.openStatsModal();
            return;
        }

        const scenario = MOCK_SCENARIOS[choiceId];
        if (!scenario && !choiceId.startsWith("sell_")) {
            UI.addNarrative("<em>The Wastes offer no response to that action... Try something else.</em>", "gm");
            return;
        }

        // Handle sell actions
        if (choiceId.startsWith("sell_")) {
            handleSellAction(choiceId);
            return;
        }

        const cost = ACTION_COSTS[choiceId];
        if (cost && state.coins < cost) {
            UI.showToast(`Need ${cost} coins`, "warning", "fa-coins");
            UI.addNarrative(`You count your coins. You need <strong>${cost}</strong>, but only have <strong>${state.coins}</strong>.`, "gm");
            return;
        }

        if (choiceId === "heal_elara" && state.hp === state.maxHp && state.mp === state.maxMp) {
            UI.showToast("You are already fully restored", "info", "fa-heart-pulse");
            return;
        }

        // Show player's choice as a message
        const choiceText = document.querySelector(`.choice-btn[data-choice="${choiceId}"] span`);
        if (choiceText) {
            UI.addNarrative(choiceText.textContent, "player");
        }

        UI.disableChoices();
        UI.showTypingIndicator();

        const delay = 600 + Math.random() * 800;
        setTimeout(() => {
            UI.hideTypingIndicator();

            let targetRegionKey = getExplicitRegionChange(choiceId);
            let needsTransition = targetRegionKey && targetRegionKey !== state.currentRegion;

            if (needsTransition) {
                const targetRegion = REGIONS[targetRegionKey];
                UI.playRegionTransition(targetRegion.name, targetRegion.levelRange, () => {
                    applyStateUpdates(scenario.stateUpdates);
                    state.currentRegion = targetRegionKey; // Update after transition
                    UI.updateLocation(REGIONS[state.currentRegion]);
                    UI.addNarrative(scenario.narrative, "gm");
                });
            } else {
                if (scenario.stateUpdates) {
                    applyStateUpdates(scenario.stateUpdates);
                }
                UI.addNarrative(scenario.narrative, "gm");
            }

            if (scenario.triggerSellMenu) {
                setTimeout(() => showSellChoices(), 600);
            } else {
                const choiceDelay = needsTransition ? 2000 : 400;
                setTimeout(() => {
                    if (scenario.choices) {
                        UI.showChoices(scenario.choices);
                        if (state.combatActive) {
                            UI.showTurnIndicator(true);
                        } else {
                            UI.hideTurnIndicator();
                        }
                    }
                }, choiceDelay);
            }

            if (scenario.stateUpdates && scenario.stateUpdates.openStats) {
                setTimeout(() => UI.openStatsModal(), 600);
            }
        }, delay);
    }

    // ---- Dynamic Ability Combat Loop ----
    function useAbility(abilityId) {
        if (!state.combatActive || !state.currentEnemy || state.combatResolving) return;

        const ability = ABILITIES[abilityId];
        if (!ability) return;

        if (state.mp < ability.mpCost) {
            UI.showToast("Not enough MP!", "danger", "fa-droplet-slash");
            return;
        }

        if (state.cooldowns && state.cooldowns[abilityId] > 0) {
            UI.showToast(`${ability.name} is cooling down`, "warning", "fa-hourglass-half");
            return;
        }

        if (ability.type === "heal" && state.hp >= state.maxHp) {
            UI.showToast("HP is already full", "info", "fa-heart");
            return;
        }

        if (!state.cooldowns) state.cooldowns = {};
        state.combatResolving = true;
        UI.disableChoices();
        UI.showTurnIndicator(true);
        UI.addNarrative(ability.name, "player");

        state.mp -= ability.mpCost;
        state.cooldowns[abilityId] = ability.cooldown > 0 ? ability.cooldown + 1 : 0;

        const derived = getDerivedStats();
        let narrativeText = "";
        const enemy = ENEMIES[state.currentEnemy];

        if (ability.type === "physical" || ability.type === "magical") {
            const isCrit = Math.random() < derived.critChance;
            const evadeChance = 0.05; // Mock enemy evade
            if (Math.random() < evadeChance) {
                narrativeText = `You use <strong>${ability.name}</strong>, but the ${enemy.name} <strong class="text-warning">DODGES</strong> the attack!`;
                UI.showFloatingNumber("MISS", "damage");
            } else {
                if (ability.type === "physical") {
                    const min = derived.atkMin * ability.multiplier;
                    const max = derived.atkMax * ability.multiplier;
                    let dmg = Math.floor(Math.random() * (max - min + 1)) + min;
                    if (isCrit) dmg = Math.floor(dmg * 1.5);
                    const actualDmg = Math.max(1, dmg - enemy.defense);
                    state.currentEnemyHp = Math.max(0, state.currentEnemyHp - actualDmg);

                    narrativeText = `You drive <strong>${ability.name}</strong> into the ${enemy.name} for <strong class="text-success">${actualDmg} physical damage</strong>${isCrit ? " — critical hit." : "."}`;
                    UI.showSlashAnimation();
                    if (isCrit) UI.showFloatingNumber("CRIT!", "heal");
                    else UI.showFloatingNumber(actualDmg.toString(), "damage");
                } else {
                    const min = derived.matkMin * ability.multiplier;
                    const max = derived.matkMax * ability.multiplier;
                    let dmg = Math.floor(Math.random() * (max - min + 1)) + min;
                    if (isCrit) dmg = Math.floor(dmg * 1.5);
                    const actualDmg = Math.max(1, dmg);
                    state.currentEnemyHp = Math.max(0, state.currentEnemyHp - actualDmg);

                    narrativeText = `<strong>${ability.name}</strong> fractures the air and hits the ${enemy.name} for <strong class="text-info">${actualDmg} magical damage</strong>${isCrit ? " — critical hit." : "."}`;
                    UI.showManaBoltAnimation();
                    if (isCrit) UI.showFloatingNumber("CRIT!", "heal");
                    else UI.showFloatingNumber(actualDmg.toString(), "damage");
                }
            }
            UI.updateEnemyHp(state.currentEnemyHp, enemy.maxHp);
        } else if (ability.type === "heal") {
            const heal = ability.healAmount;
            const actualHeal = Math.min(heal, state.maxHp - state.hp);
            state.hp += actualHeal;
            narrativeText = `You use <strong>${ability.name}</strong>, restoring <strong class="text-success">${actualHeal} HP</strong>.`;
            UI.showFloatingNumber(`+${actualHeal}`, "heal");
        } else if (ability.type === "defend") {
            state.guarding = true;
            narrativeText = "You brace behind your gear and watch for the next strike. Incoming damage is reduced this round.";
        }

        UI.addNarrative(narrativeText, "gm");
        UI.updateHUD(state);

        if (state.currentEnemyHp <= 0) {
            resolveVictory(enemy);
        } else {
            resolveEnemyTurn(enemy);
        }
    }

    function tickCooldowns() {
        Object.keys(state.cooldowns).forEach(key => {
            state.cooldowns[key] = Math.max(0, state.cooldowns[key] - 1);
        });
    }

    function resolveEnemyTurn(enemy) {
        UI.showTurnIndicator(false);

        setTimeout(() => {
            tickCooldowns();
            const derived = getDerivedStats();
            const isCrit = Math.random() < 0.1;

            if (Math.random() < derived.evadeChance) {
                UI.addNarrative(`The <strong>${enemy.name}</strong> lunges, but you slip clear of the strike.`, "gm");
                UI.showFloatingNumber("DODGED", "heal");
            } else {
                let baseDmg = enemy.attack || 5;
                if (isCrit) baseDmg = Math.floor(baseDmg * 1.5);

                const defenseMultiplier = (100 - derived.drPercent) / 100;
                const guardMultiplier = state.guarding ? 0.45 : 1;
                const finalDmg = Math.max(1, Math.floor(baseDmg * defenseMultiplier * guardMultiplier));

                state.hp = Math.max(0, state.hp - finalDmg);
                UI.flashDamage();
                UI.addNarrative(`The <strong>${enemy.name}</strong> hits for <strong class="text-danger">${finalDmg} damage</strong>${state.guarding ? " through your guard" : ""}${isCrit ? " — a critical hit." : "."}`, "gm");
                UI.showFloatingNumber(`-${finalDmg}`, "damage");
            }

            state.guarding = false;
            UI.updateHUD(state);

            if (state.hp <= 0) {
                state.combatResolving = false;
                setTimeout(handleDeath, 700);
                return;
            }

            state.combatResolving = false;
            setTimeout(() => {
                UI.showTurnIndicator(true);
                UI.updateHotbar(state);
                UI.showChoices([{ id: "combat_flee", text: "Attempt to flee", icon: "fa-person-running" }]);
            }, 350);
        }, 850);
    }

    function resolveVictory(enemy) {
        setTimeout(() => {
            const exp = enemy.expReward || 0;
            const reward = enemy.coinReward || { min: 0, max: 0 };
            const coins = Math.floor(Math.random() * (reward.max - reward.min + 1)) + reward.min;

            state.exp += exp;
            state.coins += coins;
            if (enemy.lootItemId) addItemToInventory(enemy.lootItemId, true);
            state.combatActive = false;
            state.combatResolving = false;
            state.currentEnemy = null;
            state.currentEnemyHp = 0;
            advanceTime();
            checkLevelUp();

            const lootText = enemy.lootItemId && ITEMS[enemy.lootItemId]
                ? ` You recover <strong>${ITEMS[enemy.lootItemId].name}</strong>.`
                : "";
            UI.addNarrative(`<strong class="text-success">Encounter cleared.</strong> The ${enemy.name} falls. You gain <strong>${exp} EXP</strong> and <strong>${coins} coins</strong>.${lootText}`, "gm");
            UI.hideEnemyPanel();
            UI.hideTurnIndicator();
            UI.updateHUD(state);
            UI.showChoices([
                { id: "explore_ash", text: "Push deeper into the Ash Plains", icon: "fa-compass" },
                { id: "return_bastion", text: "Return to the Last Bastion", icon: "fa-house" }
            ]);
        }, 650);
    }

    function attemptFlee() {
        if (!state.combatActive || !state.currentEnemy || state.combatResolving) return;

        const enemy = ENEMIES[state.currentEnemy];
        const fleeChance = Math.min(0.85, 0.25 + getDerivedStats().totalAgi * 0.06);
        state.combatResolving = true;
        UI.disableChoices();
        UI.addNarrative("Attempt to flee", "player");

        if (Math.random() < fleeChance) {
            state.combatActive = false;
            state.combatResolving = false;
            state.currentEnemy = null;
            state.currentEnemyHp = 0;
            advanceTime();
            UI.hideEnemyPanel();
            UI.hideTurnIndicator();
            UI.updateHUD(state);
            UI.addNarrative(`You break the ${enemy.name}'s line of sight and retreat across the ash.`, "gm");
            UI.showChoices([
                { id: "return_bastion", text: "Return to the Last Bastion", icon: "fa-house" },
                { id: "explore_ash", text: "Regroup and keep exploring", icon: "fa-compass" }
            ]);
            return;
        }

        UI.addNarrative(`The ${enemy.name} cuts off your escape.`, "gm");
        resolveEnemyTurn(enemy);
    }

    // ---- Apply state updates from scenario ----
    function applyStateUpdates(updates) {
        if (!updates) return;

        if (updates.hp_change) {
            state.hp = Math.max(0, Math.min(state.maxHp, state.hp + updates.hp_change));
            if (updates.hp_change < 0) {
                UI.flashDamage();
                UI.showToast(`${updates.hp_change} HP`, "danger", "fa-heart-crack");
                UI.showFloatingNumber(`${updates.hp_change}`, "damage");
            } else {
                UI.showFloatingNumber(`+${updates.hp_change}`, "heal");
            }
        }

        if (updates.mana_change) {
            state.mp = Math.max(0, Math.min(state.maxMp, state.mp + updates.mana_change));
            if (updates.mana_change < 0) {
                UI.showToast(`${updates.mana_change} MP`, "warning", "fa-droplet");
            }
        }

        if (updates.exp_change) {
            state.exp += updates.exp_change;
            UI.showToast(`+${updates.exp_change} EXP`, "success", "fa-star");
            UI.showFloatingNumber(`+${updates.exp_change} XP`, "xp");
            checkLevelUp();
        }

        if (updates.coins_change) {
            state.coins = Math.max(0, state.coins + updates.coins_change);
            if (updates.coins_change > 0) {
                UI.showToast(`+${updates.coins_change} Coins`, "success", "fa-coins");
                UI.showFloatingNumber(`+${updates.coins_change}`, "coins");
            } else {
                UI.showToast(`${updates.coins_change} Coins`, "warning", "fa-coins");
            }
        }

        if (updates.full_heal) {
            state.hp = state.maxHp;
            state.mp = state.maxMp;
            UI.showToast("Fully healed!", "success", "fa-heart-pulse");
        }

        if (updates.addItem) {
            addItemToInventory(updates.addItem, true);
        }

        // Combat state
        if (updates.combat_active !== undefined) {
            state.combatActive = updates.combat_active;
            if (updates.combat_active && updates.current_enemy) {
                const enemy = ENEMIES[updates.current_enemy];
                state.currentEnemy = updates.current_enemy;
                state.currentEnemyHp = enemy.hp;
                state.combatResolving = false;
                state.guarding = false;
                UI.showEnemyPanel(enemy);
            }
        }

        if (updates.combat_active === false) {
            state.currentEnemy = null;
            state.currentEnemyHp = 0;
            state.combatResolving = false;
            state.guarding = false;
            UI.hideEnemyPanel();
            UI.hideTurnIndicator();
        }

        if (updates.current_enemy === null) {
            state.currentEnemy = null;
            UI.hideEnemyPanel();
        }

        if (updates.time_advanced) advanceTime();
        if (state.hp <= 0) handleDeath();

        UI.updateHUD(state);
    }

    // ---- Time Management + Dynamic Theme ----
    function advanceTime() {
        state.timePhase++;
        if (state.timePhase > 3) {
            state.timePhase = 0;
            state.day++;
            // Rest bonus
            state.hp = Math.min(state.maxHp, state.hp + 5);
            state.mp = Math.min(state.maxMp, state.mp + 3);
            UI.showToast(`Day ${state.day} — Rest bonus: +5 HP, +3 MP`, "success", "fa-sun");
        }
        applyTimeTheme();
    }

    function applyTimeTheme() {
        const body = document.body;
        body.classList.remove("time-morning", "time-afternoon", "time-evening", "time-night");
        const timeClasses = ["time-morning", "time-afternoon", "time-evening", "time-night"];
        body.classList.add(timeClasses[state.timePhase]);
        ParticleEngine.setTimePhase(state.timePhase); // Need global access to ParticleEngine
    }

    // ---- Level Up ----
    function checkLevelUp() {
        while (state.exp >= state.expToLevel) {
            state.exp -= state.expToLevel;
            state.level++;
            state.statPoints += 3;
            state.expToLevel = Math.floor(state.expToLevel * 1.3);

            state.baseMaxHp += 5;
            state.baseMaxMp += 3;

            state.str += 1;
            state.def += 1;
            state.int += 1;
            state.agi += 1;

            syncDerivedResources({ restore: true });

            UI.showLevelUpOverlay(state.level);
        }
    }

    // ---- Death ----
    function handleDeath() {
        state.hp = Math.floor(state.maxHp * 0.5);
        state.mp = Math.floor(state.maxMp * 0.3);
        state.coins = Math.max(0, state.coins - Math.floor(state.coins * 0.2));
        state.combatActive = false;
        state.combatResolving = false;
        state.guarding = false;
        state.currentEnemy = null;
        state.currentEnemyHp = 0;
        state.timePhase = 0;
        state.day++;
        state.currentRegion = "last_bastion";
        UI.hideEnemyPanel();
        UI.hideTurnIndicator();
        UI.updateLocation(REGIONS.last_bastion);
        applyTimeTheme();

        setTimeout(() => {
            UI.addNarrative(`<strong class="text-danger">You fall to the ground. Everything goes dark...</strong>

You wake up back in the Last Bastion. Elara stands over you, her healing marks slowly fading. <em>"You're lucky someone carried you back inside. You lost some coins... and some pride. Get some rest."</em>

It is now <strong>Morning of Day ${state.day}</strong>.`, "gm");
            UI.showChoices([
                { id: "explore_bastion", text: "Look around the Bastion", icon: "fa-magnifying-glass" },
                { id: "talk_elara", text: "Thank Elara", icon: "fa-hand-holding-medical" }
            ]);
        }, 500);
    }

    // ---- Inventory & Loot Engine ----
    const AFFIXES = {
        "of the Bear": { str: 2, hp: 10, rarityBump: true },
        "of the Owl": { int: 2, mp: 10, rarityBump: true },
        "of the Fox": { agi: 2, rarityBump: true },
        "of the Turtle": { def: 2, rarityBump: true },
        "Heavy": { str: 1, def: 1, rarityBump: false },
        "Sharpened": { str: 2, rarityBump: false },
        "Glowing": { int: 1, mp: 5, rarityBump: false }
    };

    function generateAffixedItem(baseItemId) {
        const baseItem = ITEMS[baseItemId];
        if (!baseItem || baseItem.type !== "equipment") return baseItemId;

        // 40% chance to drop with an affix
        if (Math.random() > 0.4) return baseItemId;

        const affixNames = Object.keys(AFFIXES);
        const randomAffix = affixNames[Math.floor(Math.random() * affixNames.length)];
        const affixStats = AFFIXES[randomAffix];

        const isPrefix = ["Heavy", "Sharpened", "Glowing"].includes(randomAffix);
        const newName = isPrefix ? `${randomAffix} ${baseItem.name}` : `${baseItem.name} ${randomAffix}`;
        const newId = `${baseItemId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const newItem = JSON.parse(JSON.stringify(baseItem));
        newItem.name = newName;
        newItem.id = newId;
        newItem.isDynamic = true;
        newItem.baseId = baseItemId;

        if (!newItem.bonusStat) newItem.bonusStat = {};
        for (const [stat, val] of Object.entries(affixStats)) {
            if (stat === 'rarityBump') {
                if (val && newItem.rarity === "common") newItem.rarity = "uncommon";
                else if (val && newItem.rarity === "uncommon") newItem.rarity = "rare";
                continue;
            }
            newItem.bonusStat[stat] = (newItem.bonusStat[stat] || 0) + val;
        }

        if (newItem.sellPrice) {
            newItem.sellPrice.min = Math.floor(newItem.sellPrice.min * 1.5);
            newItem.sellPrice.max = Math.floor(newItem.sellPrice.max * 1.5);
        } else {
            newItem.sellPrice = { min: 10, max: 20 };
        }

        state.dynamicItems[newId] = newItem;
        ITEMS[newId] = newItem;

        return newId;
    }

    function addItemToInventory(itemId, rollAffix = false) {
        let finalItemId = itemId;
        const itemTemplate = ITEMS[itemId];

        // Affixes are rolled only when a new loot instance enters the inventory.
        if (rollAffix && itemTemplate && itemTemplate.type === "equipment" && !itemTemplate.isDynamic) {
            finalItemId = generateAffixedItem(itemId);
        }

        const existing = state.inventory.find(i => i.id === finalItemId);
        if (existing) {
            existing.qty++;
        } else {
            state.inventory.push({ id: finalItemId, qty: 1 });
        }
    }

    function useItem(itemId) {
        const slot = state.inventory.find(i => i.id === itemId);
        if (!slot || slot.qty <= 0) return false;

        const item = ITEMS[itemId];
        if (!item || item.type !== "consumable") return false;

        const canRestoreHp = item.effect.hp && state.hp < state.maxHp;
        const canRestoreMp = item.effect.mp && state.mp < state.maxMp;
        if (!canRestoreHp && !canRestoreMp) {
            UI.showToast("That item would have no effect", "info", item.icon);
            return false;
        }

        if (canRestoreHp) {
            const restored = Math.min(item.effect.hp, state.maxHp - state.hp);
            state.hp += restored;
            UI.showToast(`+${restored} HP`, "success", "fa-heart");
            UI.showFloatingNumber(`+${restored}`, "heal");
        }
        if (canRestoreMp) {
            const restored = Math.min(item.effect.mp, state.maxMp - state.mp);
            state.mp += restored;
            UI.showToast(`+${restored} MP`, "success", "fa-droplet");
        }

        slot.qty--;
        if (slot.qty <= 0) {
            state.inventory = state.inventory.filter(i => i.id !== itemId);
        }

        UI.updateHUD(state);
        UI.updateInventoryModal(state);

        if (state.combatActive && state.currentEnemy && !state.combatResolving) {
            state.combatResolving = true;
            UI.disableChoices();
            resolveEnemyTurn(ENEMIES[state.currentEnemy]);
        }
        return true;
    }

    // ---- Equipment ----
    function equipItem(itemId) {
        const item = ITEMS[itemId];
        if (!item || item.type !== "equipment" || !item.equipSlot) return false;

        const invSlot = state.inventory.find(i => i.id === itemId);
        if (!invSlot || invSlot.qty <= 0) return false;

        // Remove 1 from inventory
        invSlot.qty--;
        if (invSlot.qty <= 0) {
            state.inventory = state.inventory.filter(i => i.id !== itemId);
        }

        const slot = item.equipSlot;
        // Unequip currently equipped item in this slot
        if (state.equipment[slot]) {
            addItemToInventory(state.equipment[slot]);
        }

        state.equipment[slot] = itemId;

        syncDerivedResources();

        UI.updateHUD(state);
        if (typeof UI.updateInventoryModal === "function") {
            UI.updateInventoryModal(state);
        }
        UI.showToast(`Equipped ${item.name}`, "success", item.icon);
        return true;
    }

    function unequipItem(slot) {
        const itemId = state.equipment[slot];
        if (!itemId) return false;

        state.equipment[slot] = null;
        addItemToInventory(itemId);

        syncDerivedResources();

        UI.updateHUD(state);
        if (typeof UI.updateInventoryModal === "function") {
            UI.updateInventoryModal(state);
        }
        return true;
    }

    // ---- Sell Item ----
    function handleSellAction(choiceId) {
        const itemId = choiceId.replace("sell_", "");
        const slot = state.inventory.find(i => i.id === itemId);
        const item = ITEMS[itemId];

        if (!slot || slot.qty <= 0 || !item || !item.sellPrice) return;

        const price = Math.floor(Math.random() * (item.sellPrice.max - item.sellPrice.min + 1)) + item.sellPrice.min;
        state.coins += price;

        slot.qty--;
        if (slot.qty <= 0) {
            state.inventory = state.inventory.filter(i => i.id !== itemId);
        }

        UI.addNarrative(`Silas takes the <strong>${item.name}</strong> and inspects it. <em>"Not bad. I'll give you <strong>${price} coins</strong> for this."</em> He drops the coins into your hand.`, "gm", "silas");
        UI.showToast(`+${price} Coins`, "success", "fa-coins");
        UI.showFloatingNumber(`+${price}`, "coins");
        UI.updateHUD(state);

        setTimeout(() => showSellChoices(), 500);
    }

    function showSellChoices() {
        const sellableItems = state.inventory.filter(slot => {
            const item = ITEMS[slot.id];
            return item && item.sellPrice && slot.qty > 0;
        });

        const choices = [];
        sellableItems.forEach(slot => {
            const item = ITEMS[slot.id];
            choices.push({
                id: `sell_${slot.id}`,
                text: `Sell ${item.name} (${item.sellPrice.min}-${item.sellPrice.max} coins) x${slot.qty}`,
                icon: item.icon
            });
        });

        choices.push({ id: "talk_silas", text: "Back to Silas's shop", icon: "fa-arrow-left" });
        UI.showChoices(choices);
    }

    // ---- RPG Derived Stats Engine ----
    function getEquipmentBonusStats() {
        let bonuses = { str: 0, def: 0, int: 0, agi: 0, hp: 0, mp: 0 };
        for (const slot in state.equipment) {
            const itemId = state.equipment[slot];
            if (itemId && ITEMS[itemId] && ITEMS[itemId].bonusStat) {
                const b = ITEMS[itemId].bonusStat;
                if (b.str) bonuses.str += b.str;
                if (b.def) bonuses.def += b.def;
                if (b.int) bonuses.int += b.int;
                if (b.agi) bonuses.agi += b.agi;
                if (b.hp) bonuses.hp += b.hp;
                if (b.mp) bonuses.mp += b.mp;
            }
        }
        return bonuses;
    }

    function getDerivedStats() {
        const gear = getEquipmentBonusStats();

        const totalStr = state.str + gear.str;
        const totalDef = state.def + gear.def;
        const totalInt = state.int + gear.int;
        const totalAgi = state.agi + gear.agi;

        const computedMaxHp = state.baseMaxHp + gear.hp;
        const computedMaxMp = state.baseMaxMp + gear.mp;

        // ATK (Physical Damage Range)
        // Base dmg 1-3. STR adds +1 to min, +2 to max.
        const atkMin = 1 + totalStr;
        const atkMax = 3 + (totalStr * 2);

        // MATK (Magical Damage Range)
        const matkMin = 1 + (totalInt * 2);
        const matkMax = 4 + (totalInt * 3);

        // Damage Reduction (from DEF). Each DEF = 1.5% reduction. Max 60%.
        const drPercent = Math.min(60, totalDef * 1.5);

        // Critical Hit Chance (from AGI). Base 3%. Each AGI = 0.5%. Max 50%.
        const critChance = Math.min(0.50, 0.03 + (totalAgi * 0.005));

        // Evasion Chance (from AGI). Base 2%. Each AGI = 0.8%. Max 40%.
        const evadeChance = Math.min(0.40, 0.02 + (totalAgi * 0.008));


        return {
            maxHp: computedMaxHp,
            maxMp: computedMaxMp,
            totalStr,
            totalDef,
            totalInt,
            totalAgi,
            atkMin,
            atkMax,
            matkMin,
            matkMax,
            drPercent,
            critChance: critChance,
            evadeChance: evadeChance
        };
    }

    function syncDerivedResources({ restore = false } = {}) {
        const derived = getDerivedStats();
        state.maxHp = derived.maxHp;
        state.maxMp = derived.maxMp;
        state.hp = restore ? state.maxHp : Math.min(state.hp, state.maxHp);
        state.mp = restore ? state.maxMp : Math.min(state.mp, state.maxMp);
    }

    // ---- Stat Allocation ----
    function allocateStat(statName) {
        if (state.statPoints <= 0) return false;
        if (!["str", "def", "int", "agi"].includes(statName)) return false;

        state[statName]++;
        state.statPoints--;

        // Sync HP/MP immediately on level up allocation
        if (statName === "int") {
            state.baseMaxMp += 5;
        }

        if (statName === "str") {
            state.baseMaxHp += 5;
        }

        const previousHp = state.hp;
        const previousMp = state.mp;
        syncDerivedResources();
        if (statName === "str") state.hp = Math.min(state.maxHp, previousHp + 5);
        if (statName === "int") state.mp = Math.min(state.maxMp, previousMp + 5);

        UI.updateHUD(state);
        UI.updateStatsModal(state, getDerivedStats()); // Pass derived stats to UI
        UI.showToast(`+1 ${statName.toUpperCase()}`, "success", "fa-arrow-up");
        return true;
    }
    // ---- Process custom text input ----
    function processCustomInput(text) {
        if (!text.trim()) return;

        UI.addNarrative(text, "player");
        UI.disableChoices();
        UI.showTypingIndicator();

        setTimeout(() => {
            UI.hideTypingIndicator();

            const lower = text.toLowerCase();
            if (state.combatActive) {
                if (lower.includes("flee") || lower.includes("run")) return processChoice("combat_flee");
                if (lower.includes("defend") || lower.includes("guard") || lower.includes("brace")) return useAbility("guard");
                if (lower.includes("magic") || lower.includes("mana") || lower.includes("spell")) return useAbility("mana_bolt");
                if (lower.includes("heal") || lower.includes("potion")) {
                    if (useItem("healing_potion")) {
                        UI.addNarrative("You drink a Healing Potion before the enemy can close in.", "gm");
                    }
                    return;
                }
                if (lower.includes("attack") || lower.includes("fight") || lower.includes("hit")) return useAbility("strike");

                UI.addNarrative("<em>The enemy gives you no room for that. Attack, cast, guard, heal, or flee.</em>", "gm");
                UI.showChoices([{ id: "combat_flee", text: "Attempt to flee", icon: "fa-person-running" }]);
                return;
            }

            if (lower.includes("attack") || lower.includes("fight") || lower.includes("hit")) {
                UI.addNarrative("<em>You test your grip, but there is nothing here to fight.</em>", "gm");
                return;
            }
            if (lower.includes("heal") || lower.includes("potion")) {
                if (useItem("healing_potion")) {
                    UI.addNarrative("You open the Healing Potion and drink it down. Warmth flows through your body as your wounds start to close. <strong>+20 HP</strong>", "gm");
                    return;
                }
            }
            if (lower.includes("sell")) return showSellChoices();
            if (lower.includes("explore") || lower.includes("look")) {
                return processChoice(state.currentRegion === "ash_plains" ? "explore_ash" : "explore_bastion");
            }
            if (lower.includes("leave") || lower.includes("go out") || lower.includes("ash plains")) return processChoice("leave_bastion");
            if (lower.includes("save")) return UI.openSaveModal();

            UI.addNarrative(`<em>You say "${text}" out loud. The Wastes echo your words back, but nothing happens. Maybe try something more specific.</em>`, "gm");
        }, 800);
    }

    // ---- Save / Load System (localStorage for the frontend prototype) ----
    function createSaveData(slotId) {
        return {
            schemaVersion: SAVE_SCHEMA_VERSION,
            state: JSON.parse(JSON.stringify(state)),
            timestamp: new Date().toISOString(),
            slotId
        };
    }

    function saveGame(slotId, { silent = false } = {}) {
        if (!state.gameStarted) {
            if (!silent) UI.showToast("Start a game before saving", "warning", "fa-floppy-disk");
            return false;
        }

        const saveData = {
            ...createSaveData(slotId)
        };
        try {
            localStorage.setItem(`tsw_save_${slotId}`, JSON.stringify(saveData));
            if (!silent) {
                UI.showToast(`Saved to slot ${slotId}`, "success", "fa-floppy-disk");
                UI.updateSaveModal();
            }
            return true;
        } catch (e) {
            if (!silent) UI.showToast("Save failed. Check browser storage.", "danger", "fa-triangle-exclamation");
            return false;
        }
    }

    function autoSave() {
        return saveGame("auto", { silent: true });
    }

    function normalizeLoadedState(savedState, schemaVersion) {
        Object.assign(state, savedState);
        state.saveSchemaVersion = SAVE_SCHEMA_VERSION;
        const allowedBuilds = ["bruiser", "scout", "scholar", "vanguard", "survivor"];
        state.buildId = allowedBuilds.includes(state.buildId) ? state.buildId : "survivor";
        state.playerAvatar = `img/avatar_${state.buildId}.png`;
        state.playerName = String(state.playerName || "The Scrapper").slice(0, 24);
        state.currentRegion = REGIONS[state.currentRegion] ? state.currentRegion : "last_bastion";
        state.timePhase = Math.max(0, Math.min(3, Number(state.timePhase) || 0));
        state.day = Math.max(1, Number(state.day) || 1);
        state.level = Math.max(1, Number(state.level) || 1);
        state.inventory = Array.isArray(state.inventory)
            ? state.inventory.filter(slot => slot && ITEMS[slot.id] && Number(slot.qty) > 0).map(slot => ({ id: slot.id, qty: Math.floor(Number(slot.qty)) }))
            : [];
        state.equipment = {
            head: null,
            chest: null,
            main_hand: null,
            off_hand: null,
            accessory: null,
            ...(state.equipment || {})
        };
        Object.keys(state.equipment).forEach(slot => {
            const item = ITEMS[state.equipment[slot]];
            if (!item || item.type !== "equipment" || item.equipSlot !== slot) state.equipment[slot] = null;
        });
        state.dynamicItems = state.dynamicItems || {};
        state.cooldowns = state.cooldowns || {};
        state.combatResolving = false;
        state.guarding = false;
        if (!state.combatActive || !state.currentEnemy || !ENEMIES[state.currentEnemy]) {
            state.combatActive = false;
            state.currentEnemy = null;
            state.currentEnemyHp = 0;
        } else {
            state.currentEnemyHp = Math.max(1, Math.min(Number(state.currentEnemyHp) || ENEMIES[state.currentEnemy].maxHp, ENEMIES[state.currentEnemy].maxHp));
        }

        const gear = getEquipmentBonusStats();
        if (!state.baseMaxHp) state.baseMaxHp = Math.max(1, (state.maxHp || 50) - gear.hp);
        if (!state.baseMaxMp) state.baseMaxMp = Math.max(0, (state.maxMp || 30) - gear.mp);
        syncDerivedResources();
        state.hp = Math.max(0, Math.min(state.hp, state.maxHp));
        state.mp = Math.max(0, Math.min(state.mp, state.maxMp));
        state.coins = Math.max(0, Number(state.coins) || 0);

        if (!schemaVersion || schemaVersion < SAVE_SCHEMA_VERSION) {
            UI.showToast("Older save upgraded for this version", "info", "fa-wrench");
        }
    }

    function loadGame(slotId) {
        try {
            const raw = localStorage.getItem(`tsw_save_${slotId}`);
            if (!raw) return false;

            const saveData = JSON.parse(raw);
            if (!saveData || !saveData.state) throw new Error("Invalid save shape");

            // Restore dynamic items to global definitions
            if (saveData.state.dynamicItems) {
                Object.values(saveData.state.dynamicItems).forEach(item => {
                    ITEMS[item.id] = item;
                });
            }
            normalizeLoadedState(saveData.state, saveData.schemaVersion);

            applyTimeTheme();

            const mainMenu = document.getElementById("main-menu-screen");
            mainMenu.classList.remove("active");
            mainMenu.style.display = "none";
            document.getElementById("game-container").style.display = "flex";

            UI.resetNarrative();
            UI.updateHUD(state);
            UI.updateLocation(REGIONS[state.currentRegion]);
            UI.showToast(slotId === "auto" ? "Continued from autosave" : `Loaded slot ${slotId}`, "success", "fa-upload");
            UI.addNarrative(`<em><strong>Field record restored.</strong> Welcome back, ${state.playerName}. It is ${TIME_PHASES[state.timePhase]} of Day ${state.day}.</em>`, "gm");

            if (state.combatActive && state.currentEnemy && ENEMIES[state.currentEnemy]) {
                UI.showEnemyPanel(ENEMIES[state.currentEnemy]);
                UI.updateEnemyHp(state.currentEnemyHp, ENEMIES[state.currentEnemy].maxHp);
                UI.showTurnIndicator(true);
                UI.updateHotbar(state);
                UI.showChoices([{ id: "combat_flee", text: "Attempt to flee", icon: "fa-person-running" }]);
            } else if (state.currentRegion === "ash_plains") {
                UI.showChoices([
                    { id: "explore_ash", text: "Explore the Ash Plains", icon: "fa-compass" },
                    { id: "return_bastion", text: "Return to the Last Bastion", icon: "fa-house" }
                ]);
            } else {
                UI.showChoices([
                    { id: "explore_bastion", text: "Explore the Bastion", icon: "fa-magnifying-glass" },
                    { id: "leave_bastion", text: "Head to the Ash Plains", icon: "fa-person-walking" }
                ]);
            }
            return true;
        } catch (e) {
            UI.showToast("Load failed!", "danger", "fa-triangle-exclamation");
            return false;
        }
    }

    function deleteSave(slotId) {
        localStorage.removeItem(`tsw_save_${slotId}`);
        UI.showToast(`Slot ${slotId} deleted`, "warning", "fa-trash");
        UI.updateSaveModal();
    }

    function getSaveSlots() {
        const slots = [];
        const slotIds = ["auto", 1, 2, 3, 4, 5];
        slotIds.forEach(id => {
            const raw = localStorage.getItem(`tsw_save_${id}`);
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    slots.push({
                        id,
                        label: id === "auto" ? "Autosave" : `Slot ${id}`,
                        filled: true,
                        level: data.state.level,
                        day: data.state.day,
                        coins: data.state.coins,
                        timePhase: data.state.timePhase,
                        playerName: data.state.playerName || "The Scrapper",
                        buildId: data.state.buildId || "survivor",
                        timestamp: data.timestamp
                    });
                } catch (e) {
                    slots.push({ id, label: id === "auto" ? "Autosave" : `Slot ${id}`, filled: false, corrupt: true });
                }
            } else {
                slots.push({ id, label: id === "auto" ? "Autosave" : `Slot ${id}`, filled: false });
            }
        });
        return slots;
    }

    return {
        init,
        startNewGame,
        processChoice,
        processCustomInput,
        allocateStat,
        useItem,
        saveGame,
        autoSave,
        loadGame,
        deleteSave,
        getSaveSlots,
        getState: () => JSON.parse(JSON.stringify(state)),
        getInventory: () => JSON.parse(JSON.stringify(state.inventory)),
        getEquipment: () => ({ ...state.equipment }),
        getDerivedStats,
        equipItem,
        unequipItem,
        useAbility
    };
})();

// ============================================================
// PARTICLE ENGINE — Floating ambient particles
// ============================================================
const ParticleEngine = (() => {
    let canvas, ctx;
    let particles = [];
    let animFrame;
    let timePhase = 0;
    let paused = false;

    const PARTICLE_PALETTES = {
        0: ["#b99a52", "#d8d2c2", "#8f7a4c"],
        1: ["#d8d2c2", "#aeb1a8", "#b99a52"],
        2: ["#d56a3a", "#b99a52", "#8f5d45"],
        3: ["#72e3cc", "#73918b", "#4f6d69"]
    };

    const PARTICLE_COUNT = 50;

    function init() {
        canvas = document.getElementById("particle-canvas");
        if (!canvas) return;
        ctx = canvas.getContext("2d");
        resize();

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 150);
        });

        createParticles(PARTICLE_COUNT);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                if (animFrame) cancelAnimationFrame(animFrame);
                animFrame = null;
            } else {
                if (!animFrame && !paused) animate();
            }
        });

        animate();
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles(count) {
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(makeParticle());
        }
    }

    function makeParticle() {
        const palette = PARTICLE_PALETTES[timePhase] || PARTICLE_PALETTES[0];
        return {
            x: Math.random() * (canvas ? canvas.width : window.innerWidth),
            y: Math.random() * (canvas ? canvas.height : window.innerHeight),
            size: Math.random() * 2.5 + 0.8,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: -Math.random() * 0.25 - 0.05,
            opacity: Math.random() * 0.4 + 0.1,
            color: palette[Math.floor(Math.random() * palette.length)],
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.015 + 0.005
        };
    }

    function setTimePhase(phase) {
        timePhase = phase;
        const palette = PARTICLE_PALETTES[phase] || PARTICLE_PALETTES[0];
        particles.forEach(p => {
            p.color = palette[Math.floor(Math.random() * palette.length)];
        });
    }

    function animate() {
        if (!ctx || !canvas || paused) {
            animFrame = null;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const w = canvas.width;
        const h = canvas.height;

        const byColor = {};
        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += p.pulseSpeed;

            if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;

            if (!byColor[p.color]) byColor[p.color] = [];
            byColor[p.color].push(p);
        });

        for (const color in byColor) {
            ctx.fillStyle = color;
            byColor[color].forEach(p => {
                const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalAlpha = alpha * 0.12;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        ctx.globalAlpha = 1;
        animFrame = requestAnimationFrame(animate);
    }

    function setPaused(shouldPause) {
        paused = shouldPause;
        if (paused) {
            if (animFrame) cancelAnimationFrame(animFrame);
            animFrame = null;
            if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else if (!animFrame && !document.hidden) {
            animate();
        }
    }

    return { init, setTimePhase, setPaused };
})();
