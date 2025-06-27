var refined = [],
	items = {},
	list;

function refine(item) {
	if(!items[item.id]) {
		refined.push(item);
		items[item.id] = item;
		item.review = true;
		if(item.consumable) {
			item.is_singular = true;
		} else {
			item.is_template = true;
		}
	}
};

list = [
    {
        "id": "item:wondrous:bagholding",
        "name": "Bag of Holding",
        "description": "This bag can hold up to 500 pounds, not exceeding a volume of 64 cubic feet. The bag weighs 15 pounds regardless of its contents.",
        "rarity": 4,
        "attunes": false,
        "types": [
            "type:wondrous"
        ],
        "cost": 4000
    },
    {
        "id": "item:wondrous:cloakinvisibility",
        "name": "Cloak of Invisibility",
        "description": "While wearing this cloak, you can turn invisible. The cloak remains invisible even if you become visible by attacking or casting a spell.",
        "rarity": 9,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:illusion"
        ],
        "cost": 50000
    },
    {
        "id": "item:sword:flametongue",
        "name": "Flame Tongue",
        "description": "You can speak a command word to ignite this sword, causing it to deal an additional 2d6 fire damage.",
        "rarity": 7,
        "damage": {
            "damage:fire": "2d6",
            "damage:slashing": "1d8"
        },
        "melee": true,
        "attunes": true,
        "types": [
            "type:weapon",
            "type:sword"
        ],
        "cost": 15000
    },
    {
        "id": "item:potion:healingpotion",
        "name": "Healing Potion",
        "description": "A simple potion that heals 2d4 + 2 hit points when consumed.",
        "rarity": 1,
        "damage": {
            "damage:heal": "2d4+2"
        },
        "types": [
            "type:potion"
        ],
        "cost": 50,
        "consume": 1
    },
    {
        "id": "item:javelin:javelinlightning",
        "name": "Javelin of Lightning",
        "description": "When thrown, this javelin transforms into a bolt of lightning, dealing additional lightning damage.",
        "rarity": 6,
        "damage": {
            "damage:piercing": "1d6"
        },
        "melee": true,
        "ranged": true,
        "thrown": true,
        "attunes": true,
        "types": [
            "type:weapon",
            "type:javelin"
        ],
        "cost": 7000,
        "range": 96,
        "spells": [
            "spell:lightningbolt"
        ]
    },
    {
        "id": "item:ring:ringprotection",
        "name": "Ring of Protection",
        "description": "You gain a +1 bonus to AC and saving throws while wearing this ring.",
        "rarity": 7,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:ring"
        ],
        "cost": 15000,
        "armor": 1,
        "skill_check": {
            "skill:dexterity": 1,
            "skill:charisma": 1,
            "skill:constitution": 1,
            "skill:strength": 1,
            "skill:wisdom": 1,
            "skill:intelligence": 1
        }
    },
    {
        "id": "item:staff:staffoffire",
        "name": "Staff of Fire",
        "description": "This staff can be used to cast several fire-based spells, including Fireball and Wall of Fire.",
        "rarity": 8,
        "damage": {
            "damage:bludgeoning": "1d6"
        },
        "ranged": true,
        "attunes": true,
        "types": [
            "type:weapon",
            "type:staff",
            "type:evocation"
        ],
        "cost": 25000,
        "range": 120,
        "spells": [
            "spell:fireball",
            "spell:walloffire"
        ]
    },
    {
        "id": "item:alchemy:alchemistsfire",
        "name": "Alchemist's Fire",
        "description": "A sticky, adhesive fluid that ignites when exposed to air. It deals fire damage to creatures on impact.",
        "rarity": 2,
        "damage": {
            "damage:fire": "1d4"
        },
        "ranged": true,
        "thrown": true,
        "types": [
            "type:consumable",
            "type:alchemy",
            "type:potion"
        ],
        "cost": 50,
        "range": 16,
        "consume": 1
    },
    {
        "id": "item:armorofinvulnerability",
        "name": "Armor of Invulnerability",
        "description": "This suit of armor grants the wearer complete immunity to all non-magical damage. Only magical attacks can harm the wearer.",
        "rarity": 10,
        "attunes": true,
        "types": [
            "type:armor"
        ],
        "armor": 3,
        "cost": 100000
    },
    {
        "id": "item:dragonhidearmor",
        "name": "Dragonhide Armor",
        "description": "Crafted from the hide of a dragon, this armor provides resistance to a chosen element (fire, cold, acid, etc.) depending on the type of dragon it was taken from.",
        "rarity": 8,
        "attunes": true,
        "types": [
            "type:armor"
        ],
        "armor": 2,
        "cost": 25000
    },
    {
        "id": "item:cloakofprotection",
        "name": "Cloak of Protection",
        "description": "This magical cloak increases the wearer's AC and provides a +1 bonus to all saving throws.",
        "rarity": 7,
        "attunes": true,
        "types": [
            "type:armor",
            "type:wondrous"
        ],
        "armor": 1,
        "skill_check": {
            "skill:dexterity": 1,
            "skill:charisma": 1,
            "skill:constitution": 1,
            "skill:strength": 1,
            "skill:wisdom": 1,
            "skill:intelligence": 1
        },
        "cost": 15000
    },
    {
        "id": "item:plateofetherealness",
        "name": "Plate of Etherealness",
        "description": "This plate armor allows the wearer to phase into the Ethereal Plane for short periods, granting the wearer advantage on Stealth checks when in the Ethereal Plane.",
        "rarity": 9,
        "attunes": true,
        "types": [
            "type:armor"
        ],
        "armor": 3,
        "cost": 35000
    },
    {
        "id": "item:armorofspeed",
        "name": "Armor of Speed",
        "description": "This light armor increases the wearer's movement speed by 30 feet and grants them an extra action during their turn in combat.",
        "rarity": 8,
        "attunes": true,
        "types": [
            "type:armor"
        ],
        "armor": 2,
        "cost": 20000
    },
    {
        "id": "item:shieldofdeflection",
        "name": "Shield of Deflection",
        "description": "This magical shield grants the wearer a +2 bonus to AC and allows the user to deflect ranged attacks, granting them a chance to deflect a projectile as a reaction.",
        "rarity": 7,
        "attunes": true,
        "types": [
            "type:armor",
            "type:shield"
        ],
        "armor": 2,
        "cost": 15000
    },
    {
        "id": "item:armorofresistance",
        "name": "Armor of Resistance",
        "description": "This armor grants resistance to one type of damage, chosen upon attunement (fire, cold, lightning, etc.).",
        "rarity": 6,
        "attunes": true,
        "types": [
            "type:armor"
        ],
        "armor": 2,
        "cost": 12000
    },
    {
        "id": "item:lightningarmor",
        "name": "Lightning Armor",
        "description": "This armor crackles with electrical energy, granting the wearer resistance to lightning damage and the ability to deal 1d6 lightning damage to attackers who hit the wearer with a melee attack.",
        "rarity": 7,
        "attunes": true,
        "types": [
            "type:armor"
        ],
        "armor": 2,
        "cost": 18000
    },
    {
        "id": "item:armorofshadow",
        "name": "Armor of Shadow",
        "description": "This armor allows the wearer to meld into shadows, granting advantage on Stealth checks and resistance to necrotic damage.",
        "rarity": 6,
        "attunes": true,
        "types": [
            "type:armor"
        ],
        "armor": 2,
        "cost": 15000
    },
    {
        "id": "item:celestialarmor",
        "name": "Celestial Armor",
        "description": "This radiant armor glows with divine light, granting the wearer resistance to radiant damage and the ability to add their Charisma modifier to their AC while wearing it.",
        "rarity": 9,
        "attunes": true,
        "types": [
            "type:armor"
        ],
        "armor": 3,
        "cost": 40000
    },
    {
        "id": "item:cloakofinvisibility",
        "name": "Cloak of Invisibility",
        "description": "This cloak allows the wearer to become invisible at will. The effect lasts until the wearer attacks or casts a spell.",
        "rarity": 9,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 50000
    },
    {
        "id": "item:cloakofprotection",
        "name": "Cloak of Protection",
        "description": "This cloak grants the wearer a +1 bonus to AC and saving throws while worn.",
        "rarity": 7,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "armor": 1,
        "skill_check": {
            "skill:dexterity": 1,
            "skill:charisma": 1,
            "skill:constitution": 1,
            "skill:strength": 1,
            "skill:wisdom": 1,
            "skill:intelligence": 1
        },
        "cost": 15000
    },
    {
        "id": "item:cloakofshadow",
        "name": "Cloak of Shadows",
        "description": "This cloak blends seamlessly with shadows, granting the wearer advantage on Stealth checks in dim light or darkness.",
        "rarity": 8,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 20000
    },
    {
        "id": "item:cloakofresistance",
        "name": "Cloak of Resistance",
        "description": "This cloak provides resistance to one type of damage (fire, cold, lightning, etc.). The wearer can choose the damage type when attuning.",
        "rarity": 6,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 12000
    },
    {
        "id": "item:cloakofregeneration",
        "name": "Cloak of Regeneration",
        "description": "This cloak allows the wearer to regenerate 1 hit point every 10 minutes while they are not at full hit points.",
        "rarity": 7,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 18000
    },
    {
        "id": "item:cloakofprotectionagainstfiends",
        "name": "Cloak of Protection Against Fiends",
        "description": "This cloak grants the wearer advantage on saving throws against fiends and allows them to deal additional radiant damage against fiends.",
        "rarity": 8,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 25000,
        "skill_check": {
            "skill:wisdom": 1
        }
    },
    {
        "id": "item:cloakofflight",
        "name": "Cloak of Flight",
        "description": "This cloak allows the wearer to fly for 1 hour per day. The effect can be used in 10-minute increments.",
        "rarity": 9,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 35000
    },
    {
        "id": "item:cloakofelvenkind",
        "name": "Cloak of Elvenkind",
        "description": "This cloak enhances the wearer's ability to move quietly. It grants advantage on Stealth checks and resistance to being detected by magical means.",
        "rarity": 6,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 8000
    },
    {
        "id": "item:cloakofspellturning",
        "name": "Cloak of Spell Turning",
        "description": "This cloak reflects spells targeted at the wearer back at the caster. It can deflect any spell that requires a saving throw.",
        "rarity": 10,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 100000
    },
    {
        "id": "item:cloakofcamouflage",
        "name": "Cloak of Camouflage",
        "description": "This cloak allows the wearer to blend into their environment, granting advantage on Stealth checks when in natural terrain (forests, hills, etc.).",
        "rarity": 5,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 7000
    },
    {
        "id": "item:enchanteddagger",
        "name": "Enchanted Dagger",
        "description": "A dagger imbued with minor magical properties that deal additional force damage.",
        "rarity": 5,
        "damage": {
            "damage:force": "1d4",
            "damage:piercing": "1d6 + user.dexterity"
        },
        "melee": true,
        "stat": "Dexterity",
        "types": [
            "type:weapon",
            "type:dagger"
        ],
        "cost": 500
    },
    {
        "id": "item:bookofspells",
        "name": "Book of Minor Spells",
        "description": "A tome containing a few basic spells. Includes spells like Magic Missile and Light.",
        "rarity": 6,
        "attunes": true,
        "types": [
            "type:book",
            "type:wondrous"
        ],
        "cost": 1000,
        "spells": [
            "spell:magicmissile",
            "spell:light"
        ]
    },
    {
        "id": "item:cloakofinvisibility",
        "name": "Cloak of Invisibility",
        "description": "A magical cloak that grants the ability to turn invisible at will.",
        "rarity": 9,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:cloak"
        ],
        "cost": 50000
    },
    {
        "id": "item:mirrorofopposite",
        "name": "Mirror of Opposite",
        "description": "A small mirror that, when gazed into, shows a reflection of the opposite of what you truly desire.",
        "rarity": 8,
        "attunes": true,
        "types": [
            "type:wondrous"
        ],
        "cost": 20000
    },
    {
        "id": "item:alchemykit",
        "name": "Alchemy Kit",
        "description": "A kit containing the tools needed to craft potions, poisons, and other alchemical mixtures.",
        "rarity": 3,
        "types": [
            "type:equipment",
            "type:alchemy"
        ],
        "cost": 75
    },
    {
        "id": "item:bootsofspeed",
        "name": "Boots of Speed",
        "description": "Magical boots that allow the wearer to move at a faster pace.",
        "rarity": 7,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:boots"
        ],
        "cost": 15000
    },
    {
        "id": "item:swordoffrost",
        "name": "Sword of Frost",
        "description": "A sword that, when drawn, is surrounded by magical frost that deals cold damage.",
        "rarity": 6,
        "damage": {
            "damage:cold": "2d6",
            "damage:slashing": "1d8 + user.strength"
        },
        "melee": true,
        "stat": "Strength",
        "types": [
            "type:weapon",
            "type:sword"
        ],
        "cost": 10000
    },
    {
        "id": "item:hornofblasting",
        "name": "Horn of Blasting",
        "description": "A magical horn that, when blown, emits a powerful sonic blast that can cause deafness or damage.",
        "rarity": 7,
        "damage": {
            "damage:sound": "5d6"
        },
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:instrument"
        ],
        "cost": 20000
    },
    {
        "id": "item:arcanefocus",
        "name": "Arcane Focus",
        "description": "A crystal or orb that allows a spellcaster to channel their magic more effectively.",
        "rarity": 4,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:focus"
        ],
        "cost": 500
    },
    {
        "id": "item:boots:leaping",
        "name": "Boots of Leaping",
        "description": "These boots grant the wearer enhanced jumping ability, enabling them to leap great distances.",
        "rarity": 6,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:boots"
        ],
        "cost": 8000
    },
    {
        "id": "item:torch",
        "name": "Torch",
        "description": "A simple torch that provides light for 1 hour.",
        "rarity": 0,
        "consume": 1,
        "types": [
            "type:consumable"
        ],
        "cost": 1
    },
    {
        "id": "item:bedroll",
        "name": "Bedroll",
        "description": "A basic roll-up bed, perfect for camping outdoors.",
        "rarity": 0,
        "types": [
            "type:equipment"
        ],
        "cost": 5
    },
    {
        "id": "item:rations",
        "name": "Rations (1 Day)",
        "description": "A day's worth of food to sustain you on your travels.",
        "rarity": 0,
        "consume": 1,
        "types": [
            "type:consumable"
        ],
        "cost": 2
    },
    {
        "id": "item:rope",
        "name": "50 ft. Rope",
        "description": "A strong, 50-foot rope used for climbing, tying, or other tasks.",
        "rarity": 0,
        "types": [
            "type:equipment"
        ],
        "cost": 10
    },
    {
        "id": "item:healingpotion",
        "name": "Healing Potion",
        "description": "A simple potion that heals 2d4 + 2 hit points when consumed.",
        "rarity": 1,
        "damage": {
            "damage:heal": "2d4+2"
        },
        "types": [
            "type:potion"
        ],
        "cost": 50,
        "consume": 1
    },
    {
        "id": "item:flintandsteel",
        "name": "Flint and Steel",
        "description": "A simple fire-starting kit, useful for lighting torches or campfires.",
        "rarity": 0,
        "types": [
            "type:equipment"
        ],
        "cost": 2
    },
    {
        "id": "item:waterskin",
        "name": "Waterskin",
        "description": "A leather container for carrying water.",
        "rarity": 0,
        "types": [
            "type:equipment"
        ],
        "cost": 2
    },
    {
        "id": "item:sword:greatsword",
        "name": "Greatsword",
        "description": "A large, two-handed sword that deals massive damage.",
        "rarity": 3,
        "damage": {
            "damage:slashing": "2d6 + user.strength"
        },
        "melee": true,
        "stat": "Strength",
        "types": [
            "type:weapon",
            "type:sword"
        ],
        "cost": 50
    },
    {
        "id": "item:shield:spikedshield",
        "name": "Spiked Shield",
        "description": "A shield adorned with sharp spikes, dealing damage when used to bash.",
        "rarity": 4,
        "damage": {
            "damage:bludgeoning": "1d4 + user.strength"
        },
        "armor": 2,
        "melee": true,
        "stat": "Strength",
        "types": [
            "type:armor",
            "type:shield"
        ],
        "cost": 75
    },
    {
        "id": "item:staff:staffofpower",
        "name": "Staff of Power",
        "description": "A powerful staff that grants the wielder control over magic.",
        "rarity": 9,
        "attunes": true,
        "types": [
            "type:weapon",
            "type:staff",
            "type:evocation"
        ],
        "cost": 25000,
        "spells": [
            "spell:fireball",
            "spell:shield"
        ]
    },
    {
        "id": "item:bow:crossbow",
        "name": "Heavy Crossbow",
        "description": "A powerful ranged weapon that uses bolts for high damage output.",
        "rarity": 3,
        "damage": {
            "damage:piercing": "1d10 + user.dexterity"
        },
        "ranged": true,
        "stat": "Dexterity",
        "types": [
            "type:weapon",
            "type:crossbow"
        ],
        "cost": 100
    },
    {
        "id": "item:wand:firewand",
        "name": "Wand of Fire",
        "description": "A wand that allows the user to cast fire-based spells.",
        "rarity": 6,
        "attunes": true,
        "types": [
            "type:wand",
            "type:evocation"
        ],
        "cost": 12000,
        "spells": [
            "spell:fireball",
            "spell:burninghands"
        ]
    },
    {
        "id": "item:ring:ringmindshield",
        "name": "Ring of Mind Shielding",
        "description": "This ring prevents the user from being affected by mind-influencing magic.",
        "rarity": 8,
        "attunes": true,
        "types": [
            "type:wondrous",
            "type:ring"
        ],
        "cost": 18000
    },
    {
        "id": "item:helmet:helmoftelepathy",
        "name": "Helm of Telepathy",
        "description": "A helm that allows the user to communicate telepathically with others.",
        "rarity": 7,
        "attunes": true,
        "types": [
            "type:armor",
            "type:helm"
        ],
        "cost": 15000
    },
    {
        "id": "item:cloak:cloakofprotection",
        "name": "Cloak of Protection",
        "description": "This cloak grants a bonus to the user's AC and saving throws.",
        "rarity": 7,
        "attunes": true,
        "types": [
            "type:cloak",
            "type:wondrous"
        ],
        "cost": 15000,
        "armor": 1,
        "skill_check": {
            "skill:wisdom": 1,
            "skill:intelligence": 1
        }
    },
    {
        "id": "item:ranged:boomerang",
        "name": "Boomerang",
        "description": "A thrown weapon that returns to the user after being thrown.",
        "rarity": 2,
        "damage": {
            "damage:bludgeoning": "1d4 + user.dexterity"
        },
        "ranged": true,
        "thrown": true,
        "stat": "Dexterity",
        "types": [
            "type:weapon",
            "type:boomerang"
        ],
        "cost": 20,
        "range": 32
    },
    {
        "id": "item:potion:antidote",
        "name": "Antidote Potion",
        "description": "A potion that cures poison and negates its effects.",
        "rarity": 2,
        "types": [
            "type:potion",
            "type:consumable"
        ],
        "cost": 50,
        "consume": 1
    }
];

list.forEach(refine);
console.log(refined);
