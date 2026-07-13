import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../frontend/index.html", import.meta.url), "utf8");
const ui = fs.readFileSync(new URL("../frontend/js/ui.js", import.meta.url), "utf8");
const data = fs.readFileSync(new URL("../frontend/js/data.js", import.meta.url), "utf8");
const design = fs.readFileSync(new URL("../frontend/css/design-system.css", import.meta.url), "utf8");

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual(duplicates, [], "HTML IDs must be unique");

const requiredControls = [
    "btn-new-game",
    "btn-load-game",
    "btn-start-adventure",
    "narrative-container",
    "choices-container",
    "custom-input",
    "btn-stats",
    "btn-inventory",
    "btn-save",
    "btn-map",
    "btn-settings",
    "mapModal",
    "settingsModal"
];
requiredControls.forEach(id => assert.ok(ids.includes(id), `missing required UI contract: #${id}`));

const legacyCssIndex = html.indexOf("css/style.css");
const designCssIndex = html.indexOf("css/design-system.css");
assert.ok(legacyCssIndex >= 0 && designCssIndex > legacyCssIndex, "design-system.css must load after legacy CSS");
assert.ok(html.indexOf("js/data.js") < html.indexOf("js/game.js"));
assert.ok(html.indexOf("js/game.js") < html.indexOf("js/ui.js"));
assert.match(html, /role="log"[^>]*aria-live="polite"/);
assert.equal([...html.matchAll(/role="progressbar"/g)].length, 3);
assert.doesNotMatch(html, /coming soon|coming in phase/i);

const closeButtons = [...html.matchAll(/<button[^>]*class="btn-close"[^>]*>/g)].map(match => match[0]);
assert.ok(closeButtons.length >= 5);
closeButtons.forEach(button => assert.match(button, /aria-label="[^"]+"/, "icon-only close buttons need accessible names"));

assert.doesNotMatch(ui, /api\.dicebear\.com|window\.GameEngine/);
assert.match(ui, /DOMPurify\.sanitize/);
assert.match(ui, /contentDiv\.textContent = String\(html\)/, "player commands must render as text");
assert.match(ui, /finishVnLine/, "visual-novel typing must be skippable");
assert.doesNotMatch(data, /^\s+combat_(attack|attack_2|magic|magic_2|finish|defend):/m);

assert.match(design, /@media \(max-width: 980px\)/);
assert.match(design, /@media \(max-width: 720px\)/);
assert.match(design, /@media \(max-width: 430px\)/);
assert.match(design, /max-height: calc\(100dvh - 32px\)/);
assert.match(design, /\.game-modal \.modal-content[\s\S]*height: 100dvh/);
assert.match(design, /prefers-reduced-motion: reduce/);
assert.match(design, /\.game-title\s*\{[\s\S]*?transform: none;/);
assert.match(design, /\.game-subtitle\s*\{[\s\S]*?transform: none;/);
assert.match(design, /\.level-up-text\s*\{[\s\S]*?text-shadow: none;/);
assert.match(design, /\.notification-badge\s*\{[\s\S]*?box-shadow: none;/);
assert.match(design, /\.ability-hotbar\s*\{[\s\S]*?display: none;/, "inactive combat hotbar must stay hidden");
assert.match(design, /\.ability-hotbar\.active\s*\{[\s\S]*?display: grid;/, "active combat hotbar must use the action grid");
assert.match(design, /#inventoryModal \.paper-doll-layout\s*\{[\s\S]*?grid-template-columns: repeat\(5,/,
    "desktop inventory must keep the loadout compact enough to expose carried items");

console.log("frontend-contract.test.mjs: all assertions passed");
