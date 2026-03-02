// ============================================================
// THE SHIMMERING WASTES — Game Engine v3.0
// V3 Flow: VN Intro -> Character Creation -> Start Game
// Slash VFX, proper region transitions
// ============================================================

const GameEngine = (() => {
    // ---- Player State ----
    let state = {
        playerName: "The Scrapper",
        buildId: "survivor",
        level: 1,
        hp: 50,
        maxHp: 50,
        mp: 30,
        maxMp: 30,
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
        currentRegion: "last_bastion",
        inventory: [
            { id: "rusted_pipe", qty: 1 },
            { id: "padded_clothing", qty: 1 },
            { id: "healing_potion", qty: 1 }
        ],
        weapon: "rusted_pipe",
        armor: "padded_clothing",
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
            state.str = buildData.stats.str;
            state.def = buildData.stats.def;
            state.int = buildData.stats.int;
            state.agi = buildData.stats.agi;
            state.maxHp = buildData.stats.maxHp;
            state.hp = state.maxHp;
            state.maxMp = buildData.stats.maxMp;
            state.mp = state.maxMp;
        }

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
        if (choiceId === "leave_bastion") return "ash_plains";
        if (choiceId === "explore_bastion" || choiceId === "talk_silas" || choiceId === "talk_elara" || choiceId === "walk_away" || choiceId === "combat_flee") {
            return "last_bastion";
        }
        return null;
    }

    // ---- Process a Choice ----
    function processChoice(choiceId) {
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

        // Show player's choice as a message
        const choiceText = document.querySelector(`.choice-btn[data-choice="${choiceId}"] span`);
        if (choiceText) {
            UI.addNarrative(choiceText.textContent, "player");
        }

        UI.disableChoices();
        UI.showTypingIndicator();

        // Check if player attacked to show slash fx immediately
        const isCombatAttack = scenario.stateUpdates && scenario.stateUpdates.hp_change && scenario.stateUpdates.hp_change < 0 && state.combatActive;
        if (choiceId.includes("attack") && isCombatAttack) {
            setTimeout(() => {
                UI.showSlashAnimation();
            }, 100);
        }

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

            if (isCombatAttack && state.combatActive) {
                // Two-phase combat: player attack → enemy turn → your turn
                showPlayerTurnThenEnemyTurn(scenario);
            } else if (scenario.triggerSellMenu) {
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

    // ---- Two-Phase Combat Turn ----
    function showPlayerTurnThenEnemyTurn(scenario) {
        UI.showTurnIndicator(true);

        setTimeout(() => {
            UI.showTurnIndicator(false); // Enemy's Turn

            setTimeout(() => {
                const enemy = ENEMIES[state.currentEnemy];
                if (enemy) {
                    const enemyDamage = Math.abs(scenario.stateUpdates.hp_change);
                    UI.addNarrative(
                        `The <strong>${enemy.name}</strong> retaliates — lunging at you for <strong class="text-danger">${enemyDamage} damage</strong>! ` +
                        `<span class="enemy-status">${enemy.name} HP: ${state.currentEnemyHp}/${enemy.maxHp}</span>`,
                        "gm"
                    );
                }

                setTimeout(() => {
                    if (scenario.choices) {
                        UI.showTurnIndicator(true); // Your Turn
                        UI.showChoices(scenario.choices);
                    }
                }, 1000);
            }, 800);
        }, 1200);
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
            state.coins += updates.coins_change;
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
            addItemToInventory(updates.addItem);
        }

        // Combat state
        if (updates.combat_active !== undefined) {
            state.combatActive = updates.combat_active;
            if (updates.combat_active && updates.current_enemy) {
                const enemy = ENEMIES[updates.current_enemy];
                state.currentEnemy = updates.current_enemy;
                state.currentEnemyHp = enemy.hp;
                UI.showEnemyPanel(enemy);
            }
        }

        // Enemy HP updates from combat narrative
        if (state.combatActive && state.currentEnemy) {
            const enemy = ENEMIES[state.currentEnemy];
            if (updates.hp_change !== undefined && updates.combat_active) {
                const playerDamage = Math.floor(state.str * 1.5 + Math.random() * 5);
                state.currentEnemyHp = Math.max(0, state.currentEnemyHp - playerDamage);
                UI.updateEnemyHp(state.currentEnemyHp, enemy.maxHp);
            }
        }

        if (updates.combat_active === false) {
            state.currentEnemy = null;
            state.currentEnemyHp = 0;
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

            state.maxHp += 5;
            state.maxMp += 3;
            state.hp = state.maxHp;
            state.mp = state.maxMp;

            state.str += 1;
            state.def += 1;
            state.int += 1;
            state.agi += 1;

            UI.showLevelUpOverlay(state.level);
        }
    }

    // ---- Death ----
    function handleDeath() {
        state.hp = Math.floor(state.maxHp * 0.5);
        state.mp = Math.floor(state.maxMp * 0.3);
        state.coins = Math.max(0, state.coins - Math.floor(state.coins * 0.2));
        state.combatActive = false;
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

    // ---- Inventory ----
    function addItemToInventory(itemId) {
        const existing = state.inventory.find(i => i.id === itemId);
        if (existing) {
            existing.qty++;
        } else {
            state.inventory.push({ id: itemId, qty: 1 });
        }
    }

    function useItem(itemId) {
        const slot = state.inventory.find(i => i.id === itemId);
        if (!slot || slot.qty <= 0) return false;

        const item = ITEMS[itemId];
        if (!item || item.type !== "consumable") return false;

        if (item.effect.hp) {
            state.hp = Math.min(state.maxHp, state.hp + item.effect.hp);
            UI.showToast(`+${item.effect.hp} HP`, "success", "fa-heart");
            UI.showFloatingNumber(`+${item.effect.hp}`, "heal");
        }
        if (item.effect.mp) {
            state.mp = Math.min(state.maxMp, state.mp + item.effect.mp);
            UI.showToast(`+${item.effect.mp} MP`, "success", "fa-droplet");
        }

        slot.qty--;
        if (slot.qty <= 0) {
            state.inventory = state.inventory.filter(i => i.id !== itemId);
        }

        UI.updateHUD(state);
        UI.updateInventoryModal(state);
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

    // ---- Stat Allocation ----
    function allocateStat(statName) {
        if (state.statPoints <= 0) return false;
        if (!["str", "def", "int", "agi"].includes(statName)) return false;

        state[statName]++;
        state.statPoints--;

        if (statName === "int") {
            state.maxMp += 2;
            state.mp = Math.min(state.maxMp, state.mp + 2);
        }

        if (statName === "str") {
            state.maxHp += 1;
        }

        UI.updateHUD(state);
        UI.updateStatsModal(state);
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
            if (lower.includes("attack") || lower.includes("fight") || lower.includes("hit")) {
                if (state.combatActive) return processChoice("combat_attack");
            }
            if (lower.includes("heal") || lower.includes("potion")) {
                if (useItem("healing_potion")) {
                    UI.addNarrative("You open the Healing Potion and drink it down. Warmth flows through your body as your wounds start to close. <strong>+20 HP</strong>", "gm");
                    return;
                }
            }
            if (lower.includes("sell")) return showSellChoices();
            if (lower.includes("explore") || lower.includes("look")) return processChoice("explore_bastion");
            if (lower.includes("leave") || lower.includes("go out") || lower.includes("ash plains")) return processChoice("leave_bastion");
            if (lower.includes("save")) return UI.openSaveModal();

            UI.addNarrative(`<em>You say "${text}" out loud. The Wastes echo your words back, but nothing happens. Maybe try something more specific.</em>`, "gm");
        }, 800);
    }

    // ---- Save / Load System (localStorage for now) ----
    function saveGame(slotId) {
        const saveData = {
            state: { ...state },
            timestamp: new Date().toISOString(),
            slotId: slotId
        };
        try {
            localStorage.setItem(`tsw_save_${slotId}`, JSON.stringify(saveData));
            UI.showToast(`Game saved to Slot ${slotId}!`, "success", "fa-floppy-disk");
            UI.updateSaveModal();
            return true;
        } catch (e) {
            UI.showToast("Save failed!", "danger", "fa-triangle-exclamation");
            return false;
        }
    }

    function loadGame(slotId) {
        try {
            const raw = localStorage.getItem(`tsw_save_${slotId}`);
            if (!raw) return false;

            const saveData = JSON.parse(raw);
            Object.assign(state, saveData.state);
            applyTimeTheme();

            // Go to game view physically
            document.getElementById("main-menu-screen").style.display = "none";
            document.getElementById("game-container").style.display = "flex";

            UI.updateHUD(state);
            UI.updateLocation(REGIONS[state.currentRegion]);
            UI.showToast(`Loaded from Slot ${slotId}!`, "success", "fa-upload");
            UI.addNarrative(`<em><strong>— Game Loaded —</strong> Welcome back, Scrapper. It is ${TIME_PHASES[state.timePhase]} of Day ${state.day}.</em>`, "gm");
            UI.showChoices([
                { id: "explore_bastion", text: "Look around", icon: "fa-magnifying-glass" },
                { id: "leave_bastion", text: "Head to the Ash Plains", icon: "fa-person-walking" }
            ]);
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
        for (let i = 1; i <= 5; i++) {
            const raw = localStorage.getItem(`tsw_save_${i}`);
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    slots.push({
                        id: i,
                        filled: true,
                        level: data.state.level,
                        day: data.state.day,
                        coins: data.state.coins,
                        timePhase: data.state.timePhase,
                        timestamp: data.timestamp
                    });
                } catch (e) {
                    slots.push({ id: i, filled: false });
                }
            } else {
                slots.push({ id: i, filled: false });
            }
        }
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
        loadGame,
        deleteSave,
        getSaveSlots,
        getState: () => ({ ...state }),
        getInventory: () => [...state.inventory]
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

    const PARTICLE_PALETTES = {
        0: ["#ffd700", "#ffaa00", "#ffffff", "#ffe4a0"],
        1: ["#ffffff", "#c8deff", "#ffe4b5", "#87ceeb"],
        2: ["#ff6b35", "#ff3d00", "#ffa040", "#cc5500"],
        3: ["#4060ff", "#6080ff", "#8090c0", "#2040a0"]
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
                if (!animFrame) animate();
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
        if (!ctx || !canvas) return;
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

    return { init, setTimePhase };
})();
