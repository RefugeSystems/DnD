var RSObject = require("../../../app/storage/rsobject");

describe("RSObject", function() {

	it("can add values", function() {
		var res, a, b;
		a = {
			"created": 1544409581358,
			"creator": "585c68bfd5e06ab07fba8401",
			"updated": 1576281401013,
			"updater": "585c68bfd5e06ab07fba8401",
			"id": "item:breastplate",
			"instanceOf": null,
			"template": null,
			"name": "Breastplate",
			"description": "A heavy plate armor chest piece",
			"cost": 400,
			"durability": 100,
			"attribute": "constitution",
			"damageType": null,
			"slotType": "chest",
			"type": "chest",
			"icon": "ra ra-vest",
			"proficiency": "proficiency:armor:chain",
			"skills": null,
			"disciplines": null,
			"attuned": null,
			"attunedTo": null,
			"mobility": 2,
			"innerRange": null,
			"outerRange": null,
			"disadvantage": null,
			"advantage": null,
			"level": null,
			"weight": 6,
			"size": 4,
			"effects": [],
			"requirement": {
				"strength": 10
			},
			"modifiers": [
				"modifier:item:armor:medium"
			],
			"spellModifiers": null,
			"note": "",
			"_search": "breastplateitem:breastplatea heavy plate armor chest piecechest"
		};
		b = {
			"name": null,
			"id": "modifier:versatibilty:forcepoint",
			"description": null,
			"note": null,
			"condition": null,
			"health": null,
			"maxHealth": null,
			"race": null,
			"magical": null,
			"skillPool": null,
			"featPool": null,
			"proficiencyPool": null,
			"throwProficiency": {},
			"proficiencies": [],
			"favoredEnemies": null,
			"actionMap": {
				"action": [],
				"bonusAction": [],
				"reaction": []
			},
			"minimums": {},
			"hitMain": null,
			"hitOff": null,
			"maximums": {},
			"armor": null,
			"heaviness": null,
			"spellDC": null,
			"spellAttack": null,
			"range": {},
			"acClass": null,
			"damage": {
				"slashing": "1d8",
				"force": "1d8"
			},
			"reduction": {},
			"vampirism": null,
			"spellMemory": {},
			"spellSlots": {},
			"strength": null,
			"dexterity": null,
			"constitution": null,
			"intelligence": null,
			"wisdom": null,
			"charisma": null,
			"view": null,
			"movement": null,
			"gender": null,
			"alignment": null,
			"actions": null,
			"legendaryActions": 0,
			"lairActions": 0,
			"moves": null,
			"known": null,
			"feats": [],
			"spells": [],
			"muted": false,
			"immunities": {},
			"disadvantages": {},
			"advantages": {},
			"saveAdvantages": {},
			"saveDisadvantages": {},
			"conditions": {},
			"throws": {},
			"created": 1561172775827,
			"creator": "585c68bfd5e06ab07fba8401",
			"updated": 1561172775827,
			"updater": "585c68bfd5e06ab07fba8401",
			"chooseGod": null,
			"_search": "modifier:versatibilty:forcepoint"
		};
		res = RSObject.addValues(a, b);
		console.log("Test: ", res);
	});
});
