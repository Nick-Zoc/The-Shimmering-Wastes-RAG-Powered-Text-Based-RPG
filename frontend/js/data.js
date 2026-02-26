// ============================================================
// THE SHIMMERING WASTES — Mock Data Layer v2.0
// All game data: enemies, items, NPCs, mock narratives
// Narratives use clear, simple English while keeping intensity
// ============================================================

const ENEMIES = {
    ash_hound: {
        name: "Ash Hound",
        hp: 30, maxHp: 30,
        attack: 5, defense: 2,
        agility: "High",
        ability: "Ember Bite (10% chance for double damage)",
        region: "Ash Plains",
        expReward: 25,
        coinReward: { min: 3, max: 8 },
        loot: "Scrap Metal",
        description: "A thin, six-legged beast with glowing red eyes and smoking fur. It hunts in packs across the ash dunes."
    },
    rust_beetle: {
        name: "Rust Beetle",
        hp: 45, maxHp: 45,
        attack: 3, defense: 6,
        agility: "Low",
        ability: "Armored Shell (high physical defense)",
        region: "Ash Plains",
        expReward: 30,
        coinReward: { min: 5, max: 12 },
        loot: "Scrap Metal",
        description: "A giant beetle covered in rusted metal. Slow but very tough to break through."
    },
    crystal_golem: {
        name: "Crystal Golem",
        hp: 80, maxHp: 80,
        attack: 12, defense: 8,
        agility: "Very Low",
        ability: "Shatter Stomp (High damage, -2 Defense to self)",
        region: "Crystal Forest",
        expReward: 60,
        coinReward: { min: 15, max: 25 },
        loot: "Shimmering Shard",
        description: "A huge figure made of sharp blue crystals. The ground shakes with every step it takes."
    },
    mana_phantom: {
        name: "Mana Phantom",
        hp: 40, maxHp: 40,
        attack: 15, defense: 0,
        agility: "High",
        ability: "Phase Strike (Ignores physical defense; weak to magic)",
        region: "Crystal Forest",
        expReward: 55,
        coinReward: { min: 10, max: 20 },
        loot: "Shimmering Shard",
        description: "A ghost-like creature made of pure magic energy. Physical attacks go right through it."
    },
    wastes_colossus: {
        name: "The Wastes Colossus",
        hp: 300, maxHp: 300,
        attack: 25, defense: 15,
        agility: "Low",
        ability: "Core Laser (40 damage every 3rd turn; must defend or dodge)",
        region: "Colossus Crater",
        expReward: 500,
        coinReward: { min: 100, max: 200 },
        loot: "The Colossus Core",
        isBoss: true,
        description: "A massive monster of fused metal and magic, towering over the crater. A blinding energy core glows in its chest."
    }
};

const ITEMS = {
    healing_potion: {
        name: "Healing Potion",
        type: "consumable",
        icon: "fa-heart",
        iconColor: "#ff0054",
        effect: { hp: 20 },
        cost: 10,
        description: "A glowing red potion. Heals 20 HP."
    },
    mana_vial: {
        name: "Mana Vial",
        type: "consumable",
        icon: "fa-droplet",
        iconColor: "#00b4d8",
        effect: { mp: 20 },
        cost: 15,
        description: "A shimmering blue liquid. Restores 20 MP."
    },
    scrap_metal: {
        name: "Scrap Metal",
        type: "valuable",
        icon: "fa-gear",
        iconColor: "#adb5bd",
        sellPrice: { min: 2, max: 5 },
        description: "Broken pieces of old machines. Can be sold for a few coins."
    },
    shimmering_shard: {
        name: "Shimmering Shard",
        type: "valuable",
        icon: "fa-gem",
        iconColor: "#00f5d4",
        sellPrice: { min: 15, max: 20 },
        description: "A glowing crystal piece filled with magic energy. Worth good coins."
    },
    rusted_pipe: {
        name: "Rusted Pipe",
        type: "weapon",
        icon: "fa-hammer",
        iconColor: "#ff6b35",
        bonusStat: { str: 2 },
        description: "A heavy iron pipe. Your first weapon. Better than bare fists."
    },
    padded_clothing: {
        name: "Padded Clothing",
        type: "armor",
        icon: "fa-shirt",
        iconColor: "#6c757d",
        bonusStat: { def: 1 },
        description: "Layers of cloth and leather. Basic protection."
    },
    colossus_core: {
        name: "The Colossus Core",
        type: "quest",
        icon: "fa-sun",
        iconColor: "#ffd700",
        description: "The beating heart of the Wastes Colossus. Getting this means you won the game."
    }
};

