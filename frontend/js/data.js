// ============================================================
// THE SHIMMERING WASTES — Mock Data Layer
// All game data: enemies, items, NPCs, mock narratives
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
        description: "A gaunt, six-legged canine with smoldering fur and ember-red eyes. It stalks the ashen dunes in packs."
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
        description: "A massive beetle the size of a dog, its carapace encrusted with corroded metal. Slow but incredibly resilient."
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
        description: "A towering humanoid figure formed from jagged teal crystals. Each step sends tremors through the ground."
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
        description: "A translucent wraith of pure crystallized mana. Its attacks bypass all physical armor."
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
        description: "A colossal entity of fused metal and magic, towering over the crater. Its chest pulses with a blinding energy core."
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
        description: "A vial of crimson liquid. Restores 20 HP."
    },
    mana_vial: {
        name: "Mana Vial",
        type: "consumable",
        icon: "fa-droplet",
        iconColor: "#00b4d8",
        effect: { mp: 20 },
        cost: 15,
        description: "A phial of shimmering blue essence. Restores 20 MP."
    },
    scrap_metal: {
        name: "Scrap Metal",
        type: "valuable",
        icon: "fa-gear",
        iconColor: "#adb5bd",
        sellPrice: { min: 2, max: 5 },
        description: "Twisted fragments of pre-cataclysm machinery. Useful currency."
    },
    shimmering_shard: {
        name: "Shimmering Shard",
        type: "valuable",
        icon: "fa-gem",
        iconColor: "#00f5d4",
        sellPrice: { min: 15, max: 20 },
        description: "A resonating crystal fragment pulsing with latent magical energy."
    },
    rusted_pipe: {
        name: "Rusted Pipe",
        type: "weapon",
        icon: "fa-hammer",
        iconColor: "#ff6b35",
        bonusStat: { str: 2 },
        description: "A heavy iron pipe. Your first weapon. Better than fists."
    },
    padded_clothing: {
        name: "Padded Clothing",
        type: "armor",
        icon: "fa-shirt",
        iconColor: "#6c757d",
        bonusStat: { def: 1 },
        description: "Layered cloth and leather. Barely qualifies as armor."
    },
    colossus_core: {
        name: "The Colossus Core",
        type: "quest",
        icon: "fa-sun",
        iconColor: "#ffd700",
        description: "The pulsing heart of the Wastes Colossus. Securing this means victory."
    }
};

const NPCS = {
    silas: {
        name: "Silas the Merchant",
        location: "The Last Bastion",
        icon: "fa-coins",
        description: "A wiry man with goggles and a bandolier of trinkets. He trades scrap for supplies.",
        shop: ["healing_potion", "mana_vial"]
    },
    elara: {
        name: "Elara the Healer",
        location: "The Last Bastion",
        icon: "fa-hand-holding-medical",
        description: "A calm woman with glowing tattoos. She mends wounds for a modest fee.",
        healCost: 25
    }
};

const REGIONS = {
    last_bastion: {
        name: "The Last Bastion",
        levelRange: "Safe Zone",
        icon: "fa-shield-halved",
        color: "#ffd700",
        description: "A walled settlement nestled in a narrow canyon. The smell of ozone and roasting meat fills the air. Humanity's last refuge.",
        isSafe: true
    },
    ash_plains: {
        name: "The Ash Plains",
        levelRange: "Lv. 1–3",
        icon: "fa-wind",
        color: "#ff6b35",
        description: "Vast expanses of grey, powdery terrain. Howling winds carry ash across charred tree husks. Dangerous creatures prowl here.",
        enemies: ["ash_hound", "rust_beetle"]
    },
    crystal_forest: {
        name: "The Crystal Forest",
        levelRange: "Lv. 4–7",
        icon: "fa-gem",
        color: "#00f5d4",
        description: "Jagged teal crystals jut from the earth like frozen lightning. The air hums with magical energy. Only the strong survive here.",
        enemies: ["crystal_golem", "mana_phantom"]
    },
    colossus_crater: {
        name: "The Colossus Crater",
        levelRange: "Lv. 8+",
        icon: "fa-skull",
        color: "#ff0054",
        description: "A massive impact crater radiating intense heat and blinding light. The Colossus waits at its center.",
        enemies: ["wastes_colossus"],
        isBossZone: true
    }
};

