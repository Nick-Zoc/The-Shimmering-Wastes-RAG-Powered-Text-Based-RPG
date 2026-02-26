// ============================================================
// THE SHIMMERING WASTES — UI Controller
// DOM manipulation, animations, and rendering
// ============================================================

const UI = (() => {
    // ---- DOM References ----
    const dom = {};

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

        // Modals
        dom.statsModal = document.getElementById("statsModal");
        dom.inventoryModal = document.getElementById("inventoryModal");
    }

    // ---- Update HUD ----
    function updateHUD(state) {
        // HP Bar
        const hpPercent = (state.hp / state.maxHp) * 100;
        dom.hpFill.style.width = hpPercent + "%";
        dom.hpValue.textContent = `${state.hp}/${state.maxHp}`;

        // MP Bar
        const mpPercent = (state.mp / state.maxMp) * 100;
        dom.mpFill.style.width = mpPercent + "%";
        dom.mpValue.textContent = `${state.mp}/${state.maxMp}`;

        // EXP Bar
        const expPercent = (state.exp / state.expToLevel) * 100;
        dom.expFill.style.width = expPercent + "%";
        dom.expValue.textContent = `${state.exp}/${state.expToLevel}`;
        dom.levelBadge.textContent = `Lv. ${state.level}`;

        // Stats
        dom.statStr.textContent = state.str;
        dom.statDef.textContent = state.def;
        dom.statInt.textContent = state.int;
        dom.statAgi.textContent = state.agi;

        // Economy
        dom.coins.textContent = state.coins;

        // Time
        dom.dayCounter.textContent = `Day ${state.day}`;
        dom.timePhases.forEach((el, i) => {
            el.classList.toggle("active", i === state.timePhase);
        });

        // Combat mode
        dom.gameContainer.classList.toggle("combat-mode", state.combatActive);
    }

    // ---- Update Location Banner ----
    function updateLocation(region) {
        dom.locationIcon.innerHTML = `<i class="fa-solid ${region.icon}"></i>`;
        dom.locationIcon.style.color = region.color;
        dom.locationIcon.style.background = hexToRgba(region.color, 0.1);
        dom.locationIcon.style.borderColor = hexToRgba(region.color, 0.3);
        dom.locationName.textContent = region.name;
        dom.locationLevel.textContent = region.levelRange;
    }

    // ---- Narrative Messages ----
    function addNarrative(html, type) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `narrative-message message-${type === "gm" ? "gm" : "player"}`;

        const sender = type === "gm"
            ? `<div class="message-sender"><i class="fa-solid fa-scroll"></i> The Wastes</div>`
            : `<div class="message-sender">You</div>`;

        msgDiv.innerHTML = `
            ${sender}
            <div class="message-content">${html}</div>
        `;

        dom.narrativeContainer.appendChild(msgDiv);

        // Scroll to bottom
        requestAnimationFrame(() => {
            dom.narrativeContainer.scrollTop = dom.narrativeContainer.scrollHeight;
        });
    }

    // ---- Show Choices ----
    function showChoices(choices) {
        dom.choicesContainer.innerHTML = "";

        choices.forEach(choice => {
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

            btn.innerHTML = `
                <i class="fa-solid ${choice.icon}"></i>
                <span>${choice.text}</span>
            `;

            btn.addEventListener("click", () => {
                GameEngine.processChoice(choice.id);
            });

            dom.choicesContainer.appendChild(btn);
        });
    }

    function disableChoices() {
        const buttons = dom.choicesContainer.querySelectorAll(".choice-btn");
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.4";
            btn.style.pointerEvents = "none";
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

    // ---- Damage Flash ----
    function flashDamage() {
        const hpGroup = document.querySelector(".bar-hp");
        hpGroup.classList.add("damage-flash");
        dom.gameContainer.classList.add("damage-flash-screen");

        setTimeout(() => {
            hpGroup.classList.remove("damage-flash");
            dom.gameContainer.classList.remove("damage-flash-screen");
        }, 500);
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

        setTimeout(() => {
            if (toast.parentNode) toast.remove();
        }, 3000);
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

        // Enable/disable upgrade buttons
        const btns = document.querySelectorAll(".stat-upgrade-btn");
        btns.forEach(btn => {
            btn.disabled = state.statPoints <= 0;
        });
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

        // Equipment
        const weapon = ITEMS[state.weapon];
        const armor = ITEMS[state.armor];
        document.getElementById("equipped-weapon-icon").className = `fa-solid ${weapon.icon}`;
        document.getElementById("equipped-weapon-icon").style.color = weapon.iconColor;
        document.getElementById("equipped-weapon-name").textContent = weapon.name;
        document.getElementById("equipped-armor-icon").className = `fa-solid ${armor.icon}`;
        document.getElementById("equipped-armor-icon").style.color = armor.iconColor;
        document.getElementById("equipped-armor-name").textContent = armor.name;

        // Inventory items (exclude equipped)
        const invItems = state.inventory.filter(i => i.id !== state.weapon && i.id !== state.armor);

        invItems.forEach(slot => {
            const item = ITEMS[slot.id];
            if (!item) return;

            const div = document.createElement("div");
            div.className = "inventory-slot";
            div.innerHTML = `
                <i class="fa-solid ${item.icon}" style="color: ${item.iconColor}"></i>
                <div class="inventory-slot-name">${item.name}</div>
                ${slot.qty > 1 ? `<div class="inventory-slot-qty">x${slot.qty}</div>` : ""}
            `;

            if (item.type === "consumable") {
                div.addEventListener("click", () => {
                    GameEngine.useItem(slot.id);
                });
                div.title = `Click to use: ${item.description}`;
            } else {
                div.title = item.description;
            }

            grid.appendChild(div);
        });

        // Fill remaining slots
        const remaining = 12 - invItems.length;
        for (let i = 0; i < remaining; i++) {
            const div = document.createElement("div");
            div.className = "inventory-slot empty";
            div.innerHTML = `<i class="fa-solid fa-lock" style="color: var(--text-muted)"></i>`;
            grid.appendChild(div);
        }
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
            if (e.key === "Enter") {
                dom.sendBtn.click();
            }
        });

        // Stat allocation buttons
        document.querySelectorAll(".stat-upgrade-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const stat = btn.dataset.stat;
                GameEngine.allocateStat(stat);
            });
        });

        // Level up dismiss
        document.getElementById("level-up-dismiss").addEventListener("click", () => {
            hideLevelUpOverlay();
            openStatsModal();
        });

        // HUD buttons
        document.getElementById("btn-stats").addEventListener("click", openStatsModal);
        document.getElementById("btn-inventory").addEventListener("click", openInventoryModal);
        document.getElementById("btn-map").addEventListener("click", () => {
            showToast("Map coming in Phase 2!", "warning", "fa-map");
        });
        document.getElementById("btn-settings").addEventListener("click", () => {
            showToast("Settings coming soon!", "warning", "fa-gear");
        });
    }

    // ---- Public API ----
    return {
        init,
        updateHUD,
        updateLocation,
        addNarrative,
        showChoices,
        disableChoices,
        showTypingIndicator,
        hideTypingIndicator,
        flashDamage,
        showEnemyPanel,
        updateEnemyHp,
        hideEnemyPanel,
        showToast,
        showLevelUpOverlay,
        hideLevelUpOverlay,
        openStatsModal,
        updateStatsModal,
        openInventoryModal,
        updateInventoryModal
    };
})();

// ---- Bootstrap on DOM Ready ----
document.addEventListener("DOMContentLoaded", () => {
    UI.init();
    GameEngine.init();
});