const NPCS = {
    silas: {
        name: "Silas the Merchant",
        location: "The Last Bastion",
        icon: "fa-coins",
        description: "A skinny man with big goggles and pockets full of gadgets. He trades supplies for coins.",
        shop: ["healing_potion", "mana_vial"]
    },
    elara: {
        name: "Elara the Healer",
        location: "The Last Bastion",
        icon: "fa-hand-holding-medical",
        description: "A calm woman with glowing tattoos on her arms. She heals wounds for a small fee.",
        healCost: 25
    }
};

const REGIONS = {
    last_bastion: {
        name: "The Last Bastion",
        levelRange: "Safe Zone",
        icon: "fa-shield-halved",
        color: "#ffd700",
        description: "A walled settlement inside a narrow canyon. The last safe place for humans. Smells of cooking meat and machine oil.",
        isSafe: true
    },
    ash_plains: {
        name: "The Ash Plains",
        levelRange: "Lv. 1–3",
        icon: "fa-wind",
        color: "#ff6b35",
        description: "A wide, flat wasteland covered in grey ash. The wind howls through dead trees. Dangerous creatures roam here.",
        enemies: ["ash_hound", "rust_beetle"]
    },
    crystal_forest: {
        name: "The Crystal Forest",
        levelRange: "Lv. 4–7",
        icon: "fa-gem",
        color: "#00f5d4",
        description: "Sharp blue-green crystals grow from the ground like frozen lightning. The air buzzes with magic. Only the strong survive.",
        enemies: ["crystal_golem", "mana_phantom"]
    },
    colossus_crater: {
        name: "The Colossus Crater",
        levelRange: "Lv. 8+",
        icon: "fa-skull",
        color: "#ff0054",
        description: "A massive hole in the ground that gives off intense heat and blinding light. The final boss waits at its center.",
        enemies: ["wastes_colossus"],
        isBossZone: true
    }
};

// ============================================================
// MOCK NARRATIVE SCENARIOS — Simplified Language
// Clear, easy-to-read English while staying exciting
// ============================================================

const INTRO_NARRATIVE = `You wake up to the sharp smell of burning metal and the sound of hammers hitting steel. Rough canyon walls surround you — this is <strong>The Last Bastion</strong>, humanity's last safe haven in a ruined world.

A hundred years ago, a massive magical explosion destroyed everything. Now, the <strong>Shimmering Wastes</strong> stretch out forever beyond these walls — a twisted land of glowing crystals, ash deserts, and monsters warped by wild magic.

You are a <strong>Scrapper</strong> — one of the brave few who go out into the Wastes to find useful things from the old world. You grip your rusted pipe tightly. Your padded clothing won't stop much. But out there, under that strange purple sky, there's both treasure and death waiting.

<em>What will you do?</em>`;

