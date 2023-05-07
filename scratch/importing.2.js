// Key Vars: source, universe, event, utility

var pattern = /([0-9]+)/,
	listing;

listing = [
    {
        "name": "Abi-Dalzim's Horrid Wilting",
        "level": 8,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 30-foot cube must succeed on a Con. save or take 12d8 necrotic damage. Plants wither and die.",
        "id": "spell:abi-dalzim'shorridwilting"
    },
    {
        "name": "Absorb Elements",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 reaction",
        "concentration": "",
        "ritual": "",
        "description": "The caster has resistance to the damage received and deals 1d6 extra damage of the same type on his next attack (damage/lvl).",
        "id": "spell:absorbelements"
    },
    {
        "name": "Acid Splash",
        "level": 0,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "1 or 2 creatures within 5 feet must succeed on a Dex. save or take 1d6 acid damage (damage/lvl).",
        "id": "spell:acidsplash"
    },
    {
        "name": "Aganazzar's Scorcher",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures on a 30-ft-long, 5-ft-wide line must succeed on a Dex. save or taker 3d8 fire damage (damage/lvl).",
        "id": "spell:aganazzar'sscorcher"
    },
    {
        "name": "Aid",
        "level": 2,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Up to 3 creatures increase their hp maximum and current hp by 5 (+5 hp/lvl).",
        "id": "spell:aid"
    },
    {
        "name": "Alarm",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Alert the caster or activate an alarm if a Tiny or larger creature enters a warded 20-ft cube.",
        "id": "spell:alarm"
    },
    {
        "name": "Alter Self",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Give a new form depending on the chosen option (Aquatic Adaptation, Change Appearance, or Natural Weapons).",
        "id": "spell:alterself"
    },
    {
        "name": "Animal Friendship",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "A beast with Intelligence 3 or less must succeed on a Wis. save or be charmed (+1 beast/lvl).",
        "id": "spell:animalfriendship"
    },
    {
        "name": "Animal Messenger",
        "level": 2,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "A Tiny beast travels to deliver a 25 words message to a target (+48 h/lvl).",
        "id": "spell:animalmessenger"
    },
    {
        "name": "Animal Shapes",
        "level": 8,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Willing targets within 30 ft turn into beasts of FP 4 or lower.",
        "id": "spell:animalshapes"
    },
    {
        "name": "Animate Dead",
        "level": 3,
        "type": "type:necromancy",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Create a skeleton from bones or a zombie from a corpse, who is under the caster control (+2 creatures/lvl).",
        "id": "spell:animatedead"
    },
    {
        "name": "Animate Objects",
        "level": 5,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Animate up to 10 non-magic objects and control their actions up to 500 ft (+2 items/lvl).",
        "id": "spell:animateobjects"
    },
    {
        "name": "Antilife Shell",
        "level": 5,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Prevent creatures other than undead and constructs from entering in a 10-ft radius.",
        "id": "spell:antilifeshell"
    },
    {
        "name": "Antimagic Field",
        "level": 8,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a 10-ft-radius sphere in which spells and magic items no longer work.",
        "id": "spell:antimagicfield"
    },
    {
        "name": "Antipathy/Sympathy",
        "level": 8,
        "type": "type:enchantment",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "Attract or repel (Wis. save in order to not be attracted or scared) a kind of creature designated within 60 ft.",
        "id": "spell:antipathy/sympathy"
    },
    {
        "name": "Arcane Eye",
        "level": 4,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create an invisible eye with darkvision that sends the caster the mental image of what it sees.",
        "id": "spell:arcaneeye"
    },
    {
        "name": "Arcane Gate",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create 2 portals (max 500 ft between them) and allow teleport from one to the other.",
        "id": "spell:arcanegate"
    },
    {
        "name": "Arcane Lock",
        "level": 2,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Lock an objet (door, window, chest, etc) and the caster can set a password to suppresses the spell for 1 minute.",
        "id": "spell:arcanelock"
    },
    {
        "name": "Armor of Agathys",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster gains 5 temporary hp and creatures who hits him with a melee attack take 5 cold damage (+5 hp and damage/lvl).",
        "id": "spell:armorofagathys"
    },
    {
        "name": "Arms of Hadar",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 10-ft radius must succeed on a Str. save or take 2d6 necrotic damage (damage/lvl)",
        "id": "spell:armsofhadar"
    },
    {
        "name": "Ashardalon's Stride",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster gets an +20 ft explosive speed and deals 1d6 fire damage within 5 feet during his move (speed and damage/lvl).",
        "id": "spell:ashardalon'sstride"
    },
    {
        "name": "Astral Projection",
        "level": 9,
        "type": "type:necromancy",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "The caster and up to 8 creatures are projected into the Astral Plane.",
        "id": "spell:astralprojection"
    },
    {
        "name": "Augury",
        "level": 2,
        "type": "type:divination",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "The caster obtains an omen about the result of an action within the next 30 min (weal, woe, both or nothing).",
        "id": "spell:augury"
    },
    {
        "name": "Aura of Life",
        "level": 4,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 30-ft radius gain resistance to necrotic damage and regain 1 hp when at 0 hp.",
        "id": "spell:auraoflife"
    },
    {
        "name": "Aura of Purity",
        "level": 4,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 30-ft radius can not become diseased, gain resistance to poison, and get advantage to various saving throws.",
        "id": "spell:auraofpurity"
    },
    {
        "name": "Aura of Vitality",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "One target in a 30-ft radius regains 2d6 hp.",
        "id": "spell:auraofvitality"
    },
    {
        "name": "Awaken",
        "level": 5,
        "type": "type:transmutation",
        "casting_time": "8 hours",
        "concentration": "",
        "ritual": "",
        "description": "Give a beast or plant (Intelligence 3 or less) the ability to speek and senses similar to a human's for 30 days.",
        "id": "spell:awaken"
    },
    {
        "name": "Bane",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Up to 3 targets must succeed on a Cha. save or subtract 1d4 from their attack roll or saving throw (+1 creature/lvl).",
        "id": "spell:bane"
    },
    {
        "name": "Banishing Smite",
        "level": 5,
        "type": "type:abjuration",
        "casting_time": "1 action bonus",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the weapon attack hits, deal an extra 5d10 force damage. Target reduced to 50 hp or fewer this way are banised.",
        "id": "spell:banishingsmite"
    },
    {
        "name": "Banishment",
        "level": 4,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Cha. save or be banished to a harmless demiplane (+1 creature/lvl).",
        "id": "spell:banishment"
    },
    {
        "name": "Barkskin",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target's AC can't be less than 16.",
        "id": "spell:barkskin"
    },
    {
        "name": "Beacon of Hope",
        "level": 3,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Targets gain advantage on Wis. saving throws and death saving throws, and regain the maximum number of hp from healing.",
        "id": "spell:beaconofhope"
    },
    {
        "name": "Beast Bond",
        "level": 1,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a telepathic link with one beast to communicate with it.",
        "id": "spell:beastbond"
    },
    {
        "name": "Beast Sense",
        "level": 2,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "Ritual",
        "description": "The caster can see/hear/feel through the senses of a willing beast.",
        "id": "spell:beastsense"
    },
    {
        "name": "Bestow Curse",
        "level": 3,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or suffer an effect as a disadvantage to a check or lose an action (duration/lvl).",
        "id": "spell:bestowcurse"
    },
    {
        "name": "Bigby's Hand",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a Large hand with a Strength of 26 that can strike (4d8 force damage), push, grapple, or protect (damage/lvl).",
        "id": "spell:bigby'shand"
    },
    {
        "name": "Blade Barrier",
        "level": 6,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a 100 x 20 x 5 ft wall that provides three-quarters cover and can inflict 6d10 slashing damage if passed through.",
        "id": "spell:bladebarrier"
    },
    {
        "name": "Blade of Disaster",
        "level": 9,
        "type": "type:conjuration",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Make two melee spell attacks and deals 4d12 force damage. Critical hit (18-20) deals 12d12. +2 attacks as bonus action.",
        "id": "spell:bladeofdisaster"
    },
    {
        "name": "Blade Ward",
        "level": 0,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster gets resistance against bludgeoning, piercing, and slashing damage dealt by weapon attacks.",
        "id": "spell:bladeward"
    },
    {
        "name": "Bless",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Up to 3 targets can add 1d4 to their attack roll or saving throw (+1 creature/lvl).",
        "id": "spell:bless"
    },
    {
        "name": "Blight",
        "level": 4,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Con. save or take 8d8 necrotic damage (damage/lvl).",
        "id": "spell:blight"
    },
    {
        "name": "Blinding Smite",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the attack hits, deals an extra 3d8 radiant damage and the target must succeed on a Con. save or be blinded.",
        "id": "spell:blindingsmite"
    },
    {
        "name": "Blindness/Deafness",
        "level": 2,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Con. save or become blinded or deafened (+1 creature/lvl).",
        "id": "spell:blindness/deafness"
    },
    {
        "name": "Blink",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster has 50% of chance to switch to the Ethereal Plane, then returns to the space he vanished from on the next turn.",
        "id": "spell:blink"
    },
    {
        "name": "Blur",
        "level": 2,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster's body becomes blurred and creatures that attack him have disadvantage on attack rolls against him.",
        "id": "spell:blur"
    },
    {
        "name": "Bones of the Earth",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create up to 6 vertical 5 x 30 ft pillars of stone (+2 pillars/lvl). Possibility of crushing creatures to the ceiling.",
        "id": "spell:bonesoftheearth"
    },
    {
        "name": "Booming Blade",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If a weapon attack hits, deals 1d8 thunder damage if the target moves (damage/lvl).",
        "id": "spell:boomingblade"
    },
    {
        "name": "Branding Smite",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If a weapon attack hits, deals an extra 2d6 radiant damage and the target sheds dim light in 5-ft radius (damage/lvl).",
        "id": "spell:brandingsmite"
    },
    {
        "name": "Burning Hands",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 15-ft cone must succeed on a Dex. save or take 3d6 fire damage (damage/lvl).",
        "id": "spell:burninghands"
    },
    {
        "name": "Call Lightning",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 5-ft radius must succeed on a Dex. save or take 3d10 lightning damage (damage/lvl) on each turn.",
        "id": "spell:calllightning"
    },
    {
        "name": "Calm Emotions",
        "level": 2,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-foot-radius sphere must succeed on a Cha. save or no longer be charmed/frightened, or be indifferents.",
        "id": "spell:calmemotions"
    },
    {
        "name": "Catapult",
        "level": 1,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on Dex. save or take 3d8 bludgeoning damage of an object up to 5 pounds (+5 pounds and +1d8/lvl).",
        "id": "spell:catapult"
    },
    {
        "name": "Catnap",
        "level": 3,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "3 willing creatures fall unconscious and gain the benefice of a short rest (+1 creature/lvl).",
        "id": "spell:catnap"
    },
    {
        "name": "Cause Fear",
        "level": 1,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or becomes frightened (nbr of targets/lvl).",
        "id": "spell:causefear"
    },
    {
        "name": "Ceremony",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Perform a religious ceremony (bless water, give bonus to AC, ability check, saving throw, etc).",
        "id": "spell:ceremony"
    },
    {
        "name": "Chain Lightning",
        "level": 6,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Up to 4 different targets must succeed on a Dex. save or take 10d8 lightning damage (+1 target/lvl).",
        "id": "spell:chainlightning"
    },
    {
        "name": "Chaos Bolt",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the attack hits, deals 2d8 + 1d6 damage of a random type (damage/lvl). Rebound if double 8.",
        "id": "spell:chaosbolt"
    },
    {
        "name": "Charm Monster",
        "level": 4,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or be charmed by the caster (duration/lvl).",
        "id": "spell:charmmonster"
    },
    {
        "name": "Charm Person",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The humanoid target must succeed on a Wis. save or be charmed by the caster (+1 creature/lvl).",
        "id": "spell:charmperson"
    },
    {
        "name": "Chill Touch",
        "level": 0,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 1d8 necrotic damage (damage/lvl) and the target can't regain hp immediately.",
        "id": "spell:chilltouch"
    },
    {
        "name": "Chromatic Orb",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 3d8 damage of a previously determined type (damage/lvl)",
        "id": "spell:chromaticorb"
    },
    {
        "name": "Circle of Death",
        "level": 6,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 60-ft-radius sphere must succeed on a Con. save or take 8d6 necrotic damage (damage/lvl).",
        "id": "spell:circleofdeath"
    },
    {
        "name": "Circle of Power",
        "level": 5,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Friendly creatures in a 30-ft radius have advantage on saving throws against spells and other magicial effects.",
        "id": "spell:circleofpower"
    },
    {
        "name": "Clairvoyance",
        "level": 3,
        "type": "type:divination",
        "casting_time": "10 minutes",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create an invisible sensor in a familiar location within 1 mile, allowing to see or to hear (to choose, can switch).",
        "id": "spell:clairvoyance"
    },
    {
        "name": "Clone",
        "level": 8,
        "type": "type:necromancy",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "Create in 120 days the inert double of a living creature. If the original creature dies, its soul is transferred to the clone.",
        "id": "spell:clone"
    },
    {
        "name": "Cloud of Daggers",
        "level": 2,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 5-ft cube take automatically 4d4 slashing damage (damage/lvl).",
        "id": "spell:cloudofdaggers"
    },
    {
        "name": "Cloudkill",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft-radius sphere must succeed on a Con. save or take 5d8 poison damage (damage/lvl).",
        "id": "spell:cloudkill"
    },
    {
        "name": "Color Spray",
        "level": 1,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "6d10 creatures hp are dazzled in ascending order of their current hp (+2d10 hp/lvl).",
        "id": "spell:colorspray"
    },
    {
        "name": "Command",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or follow your order as Approach, Drop, Flee, Fall, Halt, etc (+1 creature/lvl).",
        "id": "spell:command"
    },
    {
        "name": "Commune",
        "level": 5,
        "type": "type:divination",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Allow to obtain from a divine entity the answers (yes or no) to 3 questions.",
        "id": "spell:commune"
    },
    {
        "name": "Commune with Nature",
        "level": 5,
        "type": "type:divination",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "The caster gets 3 informations about the surrounding territory. Doesn't function in dungeons or towns.",
        "id": "spell:communewithnature"
    },
    {
        "name": "Compelled Duel",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or get a disadvantage on attack rolls against creatures other than the caster.",
        "id": "spell:compelledduel"
    },
    {
        "name": "Comprehend Languages",
        "level": 1,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "The caster understands any spoken and written (1 min/page) language. Doesn't decode secret messages.",
        "id": "spell:comprehendlanguages"
    },
    {
        "name": "Compulsion",
        "level": 4,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Targets within 30 ft must succeed on a Wis. save or move in a specified direction.",
        "id": "spell:compulsion"
    },
    {
        "name": "Cone of Cold",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 60-ft cone must succeed on a Con. save or take 8d8 cold damage (damage/lvl).",
        "id": "spell:coneofcold"
    },
    {
        "name": "Confusion",
        "level": 4,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 10-ft-radius sphere must succeed on a Wis. save or can't take actions normally (+ 5-ft-radius/lvl).",
        "id": "spell:confusion"
    },
    {
        "name": "Conjure Animals",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon from 1 beast of CR 2 to 8 beasts of CR 1/4, friendly (nbr of creatures/lvl).",
        "id": "spell:conjureanimals"
    },
    {
        "name": "Conjure Barrage",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 60-ft cone must succeed on a Dex. save or take 3d8 damage from the weapon/ammunition used.",
        "id": "spell:conjurebarrage"
    },
    {
        "name": "Conjure Celestial",
        "level": 7,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 celestial of CR 4, friendly (CR +1/lvl).",
        "id": "spell:conjurecelestial"
    },
    {
        "name": "Conjure Elemental",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 elemental of CR 5, friendly (CR +1/lvl).",
        "id": "spell:conjureelemental"
    },
    {
        "name": "Conjure Fey",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 fey of CR 6, friendly (CR +1/lvl).",
        "id": "spell:conjurefey"
    },
    {
        "name": "Conjure Minor Elementals",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon from 1 elemental of CR 2 to 8 elemental of CR 1/4, friendly (nbr of creatures/lvl).",
        "id": "spell:conjureminorelementals"
    },
    {
        "name": "Conjure Volley",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 40-ft-radius, 20-ft-high cylinder must succeed on a Dex. save or take 8d8 damage from the weapon/ammunition used.",
        "id": "spell:conjurevolley"
    },
    {
        "name": "Conjure Woodland Beings",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon from 1 fey of CR 2 to 8 fey of CR 1/4, friendly (nbr of creatures/lvl).",
        "id": "spell:conjurewoodlandbeings"
    },
    {
        "name": "Contact Other Plane",
        "level": 5,
        "type": "type:divination",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Contact an extraplanar entity to ask it 5 questions if an Int. save is successful. Otherwise, 6d6 psychic damage.",
        "id": "spell:contactotherplane"
    },
    {
        "name": "Contagion",
        "level": 5,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, target is afflicted with a disease to choose from 6 proposed.",
        "id": "spell:contagion"
    },
    {
        "name": "Contingency",
        "level": 6,
        "type": "type:evocation",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Condition the activation of a 5th level spell or lower that can target the caster.",
        "id": "spell:contingency"
    },
    {
        "name": "Continual Flame",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create a flame that produces a light equivalent in brightness to a torch, but does not emit any heat.",
        "id": "spell:continualflame"
    },
    {
        "name": "Control Flames",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Control nonmagical fires to expand, extinguish, enlarge, shape simple forms, etc.",
        "id": "spell:controlflames"
    },
    {
        "name": "Control Water",
        "level": 4,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Control the water in a 100-ft cube (cause a flood, part the water, redirect the flow, create a whirlpool).",
        "id": "spell:controlwater"
    },
    {
        "name": "Control Weather",
        "level": 8,
        "type": "type:transmutation",
        "casting_time": "10 minutes",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Modify gradually the climatic conditions outdoors (precipitation, temperature and wind force).",
        "id": "spell:controlweather"
    },
    {
        "name": "Control Winds",
        "level": 5,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Controls air in a 100-ft cube and produce an effect (Gusts, Downdraft or Updraft).",
        "id": "spell:controlwinds"
    },
    {
        "name": "Cordon of Arrows",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "4 ammunition deal 1d6 piercing damage if the target doesn't succeed on a Dex. save (nbr of ammunition/lvl).",
        "id": "spell:cordonofarrows"
    },
    {
        "name": "Counterspell",
        "level": 3,
        "type": "type:abjuration",
        "casting_time": "1 reaction",
        "concentration": "",
        "ritual": "",
        "description": "In reaction, fail a spell of 3rd level or lower. Ability check if the spell is 4th level or higher (threshold/lvl).",
        "id": "spell:counterspell"
    },
    {
        "name": "Create Bonfire",
        "level": 0,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 5-ft cube must succeed on a Dex. save or take 1d8 fire damage (damage/lvl).",
        "id": "spell:createbonfire"
    },
    {
        "name": "Create Food and Water",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create 45 pounds of food and 30 gallons of water, enough to sustain 15 humanoids for 24 hours.",
        "id": "spell:createfoodandwater"
    },
    {
        "name": "Create Homunculus",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "Create one homunculus and the caster can transfer his hit points to it up to his next long rest.",
        "id": "spell:createhomunculus"
    },
    {
        "name": "Create or Destroy Water",
        "level": 1,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create or destroy up to 10 gallons of water (+10 gallons/lvl).",
        "id": "spell:createordestroywater"
    },
    {
        "name": "Create Undead",
        "level": 6,
        "type": "type:necromancy",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Up to 3 Medium or Small humanoids corpses become a ghoul who obey the caster for 24 h (nbr and type of creatures/lvl).",
        "id": "spell:createundead"
    },
    {
        "name": "Creation",
        "level": 5,
        "type": "type:illusion",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Create a non-living object made of vegetable matter or mineral and no larger than a 5-ft cube (+5 ft/lvl).",
        "id": "spell:creation"
    },
    {
        "name": "Crown of Madness",
        "level": 2,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or be charmed. It then can attack a target designated by the caster.",
        "id": "spell:crownofmadness"
    },
    {
        "name": "Crown of Stars",
        "level": 7,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, 7 motes deal 4d12 radiant damage each (+1 mote/lvl).",
        "id": "spell:crownofstars"
    },
    {
        "name": "Crusader's Mantle",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Friendly creatures in a 30-ft radius deal an extra 1d4 radiant damage when they hit with a weapon attack.",
        "id": "spell:crusader'smantle"
    },
    {
        "name": "Cure Wounds",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "1 creature regains 1d8+Ability.Mod (+1d8 hp/lvl).",
        "id": "spell:curewounds"
    },
    {
        "name": "Dancing Lights",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create up to 4 torch-sized lights that shed dim light in a 10-ft radius and can be moved later up to 60 ft.",
        "id": "spell:dancinglights"
    },
    {
        "name": "Danse Macabre",
        "level": 5,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Up to 5 Small or Medium corpses become zombie or skeleton under the caster control (+2 corpses/lvl).",
        "id": "spell:dansemacabre"
    },
    {
        "name": "Darkness",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Fill a 15-ft-radius sphere of magical darkness.",
        "id": "spell:darkness"
    },
    {
        "name": "Darkvision",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target can see in the dark within 60 feet.",
        "id": "spell:darkvision"
    },
    {
        "name": "Dawn",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 30-ft-radius, 40-ft-high cylinder must succeed on a Con. save or take 4d10 radiant damage.",
        "id": "spell:dawn"
    },
    {
        "name": "Daylight",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create a sphere that sheds bright light in a 60-ft radius and dim light in an additional 60-ft radius.",
        "id": "spell:daylight"
    },
    {
        "name": "Death Ward",
        "level": 4,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "When the target drops to 0 hp for the first time, it automatically returns to 1 hp.",
        "id": "spell:deathward"
    },
    {
        "name": "Delayed Blast Fireball",
        "level": 7,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft-radius sphere must succeed on a Dex. save or take 12d6 fire damage (damage/lvl).",
        "id": "spell:delayedblastfireball"
    },
    {
        "name": "Demiplane",
        "level": 8,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create a door that leads to a demiplane (30-ft cube). Creatures still in the demiplane at the end of the spell are trapped.",
        "id": "spell:demiplane"
    },
    {
        "name": "Destructive Wave",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Targets in a 30-ft radius must succeed on a Con. save or take 5d6 thunder damage and 5d6 radiant or necrotic damage.",
        "id": "spell:destructivewave"
    },
    {
        "name": "Detect Evil and Good",
        "level": 1,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster senses and locates aberration, celestial, elemental, fey, fiend, or undead within 30 ft.",
        "id": "spell:detectevilandgood"
    },
    {
        "name": "Detect Magic",
        "level": 1,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "Ritual",
        "description": "The caster senses the presence of magic in a 30-ft radius and learns its school of magic.",
        "id": "spell:detectmagic"
    },
    {
        "name": "Detect Poison and Disease",
        "level": 1,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "Ritual",
        "description": "The caster senses and identifies poison, poisonous creature, or disease within 30 ft.",
        "id": "spell:detectpoisonanddisease"
    },
    {
        "name": "Detect Thoughts",
        "level": 2,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster detects the superficial thoughts of a creature within 30 ft, and the deepest if the target misses a Wis. save.",
        "id": "spell:detectthoughts"
    },
    {
        "name": "Dimension Door",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster and another creature of the same size are teleported to a maximum of 500 feet.",
        "id": "spell:dimensiondoor"
    },
    {
        "name": "Disguise Self",
        "level": 1,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Modify the appearance of the caster (its physical and its equipment) thanks to an illusion.",
        "id": "spell:disguiseself"
    },
    {
        "name": "Disintegrate",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Dex. save or take 10d6+40 force damage (damage/lvl). An Large or smaller object is disintegrated.",
        "id": "spell:disintegrate"
    },
    {
        "name": "Dispel Evil and Good",
        "level": 5,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "End a condition (charmed, frightened, or possessed) or bannish a creature to its home plane (Cha. save).",
        "id": "spell:dispelevilandgood"
    },
    {
        "name": "Dispel Magic",
        "level": 3,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "End spells of 3rd level 3 or lower on a target. Ability check for each spell of 4th level or higher (threshold/lvl).",
        "id": "spell:dispelmagic"
    },
    {
        "name": "Dissonant Whispers",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or take 3d6 psychic damage and move away (damage/lvl).",
        "id": "spell:dissonantwhispers"
    },
    {
        "name": "Divination",
        "level": 4,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "The caster gets a truthful reply to 1 question about an event to occur within 7 days.",
        "id": "spell:divination"
    },
    {
        "name": "Divine Favor",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If a weapon attack hits, deals an extra 1d4 radiant damage.",
        "id": "spell:divinefavor"
    },
    {
        "name": "Divine Word",
        "level": 7,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "",
        "ritual": "",
        "description": "Targets must succeed on a Cha. save or suffer an effect (deafened, blinded, etc). Some creatures are banned.",
        "id": "spell:divineword"
    },
    {
        "name": "Dominate Beast",
        "level": 4,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "A beast within 60 ft must succeed on a Wis. save or be charmed and obey the launcher (duration/lvl).",
        "id": "spell:dominatebeast"
    },
    {
        "name": "Dominate Monster",
        "level": 8,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or be charmed and obey the caster (duration/lvl).",
        "id": "spell:dominatemonster"
    },
    {
        "name": "Dominate Person",
        "level": 5,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "One humanoid must succeed on a Wis. save or be charmed and obey the caster (duration/lvl).",
        "id": "spell:dominateperson"
    },
    {
        "name": "Draconic Transformation",
        "level": 7,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster gains blindsight (30 ft), breath weapon (6d8 force damage in a 60-ft cone) and wings (flying speed of 60 ft).",
        "id": "spell:draconictransformation"
    },
    {
        "name": "Dragon's Breath",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Spew a 15-ft cone that deals 3d6 acid, cold, fire, lightning, or poison damage in case of failed Dex. save (damage/lvl).",
        "id": "spell:dragon'sbreath"
    },
    {
        "name": "Drawmij's Instant Summons",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Mark a 10 pounds or less object and allow to teleport it into the caster hand, wherever it is, if not held.",
        "id": "spell:drawmij'sinstantsummons"
    },
    {
        "name": "Dream",
        "level": 5,
        "type": "type:illusion",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Shape the dreams of a sleeping creature who can take 3d6 psychic damage if it fails on a Wis. save.",
        "id": "spell:dream"
    },
    {
        "name": "Dream of the Blue Veil",
        "level": 7,
        "type": "type:conjuration",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "You and up to 8 willing creatures fall unconscious and are physically transported to another world on the material plan.",
        "id": "spell:dreamoftheblueveil"
    },
    {
        "name": "Druid Grove",
        "level": 6,
        "type": "type:abjuration",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Protect a 30 x 30 x 30 ft area with fog, vines, animated trees, or other effects.",
        "id": "spell:druidgrove"
    },
    {
        "name": "Druidcraft",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Provide various minor effects related to nature (weather forecast, flowering, sensory effect, etc).",
        "id": "spell:druidcraft"
    },
    {
        "name": "Dust Devil",
        "level": 2,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures within 5 ft must succeed on a Str. save or take 1d8 bludgeoning damage (damage/lvl).",
        "id": "spell:dustdevil"
    },
    {
        "name": "Earth Tremor",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 10-foot radius must succeed on a Dex. save or take 1d6 bludgeoning damage and be knocked prone (damage/lvl).",
        "id": "spell:earthtremor"
    },
    {
        "name": "Earthbind",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Target within 300 ft must succeed on a Str. save or its flying speed is reduced to 0 (descends at 60 ft/round).",
        "id": "spell:earthbind"
    },
    {
        "name": "Earthquake",
        "level": 8,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 100-ft radius must succeed on a Dex. save or be knocked prone. Cause damage to structures.",
        "id": "spell:earthquake"
    },
    {
        "name": "Eldritch Blast",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 1d10 force damage (nbr of beam/lvl).",
        "id": "spell:eldritchblast"
    },
    {
        "name": "Elemental Bane",
        "level": 4,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Con. save or suffer an extra 2d6 damage of a specific type (+1 target/lvl).",
        "id": "spell:elementalbane"
    },
    {
        "name": "Elemental Weapon",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "A weapon becomes magical with a +1 bonus to attack rolls and deal an extra 1d4 damage of a chosen type (bonus/lvl).",
        "id": "spell:elementalweapon"
    },
    {
        "name": "Enemies Abound",
        "level": 3,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on an Int. save or not be able to distinguish friend from foe ; all are ennemis for it.",
        "id": "spell:enemiesabound"
    },
    {
        "name": "Enervation",
        "level": 5,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Dex. save or take 4d8 necrotic damage each turn (+1d8/lvl).",
        "id": "spell:enervation"
    },
    {
        "name": "Enhance Ability",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target gains advantage on ability checks for one predefined ability, and other bonuses in such cases (+1 creature/lvl).",
        "id": "spell:enhanceability"
    },
    {
        "name": "Enlarge/Reduce",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Double or halve the size of a creature (Con. save) or an object.",
        "id": "spell:enlarge/reduce"
    },
    {
        "name": "Ensnaring Strike",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Str. save or be restrained and take 1d6 piercing damage (damage/lvl).",
        "id": "spell:ensnaringstrike"
    },
    {
        "name": "Entangle",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft square (difficult terrain) must succeed on a Str. save or be restrained.",
        "id": "spell:entangle"
    },
    {
        "name": "Enthrall",
        "level": 2,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Targets must succeed on a Wis. save or have disadvantage on Wisdom (Perception) checks to perceive others creatures.",
        "id": "spell:enthrall"
    },
    {
        "name": "Erupting Earth",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 20-foot cube (difficult terrain) must succeed on a Dex. save or take 3d12 bludgeoning damage (damage/lvl).",
        "id": "spell:eruptingearth"
    },
    {
        "name": "Etherealness",
        "level": 7,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster is projected into the Ethereal Plane (nbr of creatures/lvl).",
        "id": "spell:etherealness"
    },
    {
        "name": "Evard's Black Tentacles",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft square must succeed on a Dex. save or take 3d6 bludgeoning damage and be restrained.",
        "id": "spell:evard'sblacktentacles"
    },
    {
        "name": "Expeditious Retreat",
        "level": 1,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster can take the Dash action by using a bonus action.",
        "id": "spell:expeditiousretreat"
    },
    {
        "name": "Eyebite",
        "level": 6,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target in a 60-ft radius must succeed on a Wis. save or take on a the following effects: asleep, panicked or sickened.",
        "id": "spell:eyebite"
    },
    {
        "name": "Fabricate",
        "level": 4,
        "type": "type:transmutation",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Convert raw materials into Large or smaller simples objects of the same material.",
        "id": "spell:fabricate"
    },
    {
        "name": "Faerie Fire",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft cube must succeed on a Dex. save or grant advantage against them to attackers.",
        "id": "spell:faeriefire"
    },
    {
        "name": "False Life",
        "level": 1,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster gains 1d4+4 temporary hit points (+5 hp/lvl).",
        "id": "spell:falselife"
    },
    {
        "name": "Far Step",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Teleport the caster up to 60 ft on each round with a bonus action.",
        "id": "spell:farstep"
    },
    {
        "name": "Fear",
        "level": 3,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 30-ft cone must succeed on a Wis. save or drop whatever they are holding, become frightened and move away.",
        "id": "spell:fear"
    },
    {
        "name": "Feather Fall",
        "level": 1,
        "type": "type:transmutation",
        "casting_time": "1 reaction",
        "concentration": "",
        "ritual": "",
        "description": "Up to 5 creatures fall at 60 feet per round and take no falling damage before the spell ends.",
        "id": "spell:featherfall"
    },
    {
        "name": "Feeblemind",
        "level": 8,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target take 4d6 psychic damage and must succeed on an Int. save or his Charisma and Intelligence scores become 1.",
        "id": "spell:feeblemind"
    },
    {
        "name": "Feign Death",
        "level": 3,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "The willing target appears dead to all outward inspection.",
        "id": "spell:feigndeath"
    },
    {
        "name": "Find Familiar",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Summon a small animal that obeys the caster and telepathically shares his senses with him.",
        "id": "spell:findfamiliar"
    },
    {
        "name": "Find Greater Steed",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Summon a spirit that assumes the form a steed (griffon, pegasus, etc) telepathically linked to the caster.",
        "id": "spell:findgreatersteed"
    },
    {
        "name": "Find Steed",
        "level": 2,
        "type": "type:conjuration",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Summon a spirit that assumes the form a steed (horse, elk, etc) telepathically linked to the caster.",
        "id": "spell:findsteed"
    },
    {
        "name": "Find the Path",
        "level": 6,
        "type": "type:divination",
        "casting_time": "1 minute",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Determine the shortest and most direct physical path to reach a known destination.",
        "id": "spell:findthepath"
    },
    {
        "name": "Find Traps",
        "level": 2,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster senses the presence of any trap in a 120-fr radius, but the spell don't give their location.",
        "id": "spell:findtraps"
    },
    {
        "name": "Finger of Death",
        "level": 7,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Con. save or take 7d8+30 necrotic damage. If killed, becomes a zombie under the caster command.",
        "id": "spell:fingerofdeath"
    },
    {
        "name": "Fire Bolt",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 1d10 fire damage (damage/lvl). An object can ignite.",
        "id": "spell:firebolt"
    },
    {
        "name": "Fire Shield",
        "level": 4,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster gains resistance to cold or fire damage, and deals 2d8 damage to attackers who hit him within 5 ft.",
        "id": "spell:fireshield"
    },
    {
        "name": "Fire Storm",
        "level": 7,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in ten 10-ft cube must succeed on a Dex. save or take 7d10 fire damage.",
        "id": "spell:firestorm"
    },
    {
        "name": "Fireball",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 20-ft radius must succeed on a Dex. save or take 8d6 fire damage (damage/lvl).",
        "id": "spell:fireball"
    },
    {
        "name": "Fizban's Platinum Shield",
        "level": 6,
        "type": "type:abjuration",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster gains half cover, resistance to acid, cold, fire, lightning, and poison damage, and Evasion.",
        "id": "spell:fizban'splatinumshield"
    },
    {
        "name": "Flame Arrows",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "12 arrows/bolts deal an extra 1d6 fire damage (+2 ammunition/lvl).",
        "id": "spell:flamearrows"
    },
    {
        "name": "Flame Blade",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the spell attack hits, deals 3d6 fire damage (damage/lvl). Shed bright light in 10 ft and dim light in additional 10 ft.",
        "id": "spell:flameblade"
    },
    {
        "name": "Flame Strike",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 10-ft-radius, 40-ft-high cylinder must succeed on a Dex. save or take 4d6 fire and 4d6 radiant (damage/lvl).",
        "id": "spell:flamestrike"
    },
    {
        "name": "Flaming Sphere",
        "level": 2,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures within 5 ft from a 5-ft-diameter sphere must succeed on a Dex. save or take 2d6 fire damage (damage/lvl).",
        "id": "spell:flamingsphere"
    },
    {
        "name": "Flesh to Stone",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target within 60 ft must succeed on a Con. save or be restrained, or petrified after 3 failures.",
        "id": "spell:fleshtostone"
    },
    {
        "name": "Fly",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target gets a flying speed of 60 ft (+1 creature/lvl).",
        "id": "spell:fly"
    },
    {
        "name": "Fog Cloud",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Makes an area heavily obscured in a 20-ft-radius sphere (+20 ft/lvl).",
        "id": "spell:fogcloud"
    },
    {
        "name": "Forbiddance",
        "level": 6,
        "type": "type:abjuration",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Prevent teleporting to the protected area and inflicts 5d10 radiant or necrotic damage to some type of creatures.",
        "id": "spell:forbiddance"
    },
    {
        "name": "Forcecage",
        "level": 7,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creates a 20-ft cage or a 10-ft box of magical force that traps a creature. Escape by magicial means only.",
        "id": "spell:forcecage"
    },
    {
        "name": "Foresight",
        "level": 9,
        "type": "type:divination",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "1 creature sees its near future, can not be surprised and has advantage on his rolls. Attacks against it have disadvantage.",
        "id": "spell:foresight"
    },
    {
        "name": "Freedom of Movement",
        "level": 4,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Target's movement is unaffected by difficult terrain, spells or water.",
        "id": "spell:freedomofmovement"
    },
    {
        "name": "Friends",
        "level": 0,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The casters gets advantage on all Charisma checks directed at one chosen creature that isn't hostile toward him.",
        "id": "spell:friends"
    },
    {
        "name": "Frostbite",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Con. save or take 1d6 cold damage and have disadvantage on next attack roll (damage/lvl).",
        "id": "spell:frostbite"
    },
    {
        "name": "Gaseous Form",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target turns into a cloud, gets a flying speed of 10 ft, and can pass through small holes.",
        "id": "spell:gaseousform"
    },
    {
        "name": "Gate",
        "level": 9,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a portal to another plan. Also allows to summon a creature from another plane.",
        "id": "spell:gate"
    },
    {
        "name": "Geas",
        "level": 5,
        "type": "type:enchantment",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or be charmed and take 5d10 psychic if it doesn't obey (duration/lvl).",
        "id": "spell:geas"
    },
    {
        "name": "Gentle Repose",
        "level": 2,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Protect a corpse from decay or to become undead.",
        "id": "spell:gentlerepose"
    },
    {
        "name": "Giant Insect",
        "level": 4,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Transform insects (from 10 centipedes to 1 scorpion) into giant creatures that obey the caster's orders.",
        "id": "spell:giantinsect"
    },
    {
        "name": "Glibness",
        "level": 8,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Give 15 to a Charisma check and hides the lies during a magic detection.",
        "id": "spell:glibness"
    },
    {
        "name": "Globe of Invulnerability",
        "level": 6,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Block 5th level spells or lower within a 10-ft radius (threshold/lvl).",
        "id": "spell:globeofinvulnerability"
    },
    {
        "name": "Glyph of Warding",
        "level": 3,
        "type": "type:abjuration",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "A glyph on an object deals 5d8 damage in a 20-ft radius (damage/lvl) or casts a 3rd level spell (lvl/lvl) when triggered.",
        "id": "spell:glyphofwarding"
    },
    {
        "name": "Goodberry",
        "level": 1,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create up to 10 berries that restore 1 hp each and keep their power for 24 hours.",
        "id": "spell:goodberry"
    },
    {
        "name": "Grasping Vine",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Dex. save or be pulled 20 ft toward the vine.",
        "id": "spell:graspingvine"
    },
    {
        "name": "Grease",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 10-ft square (difficult terrain) must succeed on a Dex. save or fall prone.",
        "id": "spell:grease"
    },
    {
        "name": "Greater Invisibility",
        "level": 4,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target becomes invisible for 1 minute.",
        "id": "spell:greaterinvisibility"
    },
    {
        "name": "Greater Restoration",
        "level": 5,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "End one condition (charmed or petrified), one curse, any ability scores or hp reduction, or one exhaustion level.",
        "id": "spell:greaterrestoration"
    },
    {
        "name": "Green-Flame Blade",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If a weapon attack hits, deals also fire damage equal to Ability.Mod to another creature (damage/lvl) within 5 ft.",
        "id": "spell:green-flameblade"
    },
    {
        "name": "Guardian of Faith",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Hostiles creatures within a 10-ft radius of the created guardian must succeed on a Dex. save or take 20 radiant damage.",
        "id": "spell:guardianoffaith"
    },
    {
        "name": "Guardian of Nature",
        "level": 4,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Transform the caster into a Primal Beast (+10 ft, darkvision, ...) or a Great Tree (+10 hp, advantage to some rolls, ...).",
        "id": "spell:guardianofnature"
    },
    {
        "name": "Guards and Wards",
        "level": 6,
        "type": "type:abjuration",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Create a ward that protect a 50-ft square. Can set a password to immunize individuals.",
        "id": "spell:guardsandwards"
    },
    {
        "name": "Guidance",
        "level": 0,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target can add 1d4 to one ability check of its choice.",
        "id": "spell:guidance"
    },
    {
        "name": "Guiding Bolt",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 4d6 radiant damage (damage/lvl) and the next attack roll will have advantage.",
        "id": "spell:guidingbolt"
    },
    {
        "name": "Gust",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Control air to move objects or creatures (Medium or smaller) or create harmless sensory effects.",
        "id": "spell:gust"
    },
    {
        "name": "Gust of Wind",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures on a 60-ft-long, 10-ft-wide line mus succeed on a Str. save or be pushed 15 ft away.",
        "id": "spell:gustofwind"
    },
    {
        "name": "Hail of Thorns",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 5-ft radius must succeed on a Dex. save or take 1d10 piercing damage (damage/lvl).",
        "id": "spell:hailofthorns"
    },
    {
        "name": "Hallow",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "24 hours",
        "concentration": "",
        "ritual": "",
        "description": "Prevent celestials, elementals, fey, fiends, and undead to enter a 60-ft-radius area and protect/handicap the targets.",
        "id": "spell:hallow"
    },
    {
        "name": "Hallucinatory Terrain",
        "level": 4,
        "type": "type:illusion",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Make a natural terrain looks like another type (for example a road becomes a swamp or a crevasse).",
        "id": "spell:hallucinatoryterrain"
    },
    {
        "name": "Harm",
        "level": 6,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Con. save or take 14d6 necrotic damage. The spell can't kill it however.",
        "id": "spell:harm"
    },
    {
        "name": "Haste",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Target's speed is doubled. It also gains a +2 bonus to AC, advantage to Dex. saves and 1 additional action.",
        "id": "spell:haste"
    },
    {
        "name": "Heal",
        "level": 6,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "1 creature regains 70 hp and are cured of diseases, blindness, and deafness (+10 hp/lvl).",
        "id": "spell:heal"
    },
    {
        "name": "Healing Spirit",
        "level": 2,
        "type": "type:conjuration",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in touch with the spirit gain 1d6 hp (+1d6 hp/lvl).",
        "id": "spell:healingspirit"
    },
    {
        "name": "Healing Word",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "",
        "ritual": "",
        "description": "1 creature regains 1d4+Ability.Mod (+1d4 hp/lvl).",
        "id": "spell:healingword"
    },
    {
        "name": "Heat Metal",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in physical contact with the metal object take 2d8 fire damage (damage/lvl).",
        "id": "spell:heatmetal"
    },
    {
        "name": "Hellish Rebuke",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 reaction",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Dex. save or take 2d10 fire damage (damage/lvl).",
        "id": "spell:hellishrebuke"
    },
    {
        "name": "Heroes' Feast",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Produce a feast for 12 guests that cures diseases, immunizes to poison and increases hp by 2d10 for 24 hours.",
        "id": "spell:heroes'feast"
    },
    {
        "name": "Heroism",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target is immune to being frightened and gains temporary hp equal to its Ability.Mod each turns (+1 creature/lvl).",
        "id": "spell:heroism"
    },
    {
        "name": "Hex",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If an attack hits, deals an extra 1d6 necrotic damage. Disadvantage on achosem ability check (duration/lvl).",
        "id": "spell:hex"
    },
    {
        "name": "Hold Monster",
        "level": 5,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Target must succeed on a Wis. save or be paralyzed (+1 creature/lvl).",
        "id": "spell:holdmonster"
    },
    {
        "name": "Hold Person",
        "level": 2,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or be paralyzed (+1 creature/lvl).",
        "id": "spell:holdperson"
    },
    {
        "name": "Holy Aura",
        "level": 8,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Targets in a 30-ft radius have advantage on saving throws. Other creatures have disadvantage on attack rolls against them.",
        "id": "spell:holyaura"
    },
    {
        "name": "Holy Weapon",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The touched weapon shines, deals an extra 2d8 radiant damage, and can burst on a 30-ft radius (Save or 4d8 radiant).",
        "id": "spell:holyweapon"
    },
    {
        "name": "Hunger of Hadar",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft-radius sphere take 2d6 cold damage et must succeed on a Dex. save or take 2d6 acid damage.",
        "id": "spell:hungerofhadar"
    },
    {
        "name": "Hunter's Mark",
        "level": 1,
        "type": "type:divination",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target take an extra 1d6 damage and caster has advantage on Wisdom (Perception/Survival) checks to find it (duration/lvl).",
        "id": "spell:hunter'smark"
    },
    {
        "name": "Hypnotic Pattern",
        "level": 3,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 30-ft cube must succeed on a Wis. save or be charmed and incapacitated, with a speed of 0.",
        "id": "spell:hypnoticpattern"
    },
    {
        "name": "Ice Knife",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 1d10 piercing damage + Dex. save or 2d6 cold damage (damage/lvl) within 5 ft.",
        "id": "spell:iceknife"
    },
    {
        "name": "Ice Storm",
        "level": 4,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 20-ft-radius, 40-ft-high cylinder must succeed on a Dex. save or take 2d8 bludgeoning damage and 4d6 cold damage.",
        "id": "spell:icestorm"
    },
    {
        "name": "Identify",
        "level": 1,
        "type": "type:divination",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "The caster obtains properties of a magic item (attunement, charges) or knows if an item or a creature is affected by a spell.",
        "id": "spell:identify"
    },
    {
        "name": "Illusory Dragon",
        "level": 8,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures that see this illusory Huge dragon must succedd on a Wis. save or be frightened for 1 min.",
        "id": "spell:illusorydragon"
    },
    {
        "name": "Illusory Script",
        "level": 1,
        "type": "type:illusion",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Write a secret message that can only be read by a designated target or a creature with truesight.",
        "id": "spell:illusoryscript"
    },
    {
        "name": "Immolation",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target within 90 ft must succeed on a Dex. save or take 8d6 fire damage and 4d6 fire damage thereafter.",
        "id": "spell:immolation"
    },
    {
        "name": "Imprisonment",
        "level": 9,
        "type": "type:abjuration",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "The target within 30 ft must succeed on a Wis. save or be held prisoner. The form is to choose from 6 options.",
        "id": "spell:imprisonment"
    },
    {
        "name": "Incendiary Cloud",
        "level": 8,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft-radius sphere must succeed on a Dex. save or take 10d8 fire damage.",
        "id": "spell:incendiarycloud"
    },
    {
        "name": "Infernal Calling",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 devil CR 6 unfriendly (CR +1/lvl).",
        "id": "spell:infernalcalling"
    },
    {
        "name": "Infestation",
        "level": 0,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Con. save or take 1d6 poison damage and move 5 ft in a random direction (damage/lvl).",
        "id": "spell:infestation"
    },
    {
        "name": "Inflict Wounds",
        "level": 1,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 3d10 necrotic damage (damage/lvl).",
        "id": "spell:inflictwounds"
    },
    {
        "name": "Insect Plague",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft-radius sphere must succeed on a Con. save or take 4d10 piercing damage (damage/lvl).",
        "id": "spell:insectplague"
    },
    {
        "name": "Intellect Fortress",
        "level": 3,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "A willing creature has resistance to psychic damage and advantage on Int., Wis. and Cha. saving throws (+1 creature/lvl).",
        "id": "spell:intellectfortress"
    },
    {
        "name": "Investiture of Flame",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 15-ft-long line must succeed on a Dex. save or take 4d8 fire damage. Immunity and resistance to caster.",
        "id": "spell:investitureofflame"
    },
    {
        "name": "Investiture of Ice",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 15-ft cone must succeed on a Con. save or take 4d6 cold damage. Immunity and resistance to caster.",
        "id": "spell:investitureofice"
    },
    {
        "name": "Investiture of Stone",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 15-ft radius must succeed on a Dex. save or be knocked prone. Resistance and move across earth/stone.",
        "id": "spell:investitureofstone"
    },
    {
        "name": "Investiture of Wind",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 15-ft cube must succeed on a Con. save or take 2d10 bludgeoning damage. Flying speed 60 ft.",
        "id": "spell:investitureofwind"
    },
    {
        "name": "Invisibility",
        "level": 2,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target becomes invisible during 1 hour or until she attacks or casts a spell (+1 creature/lvl).",
        "id": "spell:invisibility"
    },
    {
        "name": "Invulnerability",
        "level": 9,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster gains immunity to all damage.",
        "id": "spell:invulnerability"
    },
    {
        "name": "Jump",
        "level": 1,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target gets a jump distance multiplicated by 3.",
        "id": "spell:jump"
    },
    {
        "name": "Knock",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Unlock or unbar 1 object (door, chest, padlock, set of manacles, etc) or suppressed the arcane lock spell for 10 minutes.",
        "id": "spell:knock"
    },
    {
        "name": "Legend Lore",
        "level": 5,
        "type": "type:divination",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "The caster obtains information about a person, place, or object. The lore consist of tales or stories.",
        "id": "spell:legendlore"
    },
    {
        "name": "Leomund's Secret Chest",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Hide a chest (3 x 2 x 2 ft) and its contents in the Ethereal Plane.",
        "id": "spell:leomund'ssecretchest"
    },
    {
        "name": "Leomund's Tiny Hut",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Create a 10-ft-radius dome that can shelter and protect 9 Medium creatures with the caster.",
        "id": "spell:leomund'stinyhut"
    },
    {
        "name": "Lesser Restoration",
        "level": 2,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "End one disease or one condition (blinded, deafened, paralyzed, or poisoned) on 1 creature.",
        "id": "spell:lesserrestoration"
    },
    {
        "name": "Levitate",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "1 creature or object that weighs up to 500 pounds rises vertically up to 20 ft then remains suspended.",
        "id": "spell:levitate"
    },
    {
        "name": "Life Transference",
        "level": 3,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster takes 4d8 necrotic damage and another creature gains twice the amount (+1d8 hp/lvl).",
        "id": "spell:lifetransference"
    },
    {
        "name": "Light",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Make an object to shed bright light in a 20-ft radius and dim light in an additional 20-ft radius.",
        "id": "spell:light"
    },
    {
        "name": "Lightning Arrow",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the attack hits, deals 4d8 Iightning damage. Creatures within 10 ft must succeed on a Dex. save or take 2d8 lightning damage.",
        "id": "spell:lightningarrow"
    },
    {
        "name": "Lightning Bolt",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures on a 100-ft-long, 5-ft-wide line must succeed on a Dex. save or take 8d6 lightning damage (damage/lvl).",
        "id": "spell:lightningbolt"
    },
    {
        "name": "Lightning Lure",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Str. save or take 1d8 lightning damage and be pulled up to 10 ft.",
        "id": "spell:lightninglure"
    },
    {
        "name": "Locate Animals or Plants",
        "level": 2,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Give the direction and distance to a kind of beast or plant within 5 miles.",
        "id": "spell:locateanimalsorplants"
    },
    {
        "name": "Locate Creature",
        "level": 4,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster senses the direction in which a familiar creature is within a 1000-ft radius.",
        "id": "spell:locatecreature"
    },
    {
        "name": "Locate Object",
        "level": 2,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster senses the direction to the location of an objet you are familiar with, within a 1000 ft radius.",
        "id": "spell:locateobject"
    },
    {
        "name": "Longstrider",
        "level": 1,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target gets a speed increased by 10 ft (+1 creature/lvl).",
        "id": "spell:longstrider"
    },
    {
        "name": "Maddening Darkness",
        "level": 8,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 60-ft-radius sphere of darkness must succeed on a Wis. save or take 8d8 psychic damage.",
        "id": "spell:maddeningdarkness"
    },
    {
        "name": "Maelstrom",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 30-ft radius must succeed on a Str. save or take 6d6 bludgeoning damage and be pulled towards the center.",
        "id": "spell:maelstrom"
    },
    {
        "name": "Mage Armor",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target, willing and not wearing armor, gets an AC equal to 13+Dex.Mod.",
        "id": "spell:magearmor"
    },
    {
        "name": "Mage Hand",
        "level": 0,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create a spectral hand that can in a 30-ft radius manipulate an object, open a door, stow an item, etc.",
        "id": "spell:magehand"
    },
    {
        "name": "Magic Circle",
        "level": 3,
        "type": "type:abjuration",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Create a 10-ft-radius, 20-ft-tall cylinder that protect from celestials, elementals, fey, fiends, and/or undead (+1 h/lvl).",
        "id": "spell:magiccircle"
    },
    {
        "name": "Magic Jar",
        "level": 6,
        "type": "type:necromancy",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "The caster projects his soul into an urn and then returns to his body or possesses a humanoid body.",
        "id": "spell:magicjar"
    },
    {
        "name": "Magic Missile",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "3 missiles deal automatically 1d4+1 force damage each to one or several creatures (+1 missile/lvl).",
        "id": "spell:magicmissile"
    },
    {
        "name": "Magic Mouth",
        "level": 2,
        "type": "type:illusion",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Creates a magical mouth that will repeat a message of up to 25 words when a trigger condition is met.",
        "id": "spell:magicmouth"
    },
    {
        "name": "Magic Stone",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "",
        "ritual": "",
        "description": "Up to 3 pebbles deal 1d6 + Ability.Mod bludgeoning damage if the spell attack hits.",
        "id": "spell:magicstone"
    },
    {
        "name": "Magic Weapon",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Turn a weapon into a +1 magic weapon for attack rolls and damage rolls (+2 or +3 bonus/lvl).",
        "id": "spell:magicweapon"
    },
    {
        "name": "Major Image",
        "level": 3,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create the image of an animated object or creature, with sounds and smells (without concentration/lvl).",
        "id": "spell:majorimage"
    },
    {
        "name": "Mass Cure Wounds",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Up to 6 creatures regain 3d8+Spell.Ability.Mod (+1d8 hp/lvl).",
        "id": "spell:masscurewounds"
    },
    {
        "name": "Mass Heal",
        "level": 9,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Several creatures regain a total of 700 ph and are cured of diseases, blindness, and deafness.",
        "id": "spell:massheal"
    },
    {
        "name": "Mass Healing Word",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "",
        "ritual": "",
        "description": "Up to 6 creatures regain 1d4+Ability.Mod (+1d4 hp/lvl).",
        "id": "spell:masshealingword"
    },
    {
        "name": "Mass Polymorph",
        "level": 9,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Transform up to 10 creatures into new beast forms whose CR/level are equal to or less than the target's CR/level.",
        "id": "spell:masspolymorph"
    },
    {
        "name": "Mass Suggestion",
        "level": 6,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Up to 12 targets must succeed on a Wis. save or follow the suggestion given by the caster (duration/lvl).",
        "id": "spell:masssuggestion"
    },
    {
        "name": "Maximilian's Earthen Grasp",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Str. save or take 2d6 bludgeoning damage and be restrained.",
        "id": "spell:maximilian'searthengrasp"
    },
    {
        "name": "Maze",
        "level": 8,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Banish a creature into a labyrinthine demiplane. Intelligence check to escape before the end of the spell.",
        "id": "spell:maze"
    },
    {
        "name": "Meld into Stone",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "The caster can penetrate the stone.",
        "id": "spell:meldintostone"
    },
    {
        "name": "Melf's Acid Arrow",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 4d4 acid damage, then 2d4 acid damage on the next round (damage/lvl).",
        "id": "spell:melf'sacidarrow"
    },
    {
        "name": "Melf's Minute Meteors",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures within 5 ft must succeed on a Dex.save or take 2d6 fire damage for each of the 6 meteors (+2 meteors/lvl).",
        "id": "spell:melf'sminutemeteors"
    },
    {
        "name": "Mending",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Repair break or tear in an object (broken chain link, two halves of a broken key, torn cloak, leaking wineskin, etc).",
        "id": "spell:mending"
    },
    {
        "name": "Mental Prison",
        "level": 6,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on an Int. save or take 5d10 psychic damage and believe to be surrounded by fire or other hazard.",
        "id": "spell:mentalprison"
    },
    {
        "name": "Message",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster whispers a message to a creature within 120 ft who will be the only one to hear it. It can reply the same way.",
        "id": "spell:message"
    },
    {
        "name": "Meteor Swarm",
        "level": 9,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 40-ft-radius sphere must succeed on a Dex. save or take 20d6 fire damage and 20d6 bludgeoning damage.",
        "id": "spell:meteorswarm"
    },
    {
        "name": "Mighty Fortress",
        "level": 8,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Let erupt a forteresse of stone on a 120 x 120 ft area for 7 days.",
        "id": "spell:mightyfortress"
    },
    {
        "name": "Mind Blank",
        "level": 8,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target is immune to psychic damage, reading thoughts, divination spells, and the charmed condition.",
        "id": "spell:mindblank"
    },
    {
        "name": "Mind Sliver",
        "level": 0,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on an Int. save or take 1d6 psychic damage and substract -1d4 on it's next saving throw (damage/lvl).",
        "id": "spell:mindsliver"
    },
    {
        "name": "Mind Spike",
        "level": 2,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or take 3d8 psychic damage (damage/lvl).",
        "id": "spell:mindspike"
    },
    {
        "name": "Minor Illusion",
        "level": 0,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create a sound or an immobile image of an object no larger than a 5-ft cube.",
        "id": "spell:minorillusion"
    },
    {
        "name": "Mirage Arcane",
        "level": 7,
        "type": "type:illusion",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Tansform the appearance (sight, sound, smell and feel) of a 1 mile square.",
        "id": "spell:miragearcane"
    },
    {
        "name": "Mirror Image",
        "level": 2,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create 3 illusory duplicates of the caster, each of them having a CA equal to 10 + Dex.Mod and being destroyed if they are hit.",
        "id": "spell:mirrorimage"
    },
    {
        "name": "Mislead",
        "level": 5,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster becomes invisible and creates a double that moves, acts and speaks. The caster can see and hear through this double.",
        "id": "spell:mislead"
    },
    {
        "name": "Misty Step",
        "level": 2,
        "type": "type:conjuration",
        "casting_time": "1 bonus action",
        "concentration": "",
        "ritual": "",
        "description": "The caster is teleported up to 30 feet.",
        "id": "spell:mistystep"
    },
    {
        "name": "Modify Memory",
        "level": 5,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or be charmed and its memory altered (seniority of memories/lvl).",
        "id": "spell:modifymemory"
    },
    {
        "name": "Mold Earth",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Control dirt or stone to excavate, shape, turn it into difficult terrain, etc.",
        "id": "spell:moldearth"
    },
    {
        "name": "Moonbeam",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 5-ft-radius, 40-ft-high cylinder must succeed on a Con. save or take 2d10 radiant damage (damage/lvl).",
        "id": "spell:moonbeam"
    },
    {
        "name": "Mordenkainen's Faithful Hound",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Summon an invisible watchdog that barks when a creature approaches and attacks it (4d8 piercing damage).",
        "id": "spell:mordenkainen'sfaithfulhound"
    },
    {
        "name": "Mordenkainen's Magnificent Mansion",
        "level": 7,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Create an extradimensional mansion with all the comforts that can shelter the caster and other creatures.",
        "id": "spell:mordenkainen'smagnificentmansion"
    },
    {
        "name": "Mordenkainen's Private Sanctum",
        "level": 4,
        "type": "type:abjuration",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Create a secure cube up to 100 ft on each side. The type of protection is to choose (+100 ft on each side/lvl).",
        "id": "spell:mordenkainen'sprivatesanctum"
    },
    {
        "name": "Mordenkainen's Sword",
        "level": 7,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the spell attack hits, deals 3d10 force damage. The sword can move.",
        "id": "spell:mordenkainen'ssword"
    },
    {
        "name": "Move Earth",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Shape dirt, sand, or clay, but not stone (raise, lower, flatten, create a trench, etc) in a 40-ft square in 10 min.",
        "id": "spell:moveearth"
    },
    {
        "name": "Nathair's Mischief",
        "level": 2,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Fill a 20-ft cube with a magic effect. The random effect can be charmed, blinded, incapacitated or difficult terrain.",
        "id": "spell:nathair'smischief"
    },
    {
        "name": "Negative Energy Flood",
        "level": 5,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Con. save or take 5d12 necrotic damage. Killed that way, the target rises as a zombi.",
        "id": "spell:negativeenergyflood"
    },
    {
        "name": "Nondetection",
        "level": 3,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Protect a creature or an object from any divination magic or magical scrying.",
        "id": "spell:nondetection"
    },
    {
        "name": "Nystul's Magic Aura",
        "level": 2,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Reveal false information about a creature or an object that would be the target of a divination spell.",
        "id": "spell:nystul'smagicaura"
    },
    {
        "name": "Otiluke's Freezing Sphere",
        "level": 6,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 60-ft-radius sphere must succeed on a Con. save or take 10d6 cold damage (damage/lvl).",
        "id": "spell:otiluke'sfreezingsphere"
    },
    {
        "name": "Otiluke's Resilient Sphere",
        "level": 4,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The Large size or smaller target must succeedd on a Dex. save or be enclosed for the spell duration.",
        "id": "spell:otiluke'sresilientsphere"
    },
    {
        "name": "Otto's Irresistible Dance",
        "level": 6,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or dance (disadvantage on Dex. save and attack rolls).",
        "id": "spell:otto'sirresistibledance"
    },
    {
        "name": "Pass without Trace",
        "level": 2,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster and his allies within 30 ft get a +10 bonus to Dexterity (Discretion) checks and leave behind no tracks or traces.",
        "id": "spell:passwithouttrace"
    },
    {
        "name": "Passwall",
        "level": 5,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Open a 5-ft wide, 8-ft tall, 20-ft deep passage through stone, wood or plaster.",
        "id": "spell:passwall"
    },
    {
        "name": "Phantasmal Force",
        "level": 2,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Tha target must succeed on an Int. save or perceive as real an object or creature created by the caster (with sound).",
        "id": "spell:phantasmalforce"
    },
    {
        "name": "Phantasmal Killer",
        "level": 4,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or be frightened then take 4d10 psychic damage (damage/lvl) on each of it's turn.",
        "id": "spell:phantasmalkiller"
    },
    {
        "name": "Phantom Steed",
        "level": 3,
        "type": "type:illusion",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Create a quasi-real Large horselike creature and everything to mount it.",
        "id": "spell:phantomsteed"
    },
    {
        "name": "Planar Ally",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Summon a celestial, elemental, or fiend that will help the caster in exchange for payment (1000 gp/h, sacrifice, quest, etc).",
        "id": "spell:planarally"
    },
    {
        "name": "Planar Binding",
        "level": 5,
        "type": "type:abjuration",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "The target (celestial, elemental, fey, or fiend) must succeed on a Cha. save or serve the caster (duration/lvl).",
        "id": "spell:planarbinding"
    },
    {
        "name": "Plane Shift",
        "level": 7,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster and up to 8 creatures are transported to another plane of existence, or a creature is banished (Cha. save).",
        "id": "spell:planeshift"
    },
    {
        "name": "Plant Growth",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action or 8 hours",
        "concentration": "",
        "ritual": "",
        "description": "Plants in the area grow vigorously, or over a year the plants produce twice the normal amount of food.",
        "id": "spell:plantgrowth"
    },
    {
        "name": "Poison Spray",
        "level": 0,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Con. save or take 1d12 poison damage (damage/lvl).",
        "id": "spell:poisonspray"
    },
    {
        "name": "Polymorph",
        "level": 4,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Transform a target into a new beast form whose CR/level is equal to or less than the target's CR/level.",
        "id": "spell:polymorph"
    },
    {
        "name": "Power Word Heal",
        "level": 9,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target regains all its hp and charmed, frightened, paralyzed, and stunned conditions end.",
        "id": "spell:powerwordheal"
    },
    {
        "name": "Power Word Kill",
        "level": 9,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target (100 hp or fewer) dies!",
        "id": "spell:powerwordkill"
    },
    {
        "name": "Power Word Pain",
        "level": 7,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target (100 hp max) has its speed reduced to 10 ft, disadvantage to d20 rolls and has to make a Con. save to cast spells.",
        "id": "spell:powerwordpain"
    },
    {
        "name": "Power Word Stun",
        "level": 8,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target (150 hp or fewer) is stunned until it succeeds on a Con. save.",
        "id": "spell:powerwordstun"
    },
    {
        "name": "Prayer of Healing",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "10 minutes",
        "concentration": "",
        "ritual": "",
        "description": "Up to 6 creatures regain 2d8+Ability.Mod (+1d8 hp/lvl).",
        "id": "spell:prayerofhealing"
    },
    {
        "name": "Prestidigitation",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Minor magical trick (sensory effect, light a torch, clean an object, warm, make a symbol appear, create a trinket, etc).",
        "id": "spell:prestidigitation"
    },
    {
        "name": "Primal Savagery",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the melee spell attack hits, deals 1d10 acid damage (damage/lvl).",
        "id": "spell:primalsavagery"
    },
    {
        "name": "Primordial Ward",
        "level": 6,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster gets resistance to acid, cold, fire, lightning, and thunder damage or immunity to a single type.",
        "id": "spell:primordialward"
    },
    {
        "name": "Prismatic Spray",
        "level": 7,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 60-ft cone must succeed on a Dex. save or take 10d6 damage of a randomly determined type.",
        "id": "spell:prismaticspray"
    },
    {
        "name": "Prismatic Wall",
        "level": 9,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create a multi-layered wall that inflicts different effects and damage depending on the layer.",
        "id": "spell:prismaticwall"
    },
    {
        "name": "Produce Flame",
        "level": 0,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 1d8 fire damage (damage/lvl). Shed bright light in 10 ft and dim light in additional 10 ft.",
        "id": "spell:produceflame"
    },
    {
        "name": "Programmed Illusion",
        "level": 6,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create the image of an animated object or creature, with sounds, for 5 min, with a triggering condition.",
        "id": "spell:programmedillusion"
    },
    {
        "name": "Project Image",
        "level": 7,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a copy of the caster that mimics him, moves and emits sounds. The caster can see and hear through this double.",
        "id": "spell:projectimage"
    },
    {
        "name": "Protection from Energy",
        "level": 3,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target gains resistance to one damage type (acid, cold, fire, lightning, or thunder).",
        "id": "spell:protectionfromenergy"
    },
    {
        "name": "Protection from Evil and Good",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target is protected (disadvantage on attack rolls) against aberrations, celestials, elementals, fey, fiends, and undead.",
        "id": "spell:protectionfromevilandgood"
    },
    {
        "name": "Protection from Poison",
        "level": 2,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Neutralize 1 poison in one creature, give advantage on saving throws againt being poisoned, and resistance to poison damage.",
        "id": "spell:protectionfrompoison"
    },
    {
        "name": "Psychic Scream",
        "level": 9,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Up to 10 creatures must succeed on an Int. save or take 14d6 psychic damage.",
        "id": "spell:psychicscream"
    },
    {
        "name": "Purify Food and Drink",
        "level": 1,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Purified and rendered free of poison and disease nonmagical food and drink in a 5-ft-radius sphere.",
        "id": "spell:purifyfoodanddrink"
    },
    {
        "name": "Pyrotechnics",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Target flame within 60-ft and make them explode (Con. save or blinded) or spread smoke (heavily obscured).",
        "id": "spell:pyrotechnics"
    },
    {
        "name": "Raise Dead",
        "level": 5,
        "type": "type:necromancy",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "Take back to life (1 hp) a creature died for no longer than 10 days. Doesn't restore missing body parts.",
        "id": "spell:raisedead"
    },
    {
        "name": "Rary's Telepathic Bond",
        "level": 5,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Create a telepathic link between up to 8 people in a 30-ft radius for 1 hour.",
        "id": "spell:rary'stelepathicbond"
    },
    {
        "name": "Raulothim's Psychic Lance",
        "level": 4,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Int. save or take 7d6 psychic damage and be incapacitated (damage/lvl).",
        "id": "spell:raulothim'spsychiclance"
    },
    {
        "name": "Ray of Enfeeblement",
        "level": 2,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the spell attack hits, the target deals only half damage with a weapon attack that use Strength (Con. save).",
        "id": "spell:rayofenfeeblement"
    },
    {
        "name": "Ray of Frost",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 1d8 cold damage (damage/lvl) and the target's speed is reduced by 10 ft.",
        "id": "spell:rayoffrost"
    },
    {
        "name": "Ray of Sickness",
        "level": 1,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the attack hits, deals 2d8 poison damage (damage/lvl) and the target can be poisoned (Con. save).",
        "id": "spell:rayofsickness"
    },
    {
        "name": "Regenerate",
        "level": 7,
        "type": "type:transmutation",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "The target regains 4d8+15 hp then 1 hp per round and its severed members are restored.",
        "id": "spell:regenerate"
    },
    {
        "name": "Reincarnate",
        "level": 5,
        "type": "type:transmutation",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "Reincarnate the soul of an humanoid died for no longer than 10 days. The race of the new body is determined at random.",
        "id": "spell:reincarnate"
    },
    {
        "name": "Remove Curse",
        "level": 3,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "End all curses affecting one creature or object.",
        "id": "spell:removecurse"
    },
    {
        "name": "Resistance",
        "level": 0,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target can add 1d4 to one saving throw of its choice.",
        "id": "spell:resistance"
    },
    {
        "name": "Resurrection",
        "level": 7,
        "type": "type:necromancy",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "Take back to life (all hp) a creature died for no longer than 100 years (except of old age). Restore any missing body parts.",
        "id": "spell:resurrection"
    },
    {
        "name": "Reverse Gravity",
        "level": 7,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Invert gravity in a 50-ft-radius, 100-ft-high cylinder.",
        "id": "spell:reversegravity"
    },
    {
        "name": "Revivify",
        "level": 3,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Take back to 1 hp a creature that has died within the last minute (except of old age).",
        "id": "spell:revivify"
    },
    {
        "name": "Rime's Binding Ice",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 30-ft cone must succeed on a Con. save or take 3d8 cold damage and its speed reduced to 0 (damage/lvl).",
        "id": "spell:rime'sbindingice"
    },
    {
        "name": "Rope Trick",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Vertically raise a rope that lead to an extradimensional space that can hold 8 Medium creatures.",
        "id": "spell:ropetrick"
    },
    {
        "name": "Sacred Flame",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Dex. save or take 1d8 radiant damage (damage/lvl).",
        "id": "spell:sacredflame"
    },
    {
        "name": "Sanctuary",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 bonus action",
        "concentration": "",
        "ritual": "",
        "description": "The protected creature forces a Wis. save to his aggressor in case of attack or offensive spell to no longer be the target.",
        "id": "spell:sanctuary"
    },
    {
        "name": "Scatter",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Up to 5 creatures are teleported (Wis. save if unwilling) within 120 ft.",
        "id": "spell:scatter"
    },
    {
        "name": "Scorching Ray",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attacks hit, 3 rays deal 2d6 fire damage each (+1 ray/lvl).",
        "id": "spell:scorchingray"
    },
    {
        "name": "Scrying",
        "level": 5,
        "type": "type:divination",
        "casting_time": "10 minutes",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Allow you to see and hear a specific creature (can also target a location) on the same plane (Wis. save).",
        "id": "spell:scrying"
    },
    {
        "name": "Searing Smite",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the attack hits, deals an extra 1d6 fire damage and ignite the target (damage/lvl).",
        "id": "spell:searingsmite"
    },
    {
        "name": "See Invisibility",
        "level": 2,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster sees invisible creatures and objects, and into the Ethereal Plane.",
        "id": "spell:seeinvisibility"
    },
    {
        "name": "Seeming",
        "level": 5,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Change physical appearance as well as clothing and equipment of targets (saving throw for unwilling).",
        "id": "spell:seeming"
    },
    {
        "name": "Sending",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Send a 25-words message to a creature you are familiar with, regardless of the distance or the plan. It can answer it.",
        "id": "spell:sending"
    },
    {
        "name": "Sequester",
        "level": 7,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Protect a willing creature (who becomes invisible and unconscious) or an object from divination spells.",
        "id": "spell:sequester"
    },
    {
        "name": "Shadow Blade",
        "level": 2,
        "type": "type:illusion",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a weapon that deals 2d8 psychic damage with the finesse, light, and thrown properties (damage/lvl).",
        "id": "spell:shadowblade"
    },
    {
        "name": "Shadow of Moil",
        "level": 4,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Tha caster gains resistance to radiant damage and deals 2d8 necrotic damage to creatures that hit him with an attack.",
        "id": "spell:shadowofmoil"
    },
    {
        "name": "Shape Water",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Control water to obtain various minor effects such as changing color, freezing, changing the flow, etc.",
        "id": "spell:shapewater"
    },
    {
        "name": "Shapechange",
        "level": 9,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster takes the form of a creature he has seen at least once with a CR equal to its level or lower.",
        "id": "spell:shapechange"
    },
    {
        "name": "Shatter",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 10-ft-radius sphere must succeed on a Con. save or take 3d8 thunder damage (damage/lvl).",
        "id": "spell:shatter"
    },
    {
        "name": "Shield",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 reaction",
        "concentration": "",
        "ritual": "",
        "description": "In reaction, the caster gains a +5 bonus to AC and take no damage from the magic missile spell.",
        "id": "spell:shield"
    },
    {
        "name": "Shield of Faith",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target gets a +2 bonus to AC.",
        "id": "spell:shieldoffaith"
    },
    {
        "name": "Shillelagh",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "",
        "ritual": "",
        "description": "Make magical a wooden weapon. Its damage become a d8 and the caster can use his spellcasting ability instead of Strength.",
        "id": "spell:shillelagh"
    },
    {
        "name": "Shocking Grasp",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 1d8 lightning damage (damage/lvl) and the target can't take reactions.",
        "id": "spell:shockinggrasp"
    },
    {
        "name": "Sickening Radiance",
        "level": 4,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 30-ft radius must succeed on a Con. save or take 4d10 radiant damage and one level of exhaustion.",
        "id": "spell:sickeningradiance"
    },
    {
        "name": "Silence",
        "level": 2,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "Ritual",
        "description": "Block all sounds within a 20-ft-radius sphere.",
        "id": "spell:silence"
    },
    {
        "name": "Silent Image",
        "level": 1,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create the image of an object or a creature (without sound and no larger than a 15-ft cube) and lets it move.",
        "id": "spell:silentimage"
    },
    {
        "name": "Simulacrum",
        "level": 7,
        "type": "type:illusion",
        "casting_time": "12 hours",
        "concentration": "",
        "ritual": "",
        "description": "Create a duplicate of a beast or humanoid with the same abilities, half of the hp and without equipment.",
        "id": "spell:simulacrum"
    },
    {
        "name": "Skill Empowerment",
        "level": 5,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target doubles its proficiency bonus for one skill.",
        "id": "spell:skillempowerment"
    },
    {
        "name": "Skywrite",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "Ritual",
        "description": "Create up to 10 words in the clouds.",
        "id": "spell:skywrite"
    },
    {
        "name": "Sleep",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "5d8 hp of creatures fall unconscious, starting with the creature with the lowest current hp (+2d8 hp/lvl).",
        "id": "spell:sleep"
    },
    {
        "name": "Sleet Storm",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft-radius, 20-ft-tall cylinder (heavily obscured) must succeed on a Dex. save or fall prone.",
        "id": "spell:sleetstorm"
    },
    {
        "name": "Slow",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Up to 6 targets must succeed on a Wis. save, or have their speed and actions reduced and -2 to CA and Dex. saves.",
        "id": "spell:slow"
    },
    {
        "name": "Snare",
        "level": 1,
        "type": "type:abjuration",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Create a magic trap (Dex. save or the Small to Large size creature is hoisted into the air).",
        "id": "spell:snare"
    },
    {
        "name": "Snilloc's Snowball Swarm",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 5-ft-radius sphere must succeed on a Dex. save or take 3d6 cold damage (damage/lvl).",
        "id": "spell:snilloc'ssnowballswarm"
    },
    {
        "name": "Soul Cage",
        "level": 6,
        "type": "type:necromancy",
        "casting_time": "1 reaction",
        "concentration": "",
        "ritual": "",
        "description": "Snatch a soul to regain hp, ask it a question, get advantage to a roll, or see a place it saw in life.",
        "id": "spell:soulcage"
    },
    {
        "name": "Spare the Dying",
        "level": 0,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "1 living creature with 0 hit points becomes stable.",
        "id": "spell:sparethedying"
    },
    {
        "name": "Speak with Animals",
        "level": 1,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "The caster communicates with beats that can share information or help.",
        "id": "spell:speakwithanimals"
    },
    {
        "name": "Speak with Dead",
        "level": 3,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Allow a corpse that still has a mouth and is not an undead to answer 5 questions to the caster.",
        "id": "spell:speakwithdead"
    },
    {
        "name": "Speak with Plants",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster can communicate with plants within 30 ft, and turns difficult terrain into ordinary terrain or vice versa.",
        "id": "spell:speakwithplants"
    },
    {
        "name": "Spider Climb",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target can move along vertical surfaces while leaving its hands free and gains climbing speed.",
        "id": "spell:spiderclimb"
    },
    {
        "name": "Spike Growth",
        "level": 2,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft radius (difficult terrain) take 2d4 piercing damage for every 5 ft of movement.",
        "id": "spell:spikegrowth"
    },
    {
        "name": "Spirit Guardians",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Targets in a 15-ft radius must succeed on a Wis. save or take 3d8 radiant or necrotic damage (damage/lvl).",
        "id": "spell:spiritguardians"
    },
    {
        "name": "Spirit Shroud",
        "level": 3,
        "type": "type:necromancy",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the attack hits, deals an extra 1d8 radiant, necrotic, or cold damage. Target can't regain hp this turn (damage/lvl).",
        "id": "spell:spiritshroud"
    },
    {
        "name": "Spiritual Weapon",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 1d8+Ability.Mod force damage (damage/lvl). A bonus action allows another attack.",
        "id": "spell:spiritualweapon"
    },
    {
        "name": "Staggering Smite",
        "level": 4,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the attack hits, deals an extra 4d6 pyschic damage and the target must succeed on a Wis. save or have a disadvantage.",
        "id": "spell:staggeringsmite"
    },
    {
        "name": "Steel Wind Strike",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the spell attack hits, deals 6d10 force damage to 5 creatures, then the caster teleports.",
        "id": "spell:steelwindstrike"
    },
    {
        "name": "Stinking Cloud",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft-radius sphere must succeed on a Con. save or spend their action that turn retching and reeling.",
        "id": "spell:stinkingcloud"
    },
    {
        "name": "Stone Shape",
        "level": 4,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Give a stone no more than 5 ft in any dimension any shape, or create an opening in it.",
        "id": "spell:stoneshape"
    },
    {
        "name": "Stoneskin",
        "level": 4,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target gets resistance to nonmagical bludgeoning, piercing, and slashing damage.",
        "id": "spell:stoneskin"
    },
    {
        "name": "Storm of Vengeance",
        "level": 9,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 360-ft radius must succeed on a Con. save or be deafened and suffer various damage and effects.",
        "id": "spell:stormofvengeance"
    },
    {
        "name": "Storm Sphere",
        "level": 4,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 20-ft-radius sphere must succeed on a Str. save or take 2d6 bludgeoning damage (damage/lvl).",
        "id": "spell:stormsphere"
    },
    {
        "name": "Suggestion",
        "level": 2,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or follow the suggestion given by the caster in one or two sentences.",
        "id": "spell:suggestion"
    },
    {
        "name": "Summon Aberration",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 aberrant spirit (beholderkin, slaad, or star spawn), friendly (stat block/your lvl).",
        "id": "spell:summonaberration"
    },
    {
        "name": "Summon Beast",
        "level": 2,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 bestial spirit (air, land, or water), friendly (stat block/your lvl).",
        "id": "spell:summonbeast"
    },
    {
        "name": "Summon Celestial",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 celestial spirit (avenger or defender), friendly (stat block/your lvl).",
        "id": "spell:summoncelestial"
    },
    {
        "name": "Summon Construct",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 spirit of a construct (clay, metal, or stone), friendly (stat block/your lvl).",
        "id": "spell:summonconstruct"
    },
    {
        "name": "Summon Draconic Spirit",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 draconic spirit (chromatic, gem, or metallic), friendly (stat/lvl).",
        "id": "spell:summondraconicspirit"
    },
    {
        "name": "Summon Elemental",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 elemental spirit (air, earth, fire, or water), friendly (stat block/your lvl).",
        "id": "spell:summonelemental"
    },
    {
        "name": "Summon Fey",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 fey spirit (fuming, mirthful, or tricksy), friendly (stat block/your lvl).",
        "id": "spell:summonfey"
    },
    {
        "name": "Summon Fiend",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 fiendish spirit (demon, devil, or yugoloth), friendly (stat block/your lvl).",
        "id": "spell:summonfiend"
    },
    {
        "name": "Summon Greater Demon",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 demon of CR 5, friendly (CR +1/lvl).",
        "id": "spell:summongreaterdemon"
    },
    {
        "name": "Summon Lesser Demons",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 2 demons of CR 1 to 8 demons of CR 1/4, unfriendly (nbr of creatures/lvl).",
        "id": "spell:summonlesserdemons"
    },
    {
        "name": "Summon Shadowspawn",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 shadowy spirit (fury, despair, or fear), friendly (stat block/your lvl).",
        "id": "spell:summonshadowspawn"
    },
    {
        "name": "Summon Undead",
        "level": 3,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Summon 1 undead spirit (ghostly, putrid, or skeletal), friendly (stat block/your lvl).",
        "id": "spell:summonundead"
    },
    {
        "name": "Sunbeam",
        "level": 6,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures on a 5-ft-wide, 60-ft-long line must succeed on a Con. save or take 6d8 radiant damage and be blinded.",
        "id": "spell:sunbeam"
    },
    {
        "name": "Sunburst",
        "level": 8,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 60-ft radius must succeed on a Con. save or take 12d6 radiant damage and be blinded for 1 min.",
        "id": "spell:sunburst"
    },
    {
        "name": "Swift Quiver",
        "level": 5,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Make a quiver to produce an endless supply of nonmagical ammunition, allowing 2 attacks per round with a bonus action.",
        "id": "spell:swiftquiver"
    },
    {
        "name": "Sword Burst",
        "level": 0,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 5-ft-radius must succeed on a Dex. save or take 1d6 force damage (damage/lvl).",
        "id": "spell:swordburst"
    },
    {
        "name": "Symbol",
        "level": 7,
        "type": "type:abjuration",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Set the trigger and the effect of a glyph on an object (death, discord, fear, hopelessness, insanity, pain, sleep, etc).",
        "id": "spell:symbol"
    },
    {
        "name": "Synaptic Static",
        "level": 5,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 20-ft radius must succeed on an Int. save or take 8d6 psychic damage.",
        "id": "spell:synapticstatic"
    },
    {
        "name": "Tasha's Caustic Brew",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 30 ft long 5 ft wide line must succeed on a Dex. save or take 2d4 acid damage each turn (+2d4/lvl).",
        "id": "spell:tasha'scausticbrew"
    },
    {
        "name": "Tasha's Hideous Laughter",
        "level": 1,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or falls into fits of laughter, fall prone and becoming incapacitated.",
        "id": "spell:tasha'shideouslaughter"
    },
    {
        "name": "Tasha's Mind Whip",
        "level": 2,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Target must succeed on an Int. save or take 3d6 psychic damage and choose to move or take an action next turn (+1 creature/lvl).",
        "id": "spell:tasha'smindwhip"
    },
    {
        "name": "Tasha's Otherworldly Guise",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Immune to fire/poison or radiant/necrotic damage, 40 ft flying speed, +2 AC bonus, weapons are magical, 2 attacks.",
        "id": "spell:tasha'sotherworldlyguise"
    },
    {
        "name": "Telekinesis",
        "level": 5,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Move a creature (Huge or smaller) or object (up to 1,000 pounds) by thought in case of successful contest.",
        "id": "spell:telekinesis"
    },
    {
        "name": "Telepathy",
        "level": 8,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Comunicate via telepathy with a known and willing creature on the same plane of existence.",
        "id": "spell:telepathy"
    },
    {
        "name": "Teleport",
        "level": 7,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster and 8 creatures are teleported anywhere on the same plane. Risk of failure depending on the destination familiarity.",
        "id": "spell:teleport"
    },
    {
        "name": "Teleportation Circle",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Create a circle that allows anyone to be teleported to another teleportation circle known to the caster.",
        "id": "spell:teleportationcircle"
    },
    {
        "name": "Temple of the Gods",
        "level": 7,
        "type": "type:conjuration",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "Let erupt a temple dedicated to a god on a 120 x 120 ft area for 1 day.",
        "id": "spell:templeofthegods"
    },
    {
        "name": "Tenser's Floating Disk",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Create a floating 3-ft-diameter disk that can support up to 500 pounds and follows the caster.",
        "id": "spell:tenser'sfloatingdisk"
    },
    {
        "name": "Tenser's Transformation",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster gains 50 hp, advantage to attack rolls, an extra 2d12 force damage, martial proficiencies and two attacks per round.",
        "id": "spell:tenser'stransformation"
    },
    {
        "name": "Thaumaturgy",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Create various minor effects to impress or distract creatures.",
        "id": "spell:thaumaturgy"
    },
    {
        "name": "Thorn Whip",
        "level": 0,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "If the attack hits, deals 1d6 piercing damage and pull the target (Larger or smaller) up to 10 ft (damage/lvl).",
        "id": "spell:thornwhip"
    },
    {
        "name": "Thunder Step",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster teleports and creatures within 10 ft must succeed on a Con. save or take 3d10 thunder damage.",
        "id": "spell:thunderstep"
    },
    {
        "name": "Thunderclap",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures within 5 ft must succeed on a Con. save or take 1d6 thunder damage (damage/lvl).",
        "id": "spell:thunderclap"
    },
    {
        "name": "Thunderous Smite",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the attack hits, deals an extra 2d6 thunder damage, and target must succeed on a Str. save or be pushed and knocked prone.",
        "id": "spell:thunderoussmite"
    },
    {
        "name": "Thunderwave",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 15-ft cube must succeed on a Con. save or take 2d8 thunder damage (damage/lvl).",
        "id": "spell:thunderwave"
    },
    {
        "name": "Tidal Wave",
        "level": 3,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in an 30 x 10 x 10 ft area must succeed on Dex. save or take 4d8 bludgeoning damage and be knocked prone.",
        "id": "spell:tidalwave"
    },
    {
        "name": "Time Stop",
        "level": 9,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Stop the time during 1d4+1 turns for everyone except for the caster.",
        "id": "spell:timestop"
    },
    {
        "name": "Tiny Servant",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "Transform one Tiny object into a creature with arms and legs under the caster control (+2 objects/lvl).",
        "id": "spell:tinyservant"
    },
    {
        "name": "Toll the Dead",
        "level": 0,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or take 1d8 or 1d12 necrotic damage (damage/lvl).",
        "id": "spell:tollthedead"
    },
    {
        "name": "Tongues",
        "level": 3,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target understands and speaks any spoken language it hears.",
        "id": "spell:tongues"
    },
    {
        "name": "Transmute Rock",
        "level": 5,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Transform a 40-ft cube of rock into mud or of mud into rock.",
        "id": "spell:transmuterock"
    },
    {
        "name": "Transport via Plants",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster can move from one plant to another plant (Large or larger) using 5 ft.",
        "id": "spell:transportviaplants"
    },
    {
        "name": "Tree Stride",
        "level": 5,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster can move from one tree to another tree of the same kind (500 ft max between both) using 5 ft.",
        "id": "spell:treestride"
    },
    {
        "name": "True Polymorph",
        "level": 9,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Transform a creature or object into a new form (creature <-> object) of FP/level at most equal to the FP/level of the crea",
        "id": "spell:truepolymorph"
    },
    {
        "name": "True Resurrection",
        "level": 9,
        "type": "type:necromancy",
        "casting_time": "1 hour",
        "concentration": "",
        "ritual": "",
        "description": "Take back to life (all hp) a creature died for no longer than 200 years (except of old age), even without the original body.",
        "id": "spell:trueresurrection"
    },
    {
        "name": "True Seeing",
        "level": 6,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target gets truesight, sees magic secret doors and in the Ethereal Plane.",
        "id": "spell:trueseeing"
    },
    {
        "name": "True Strike",
        "level": 0,
        "type": "type:divination",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster gains advantage on his first attack roll against a target.",
        "id": "spell:truestrike"
    },
    {
        "name": "Tsunami",
        "level": 8,
        "type": "type:conjuration",
        "casting_time": "1 minute",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 300-ft-long, 300-ft-high, 50-ft-thick area must succeed on a Str. save or take 6d10 bludgeoning damage.",
        "id": "spell:tsunami"
    },
    {
        "name": "Unseen Servant",
        "level": 1,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Create an invisible servant who performs simple tasks (bring something back, clean up, maintain a fire, serve at table, etc).",
        "id": "spell:unseenservant"
    },
    {
        "name": "Vampiric Touch",
        "level": 3,
        "type": "type:necromancy",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the spell attack hits, deals 3d6 necrotic damage (damage/lvl) and the caster regains 50% of his hp.",
        "id": "spell:vampirictouch"
    },
    {
        "name": "Vicious Mockery",
        "level": 0,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target must succeed on a Wis. save or take 1d4 psychic damage and have disadvantage on its attack roll (damage/lvl).",
        "id": "spell:viciousmockery"
    },
    {
        "name": "Vitriolic Sphere",
        "level": 4,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures within 20-ft must succeed on a Dex. save or take 10d4 acid damage (damage/lvl) then 5d4 acid damage on its turn.",
        "id": "spell:vitriolicsphere"
    },
    {
        "name": "Wall of Fire",
        "level": 4,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a 60 x 20 x 1 ft wall of fire. Creatures inside or within 10ft of one side of the wall take 5d8 fire damage (damage/lvl).",
        "id": "spell:walloffire"
    },
    {
        "name": "Wall of Force",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a physically insurmountable wall of force (ten 10-ft panels) immune to all types of damage.",
        "id": "spell:wallofforce"
    },
    {
        "name": "Wall of Ice",
        "level": 6,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a wall of ice (ten 10-ft panels) that can be damaged and can inflict 5d6 cold damage if passed through (damage/lvl).",
        "id": "spell:wallofice"
    },
    {
        "name": "Wall of Light",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a 60-ft-long, 10-ft-high, 5-ft-thick wall of light that can deal 4d8 radiant damage to one target (damage/lvl).",
        "id": "spell:walloflight"
    },
    {
        "name": "Wall of Sand",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a 30-ft-long, 10-ft-high, 10-ft-thick sand wall that blocks line of sight (blinded) but not movement.",
        "id": "spell:wallofsand"
    },
    {
        "name": "Wall of Stone",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a nonmagical wall of stone (ten 10-ft panels) that can be damaged.",
        "id": "spell:wallofstone"
    },
    {
        "name": "Wall of Thorns",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create an 60-ft-long, 10-ft-high, 5-ft-thick wall of brush that slows movement and can inflict 7d8 piercing damage (damage/lvl).",
        "id": "spell:wallofthorns"
    },
    {
        "name": "Wall of Water",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a 30-ft-long, 10-ft-high, 1-ft-thick wall of water that gives disadvantage on ranged attacks and halved fire damage.",
        "id": "spell:wallofwater"
    },
    {
        "name": "Warding Bond",
        "level": 2,
        "type": "type:abjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The target gains +1 on AC, +1 on saving throws and resistance to all damage, but the caster shares damage.",
        "id": "spell:wardingbond"
    },
    {
        "name": "Warding Wind",
        "level": 2,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create strong wind (20 miles/h) in a 10-ft radius (deafen, extinguish flames, hedge out gas, difficult terrain, etc).",
        "id": "spell:wardingwind"
    },
    {
        "name": "Water Breathing",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Up to 10 creatures gets the ability to breathe underwater.",
        "id": "spell:waterbreathing"
    },
    {
        "name": "Water Walk",
        "level": 3,
        "type": "type:transmutation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "Ritual",
        "description": "Up to 10 creatures can move on a liquid surface (water, acid, mud, lava, etc) as if it were harmless solid ground.",
        "id": "spell:waterwalk"
    },
    {
        "name": "Watery Sphere",
        "level": 4,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Up to 4 Medium creatures or 1 Large creature in a 10-ft radius must succeed on a Str. save or be restrained.",
        "id": "spell:waterysphere"
    },
    {
        "name": "Web",
        "level": 2,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a 20-ft cube filled by thick, sticky webs (difficult terrain) that can restrain creature (Dex. save).",
        "id": "spell:web"
    },
    {
        "name": "Weird",
        "level": 9,
        "type": "type:illusion",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 30-ft-radius sphere must succeed on a Wis. save or be frightened and take 4d10 psychic damage each turn.",
        "id": "spell:weird"
    },
    {
        "name": "Whirlwind",
        "level": 7,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Creatures in a 10-ft-radius, 30-foot-high cylinder must succeed on a Dex. save or take 10d6 blunt damage.",
        "id": "spell:whirlwind"
    },
    {
        "name": "Wind Walk",
        "level": 6,
        "type": "type:transmutation",
        "casting_time": "1 minute",
        "concentration": "",
        "ritual": "",
        "description": "The caster and up to 10 creatures assume gaseous form (flying speed of 300 ft and resistance to damage from nonmagical weapon).",
        "id": "spell:windwalk"
    },
    {
        "name": "Wind Wall",
        "level": 3,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Create a 50-ft-long, 15-ft-high, 1-ft-thick wall of wind. Small flying creatures can't pass. Arrows and bolts are deflected.",
        "id": "spell:windwall"
    },
    {
        "name": "Wish",
        "level": 9,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Duplicate a 8th level spell or lower without components, or create another effect at the MD discretion.",
        "id": "spell:wish"
    },
    {
        "name": "Witch Bolt",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the spell attack hits, deals 1d12 lightning damage (damage/lvl) on each round.",
        "id": "spell:witchbolt"
    },
    {
        "name": "Word of Radiance",
        "level": 0,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures in a 5-ft-radius must succeed on a Con. save or take 1d6 radiant damage (/lvl).",
        "id": "spell:wordofradiance"
    },
    {
        "name": "Word of Recall",
        "level": 6,
        "type": "type:conjuration",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "The caster and up to 5 other creatures are teleported to a previously designated sanctuary.",
        "id": "spell:wordofrecall"
    },
    {
        "name": "Wrath of Nature",
        "level": 5,
        "type": "type:evocation",
        "casting_time": "1 action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "Animate trees, rocks, and grasses in a 60 x 60 x 60 ft cube.",
        "id": "spell:wrathofnature"
    },
    {
        "name": "Wrathful Smite",
        "level": 1,
        "type": "type:evocation",
        "casting_time": "1 bonus action",
        "concentration": "Concentration",
        "ritual": "",
        "description": "If the attack hits, deals an extra 1d6 psychic damage and the target must succeed on a Wis. save or be frightened.",
        "id": "spell:wrathfulsmite"
    },
    {
        "name": "Zephyr Strike",
        "level": 1,
        "type": "type:transmutation",
        "casting_time": "1 action bonus",
        "concentration": "Concentration",
        "ritual": "",
        "description": "The caster's movement (+30 ft) doesn't provoque OA and he gets advantage to one attack roll that deals an extra 1d8 force.",
        "id": "spell:zephyrstrike"
    },
    {
        "name": "Zone of Truth",
        "level": 2,
        "type": "type:enchantment",
        "casting_time": "1 action",
        "concentration": "",
        "ritual": "",
        "description": "Creatures within a 15-ft-radius sphere must succeed on a Cha. save or can not lie.",
        "id": "spell:zoneoftruth"
    }
];