// ============================================================
// MOCK NARRATIVE SCENARIOS
// Pre-scripted demo sequences
// ============================================================

const INTRO_NARRATIVE = `You awaken to the acrid tang of ozone and the distant clang of hammered metal. The rough walls of a canyon settlement surround you — this is <strong>The Last Bastion</strong>, the final refuge of humanity in a world consumed by magical ruin.

A century ago, the Cataclysm shattered civilization. Now, the <strong>Shimmering Wastes</strong> stretch endlessly beyond these walls — a warped hellscape of crystalline flora, ashen deserts, and creatures twisted by latent magic.

You are a <strong>Scrapper</strong> — one of the desperate few who venture into the Wastes to salvage the remnants of the old world. Your rusted pipe feels heavy in your hand. Your padded clothing offers meager protection. But out there, under that bruised purple sky, fortune and death walk hand in hand.

<em>What will you do?</em>`;

const MOCK_SCENARIOS = {
    explore_bastion: {
        narrative: `You wander through the narrow streets of the Bastion. Market stalls line the canyon walls, their awnings patched together from salvaged tarps. The air smells of grilled meat and engine grease.

You spot <strong>Silas the Merchant</strong> polishing a row of glass vials behind a makeshift counter. Nearby, <strong>Elara the Healer</strong> tends to a wounded scrapper, her fingertips glowing with soft light.

The main gate looms ahead — beyond it, the ashen horizon stretches into nothing.`,
        choices: [
            { id: "talk_silas", text: "Talk to Silas the Merchant", icon: "fa-comments" },
            { id: "talk_elara", text: "Visit Elara the Healer", icon: "fa-hand-holding-medical" },
            { id: "leave_bastion", text: "Head out to the Ash Plains", icon: "fa-person-walking" },
            { id: "check_stats", text: "Check your gear and stats", icon: "fa-clipboard-list" }
        ],
        stateUpdates: { time_advanced: false }
    },
    talk_silas: {
        narrative: `Silas looks up from his counter, goggles reflecting the torchlight. <em>"Ah, another scrapper looking to stay alive out there, eh?"</em> He gestures to his wares with a flourish.

<em>"Healing Potions — 10 coins each, restores 20 HP. Mana Vials — 15 coins, restores 20 MP. Trust me, you don't want to be caught in the Wastes without 'em."</em>

He leans in conspiratorially: <em>"Word of advice? The Ash Hounds are getting bolder. Don't wander too far without at least one potion in your pack."</em>`,
        choices: [
            { id: "buy_potion", text: "Buy a Healing Potion (10 coins)", icon: "fa-heart" },
            { id: "buy_mana", text: "Buy a Mana Vial (15 coins)", icon: "fa-droplet" },
            { id: "explore_bastion", text: "Walk away", icon: "fa-arrow-left" }
        ],
        stateUpdates: { time_advanced: false }
    },
    buy_potion: {
        narrative: `You slide 10 coins across the counter. Silas scoops them up and hands you a <strong>Healing Potion</strong> — a vial of thick crimson liquid that seems to glow faintly.

<em>"Good choice. That'll patch you up when things get ugly."</em>`,
        choices: [
            { id: "buy_mana", text: "Buy a Mana Vial too (15 coins)", icon: "fa-droplet" },
            { id: "explore_bastion", text: "Thanks, I'll go now", icon: "fa-arrow-left" }
        ],
        stateUpdates: { coins_change: -10, time_advanced: false, addItem: "healing_potion" }
    },
    buy_mana: {
        narrative: `You hand over 15 coins. Silas uncorks a small phial of shimmering blue liquid and places it carefully in your hand.

<em>"Mana Vial. If you've got any magical aptitude at all, this'll fuel it. If not — well, it still tastes nice."</em>`,
        choices: [
            { id: "buy_potion", text: "Buy a Healing Potion too (10 coins)", icon: "fa-heart" },
            { id: "explore_bastion", text: "Thanks, heading out", icon: "fa-arrow-left" }
        ],
        stateUpdates: { coins_change: -15, time_advanced: false, addItem: "mana_vial" }
    },
    talk_elara: {
        narrative: `Elara looks up from her patient, her glowing tattoos dimming as she turns her attention to you. Her expression is warm but tired.

<em>"Another scrapper. You look like you're still in one piece — for now."</em> She wipes her hands on a cloth. <em>"Full restoration — HP and Mana — costs 25 coins. Consider it an investment in your continued breathing."</em>`,
        choices: [
            { id: "heal_elara", text: "Pay for healing (25 coins)", icon: "fa-heart-pulse" },
            { id: "explore_bastion", text: "Maybe later", icon: "fa-arrow-left" }
        ],
        stateUpdates: { time_advanced: false }
    },
    heal_elara: {
        narrative: `You drop 25 coins into Elara's palm. She places her hands over your chest and a warm golden light envelops you. Aches you didn't even know you had dissolve. Your HP and MP are fully restored.

<em>"There. Good as new. Try not to die out there — I'm running low on bandages."</em>`,
        choices: [
            { id: "explore_bastion", text: "Return to the Bastion streets", icon: "fa-arrow-left" },
            { id: "leave_bastion", text: "Head out to the Ash Plains", icon: "fa-person-walking" }
        ],
        stateUpdates: { coins_change: -25, full_heal: true, time_advanced: false }
    },
    leave_bastion: {
        narrative: `You step through the Bastion's main gate. The canyon walls fall away and the world opens into an endless expanse of grey desolation — <strong>The Ash Plains</strong>.

Powdery ash crunches beneath your boots. The sky above is a sickly purple, streaked with veins of residual magic. Charred tree husks dot the landscape like the bones of a dead forest. The wind howls mournfully.

Something moves in the ash ahead — low, fast, and predatory. Ember-red eyes flash in the haze.

<em>An <strong>Ash Hound</strong> has spotted you!</em>`,
        choices: [
            { id: "combat_attack", text: "Attack with your Rusted Pipe!", icon: "fa-hammer" },
            { id: "combat_magic", text: "Cast a Mana Bolt", icon: "fa-wand-sparkles" },
            { id: "combat_defend", text: "Raise your guard", icon: "fa-shield" },
            { id: "combat_flee", text: "Attempt to flee!", icon: "fa-person-running" }
        ],
        stateUpdates: {
            time_advanced: true,
            combat_active: true,
            current_enemy: "ash_hound"
        }
    },
    combat_attack: {
        narrative: `You grip your <strong>Rusted Pipe</strong> and swing hard at the Ash Hound! The blow connects with a satisfying crunch, dealing <strong class="text-success">12 damage</strong>!

The beast snarls and lunges, sinking its teeth into your arm — <strong class="text-danger">4 damage</strong> to you!

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
        narrative: `You raise the pipe overhead and bring it crashing down! <strong class="text-success">14 damage!</strong> The Ash Hound yelps and staggers.

It retaliates with a desperate lunge — its claws rake your side for <strong class="text-danger">3 damage</strong>.

<span class="enemy-status">Ash Hound HP: 4/30</span>

<em>The creature is weakening. One more hit should finish it.</em>`,
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
        narrative: `With a final, savage swing, you bring the Rusted Pipe down on the Ash Hound. The creature crumples into the ash, its ember eyes flickering out.

<strong class="text-success">⚔️ VICTORY!</strong>

You gain <strong>25 EXP</strong> and find <strong>5 coins</strong> and some <strong>Scrap Metal</strong> among the remains.

The ash settles around you. The purple sky churns overhead. The Wastes stretch on.

<em>The afternoon sun (such as it is) beats down. Time marches forward.</em>`,
        choices: [
            { id: "explore_ash", text: "Continue exploring the Ash Plains", icon: "fa-compass" },
            { id: "return_bastion", text: "Return to the Bastion to rest", icon: "fa-house" },
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
        narrative: `You extend your palm and channel mana. A crackling bolt of teal energy lances through the air and strikes the Ash Hound square in the chest for <strong class="text-success">18 magic damage</strong>! The creature howls.

It stumbles but manages to snap at your leg — <strong class="text-danger">5 damage</strong>!

Your mana drains slightly. <strong>-8 MP</strong>

<span class="enemy-status">Ash Hound HP: 12/30</span>`,
        choices: [
            { id: "combat_attack", text: "Follow up with a melee strike!", icon: "fa-hammer" },
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
        narrative: `Another surge of mana erupts from your hands! The bolt tears through the weakened Ash Hound for <strong class="text-success">16 damage</strong>, shattering it into a cloud of ember and ash.

<strong class="text-success">⚔️ VICTORY!</strong>

You gain <strong>25 EXP</strong> and find <strong>7 coins</strong> scattered in the remains.

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
        narrative: `You brace yourself, raising your arms to guard. The Ash Hound lunges — you deflect its jaws, taking only <strong class="text-danger">1 damage</strong> through your defense.

<em>Your guard holds. The creature circles, looking for an opening.</em>`,
        choices: [
            { id: "combat_attack", text: "Counter-attack now!", icon: "fa-hammer" },
            { id: "combat_magic", text: "Cast a Mana Bolt", icon: "fa-wand-sparkles" },
            { id: "combat_flee", text: "Use this chance to flee", icon: "fa-person-running" }
        ],
        stateUpdates: {
            hp_change: -1,
            combat_active: true,
            time_advanced: false
        }
    },
    combat_flee: {
        narrative: `You spin on your heel and sprint through the ash! The Ash Hound gives chase, snapping at your heels. Its claws rake your back for <strong class="text-danger">3 damage</strong> — but you manage to put enough distance between you and the beast.

<em>You've escaped! The Ash Hound's howl fades behind you.</em>

Panting, you survey your surroundings. The Bastion's canyon walls are visible in the distance.`,
        choices: [
            { id: "return_bastion", text: "Retreat to the Bastion", icon: "fa-house" },
            { id: "explore_ash", text: "Push deeper into the Ash Plains", icon: "fa-compass" }
        ],
        stateUpdates: {
            hp_change: -3,
            combat_active: false,
            current_enemy: null,
            time_advanced: true
        }
    },
    explore_ash: {
        narrative: `You press deeper into the Ash Plains. The landscape is monotonous — grey dunes, skeletal trees, and the ever-present wind.

You spot something glinting in the ash. Digging reveals a cache of <strong>Scrap Metal</strong> — tarnished but salvageable. <strong>+3 coins</strong>.

In the distance, you notice a ridge of strange, teal-tinted rock formations. Could that be the edge of the <strong>Crystal Forest</strong>?

A <strong>Rust Beetle</strong> emerges from beneath a charred log, its armored shell grinding ominously.`,
        choices: [
            { id: "combat_attack", text: "Attack the Rust Beetle!", icon: "fa-hammer" },
            { id: "combat_defend", text: "Take a defensive stance", icon: "fa-shield" },
            { id: "return_bastion", text: "Retreat before it notices you", icon: "fa-house" }
        ],
        stateUpdates: {
            coins_change: 3,
            time_advanced: true,
            combat_active: true,
            current_enemy: "rust_beetle"
        }
    },
    return_bastion: {
        narrative: `You make your way back through the ash-covered wasteland. The familiar walls of the Bastion rise ahead, offering safety and shelter.

Passing through the gate, the sounds of civilization replace the desolate howl of the Wastes. You can smell cooking fires and hear the clang of the blacksmith's hammer.

<em>You feel a sense of relief wash over you. The Bastion is home — for now.</em>`,
        choices: [
            { id: "explore_bastion", text: "Explore the Bastion", icon: "fa-magnifying-glass" },
            { id: "talk_silas", text: "Visit Silas's shop", icon: "fa-shop" },
            { id: "talk_elara", text: "See Elara for healing", icon: "fa-hand-holding-medical" },
            { id: "leave_bastion", text: "Head back out immediately", icon: "fa-person-walking" }
        ],
        stateUpdates: { time_advanced: true }
    },
    check_stats: {
        narrative: `You take a moment to assess yourself.

You are a <strong>Scrapper</strong> — a scavenger of the old world. Your gear is basic, your coffers light, but you're alive. That counts for something in the Shimmering Wastes.

<em>Open the Stats menu to review your attributes and allocate any available stat points.</em>`,
        choices: [
            { id: "explore_bastion", text: "Continue exploring", icon: "fa-magnifying-glass" },
            { id: "leave_bastion", text: "Head to the Ash Plains", icon: "fa-person-walking" }
        ],
        stateUpdates: { time_advanced: false, openStats: true }
    }
};

const TIME_PHASES = ["Morning", "Afternoon", "Evening", "Night"];
const TIME_ICONS = ["fa-sun", "fa-cloud-sun", "fa-cloud-moon", "fa-moon"];
const TIME_COLORS = ["#ffd700", "#ff9500", "#e65c00", "#6366f1"];