const MOCK_SCENARIOS = {
    explore_bastion: {
        narrative: `You walk through the busy streets of the Bastion. Small shops line the canyon walls, their covers made from old scraps of cloth. The air smells like grilled meat and engine grease.

You see <strong>Silas the Merchant</strong> cleaning glass bottles at his shop counter. Nearby, <strong>Elara the Healer</strong> is treating a wounded scrapper — her fingertips glow with soft light.

The main gate stands ahead — beyond it, nothing but grey ash stretches to the horizon.`,
        choices: [
            { id: "talk_silas", text: "Talk to Silas the Merchant", icon: "fa-comments" },
            { id: "talk_elara", text: "Visit Elara the Healer", icon: "fa-hand-holding-medical" },
            { id: "leave_bastion", text: "Head out to the Ash Plains", icon: "fa-person-walking" },
            { id: "check_stats", text: "Check your gear and stats", icon: "fa-clipboard-list" }
        ],
        stateUpdates: { time_advanced: false }
    },
    talk_silas: {
        narrative: `Silas looks up from his counter. His big goggles reflect the torchlight. <em>"Ah, another scrapper trying to stay alive out there, huh?"</em> He waves his hand over his items.

<em>"Healing Potions — 10 coins each, heals 20 HP. Mana Vials — 15 coins, restores 20 MP. Trust me, you really don't want to go into the Wastes without at least one of these."</em>

He leans closer and whispers: <em>"A word of warning — the Ash Hounds are getting braver lately. Don't go too far without a potion."</em>`,
        choices: [
            { id: "buy_potion", text: "Buy a Healing Potion (10 coins)", icon: "fa-heart" },
            { id: "buy_mana", text: "Buy a Mana Vial (15 coins)", icon: "fa-droplet" },
            { id: "explore_bastion", text: "Walk away", icon: "fa-arrow-left" }
        ],
        stateUpdates: { time_advanced: false }
    },
    buy_potion: {
        narrative: `You hand over 10 coins. Silas takes them quickly and gives you a <strong>Healing Potion</strong> — a small bottle of thick red liquid that glows faintly.

<em>"Good choice. This'll fix you up when things get rough out there."</em>`,
        choices: [
            { id: "buy_mana", text: "Buy a Mana Vial too (15 coins)", icon: "fa-droplet" },
            { id: "explore_bastion", text: "Thanks, I'll go now", icon: "fa-arrow-left" }
        ],
        stateUpdates: { coins_change: -10, time_advanced: false, addItem: "healing_potion" }
    },
    buy_mana: {
        narrative: `You give 15 coins to Silas. He carefully opens a small bottle of glowing blue liquid and hands it to you.

<em>"Mana Vial. If you have any magic ability, this will power it up. If you don't — well, it still tastes pretty good."</em>`,
        choices: [
            { id: "buy_potion", text: "Buy a Healing Potion too (10 coins)", icon: "fa-heart" },
            { id: "explore_bastion", text: "Thanks, heading out", icon: "fa-arrow-left" }
        ],
        stateUpdates: { coins_change: -15, time_advanced: false, addItem: "mana_vial" }
    },
    talk_elara: {
        narrative: `Elara looks up from her patient. The glowing marks on her skin fade as she turns to you. Her face is kind but tired.

<em>"Another scrapper. At least you're still in one piece — for now."</em> She wipes her hands. <em>"Full healing — both HP and Mana — costs 25 coins. Think of it as paying to keep breathing."</em>`,
        choices: [
            { id: "heal_elara", text: "Pay for healing (25 coins)", icon: "fa-heart-pulse" },
            { id: "explore_bastion", text: "Maybe later", icon: "fa-arrow-left" }
        ],
        stateUpdates: { time_advanced: false }
    },
    heal_elara: {
        narrative: `You drop 25 coins into Elara's hand. She puts her palms over your chest and warm golden light wraps around you. All your pain disappears. Your HP and MP are fully restored.

<em>"All better. Try not to die out there — I'm running out of bandages."</em>`,
        choices: [
            { id: "explore_bastion", text: "Go back to the Bastion streets", icon: "fa-arrow-left" },
            { id: "leave_bastion", text: "Head out to the Ash Plains", icon: "fa-person-walking" }
        ],
        stateUpdates: { coins_change: -25, full_heal: true, time_advanced: false }
    },
    leave_bastion: {
        narrative: `You step through the Bastion's main gate. The canyon walls fall away and a huge, grey wasteland opens up before you — <strong>The Ash Plains</strong>.

Soft ash crunches under your boots. The sky above is a sick-looking purple, with streaks of leftover magic running through it. Dead, burnt trees stick up from the ground like skeletons. The wind screams.

Something moves in the ash ahead — something low, fast, and hungry. Red eyes flash in the dusty air.

<em>An <strong>Ash Hound</strong> has spotted you!</em>`,
        choices: [
            { id: "combat_attack", text: "Attack with your Rusted Pipe!", icon: "fa-hammer" },
            { id: "combat_magic", text: "Cast a Mana Bolt", icon: "fa-wand-sparkles" },
            { id: "combat_defend", text: "Raise your guard", icon: "fa-shield" },
            { id: "combat_flee", text: "Try to run away!", icon: "fa-person-running" }
        ],
        stateUpdates: {
            time_advanced: true,
            combat_active: true,
            current_enemy: "ash_hound"
        }
    },
    combat_attack: {
        narrative: `You grab your <strong>Rusted Pipe</strong> and swing hard at the Ash Hound! The hit connects with a loud crunch — <strong class="text-success">12 damage</strong>!

The beast growls and bites your arm — <strong class="text-danger">4 damage</strong> to you!

<span class="enemy-status">Ash Hound HP: 18/30</span>`,
        choices: [
            { id: "combat_attack_2", text: "Strike again!", icon: "fa-hammer" },
            { id: "combat_magic", text: "Switch to Mana Bolt", icon: "fa-wand-sparkles" },
            { id: "combat_defend", text: "Defend this round", icon: "fa-shield" },
            { id: "combat_flee", text: "Try to run!", icon: "fa-person-running" }
        ],
        stateUpdates: {
            hp_change: -4,
            combat_active: true,
            time_advanced: false
        }
    },
    combat_attack_2: {
        narrative: `You lift the pipe over your head and smash it down! <strong class="text-success">14 damage!</strong> The Ash Hound cries out and stumbles.

It fights back with a desperate lunge — its claws scratch your side for <strong class="text-danger">3 damage</strong>.

<span class="enemy-status">Ash Hound HP: 4/30</span>

<em>The creature is getting weak. One more good hit should finish it off.</em>`,
        choices: [
            { id: "combat_finish", text: "Finish it off!", icon: "fa-skull-crossbones" },
            { id: "combat_defend", text: "Play it safe, defend", icon: "fa-shield" }
        ],
        stateUpdates: {
            hp_change: -3,
            combat_active: true,
            time_advanced: false
        }
    },
    combat_finish: {
        narrative: `With one final powerful swing, you bring the Rusted Pipe down on the Ash Hound. The creature falls into the ash, its red eyes flickering out.

<strong class="text-success">⚔️ VICTORY!</strong>

You earn <strong>25 EXP</strong> and find <strong>5 coins</strong> and some <strong>Scrap Metal</strong> in the remains.

The ash settles around you. The purple sky swirls above. The Wastes go on forever.

<em>The afternoon sun beats down. Time moves forward.</em>`,
        choices: [
            { id: "explore_ash", text: "Keep exploring the Ash Plains", icon: "fa-compass" },
            { id: "return_bastion", text: "Go back to the Bastion to rest", icon: "fa-house" },
            { id: "check_stats", text: "Check your stats", icon: "fa-clipboard-list" }
        ],
        stateUpdates: {
            combat_active: false,
            current_enemy: null,
            exp_change: 25,
            coins_change: 5,
            time_advanced: true,
            addItem: "scrap_metal"
        }
    },
    combat_magic: {
        narrative: `You stretch out your hand and focus your mana. A crackling bolt of blue-green energy shoots through the air and hits the Ash Hound right in the chest — <strong class="text-success">18 magic damage</strong>! The creature howls in pain.

It stumbles but still snaps at your leg — <strong class="text-danger">5 damage</strong>!

Your mana drops. <strong>-8 MP</strong>

<span class="enemy-status">Ash Hound HP: 12/30</span>`,
        choices: [
            { id: "combat_attack", text: "Follow up with a melee hit!", icon: "fa-hammer" },
            { id: "combat_magic_2", text: "Cast another Mana Bolt", icon: "fa-wand-sparkles" },
            { id: "combat_defend", text: "Defend", icon: "fa-shield" }
        ],
        stateUpdates: {
            hp_change: -5,
            mana_change: -8,
            combat_active: true,
            time_advanced: false
        }
    },
    combat_magic_2: {
        narrative: `Another burst of mana shoots from your hands! The bolt rips through the weakened Ash Hound for <strong class="text-success">16 damage</strong>, breaking it apart into ash and embers.

<strong class="text-success">⚔️ VICTORY!</strong>

You earn <strong>25 EXP</strong> and find <strong>7 coins</strong> in the remains.

<strong>-8 MP</strong>`,
        choices: [
            { id: "explore_ash", text: "Keep exploring the Ash Plains", icon: "fa-compass" },
            { id: "return_bastion", text: "Head back to the Bastion", icon: "fa-house" }
        ],
        stateUpdates: {
            combat_active: false,
            current_enemy: null,
            mana_change: -8,
            exp_change: 25,
            coins_change: 7,
            time_advanced: true
        }
    },
    combat_defend: {
        narrative: `You brace yourself, lifting your arms to block. The Ash Hound jumps at you — you push its jaws away, taking only <strong class="text-danger">1 damage</strong> through your defense.

<em>Your guard holds strong. The creature circles around you, looking for a weak spot.</em>`,
        choices: [
            { id: "combat_attack", text: "Counter-attack now!", icon: "fa-hammer" },
            { id: "combat_magic", text: "Cast a Mana Bolt", icon: "fa-wand-sparkles" },
            { id: "combat_flee", text: "Use this chance to run", icon: "fa-person-running" }
        ],
        stateUpdates: {
            hp_change: -1,
            combat_active: true,
            time_advanced: false
        }
    },
    combat_flee: {
        narrative: `You turn around and sprint through the ash! The Ash Hound chases, snapping at your heels. Its claws scratch your back — <strong class="text-danger">3 damage</strong> — but you manage to get away.

<em>You escaped! The Ash Hound's howl fades behind you.</em>

You stop to catch your breath. The Bastion walls are visible in the distance.`,
        choices: [
            { id: "return_bastion", text: "Run back to the Bastion", icon: "fa-house" },
            { id: "explore_ash", text: "Go deeper into the Ash Plains", icon: "fa-compass" }
        ],
        stateUpdates: {
            hp_change: -3,
            combat_active: false,
            current_enemy: null,
            time_advanced: true
        }
    },
    explore_ash: {
        narrative: `You push deeper into the Ash Plains. The view is the same everywhere — grey dunes, dead trees, and the never-ending wind.

Something shiny catches your eye in the ash. You dig it out — a pile of <strong>Scrap Metal</strong>! Old but still worth something. <strong>+3 coins</strong>.

Far away, you notice a ridge of strange blue-green rocks. Could that be the start of the <strong>Crystal Forest</strong>?

A <strong>Rust Beetle</strong> crawls out from under a burnt log, its metal shell making a grinding noise.`,
        choices: [
            { id: "combat_attack", text: "Attack the Rust Beetle!", icon: "fa-hammer" },
            { id: "combat_defend", text: "Take a defensive stance", icon: "fa-shield" },
            { id: "return_bastion", text: "Back off before it sees you", icon: "fa-house" }
        ],
        stateUpdates: {
            coins_change: 3,
            time_advanced: true,
            combat_active: true,
            current_enemy: "rust_beetle"
        }
    },
    return_bastion: {
        narrative: `You make your way back through the ash-covered wasteland. The familiar walls of the Bastion appear ahead, a welcome sight.

Walking through the gate, the noise of people living their lives replaces the lonely howl of the wind. You smell cooking fires and hear hammers hitting metal.

<em>You feel safe again. The Bastion is home — for now.</em>`,
        choices: [
            { id: "explore_bastion", text: "Walk around the Bastion", icon: "fa-magnifying-glass" },
            { id: "talk_silas", text: "Go to Silas's shop", icon: "fa-shop" },
            { id: "talk_elara", text: "Visit Elara for healing", icon: "fa-hand-holding-medical" },
            { id: "leave_bastion", text: "Go right back out", icon: "fa-person-walking" }
        ],
        stateUpdates: { time_advanced: true }
    },
    check_stats: {
        narrative: `You take a moment to look yourself over.

You are a <strong>Scrapper</strong> — a survivor who searches the ruins of the old world. Your equipment is basic and your pockets aren't very full, but you're alive. That's what matters in the Shimmering Wastes.

<em>Open the Stats menu to check your abilities and spend any available upgrade points.</em>`,
        choices: [
            { id: "explore_bastion", text: "Keep exploring", icon: "fa-magnifying-glass" },
            { id: "leave_bastion", text: "Head to the Ash Plains", icon: "fa-person-walking" }
        ],
        stateUpdates: { time_advanced: false, openStats: true }
    }
};

const TIME_PHASES = ["Morning", "Afternoon", "Evening", "Night"];
const TIME_ICONS = ["fa-sun", "fa-cloud-sun", "fa-cloud-moon", "fa-moon"];
const TIME_COLORS = ["#ffd700", "#ff9500", "#e65c00", "#6366f1"];
