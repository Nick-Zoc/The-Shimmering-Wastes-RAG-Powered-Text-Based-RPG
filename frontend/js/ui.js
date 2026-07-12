// ============================================================
// THE SHIMMERING WASTES — UI Controller
// Accessible vanilla-JS rendering for the Bastion Field Rig interface.
// ============================================================

const UI = (() => {
    // ---- DOM References ----
    const dom = {};

    // ---- Previous state for change detection ----
    let prevState = null;
    let typewriterActive = false;
    let finishActiveTypewriter = null;

    const SPEAKERS = {
        narrator: { name: "The Wastes", icon: "fa-scroll" },
        silas: { name: "Silas", icon: "fa-hammer" },
        elara: { name: "Elara", icon: "fa-staff-snake" }
    };

    const preferences = {
        textSpeed: Number(localStorage.getItem("tsw_text_speed") || 18),
        textSize: localStorage.getItem("tsw_text_size") || "standard",
        musicEnabled: localStorage.getItem("tsw_music_enabled") !== "false",
        reducedMotion: localStorage.getItem("tsw_reduced_motion") === "true" || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    };
    if (![0, 8, 18, 32].includes(preferences.textSpeed)) preferences.textSpeed = 18;
    if (!["compact", "standard", "large"].includes(preferences.textSize)) preferences.textSize = "standard";

    function cacheDom() {
        dom.hpFill = document.getElementById("hp-fill");
        dom.hpValue = document.getElementById("hp-value");
        dom.mpFill = document.getElementById("mp-fill");
        dom.mpValue = document.getElementById("mp-value");
        dom.expFill = document.getElementById("exp-fill");
        dom.expValue = document.getElementById("exp-value");
        dom.levelBadge = document.getElementById("level-badge");
        dom.playerAvatar = document.getElementById("player-avatar-image");
        dom.playerName = document.getElementById("player-name");
        dom.playerTitle = document.getElementById("player-title");

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
        dom.regionTransitionName = document.getElementById("region-transition-name");
        dom.regionTransitionLevel = document.getElementById("region-transition-level");
        dom.autoSaveIndicator = document.getElementById("auto-save-indicator");

        // Modals
        dom.statsModal = document.getElementById("statsModal");
        dom.inventoryModal = document.getElementById("inventoryModal");
        dom.saveModal = document.getElementById("saveModal");
        dom.mapModal = document.getElementById("mapModal");
        dom.settingsModal = document.getElementById("settingsModal");
        dom.textSpeed = document.getElementById("setting-text-speed");
        dom.textSize = document.getElementById("setting-text-size");
        dom.musicEnabled = document.getElementById("setting-music-enabled");
        dom.reducedMotion = document.getElementById("setting-reduced-motion");

        // V3 New DOM
        dom.bgMusic = document.getElementById("bg-music");
        dom.musicToggle = document.getElementById("music-toggle");
        dom.musicIcon = document.getElementById("music-icon");
        dom.mainMenuScreen = document.getElementById("main-menu-screen");
        dom.btnNewGame = document.getElementById("btn-new-game");
        dom.btnLoadGame = document.getElementById("btn-load-game");
        dom.vnScreen = document.getElementById("vn-screen");
        dom.vnSpeaker = document.getElementById("vn-speaker");
        dom.vnText = document.getElementById("vn-text");
        dom.vnNextBtn = document.getElementById("vn-next");
        dom.charCreation = document.getElementById("character-creation");
        dom.charNameInput = document.getElementById("char-name-input");
        dom.buildGrid = document.getElementById("build-grid");
        dom.btnStartAdventure = document.getElementById("btn-start-adventure");
    }

    // ---- Update HUD with change detection ----
    function updateHUD(state) {
        const hpPercent = state.maxHp ? (state.hp / state.maxHp) * 100 : 0;
        dom.hpFill.style.width = hpPercent + "%";
        dom.hpValue.textContent = `${state.hp}/${state.maxHp}`;
        dom.hpFill.parentElement.setAttribute("aria-valuenow", state.hp);
        dom.hpFill.parentElement.setAttribute("aria-valuemax", state.maxHp);

        const hpGroup = document.querySelector(".bar-hp");
        hpGroup.classList.toggle("critical", hpPercent <= 25 && state.hp > 0);

        const mpPercent = state.maxMp ? (state.mp / state.maxMp) * 100 : 0;
        dom.mpFill.style.width = mpPercent + "%";
        dom.mpValue.textContent = `${state.mp}/${state.maxMp}`;
        dom.mpFill.parentElement.setAttribute("aria-valuenow", state.mp);
        dom.mpFill.parentElement.setAttribute("aria-valuemax", state.maxMp);

        const expPercent = (state.exp / state.expToLevel) * 100;
        dom.expFill.style.width = expPercent + "%";
        dom.expValue.textContent = `${state.exp}/${state.expToLevel}`;
        dom.expFill.parentElement.setAttribute("aria-valuenow", state.exp);
        dom.expFill.parentElement.setAttribute("aria-valuemax", state.expToLevel);
        dom.levelBadge.textContent = `Lv. ${state.level}`;

        if (dom.playerName) dom.playerName.textContent = state.playerName;
        if (dom.playerTitle) dom.playerTitle.textContent = `${state.buildId || "survivor"} · wastes survivor`;
        if (dom.playerAvatar && state.playerAvatar) dom.playerAvatar.src = state.playerAvatar;

        updateStatWithFlash(dom.statStr, state.str);
        updateStatWithFlash(dom.statDef, state.def);
        updateStatWithFlash(dom.statInt, state.int);
        updateStatWithFlash(dom.statAgi, state.agi);

        if (prevState && prevState.coins !== state.coins) {
            dom.coins.classList.add("stat-changed");
            setTimeout(() => dom.coins.classList.remove("stat-changed"), 600);
        }
        dom.coins.textContent = state.coins;

        dom.dayCounter.textContent = `Day ${state.day}`;
        dom.timePhases.forEach((el, i) => {
            el.classList.toggle("active", i === state.timePhase);
        });

        dom.gameContainer.classList.toggle("combat-mode", state.combatActive);
        document.body.dataset.gameState = state.combatActive ? "combat" : "exploration";
        document.body.classList.toggle("critical-health", hpPercent <= 25 && state.hp > 0);
        updateStatsBadge(state.statPoints);
        updateQuickUseBar(state);
        updateHotbar(state);
        scheduleAutoSave(state);

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

    // ---- Region Transition Effect (with location message, 1.5s) ----
    function playRegionTransition(regionName, regionLevel, callback) {
        dom.regionTransitionName.textContent = regionName || "Unknown Region";
        dom.regionTransitionLevel.textContent = regionLevel || "";
        dom.regionTransition.classList.add("active");

        // Hold for 1.5s to let player read
        setTimeout(() => {
            if (callback) callback();
            // Fade out after callback
            setTimeout(() => {
                dom.regionTransition.classList.remove("active");
            }, 400);
        }, 1500);
    }

    // ---- Detect speaker type from narrative content ----
    function detectSpeaker(html) {
        if (!html) return "narrator";
        const lower = html.toLowerCase();
        if (lower.includes("silas") && (lower.includes('"') || lower.includes("&quot;") || lower.includes("<em>"))) {
            return "silas";
        }
        if (lower.includes("elara") && (lower.includes('"') || lower.includes("&quot;") || lower.includes("<em>"))) {
            return "elara";
        }
        return "narrator";
    }

    function sanitizeNarrative(html) {
        if (window.DOMPurify) {
            return window.DOMPurify.sanitize(String(html), {
                ALLOWED_TAGS: ["strong", "em", "span", "br", "p"],
                ALLOWED_ATTR: []
            });
        }

        const fallback = document.createElement("div");
        fallback.textContent = String(html);
        return fallback.innerHTML;
    }

    // ---- Narrative Messages with Typewriter + Local Identity ----
    function addNarrative(html, type, speaker) {
        const msgDiv = document.createElement("div");
        msgDiv.className = `narrative-message message-${type === "gm" ? "gm" : "player"} message-new`;

        const senderDiv = document.createElement("div");
        senderDiv.className = "message-sender";
        if (type === "gm") {
            const speakerKey = speaker || detectSpeaker(html);
            const speakerMeta = SPEAKERS[speakerKey] || SPEAKERS.narrator;
            const sigil = document.createElement("span");
            sigil.className = `message-sigil sigil-${speakerKey}`;
            sigil.setAttribute("aria-hidden", "true");
            sigil.innerHTML = `<i class="fa-solid ${speakerMeta.icon}"></i>`;
            senderDiv.append(sigil, document.createTextNode(speakerMeta.name));
        } else {
            const playerState = GameEngine.getState();
            const avatar = document.createElement("img");
            avatar.className = "message-avatar";
            avatar.src = playerState.playerAvatar || "img/avatar_survivor.png";
            avatar.alt = "";
            senderDiv.append(avatar, document.createTextNode(playerState.playerName || "You"));
        }

        const contentDiv = document.createElement("div");
        contentDiv.className = "message-content";

        msgDiv.appendChild(senderDiv);
        msgDiv.appendChild(contentDiv);
        dom.narrativeContainer.appendChild(msgDiv);

        setTimeout(() => msgDiv.classList.remove("message-new"), 1500);

        const safeHtml = type === "gm" ? sanitizeNarrative(html) : null;
        if (type === "gm" && String(html).length < 800 && !preferences.reducedMotion && preferences.textSpeed > 0) {
            typewriteHTML(contentDiv, safeHtml);
        } else if (type === "gm") {
            contentDiv.innerHTML = safeHtml;
        } else {
            contentDiv.textContent = String(html);
        }

        requestAnimationFrame(() => {
            dom.narrativeContainer.scrollTop = dom.narrativeContainer.scrollHeight;
        });
    }

    // ---- Typewriter HTML ----
    function typewriteHTML(container, html) {
        if (finishActiveTypewriter) finishActiveTypewriter();
        typewriterActive = true;
        container.innerHTML = '';

        const cursor = document.createElement("span");
        cursor.className = "typewriter-cursor";

        const temp = document.createElement("div");
        temp.innerHTML = html;
        const fullText = temp.textContent || temp.innerText;

        let index = 0;
        const speed = preferences.textSpeed;
        let timerId = null;
        let finished = false;

        function finish() {
            if (finished) return;
            finished = true;
            clearTimeout(timerId);
            cursor.remove();
            container.innerHTML = sanitizeNarrative(html);
            typewriterActive = false;
            finishActiveTypewriter = null;
            dom.narrativeContainer.scrollTop = dom.narrativeContainer.scrollHeight;
        }

        finishActiveTypewriter = finish;

        function typeNext() {
            if (index < fullText.length) {
                container.textContent = fullText.substring(0, index + 1);
                container.appendChild(cursor);
                index++;
                dom.narrativeContainer.scrollTop = dom.narrativeContainer.scrollHeight;
                timerId = setTimeout(typeNext, speed);
            } else {
                finish();
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

    // ---- Subtle Button Glow ----
    function triggerButtonGlow(element) {
        element.classList.remove("btn-click-glow");
        void element.offsetWidth;
        element.classList.add("btn-click-glow");
        setTimeout(() => element.classList.remove("btn-click-glow"), 350);
    }

    // ---- Combat Turn Indicator ----
    function showTurnIndicator(isPlayerTurn) {
        // Force re-animation by removing and re-adding
        dom.turnIndicator.classList.remove("active", "player-turn", "enemy-turn");
        void dom.turnIndicator.offsetWidth;

        dom.turnIndicator.classList.add("active");
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

    // ---- Ability Hotbar ----
    function updateHotbar(state) {
        const hotbar = document.getElementById("ability-hotbar");
        if (!hotbar) return;

        if (!state.combatActive) {
            hotbar.classList.remove("active");
            return;
        }

        hotbar.classList.add("active");
        hotbar.innerHTML = "";

        // Standard test loadout (can be expanded later if skills depend on class)
        const availableAbilities = ["strike", "heavy_blow", "mana_bolt", "first_aid", "guard"];

        availableAbilities.forEach(abilityId => {
            const ability = ABILITIES[abilityId];
            if (!ability) return;

            const currentCd = state.cooldowns ? state.cooldowns[abilityId] || 0 : 0;
            const canAfford = state.mp >= ability.mpCost;
            const isReady = currentCd <= 0 && canAfford && !state.combatResolving;

            const el = document.createElement("button");
            el.className = `hotbar-btn ${isReady ? "" : "disabled"}`;
            el.type = "button";
            el.disabled = !isReady;
            el.setAttribute("aria-label", `${ability.name}. ${ability.description}${ability.mpCost ? `. Costs ${ability.mpCost} mana.` : ""}`);
            if (currentCd > 0) el.classList.add("on-cooldown");

            el.innerHTML = `
                <i class="fa-solid ${ability.icon}"></i>
                <span class="hotbar-btn-name">${ability.name}</span>
                ${ability.mpCost > 0 ? `<span class="hotbar-btn-mp">${ability.mpCost} MP</span>` : ""}
                ${currentCd > 0 ? `<div class="cooldown-overlay">${currentCd}</div>` : ""}
            `;

            el.addEventListener("pointerenter", (e) => showGameTooltip(ability, e, true));
            el.addEventListener("pointerleave", hideGameTooltip);
            el.addEventListener("pointermove", moveGameTooltip);

            if (isReady) {
                el.addEventListener("click", () => {
                    triggerButtonGlow(el);
                    hideGameTooltip();
                    GameEngine.useAbility(abilityId);
                });
            }

            hotbar.appendChild(el);
        });
    }

    // ---- Quick-Use Consumable Bar ----
    function updateQuickUseBar(state) {
        const bar = dom.quickUseBar;
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
            const el = document.createElement("button");
            el.type = "button";
            el.className = "quick-use-item";
            el.setAttribute("aria-label", `Use ${item.name}. ${slot.qty} remaining.`);
            el.innerHTML = `
                <i class="fa-solid ${item.icon}" style="color: ${item.iconColor}"></i>
                ${item.name}
                <span class="quick-use-qty">x${slot.qty}</span>
            `;

            el.addEventListener("click", () => {
                triggerButtonGlow(el);
                GameEngine.useItem(slot.id);
            });

            el.addEventListener("pointerenter", (e) => showGameTooltip(item, e));
            el.addEventListener("pointerleave", hideGameTooltip);
            el.addEventListener("pointermove", moveGameTooltip);

            bar.appendChild(el);
        });
    }

    // ---- Typing Indicator ----
    function showTypingIndicator() {
        const indicator = document.createElement("div");
        indicator.className = "narrative-message message-gm";
        indicator.id = "typing-indicator";
        indicator.innerHTML = `
            <div class="message-sender">
                <span class="message-sigil sigil-narrator" aria-hidden="true"><i class="fa-solid fa-scroll"></i></span>
                The Wastes
            </div>
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
        dom.levelUpLevel.innerHTML = `
            Level ${level}!
            <div class="level-up-stats">
                <div class="level-stat-box"><i class="fa-solid fa-heart-pulse"></i><div class="stat-val">+HP/MP</div></div>
                <div class="level-stat-box"><i class="fa-solid fa-arrow-up-right-dots"></i><div class="stat-val">+3 Points</div></div>
                <div class="level-stat-box"><i class="fa-solid fa-dumbbell"></i><div class="stat-val">+1 All</div></div>
            </div>
        `;
        dom.levelUpOverlay.classList.add("active");
    }

    function hideLevelUpOverlay() {
        dom.levelUpOverlay.classList.remove("active");
    }

    // ---- Stats Modal ----
    function openStatsModal() {
        const state = GameEngine.getState();
        const derived = GameEngine.getDerivedStats();
        updateStatsModal(state, derived);
        const modal = new bootstrap.Modal(dom.statsModal);
        modal.show();
    }

    function updateStatsModal(state, derived) {
        // Base Stats (Left Column)
        document.getElementById("modal-stat-points").textContent = state.statPoints;
        document.getElementById("modal-str").textContent = state.str;
        document.getElementById("modal-def").textContent = state.def;
        document.getElementById("modal-int").textContent = state.int;
        document.getElementById("modal-agi").textContent = state.agi;

        const btns = document.querySelectorAll(".stat-upgrade-btn");
        btns.forEach(btn => { btn.disabled = state.statPoints <= 0; });

        // Derived Stats (Right Column)
        if (derived) {
            document.getElementById("derived-hp").textContent = derived.maxHp;
            document.getElementById("derived-mp").textContent = derived.maxMp;
            document.getElementById("derived-atk").textContent = `${derived.atkMin} - ${derived.atkMax}`;
            document.getElementById("derived-dr").textContent = `${derived.drPercent.toFixed(1)}%`;
            document.getElementById("derived-matk").textContent = `${derived.matkMin} - ${derived.matkMax}`;
            document.getElementById("derived-crit").textContent = `${(derived.critChance * 100).toFixed(1)}%`;
            document.getElementById("derived-evade").textContent = `${(derived.evadeChance * 100).toFixed(1)}%`;
        }
    }

    // ---- Inventory Modal ----
    function openInventoryModal() {
        updateInventoryModal(GameEngine.getState());
        const modal = new bootstrap.Modal(dom.inventoryModal);
        modal.show();
    }

    function updateInventoryModal(state) {
        const pdGrid = document.getElementById("paper-doll-grid");
        if (pdGrid) {
            pdGrid.innerHTML = "";
            const slots = [
                { id: "head", icon: "fa-crown", label: "Head" },
                { id: "chest", icon: "fa-shirt", label: "Chest" },
                { id: "main_hand", icon: "fa-hand-fist", label: "Main Hand" },
                { id: "off_hand", icon: "fa-shield", label: "Off Hand" },
                { id: "accessory", icon: "fa-ring", label: "Accessory" }
            ];

            slots.forEach(s => {
                const itemId = state.equipment[s.id];
                const item = itemId ? ITEMS[itemId] : null;

                const div = document.createElement(item ? "button" : "div");
                div.className = "pd-slot " + (item ? "filled" : "");
                div.dataset.slot = s.id;

                if (item) {
                    div.type = "button";
                    div.setAttribute("aria-label", `Unequip ${item.name} from ${s.label}`);
                    div.innerHTML = `
                        <i class="fa-solid ${item.icon}" style="color: ${item.iconColor}"></i>
                        <div class="pd-slot-name">${item.name}</div>
                    `;
                    div.style.borderColor = getRarityColor(item.rarity);
                    div.addEventListener("pointerenter", (e) => showGameTooltip(item, e));
                    div.addEventListener("pointerleave", hideGameTooltip);
                    div.addEventListener("pointermove", moveGameTooltip);
                    div.addEventListener("click", () => {
                        GameEngine.unequipItem(s.id);
                        hideGameTooltip();
                    });
                } else {
                    div.innerHTML = `<i class="fa-solid ${s.icon}"></i><div class="pd-slot-name">${s.label}</div>`;
                }
                pdGrid.appendChild(div);
            });
        }

        const grid = document.getElementById("inventory-grid");
        if (!grid) return;
        grid.innerHTML = "";

        const invItems = state.inventory;

        invItems.forEach(slot => {
            const item = ITEMS[slot.id];
            if (!item) return;

            const rarityClass = item.rarity ? `rarity-${item.rarity}` : "rarity-common";
            const isActionable = item.type === "consumable" || item.type === "equipment";
            const div = document.createElement(isActionable ? "button" : "div");
            div.className = `inventory-slot ${rarityClass}`;
            if (isActionable) {
                div.type = "button";
                div.setAttribute("aria-label", `${item.type === "consumable" ? "Use" : "Equip"} ${item.name}${slot.qty > 1 ? `, quantity ${slot.qty}` : ""}`);
            }
            div.innerHTML = `
                <i class="fa-solid ${item.icon}" style="color: ${item.iconColor}"></i>
                <div class="inventory-slot-name">${item.name}</div>
                ${slot.qty > 1 ? `<div class="inventory-slot-qty">x${slot.qty}</div>` : ""}
            `;

            div.addEventListener("pointerenter", (e) => showGameTooltip(item, e));
            div.addEventListener("pointerleave", hideGameTooltip);
            div.addEventListener("pointermove", moveGameTooltip);

            if (item.type === "consumable") {
                div.addEventListener("click", () => {
                    triggerButtonGlow(div);
                    GameEngine.useItem(slot.id);
                    hideGameTooltip();
                });
                div.style.cursor = "pointer";
            } else if (item.type === "equipment") {
                div.addEventListener("click", () => {
                    triggerButtonGlow(div);
                    GameEngine.equipItem(slot.id);
                    hideGameTooltip();
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

    function getRarityColor(rarity) {
        switch (rarity) {
            case 'common': return '#6c757d';
            case 'uncommon': return '#00f5d4';
            case 'rare': return '#ffd700';
            case 'legendary': return '#ff0054';
            default: return 'var(--border-subtle)';
        }
    }

    // ---- Game Tooltip System (FIXED persistence bug) ----
    let activeTooltip = null;
    let tooltipCleanupInterval = null;

    function showGameTooltip(itemOrAbility, event, isAbility = false) {
        hideGameTooltip();

        const tip = document.createElement("div");
        tip.className = "game-tooltip";
        tip.id = "active-game-tooltip";

        let statLine = "";

        if (isAbility) {
            if (itemOrAbility.mpCost > 0) statLine += `<div class="game-tooltip-stat">💧 Cost: ${itemOrAbility.mpCost} MP</div>`;
            if (itemOrAbility.cooldown > 0) statLine += `<div class="game-tooltip-stat">⏳ Cooldown: ${itemOrAbility.cooldown} Turns</div>`;
            if (itemOrAbility.multiplier) statLine += `<div class="game-tooltip-stat">⚔️ Power: ${itemOrAbility.multiplier * 100}% ${itemOrAbility.type}</div>`;
            if (itemOrAbility.healAmount) statLine += `<div class="game-tooltip-stat">❤️ Heals: ${itemOrAbility.healAmount} HP</div>`;

            tip.innerHTML = `
                <div class="game-tooltip-title">${itemOrAbility.name} <small style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.7rem;">[Ability]</small></div>
                <div class="game-tooltip-desc">${itemOrAbility.description}</div>
                <div class="game-tooltip-stats-container" style="margin-top: 10px;">${statLine}</div>
            `;
        } else {
            const item = itemOrAbility;
            // Stat Comparison Logic for Equipment
            if (item.type === "equipment" && item.equipSlot) {
                const state = GameEngine.getState();
                const equippedId = state.equipment[item.equipSlot];
                const equippedItem = equippedId ? ITEMS[equippedId] : null;

                if (item.bonusStat) {
                    Object.entries(item.bonusStat).forEach(([k, v]) => {
                        let diffFormatted = "";
                        if (equippedItem && equippedItem.bonusStat) {
                            const eqVal = equippedItem.bonusStat[k] || 0;
                            const diff = v - eqVal;
                            if (diff > 0) diffFormatted = ` <span class="text-success">(+${diff})</span>`;
                            else if (diff < 0) diffFormatted = ` <span class="text-danger">(${diff})</span>`;
                        } else if (equippedItem && !equippedItem.bonusStat) {
                            diffFormatted = ` <span class="text-success">(+${v})</span>`;
                        } else if (!equippedItem) {
                            diffFormatted = ` <span class="text-success">(+${v})</span>`;
                        }
                        statLine += `<div class="game-tooltip-stat">⚔️ +${v} ${k.toUpperCase()}${diffFormatted}</div>`;
                    });
                }

                if (equippedItem && equippedItem.bonusStat) {
                    // Check if equipped item has stats this new item doesn't
                    Object.entries(equippedItem.bonusStat).forEach(([k, eqVal]) => {
                        if (!item.bonusStat || item.bonusStat[k] === undefined) {
                            statLine += `<div class="game-tooltip-stat">⚔️ 0 ${k.toUpperCase()} <span class="text-danger">(-${eqVal})</span></div>`;
                        }
                    });
                }

                if (equippedItem && equippedItem.id !== item.id) {
                    statLine += `<div class="game-tooltip-compare" style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px;"><small class="text-muted">Equipped: ${equippedItem.name}</small></div>`;
                }
            } else {
                if (item.effect) {
                    if (item.effect.hp) statLine += `<div class="game-tooltip-stat">❤️ Restores ${item.effect.hp} HP</div>`;
                    if (item.effect.mp) statLine += `<div class="game-tooltip-stat">💧 Restores ${item.effect.mp} MP</div>`;
                }
                if (item.bonusStat) {
                    Object.entries(item.bonusStat).forEach(([k, v]) => {
                        statLine += `<div class="game-tooltip-stat">⚔️ +${v} ${k.toUpperCase()}</div>`;
                    });
                }
            }

            if (item.cost) statLine += `<div class="game-tooltip-stat">💰 Cost: ${item.cost} coins</div>`;
            if (item.sellPrice) statLine += `<div class="game-tooltip-stat">💰 Sell: ${item.sellPrice.min}-${item.sellPrice.max} coins</div>`;

            const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);

            tip.innerHTML = `
                <div class="game-tooltip-title">${item.name} <small style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.7rem;">[${typeLabel}]</small></div>
                <div class="game-tooltip-desc">${item.description}</div>
                <div class="game-tooltip-stats-container" style="margin-top: 10px;">${statLine}</div>
            `;
        }

        document.body.appendChild(tip);
        activeTooltip = tip;
        positionTooltip(event.clientX, event.clientY);

        // Safety: auto-hide after 5s if still around
        clearTimeout(tooltipCleanupInterval);
        tooltipCleanupInterval = setTimeout(() => hideGameTooltip(), 5000);
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
        // Remove ALL tooltip elements (belt-and-suspenders approach)
        document.querySelectorAll(".game-tooltip").forEach(el => el.remove());
        activeTooltip = null;
        clearTimeout(tooltipCleanupInterval);
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
                item.addEventListener("pointerenter", (e) => {
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

                    clearTimeout(tooltipCleanupInterval);
                    tooltipCleanupInterval = setTimeout(() => hideGameTooltip(), 5000);
                });
                item.addEventListener("pointerleave", hideGameTooltip);
                item.addEventListener("pointermove", moveGameTooltip);
            }
        });
    }

    // ---- Debounced Auto-Save ----
    let autoSaveTimeout = null;
    function scheduleAutoSave(state) {
        if (!state.gameStarted) return;
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            if (!GameEngine.autoSave()) return;
            dom.autoSaveIndicator.classList.add("visible");
            setTimeout(() => dom.autoSaveIndicator.classList.remove("visible"), 1300);
        }, 700);
    }

    // ---- Save / Load Modal ----
    function openSaveModal() {
        updateSaveModal();
        const modal = new bootstrap.Modal(dom.saveModal);
        modal.show();
    }

    function openMapModal() {
        const currentRegion = GameEngine.getState().currentRegion;
        document.querySelectorAll("[data-map-region]").forEach(region => {
            const isCurrent = region.dataset.mapRegion === currentRegion;
            region.classList.toggle("current", isCurrent);
            if (isCurrent) region.setAttribute("aria-current", "location");
            else region.removeAttribute("aria-current");
        });
        bootstrap.Modal.getOrCreateInstance(dom.mapModal).show();
    }

    function openSettingsModal() {
        if (dom.textSpeed) dom.textSpeed.value = String(preferences.textSpeed);
        if (dom.textSize) dom.textSize.value = preferences.textSize;
        if (dom.musicEnabled) dom.musicEnabled.checked = preferences.musicEnabled;
        if (dom.reducedMotion) dom.reducedMotion.checked = preferences.reducedMotion;
        bootstrap.Modal.getOrCreateInstance(dom.settingsModal).show();
    }

    function applyMotionPreference() {
        document.documentElement.classList.toggle("reduce-motion", preferences.reducedMotion);
        ParticleEngine.setPaused(preferences.reducedMotion);
    }

    function applyTextSizePreference() {
        document.documentElement.dataset.textSize = preferences.textSize;
    }

    function updateMusicControls(playing) {
        dom.musicIcon.classList.toggle("fa-volume-high", playing);
        dom.musicIcon.classList.toggle("fa-volume-xmark", !playing);
        dom.musicIcon.style.color = playing ? "var(--teal)" : "";
        dom.musicToggle.setAttribute("aria-pressed", String(playing));
        if (dom.musicEnabled) dom.musicEnabled.checked = preferences.musicEnabled;
    }

    function setMusicEnabled(enabled) {
        preferences.musicEnabled = enabled;
        localStorage.setItem("tsw_music_enabled", String(enabled));
        if (!enabled) {
            dom.bgMusic.pause();
            updateMusicControls(false);
            return;
        }

        dom.bgMusic.volume = 0.3;
        dom.bgMusic.play().then(() => updateMusicControls(true)).catch(() => updateMusicControls(false));
    }

    function resetNarrative() {
        if (finishActiveTypewriter) finishActiveTypewriter();
        typewriterActive = false;
        dom.narrativeContainer.innerHTML = "";
        dom.choicesContainer.innerHTML = "";
        hideTypingIndicator();
        hideTurnIndicator();
        hideEnemyPanel();
    }

    function updateSaveModal() {
        const container = document.getElementById("save-slots-container");
        if (!container) return;

        const slots = GameEngine.getSaveSlots();
        const gameStarted = GameEngine.getState().gameStarted;
        container.innerHTML = "";

        slots.forEach(slot => {
            const div = document.createElement("div");
            div.className = `save-slot ${slot.filled ? "" : "save-slot-empty"} ${slot.corrupt ? "save-slot-corrupt" : ""}`;

            if (slot.filled) {
                const timeLabel = TIME_PHASES[slot.timePhase] || "Unknown";
                const dateStr = new Date(slot.timestamp).toLocaleDateString() + " " + new Date(slot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const slotTitle = slot.id === "auto" ? "Autosave" : `Slot ${slot.id}`;

                div.innerHTML = `
                    <div class="save-slot-left">
                        <div class="save-slot-number">${slotTitle}</div>
                        <div class="save-slot-info">
                            <div class="save-slot-title"></div>
                            <div class="save-slot-details">Day ${slot.day} • ${timeLabel} • ${slot.coins} coins • Saved: ${dateStr}</div>
                        </div>
                    </div>
                    <div class="save-slot-actions">
                        <button class="save-action-btn" aria-label="Load ${slotTitle}" title="Load Game" data-load="${slot.id}">
                            <i class="fa-solid fa-upload"></i>
                        </button>
                        ${slot.id !== "auto" && gameStarted ? `<button class="save-action-btn" aria-label="Overwrite ${slotTitle}" title="Overwrite Save" data-save="${slot.id}"><i class="fa-solid fa-floppy-disk"></i></button>` : ""}
                        <button class="save-action-btn delete" aria-label="Delete ${slotTitle}" title="Delete Save" data-delete="${slot.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                `;
                div.querySelector(".save-slot-title").textContent = `${slot.playerName} — Lv.${slot.level} · ${slot.buildId}`;
            } else {
                const slotTitle = slot.id === "auto" ? "Autosave" : `Slot ${slot.id}`;
                div.innerHTML = `
                    <div class="save-slot-left">
                        <div class="save-slot-number">${slotTitle}</div>
                        <div class="save-slot-info">
                            <div class="save-slot-title">${slot.corrupt ? "Unreadable field record" : "Empty field record"}</div>
                            <div class="save-slot-details">${slot.corrupt ? "Delete this record before reusing it." : "No saved game"}</div>
                        </div>
                    </div>
                    <div class="save-slot-actions">
                        ${slot.id !== "auto" && gameStarted ? `<button class="save-action-btn" aria-label="Save to ${slotTitle}" title="Save Here" data-save="${slot.id}"><i class="fa-solid fa-floppy-disk"></i></button>` : ""}
                        ${slot.corrupt ? `<button class="save-action-btn delete" aria-label="Delete ${slotTitle}" data-delete="${slot.id}"><i class="fa-solid fa-trash"></i></button>` : ""}
                    </div>
                `;
            }

            container.appendChild(div);
        });

        container.querySelectorAll("[data-save]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                triggerButtonGlow(btn);
                GameEngine.saveGame(Number(btn.dataset.save));
            });
        });

        container.querySelectorAll("[data-load]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                triggerButtonGlow(btn);
                const slotId = btn.dataset.load === "auto" ? "auto" : Number(btn.dataset.load);
                if (GameEngine.loadGame(slotId)) bootstrap.Modal.getInstance(dom.saveModal).hide();
            });
        });

        container.querySelectorAll("[data-delete]").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const slotId = btn.dataset.delete === "auto" ? "auto" : Number(btn.dataset.delete);
                if (btn.dataset.confirmDelete === "true") {
                    GameEngine.deleteSave(slotId);
                    return;
                }

                btn.dataset.confirmDelete = "true";
                btn.classList.add("confirm-delete");
                btn.title = "Click again to confirm deletion";
                btn.setAttribute("aria-label", `Confirm deletion of ${slotId === "auto" ? "autosave" : `slot ${slotId}`}`);
                btn.innerHTML = '<i class="fa-solid fa-check"></i>';
                setTimeout(() => {
                    if (!btn.isConnected) return;
                    btn.dataset.confirmDelete = "false";
                    btn.classList.remove("confirm-delete");
                    btn.title = "Delete Save";
                    btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                }, 3000);
            });
        });
    }

    // ---- Keyboard Shortcuts ----
    function initKeyboardShortcuts() {
        document.addEventListener("keydown", (e) => {
            if (document.activeElement === dom.customInput) return;
            if (document.querySelector(".modal.show")) return;
            if (!GameEngine.getState().gameStarted) return;

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

    // ---- Global tooltip cleanup (fixes persistence bug) ----
    function initGlobalTooltipCleanup() {
        // If mouse moves and isn't over a tooltip-enabled element, hide tooltip
        document.addEventListener("pointermove", (e) => {
            if (!activeTooltip) return;
            const target = e.target;
            // Check if we're over a tooltip-source element
            const isOverTooltipSource = target.closest(".stat-item, .inventory-slot, .quick-use-item, .game-tooltip");
            if (!isOverTooltipSource) {
                hideGameTooltip();
            }
        });

        // Hide tooltip on any scroll
        document.addEventListener("scroll", hideGameTooltip, true);

        // Hide tooltip on click anywhere
        document.addEventListener("click", () => {
            // Small delay to let click handlers process first
            setTimeout(hideGameTooltip, 50);
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

        dom.sendBtn.addEventListener("click", () => {
            const text = dom.customInput.value;
            dom.customInput.value = "";
            GameEngine.processCustomInput(text);
        });

        dom.customInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") dom.sendBtn.click();
        });

        dom.narrativeContainer.addEventListener("click", () => {
            if (finishActiveTypewriter) finishActiveTypewriter();
        });

        dom.narrativeContainer.addEventListener("keydown", (e) => {
            if (finishActiveTypewriter && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                finishActiveTypewriter();
            }
        });

        document.querySelectorAll(".stat-upgrade-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                triggerButtonGlow(btn);
                GameEngine.allocateStat(btn.dataset.stat);
            });
        });

        document.getElementById("level-up-dismiss").addEventListener("click", () => {
            hideLevelUpOverlay();
            openStatsModal();
        });

        document.querySelectorAll(".hud-btn").forEach(btn => {
            btn.addEventListener("click", () => triggerButtonGlow(btn));
        });

        document.getElementById("btn-stats").addEventListener("click", openStatsModal);
        document.getElementById("btn-inventory").addEventListener("click", openInventoryModal);
        document.getElementById("btn-save").addEventListener("click", openSaveModal);
        document.getElementById("btn-map").addEventListener("click", openMapModal);
        document.getElementById("btn-settings").addEventListener("click", openSettingsModal);

        if (dom.textSpeed) {
            dom.textSpeed.addEventListener("change", () => {
                preferences.textSpeed = Number(dom.textSpeed.value);
                localStorage.setItem("tsw_text_speed", String(preferences.textSpeed));
            });
        }

        if (dom.textSize) {
            dom.textSize.addEventListener("change", () => {
                preferences.textSize = dom.textSize.value;
                localStorage.setItem("tsw_text_size", preferences.textSize);
                applyTextSizePreference();
            });
        }

        if (dom.musicEnabled) {
            dom.musicEnabled.addEventListener("change", () => setMusicEnabled(dom.musicEnabled.checked));
        }

        if (dom.reducedMotion) {
            dom.reducedMotion.addEventListener("change", () => {
                preferences.reducedMotion = dom.reducedMotion.checked;
                localStorage.setItem("tsw_reduced_motion", String(preferences.reducedMotion));
                applyMotionPreference();
            });
        }

        applyMotionPreference();
        applyTextSizePreference();
        initKeyboardShortcuts();
        initStatTooltips();
        initGlobalTooltipCleanup();
        initV3Systems();
    }

    // ==========================================
    // V3: MAIN MENU & VISUAL NOVEL & FX
    // ==========================================
    const VN_STORY = [
        { speaker: "???", text: "The Old World died a long time ago. Magic and metal tore the planet apart." },
        { speaker: "???", text: "Now, only the Shimmering Wastes remain. And the things that crawl out of the ash." },
        { speaker: "Silas", text: "Hey! You! Over here, before the Ash Hounds see you!" }
    ];
    let vnStep = 0;
    let finishVnLine = null;

    const BUILDS = [
        {
            id: "bruiser", name: "Bruiser", stats: { maxHp: 65, maxMp: 20, str: 7, def: 4, int: 2, agi: 3 }, avatar: "img/avatar_bruiser.png",
            description: "<strong>The Bruiser</strong> relies on raw Physical Attack and high Maximum HP. They excel at crushing foes quickly but lack evasion and magical aptitude."
        },
        {
            id: "scout", name: "Scout", stats: { maxHp: 45, maxMp: 25, str: 4, def: 3, int: 3, agi: 7 }, avatar: "img/avatar_scout.png",
            description: "<strong>The Scout</strong> prioritizes Agility, leading to high Critical Hit and Evasion rates. They are fragile but can completely avoid incoming attacks."
        },
        {
            id: "scholar", name: "Scholar", stats: { maxHp: 40, maxMp: 45, str: 2, def: 2, int: 8, agi: 4 }, avatar: "img/avatar_scholar.png",
            description: "<strong>The Scholar</strong> focuses on Intelligence, granting the deepest Mana pool and the strongest magical attacks."
        },
        {
            id: "vanguard", name: "Vanguard", stats: { maxHp: 60, maxMp: 20, str: 4, def: 7, int: 3, agi: 2 }, avatar: "img/avatar_vanguard.png",
            description: "<strong>The Vanguard</strong> is an iron fortress. With massive base Defense, they passively reduce all incoming physical damage by a significant percentage."
        },
        {
            id: "survivor", name: "Survivor", stats: { maxHp: 50, maxMp: 30, str: 5, def: 5, int: 5, agi: 5 }, avatar: "img/avatar_survivor.png",
            description: "<strong>The Survivor</strong> is perfectly balanced across all stats. A versatile scrapper capable of adapting to any combat situation in the Wastes."
        }
    ];
    let selectedBuild = null;

    function initV3Systems() {
        // --- Audio Autoplay Setup ---
        let audioStarted = false;
        const initiateAudio = () => {
            if (audioStarted || !dom.bgMusic || !preferences.musicEnabled) return;
            const playPromise = dom.bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    dom.bgMusic.volume = 0.3;
                    updateMusicControls(true);
                    audioStarted = true;
                }).catch(() => updateMusicControls(false));
            }
            // Remove listeners after first interaction
            document.removeEventListener("pointerdown", initiateAudio);
            document.removeEventListener("keydown", initiateAudio);
        };
        document.addEventListener("pointerdown", initiateAudio);
        document.addEventListener("keydown", initiateAudio);

        // Audio Toggle Button
        if (dom.musicToggle) {
            dom.musicToggle.addEventListener("click", (e) => {
                e.stopPropagation(); // Prevent trigger by the global listener above if it hasn't fired
                const audio = dom.bgMusic;
                if (!audio) return;

                if (audio.paused) {
                    setMusicEnabled(true);
                    audioStarted = true;
                } else {
                    setMusicEnabled(false);
                }
            });
        }

        // Main Menu Buttons
        if (dom.btnNewGame) {
            dom.btnNewGame.addEventListener("click", () => {
                dom.mainMenuScreen.classList.remove("active");
                dom.mainMenuScreen.style.display = "none";
                startVNIntro();
            });
        }

        if (dom.btnLoadGame) {
            dom.btnLoadGame.addEventListener("click", () => {
                // Keep the Main Menu screen active and visible.
                // Only show the load modal on top of it.
                openSaveModal();
            });
        }

        // Build Grid Population
        if (dom.buildGrid) {
            dom.buildGrid.innerHTML = "";
            BUILDS.forEach(b => {
                const card = document.createElement("button");
                card.type = "button";
                card.className = "build-card";
                card.setAttribute("aria-pressed", "false");
                card.innerHTML = `
                    <img src="${b.avatar}" class="build-avatar" alt="${b.name}">
                    <div class="build-name">${b.name}</div>
                    <div class="build-stat">STR ${b.stats.str} | DEF ${b.stats.def}</div>
                `;
                card.addEventListener("click", () => selectBuild(b, card));
                dom.buildGrid.appendChild(card);
            });
        }

        // Adventure Start
        if (dom.btnStartAdventure) {
            dom.btnStartAdventure.addEventListener("click", () => {
                const name = dom.charNameInput.value.trim() || "The Scrapper";
                dom.vnScreen.style.display = "none";
                dom.gameContainer.style.display = "flex";

                // Boot game
                GameEngine.startNewGame(name, selectedBuild);
            });
        }
    }

    function startVNIntro() {
        dom.vnScreen.style.display = "flex";
        vnStep = 0;
        showVnDialogue();

        dom.vnNextBtn.addEventListener("click", handleVnNext);
    }

    function handleVnNext() {
        if (finishVnLine) {
            finishVnLine();
            return;
        }

        vnStep++;
        if (vnStep < VN_STORY.length) {
            showVnDialogue();
        } else {
            // End of story, show character creation
            dom.vnNextBtn.style.display = "none";
            document.querySelector(".vn-dialogue-box").style.display = "none";
            dom.charCreation.style.display = "block";
        }
    }

    function showVnDialogue() {
        if (finishVnLine) finishVnLine();
        const line = VN_STORY[vnStep];
        dom.vnSpeaker.textContent = line.speaker;

        // Typewriter effect for VN
        dom.vnText.innerHTML = "";
        let i = 0;
        const text = line.text;

        dom.vnNextBtn.disabled = false;
        dom.vnNextBtn.innerHTML = 'Reveal line <i class="fa-solid fa-forward"></i>';

        const finishLine = () => {
            if (!finishVnLine) return;
            clearInterval(typeInterval);
            dom.vnText.textContent = text;
            finishVnLine = null;
            dom.vnNextBtn.innerHTML = 'Continue <i class="fa-solid fa-caret-right"></i>';
        };
        finishVnLine = finishLine;

        const typeInterval = setInterval(() => {
            if (i < text.length) {
                dom.vnText.textContent += text.charAt(i);
                i++;
            } else {
                finishLine();
            }
        }, 20);
    }

    // Skip down to selectBuild to override it:
    function selectBuild(b, cardElement) {
        selectedBuild = b;
        document.querySelectorAll(".build-card").forEach(c => {
            c.classList.remove("selected");
            c.setAttribute("aria-pressed", "false");
        });
        cardElement.classList.add("selected");
        cardElement.setAttribute("aria-pressed", "true");
        dom.btnStartAdventure.disabled = false;

        // Show the description
        const descBox = document.getElementById("build-description");
        if (descBox) {
            descBox.innerHTML = b.description;
            descBox.style.display = "block";
        }
    }

    function showSlashAnimation() {
        // Create the VFX dynamically over the enemy panel
        const container = document.createElement("div");
        container.className = "vfx-container";
        const slash = document.createElement("div");
        slash.className = "vfx-slash";
        container.appendChild(slash);
        dom.enemyPanel.appendChild(container);

        // Clean up
        setTimeout(() => container.remove(), 400);
    }

    function showManaBoltAnimation() {
        const container = document.createElement("div");
        container.className = "vfx-container";
        const bolt = document.createElement("div");
        bolt.className = "vfx-mana-bolt";
        container.appendChild(bolt);
        dom.enemyPanel.appendChild(container);

        setTimeout(() => container.remove(), 600);
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
        updateSaveModal,
        resetNarrative,
        showSlashAnimation,
        showManaBoltAnimation,
        updateHotbar
    };
})();

// ---- Bootstrap on DOM Ready ----
document.addEventListener("DOMContentLoaded", () => {
    UI.init();
    GameEngine.init();
});
