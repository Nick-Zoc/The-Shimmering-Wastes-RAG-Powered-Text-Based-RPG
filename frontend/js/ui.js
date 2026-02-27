// ============================================================
// THE SHIMMERING WASTES — UI Controller v2.2
// Typewriter effect, tooltips, quick-use bar, turn indicator,
// collapsible sections, notification badges, auto-save, glow
// ============================================================

const UI = (() => {
    // ---- DOM References ----
    const dom = {};

    // ---- Previous state for change detection ----
    let prevState = null;
    let typewriterActive = false;

    function cacheDom() {
        dom.hpFill = document.getElementById("hp-fill");
        dom.hpValue = document.getElementById("hp-value");
        dom.mpFill = document.getElementById("mp-fill");
        dom.mpValue = document.getElementById("mp-value");
        dom.expFill = document.getElementById("exp-fill");
        dom.expValue = document.getElementById("exp-value");
        dom.levelBadge = document.getElementById("level-badge");

        dom.statStr = document.getElementById("stat-str");
        dom.statDef = document.getElementById("stat-def");
        dom.statInt = document.getElementById("stat-int");
        dom.statAgi = document.getElementById("stat-agi");

        dom.coins = document.getElementById("coins-value");
        dom.dayCounter = document.getElementById("day-counter");
        dom.timePhases = document.querySelectorAll(".time-phase");

        dom.narrativeContainer = document.getElementById("narrative-container");
        dom.choicesContainer = document.getElementById("choices-container");
        dom.customInput = document.getElementById("custom-input");
        dom.sendBtn = document.getElementById("send-btn");

        dom.locationIcon = document.getElementById("location-icon");
        dom.locationName = document.getElementById("location-name");
        dom.locationLevel = document.getElementById("location-level");

        dom.enemyPanel = document.getElementById("enemy-panel");
        dom.enemyAvatar = document.getElementById("enemy-avatar");
        dom.enemyName = document.getElementById("enemy-name");
        dom.enemyHpFill = document.getElementById("enemy-hp-fill");
        dom.enemyHpText = document.getElementById("enemy-hp-text");
        dom.enemyAtk = document.getElementById("enemy-atk");
        dom.enemyDef = document.getElementById("enemy-def");

        dom.gameContainer = document.getElementById("game-container");
        dom.toastContainer = document.getElementById("toast-container");
        dom.levelUpOverlay = document.getElementById("level-up-overlay");
        dom.levelUpLevel = document.getElementById("level-up-level");

        dom.turnIndicator = document.getElementById("turn-indicator");
        dom.turnIndicatorText = document.getElementById("turn-indicator-text");
        dom.quickUseBar = document.getElementById("quick-use-bar");
        dom.regionTransition = document.getElementById("region-transition");
        dom.autoSaveIndicator = document.getElementById("auto-save-indicator");

        // Modals
        dom.statsModal = document.getElementById("statsModal");
        dom.inventoryModal = document.getElementById("inventoryModal");
        dom.saveModal = document.getElementById("saveModal");
    }

    // ---- Update HUD with change detection ----
    function updateHUD(state) {
        // HP Bar
        const hpPercent = (state.hp / state.maxHp) * 100;
        dom.hpFill.style.width = hpPercent + "%";
        dom.hpValue.textContent = `${state.hp}/${state.maxHp}`;

        // HP critical warning (below 25%)
        const hpGroup = document.querySelector(".bar-hp");
        hpGroup.classList.toggle("critical", hpPercent <= 25 && state.hp > 0);

        // MP Bar
        const mpPercent = (state.mp / state.maxMp) * 100;
        dom.mpFill.style.width = mpPercent + "%";
        dom.mpValue.textContent = `${state.mp}/${state.maxMp}`;

        // EXP Bar
        const expPercent = (state.exp / state.expToLevel) * 100;
        dom.expFill.style.width = expPercent + "%";
        dom.expValue.textContent = `${state.exp}/${state.expToLevel}`;
        dom.levelBadge.textContent = `Lv. ${state.level}`;

        // Stats — with change flash animation
        updateStatWithFlash(dom.statStr, state.str);
        updateStatWithFlash(dom.statDef, state.def);
        updateStatWithFlash(dom.statInt, state.int);
        updateStatWithFlash(dom.statAgi, state.agi);

        // Economy — with change flash
        if (prevState && prevState.coins !== state.coins) {
            dom.coins.classList.add("stat-changed");
            setTimeout(() => dom.coins.classList.remove("stat-changed"), 600);
        }
        dom.coins.textContent = state.coins;

        // Time
        dom.dayCounter.textContent = `Day ${state.day}`;
        dom.timePhases.forEach((el, i) => {
            el.classList.toggle("active", i === state.timePhase);
        });

        // Combat mode
        dom.gameContainer.classList.toggle("combat-mode", state.combatActive);

        // Notification badge on stats button
        updateStatsBadge(state.statPoints);

        // Quick-use bar
        updateQuickUseBar(state);

        // Auto-save
        triggerAutoSave();

        // Save previous state for change detection
        prevState = { ...state };
    }

    function updateStatWithFlash(el, newVal) {
        const oldVal = parseInt(el.textContent) || 0;
        if (oldVal !== newVal && prevState) {
            el.classList.add("stat-changed");
            setTimeout(() => el.classList.remove("stat-changed"), 600);
        }
        el.textContent = newVal;
    }

    // ---- Notification Badge ----
    function updateStatsBadge(statPoints) {
        const btn = document.getElementById("btn-stats");
        let badge = btn.querySelector(".notification-badge");

        if (statPoints > 0) {
            if (!badge) {
                badge = document.createElement("span");
                badge.className = "notification-badge";
                btn.appendChild(badge);
            }
            badge.textContent = statPoints;
        } else if (badge) {
            badge.remove();
        }
    }

    // ---- Update Location Banner ----
    function updateLocation(region) {
        dom.locationIcon.innerHTML = `<i class="fa-solid ${region.icon}"></i>`;
        dom.locationIcon.style.color = region.color;
        dom.locationIcon.style.background = hexToRgba(region.color, 0.12);
        dom.locationIcon.style.borderColor = hexToRgba(region.color, 0.35);
        dom.locationName.textContent = region.name;
        dom.locationLevel.textContent = region.levelRange;
    }

    // ---- Region Transition Effect ----
    function playRegionTransition(callback) {
        dom.regionTransition.classList.add("active");
        setTimeout(() => {
            if (callback) callback();
            setTimeout(() => {
                dom.regionTransition.classList.remove("active");
            }, 300);
        }, 400);
    }

    // ---- Narrative Messages with Typewriter ----
    function addNarrative(html, type) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `narrative-message message-${type === "gm" ? "gm" : "player"} message-new`;

        const sender = type === "gm"
            ? `<div class="message-sender"><i class="fa-solid fa-scroll"></i> The Wastes</div>`
            : `<div class="message-sender">You</div>`;

        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";

        msgDiv.innerHTML = sender;
        msgDiv.appendChild(contentDiv);
        dom.narrativeContainer.appendChild(msgDiv);

        // Remove new-message glow after animation
        setTimeout(() => msgDiv.classList.remove("message-new"), 1500);

        if (type === "gm" && html.length < 800) {
            // Typewriter effect for GM messages
            typewriteHTML(contentDiv, html);
        } else {
            // Instant for player or very long text
            contentDiv.innerHTML = html;
        }

        // Scroll to bottom
        requestAnimationFrame(() => {
            dom.narrativeContainer.scrollTop = dom.narrativeContainer.scrollHeight;
        });
    }

    // ---- Typewriter HTML ----
    function typewriteHTML(container, html) {
        typewriterActive = true;
        container.innerHTML = '';

        // Create a cursor
        const cursor = document.createElement("span");
        cursor.className = "typewriter-cursor";

        // Parse into temp element to get text nodes
        const temp = document.createElement("div");
        temp.innerHTML = html;
        const fullText = temp.textContent || temp.innerText;

        // Type visible text, then swap in full HTML at end
        let index = 0;
        const speed = 18; // ms per character

        function typeNext() {
            if (index < fullText.length) {
                container.textContent = fullText.substring(0, index + 1);
                container.appendChild(cursor);
                index++;

                // Scroll during typing
                dom.narrativeContainer.scrollTop = dom.narrativeContainer.scrollHeight;
                setTimeout(typeNext, speed);
            } else {
                // Done — swap in full rich HTML
                cursor.remove();
                container.innerHTML = html;
                typewriterActive = false;

                // Final scroll
                dom.narrativeContainer.scrollTop = dom.narrativeContainer.scrollHeight;
            }
        }

        typeNext();
    }

    // ---- Show Choices with keyboard hints ----
    function showChoices(choices) {
        dom.choicesContainer.innerHTML = "";
        const keyMap = ["1", "2", "3", "4"];

        choices.forEach((choice, index) => {
            const btn = document.createElement("button");
            btn.className = "choice-btn";
            btn.dataset.choice = choice.id;

            // Add combat variant classes
            if (choice.id.includes("attack") || choice.id.includes("finish")) {
                btn.classList.add("combat-attack");
            } else if (choice.id.includes("magic")) {
                btn.classList.add("combat-magic");
            } else if (choice.id.includes("defend")) {
                btn.classList.add("combat-defend");
            } else if (choice.id.includes("flee")) {
                btn.classList.add("combat-flee");
            }

            const kbdHint = index < 4 ? `<span class="kbd-hint">${keyMap[index]}</span>` : "";

            btn.innerHTML = `
                <i class="fa-solid ${choice.icon}"></i>
                <span>${choice.text}</span>
                ${kbdHint}
            `;

            btn.addEventListener("click", () => {
                triggerButtonGlow(btn);
                GameEngine.processChoice(choice.id);
            });

            dom.choicesContainer.appendChild(btn);
        });
    }

    function disableChoices() {
        const buttons = dom.choicesContainer.querySelectorAll(".choice-btn");
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.35";
            btn.style.pointerEvents = "none";
        });
    }

    // ---- Subtle Button Glow (replaces ripple) ----
    function triggerButtonGlow(element) {
        element.classList.remove("btn-click-glow");
        void element.offsetWidth; // force reflow
        element.classList.add("btn-click-glow");
        setTimeout(() => element.classList.remove("btn-click-glow"), 350);
    }

    // ---- Combat Turn Indicator ----
    function showTurnIndicator(isPlayerTurn) {
        dom.turnIndicator.classList.add("active");
        dom.turnIndicator.classList.remove("player-turn", "enemy-turn");
        dom.turnIndicator.classList.add(isPlayerTurn ? "player-turn" : "enemy-turn");

        const icon = dom.turnIndicator.querySelector("i");
        icon.className = isPlayerTurn
            ? "fa-solid fa-hand-fist"
            : "fa-solid fa-skull-crossbones";
        dom.turnIndicatorText.textContent = isPlayerTurn ? "Your Turn" : "Enemy's Turn";
    }

    function hideTurnIndicator() {
        dom.turnIndicator.classList.remove("active");
    }

    // ---- Quick-Use Consumable Bar ----
    function updateQuickUseBar(state) {
        const bar = dom.quickUseBar;
        // Clear items (keep label)
        const existingItems = bar.querySelectorAll(".quick-use-item");
        existingItems.forEach(el => el.remove());

        const consumables = state.inventory.filter(slot => {
            const item = ITEMS[slot.id];
            return item && item.type === "consumable" && slot.qty > 0;
        });

        if (consumables.length === 0) {
            bar.classList.remove("active");
            return;
        }

        bar.classList.add("active");

        consumables.forEach(slot => {
            const item = ITEMS[slot.id];
            const el = document.createElement("div");
            el.className = "quick-use-item";
            el.innerHTML = `
                <i class="fa-solid ${item.icon}" style="color: ${item.iconColor}"></i>
                ${item.name}
                <span class="quick-use-qty">x${slot.qty}</span>
            `;

            el.addEventListener("click", () => {
                triggerButtonGlow(el);
                GameEngine.useItem(slot.id);
            });

            // Tooltip
            el.addEventListener("mouseenter", (e) => {
                showGameTooltip(item, e);
            });
            el.addEventListener("mouseleave", hideGameTooltip);
            el.addEventListener("mousemove", moveGameTooltip);

            bar.appendChild(el);
        });
    }

    // ---- Typing Indicator ----
    function showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.className = "narrative-message message-gm";
        indicator.id = "typing-indicator";
        indicator.innerHTML = `
            <div class="message-sender"><i class="fa-solid fa-scroll"></i> The Wastes</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        dom.narrativeContainer.appendChild(indicator);
        dom.narrativeContainer.scrollTop = dom.narrativeContainer.scrollHeight;
    }

    function hideTypingIndicator() {
        const indicator = document.getElementById("typing-indicator");
        if (indicator) indicator.remove();
    }

    // ---- Damage Flash + Screen Shake ----
    function flashDamage() {
        const hpGroup = document.querySelector(".bar-hp");
        hpGroup.classList.add("damage-flash");
        dom.gameContainer.classList.add("damage-flash-screen");
        dom.gameContainer.classList.add("screen-shake");

        setTimeout(() => {
            hpGroup.classList.remove("damage-flash");
            dom.gameContainer.classList.remove("damage-flash-screen");
            dom.gameContainer.classList.remove("screen-shake");
        }, 600);
    }

    // ---- Floating Combat Numbers ----
    function showFloatingNumber(text, type, x, y) {
        const el = document.createElement("div");
        el.className = `floating-number ${type}`;
        el.textContent = text;

        if (!x || !y) {
            const hpBar = document.querySelector(".bar-hp .resource-bar");
            if (hpBar) {
                const rect = hpBar.getBoundingClientRect();
                x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 60;
                y = rect.top;
            } else {
                x = window.innerWidth / 2;
                y = window.innerHeight / 3;
            }
        }

        el.style.left = x + "px";
        el.style.top = y + "px";
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    // ---- Enemy Panel ----
    function showEnemyPanel(enemy) {
        dom.enemyPanel.classList.add("active");

        const iconMap = {
            "Ash Hound": "fa-dog",
            "Rust Beetle": "fa-bug",
            "Crystal Golem": "fa-mountain",
            "Mana Phantom": "fa-ghost",
            "The Wastes Colossus": "fa-robot"
        };

        dom.enemyAvatar.innerHTML = `<i class="fa-solid ${iconMap[enemy.name] || 'fa-skull'}"></i>`;
        dom.enemyName.textContent = enemy.name;
        dom.enemyHpFill.style.width = "100%";
        dom.enemyHpText.textContent = `${enemy.hp}/${enemy.maxHp}`;
        dom.enemyAtk.innerHTML = `ATK: <span>${enemy.attack}</span>`;
        dom.enemyDef.innerHTML = `DEF: <span>${enemy.defense}</span>`;
    }

    function updateEnemyHp(currentHp, maxHp) {
        const percent = (currentHp / maxHp) * 100;
        dom.enemyHpFill.style.width = percent + "%";
        dom.enemyHpText.textContent = `${currentHp}/${maxHp}`;
    }

    function hideEnemyPanel() {
        dom.enemyPanel.classList.remove("active");
    }

    // ---- Toast Notifications ----
    function showToast(message, type, icon) {
        const toast = document.createElement("div");
        toast.className = `game-toast toast-${type}`;
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
        dom.toastContainer.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3000);
    }

    // ---- Level Up Overlay ----
    function showLevelUpOverlay(level) {
        dom.levelUpLevel.textContent = `Level ${level}`;
        dom.levelUpOverlay.classList.add("active");
    }

    function hideLevelUpOverlay() {
        dom.levelUpOverlay.classList.remove("active");
    }

    // ---- Stats Modal ----
    function openStatsModal() {
        updateStatsModal(GameEngine.getState());
        const modal = new bootstrap.Modal(dom.statsModal);
        modal.show();
    }

    function updateStatsModal(state) {
        document.getElementById("modal-stat-points").textContent = state.statPoints;
        document.getElementById("modal-str").textContent = state.str;
        document.getElementById("modal-def").textContent = state.def;
        document.getElementById("modal-int").textContent = state.int;
        document.getElementById("modal-agi").textContent = state.agi;

        const btns = document.querySelectorAll(".stat-upgrade-btn");
        btns.forEach(btn => { btn.disabled = state.statPoints <= 0; });
    }

    // ---- Inventory Modal ----
    function openInventoryModal() {
        updateInventoryModal(GameEngine.getState());
        const modal = new bootstrap.Modal(dom.inventoryModal);
        modal.show();
    }

    function updateInventoryModal(state) {
        const grid = document.getElementById("inventory-grid");
        grid.innerHTML = "";

        const weapon = ITEMS[state.weapon];
        const armor = ITEMS[state.armor];
        document.getElementById("equipped-weapon-icon").className = `fa-solid ${weapon.icon}`;
        document.getElementById("equipped-weapon-icon").style.color = weapon.iconColor;
        document.getElementById("equipped-weapon-name").textContent = weapon.name;
        document.getElementById("equipped-armor-icon").className = `fa-solid ${armor.icon}`;
        document.getElementById("equipped-armor-icon").style.color = armor.iconColor;
        document.getElementById("equipped-armor-name").textContent = armor.name;

        const invItems = state.inventory.filter(i => i.id !== state.weapon && i.id !== state.armor);

        invItems.forEach(slot => {
            const item = ITEMS[slot.id];
            if (!item) return;

            const rarity = item.type === "quest" ? "rarity-legendary" :
                item.type === "valuable" && item.sellPrice && item.sellPrice.min >= 10 ? "rarity-rare" :
                    item.type === "consumable" ? "rarity-uncommon" : "rarity-common";
            const div = document.createElement("div");
            div.className = `inventory-slot ${rarity}`;
            div.innerHTML = `
                <i class="fa-solid ${item.icon}" style="color: ${item.iconColor}"></i>
                <div class="inventory-slot-name">${item.name}</div>
                ${slot.qty > 1 ? `<div class="inventory-slot-qty">x${slot.qty}</div>` : ""}
            `;

            div.addEventListener("mouseenter", (e) => showGameTooltip(item, e));
            div.addEventListener("mouseleave", hideGameTooltip);
            div.addEventListener("mousemove", moveGameTooltip);

            if (item.type === "consumable") {
                div.addEventListener("click", () => {
                    triggerButtonGlow(div);
                    GameEngine.useItem(slot.id);
                });
                div.style.cursor = "pointer";
            }

            grid.appendChild(div);
        });

        const remaining = 12 - invItems.length;
        for (let i = 0; i < remaining; i++) {
            const div = document.createElement("div");
            div.className = "inventory-slot empty";
            div.innerHTML = `<i class="fa-solid fa-lock" style="color: var(--text-muted)"></i>`;
            grid.appendChild(div);
        }
    }

    // ---- Game Tooltip System ----
    let activeTooltip = null;

    function showGameTooltip(item, event) {
        hideGameTooltip();

        const tip = document.createElement("div");
        tip.className = "game-tooltip";
        tip.id = "active-game-tooltip";

        let statLine = "";
        if (item.effect) {
            if (item.effect.hp) statLine += `<div class="game-tooltip-stat">❤️ Restores ${item.effect.hp} HP</div>`;
            if (item.effect.mp) statLine += `<div class="game-tooltip-stat">💧 Restores ${item.effect.mp} MP</div>`;
        }
        if (item.bonusStat) {
            Object.entries(item.bonusStat).forEach(([k, v]) => {
                statLine += `<div class="game-tooltip-stat">⚔️ +${v} ${k.toUpperCase()}</div>`;
            });
        }
        if (item.cost) statLine += `<div class="game-tooltip-stat">💰 Cost: ${item.cost} coins</div>`;
        if (item.sellPrice) statLine += `<div class="game-tooltip-stat">💰 Sell: ${item.sellPrice.min}-${item.sellPrice.max} coins</div>`;

        const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);

        tip.innerHTML = `
            <div class="game-tooltip-title">${item.name} <small style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.7rem;">[${typeLabel}]</small></div>
            <div class="game-tooltip-desc">${item.description}</div>
            ${statLine}
        `;

        document.body.appendChild(tip);
        activeTooltip = tip;
        positionTooltip(event.clientX, event.clientY);
    }

    function moveGameTooltip(event) {
        if (activeTooltip) positionTooltip(event.clientX, event.clientY);
    }

    function positionTooltip(x, y) {
        if (!activeTooltip) return;
        const pad = 15;
        let left = x + pad;
        let top = y + pad;

        const rect = activeTooltip.getBoundingClientRect();
        if (left + rect.width > window.innerWidth) left = x - rect.width - pad;
        if (top + rect.height > window.innerHeight) top = y - rect.height - pad;

        activeTooltip.style.left = left + "px";
        activeTooltip.style.top = top + "px";
    }

    function hideGameTooltip() {
        const existing = document.getElementById("active-game-tooltip");
        if (existing) existing.remove();
        activeTooltip = null;
    }

    // ---- HUD Stat Tooltips ----
    function initStatTooltips() {
        const descriptions = {
            str: { name: "Strength", desc: "Boosts physical damage and max HP" },
            def: { name: "Defense", desc: "Reduces incoming damage from attacks" },
            int: { name: "Intelligence", desc: "Increases magic damage and max MP" },
            agi: { name: "Agility", desc: "Improves dodge and flee success rate" }
        };

        document.querySelectorAll(".stat-item").forEach(item => {
            const iconEl = item.querySelector(".stat-icon");
            if (!iconEl) return;
            let statKey = null;
            ["str", "def", "int", "agi"].forEach(k => {
                if (iconEl.classList.contains(k)) statKey = k;
            });

            if (statKey) {
                item.dataset.tooltip = "true";
                item.addEventListener("mouseenter", (e) => {
                    const info = descriptions[statKey];
                    const tip = document.createElement("div");
                    tip.className = "game-tooltip";
                    tip.id = "active-game-tooltip";
                    tip.innerHTML = `
                        <div class="game-tooltip-title">${info.name}</div>
                        <div class="game-tooltip-desc">${info.desc}</div>
                    `;
                    document.body.appendChild(tip);
                    activeTooltip = tip;
                    positionTooltip(e.clientX, e.clientY);
                });
                item.addEventListener("mouseleave", hideGameTooltip);
                item.addEventListener("mousemove", moveGameTooltip);
            }
        });
    }

    // ---- Collapsible Sidebar Sections ----
    function initCollapsibleSections() {
        const sections = document.querySelectorAll(".hud-section[data-section]");
        const saved = JSON.parse(localStorage.getItem("tsw_collapsed") || "{}");

        sections.forEach(section => {
            const key = section.dataset.section;
            const title = section.querySelector(".hud-section-title");

            // Restore saved state
            if (saved[key]) {
                section.classList.add("collapsed");
            }

            title.addEventListener("click", () => {
                section.classList.toggle("collapsed");
                // Save state
                const current = JSON.parse(localStorage.getItem("tsw_collapsed") || "{}");
                current[key] = section.classList.contains("collapsed");
                localStorage.setItem("tsw_collapsed", JSON.stringify(current));
            });
        });
    }

    // ---- Auto-Save Indicator ----
    let autoSaveTimeout = null;
    function triggerAutoSave() {
        // Show the indicator briefly
        dom.autoSaveIndicator.classList.add("visible");
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            dom.autoSaveIndicator.classList.remove("visible");
        }, 1500);
    }

    // ---- Save / Load Modal ----
    function openSaveModal() {
        updateSaveModal();
        const modal = new bootstrap.Modal(dom.saveModal);
        modal.show();
    }

    function updateSaveModal() {
        const container = document.getElementById("save-slots-container");
        if (!container) return;

        const slots = GameEngine.getSaveSlots();
        container.innerHTML = "";

        slots.forEach(slot => {
            const div = document.createElement("div");
            div.className = `save-slot ${slot.filled ? "" : "save-slot-empty"}`;

            if (slot.filled) {
                const timeLabel = TIME_PHASES[slot.timePhase] || "Unknown";
                const dateStr = new Date(slot.timestamp).toLocaleDateString() + " " + new Date(slot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                div.innerHTML = `
                    <div class="save-slot-left">
                        <div class="save-slot-number">${slot.id}</div>
                        <div class="save-slot-info">
                            <div class="save-slot-title">The Scrapper — Lv.${slot.level}</div>
                            <div class="save-slot-details">Day ${slot.day} • ${timeLabel} • ${slot.coins} coins • Saved: ${dateStr}</div>
                        </div>
                    </div>
                    <div class="save-slot-actions">
                        <button class="save-action-btn" title="Load Game" data-load="${slot.id}">
                            <i class="fa-solid fa-upload"></i>
                        </button>
                        <button class="save-action-btn" title="Overwrite Save" data-save="${slot.id}">
                            <i class="fa-solid fa-floppy-disk"></i>
                        </button>
                        <button class="save-action-btn delete" title="Delete Save" data-delete="${slot.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <div class="save-slot-left">
                        <div class="save-slot-number">${slot.id}</div>
                        <div class="save-slot-info">
                            <div class="save-slot-title">— Empty Slot —</div>
                            <div class="save-slot-details">No saved game</div>
                        </div>
                    </div>
                    <div class="save-slot-actions">
                        <button class="save-action-btn" title="Save Here" data-save="${slot.id}">
                            <i class="fa-solid fa-floppy-disk"></i>
                        </button>
                    </div>
                `;
            }

            container.appendChild(div);
        });

        container.querySelectorAll("[data-save]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                triggerButtonGlow(btn);
                GameEngine.saveGame(parseInt(btn.dataset.save));
            });
        });

        container.querySelectorAll("[data-load]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                triggerButtonGlow(btn);
                GameEngine.loadGame(parseInt(btn.dataset.load));
                bootstrap.Modal.getInstance(dom.saveModal).hide();
            });
        });

        container.querySelectorAll("[data-delete]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                GameEngine.deleteSave(parseInt(btn.dataset.delete));
            });
        });
    }

    // ---- Keyboard Shortcuts ----
    function initKeyboardShortcuts() {
        document.addEventListener("keydown", (e) => {
            if (document.activeElement === dom.customInput) return;
            if (document.querySelector(".modal.show")) return;

            switch (e.key) {
                case "1": case "2": case "3": case "4":
                    const idx = parseInt(e.key) - 1;
                    const btns = dom.choicesContainer.querySelectorAll(".choice-btn:not([disabled])");
                    if (btns[idx]) btns[idx].click();
                    break;
                case "s": case "S":
                    if (!e.ctrlKey && !e.metaKey) openStatsModal();
                    break;
                case "i": case "I":
                    openInventoryModal();
                    break;
                case "f": case "F":
                    openSaveModal();
                    break;
                case "/":
                    e.preventDefault();
                    dom.customInput.focus();
                    break;
            }
        });
    }

    // ---- Utility ----
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // ---- Initialize ----
    function init() {
        cacheDom();

        // Custom input handler
        dom.sendBtn.addEventListener("click", () => {
            const text = dom.customInput.value;
            dom.customInput.value = "";
            GameEngine.processCustomInput(text);
        });

        dom.customInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") dom.sendBtn.click();
        });

        // Stat allocation buttons
        document.querySelectorAll(".stat-upgrade-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                triggerButtonGlow(btn);
                GameEngine.allocateStat(btn.dataset.stat);
            });
        });

        // Level up dismiss
        document.getElementById("level-up-dismiss").addEventListener("click", () => {
            hideLevelUpOverlay();
            openStatsModal();
        });

        // HUD buttons — with glow
        document.querySelectorAll(".hud-btn").forEach(btn => {
            btn.addEventListener("click", () => triggerButtonGlow(btn));
        });

        document.getElementById("btn-stats").addEventListener("click", openStatsModal);
        document.getElementById("btn-inventory").addEventListener("click", openInventoryModal);
        document.getElementById("btn-save").addEventListener("click", openSaveModal);
        document.getElementById("btn-map").addEventListener("click", () => {
            showToast("Map coming in Phase 2!", "warning", "fa-map");
        });
        document.getElementById("btn-settings").addEventListener("click", () => {
            showToast("Settings coming soon!", "warning", "fa-gear");
        });

        // Init systems
        initKeyboardShortcuts();
        initStatTooltips();
        initCollapsibleSections();
    }

    // ---- Public API ----
    return {
        init,
        updateHUD,
        updateLocation,
        playRegionTransition,
        addNarrative,
        showChoices,
        disableChoices,
        showTypingIndicator,
        hideTypingIndicator,
        flashDamage,
        showFloatingNumber,
        showTurnIndicator,
        hideTurnIndicator,
        showEnemyPanel,
        updateEnemyHp,
        hideEnemyPanel,
        showToast,
        showLevelUpOverlay,
        hideLevelUpOverlay,
        openStatsModal,
        updateStatsModal,
        openInventoryModal,
        updateInventoryModal,
        openSaveModal,
        updateSaveModal
    };
})();

// ---- Bootstrap on DOM Ready ----
document.addEventListener("DOMContentLoaded", () => {
    UI.init();
    GameEngine.init();
});