// listing.forEach(function(spell) {
// 	var match;
// 	if(!universe.manager.spell.object[spell.id]) {
// 		if(spell.ritual) {
// 			spell.ritual = true;
// 		}
// 		if(match = pattern.exec(spell.castingme)) {
// 			spell.cast_time = parseInt(match[1])
// 		}
// 		universe.create(spell);
// 	}
// });

listing.forEach(function(spell) {
	var match;
    if(spell.ritual) {
        spell.ritual = true;
    }
    if(spell.concentration) {
        spell.concentration = true;
    }
    if(match = pattern.exec(spell.casting_time)) {
		if(spell.casting_time.indexOf("action") !== -1) {
        	spell.cast_time = parseInt(match[1]) * 6;
		} else if(spell.casting_time.indexOf("minute") !== -1) {
        	spell.cast_time = parseInt(match[1]) * 60;
		} else if(spell.casting_time.indexOf("hour") !== -1) {
        	spell.cast_time = parseInt(match[1]) * 360;
		}
        if(spell.cast_time === 6) {
            delete(spell.cast_time);
        }
    }
    if(spell.casting_time.indexOf("reaction") !== -1) {
        spell.action_cost = {
            "reaction": 1
        };
    } else if(spell.casting_time.indexOf("bonus") !== -1) {
        spell.action_cost = {
            "bonus": 1
        };
    } else if(spell.casting_time.indexOf("action") !== -1) {
        spell.action_cost = {
            "action": 1
        };
    }
	spell.description = cleanDescription(spell.description);
});

function cleanDescription(description) {
	var matches = /([0-9]+)[- ]?(ft|foot|feet)/ig,
		result = description,
		match,
		n;
	while(match = matches.exec(description)) {
		n = match[1] * .8;
		result = result.replace(match[0], n + " stud");
	}
	return result;
}
