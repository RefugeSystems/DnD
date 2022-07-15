var characters,
	knowns,
	types,
	bars;

characters = [
	"entity:character:5c01d9a538f9d87138ad6ca4",
	"entity:character:5bf3556a38f9d87138ad6c9f",
	"entity:character:5bef917a38f9d87138ad6c9a",
	"entity:character:5ec82e3a69e7408bc4c6920b",
	"entity:character:5beedf5c38f9d87138ad6c98",
	"entity:character:5beec5a538f9d87138ad6c94",
	"entity:character:5c0c4409449590597e991ca6",
	"entity:character:586d3bd1f81afb661e843908",
	"entity:character:5ca94d55b6bf0d41cd2a8176",
	"entity:character:5c0c46a8449590597e991cac",
	"entity:character:5c55f89943fb524d44f08d4f"
];

types = [{
	"name": "Investigating",
	"type": "type:investigating",
	"icon": "fa-solid fa-search",
	"userbar_actions": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
}, {
	"name": "Combat",
	"type": "type:combat",
	"icon": "game-icon game-icon-sword-clash",
	"userbar_actions": [{
		"id": "action:main:attack",
		"name": "Attack",
		"icon": "game-icon game-icon-sword-clash"
	}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
}, {
	"name": "Town",
	"type": "type:town",
	"icon": "fa-solid fa-archway",
	"userbar_actions": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
}, {
	"name": "Travel",
	"type": "type:travel",
	"icon": "fa-solid fa-wagon-covered",
	"userbar_actions": [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}]
}];
	
knowns = {};
bars = {};

characters.forEach(function(character) {
	bars[character] = [];
	types.forEach(function(type) {
		var details = JSON.parse(JSON.stringify(Object.assign({}, type))),
			knowledge = {};
		
		knowns[character] = knowledge.id = "knowledge:puzzles:" + character;
		knowledge.name = "Puzzle Knowledge Reference";
		knowledge.icon = "fa-solid fa-puzzle";
		knowledge.category = "category:ideas:travels";
		knowledge.character = character;
		knowledge.description = "Over your journeys you've learn about objects called {{Power Crystals}} that have distinct colors and special properties that affect magic and were seemingly important in the ancient world as well as the current.\n\nThe 3 base crystals are:\n+ {{Green Power Crystal}} - The Crafter  \nNature, Healing, and Persistent Effects\n+ {{Blue Power Crystal}} - The Citizen  \nWater, Manipulation, and Protection Effects\n+ {{Red Power Crystal}} - The Curator  \nForce, Destruction, and Short Term Effects\n\nAnd 4 special crystals, of which you only currently know some about 2 of them:\n+ {{Orange Power Crystal}} - The Composer  \nFire, Chaos, Reality Distortion\n+ {{Lime Power Crystal}} - The Conformist  \nTransitory effects of other crystals\n\nThe remaining 2 crystals you only know to be quite powerful and additionally do not align with {{the nature of the power crystals that of which you are aware, knowledge:story:crystals:powerspectrum}}:\n+ {{Silver Power Crystal}} - ?  \nSeems to be capable of creating portals?\n+ {{Gold Power Crystal}} - ?  \nSeems to be capable of creating portals?\n\nIn your travels you've come across magical barriers matching the various colors or combinations thereof that were passed by holding a crystal of the same color or 2 crystals whose {{combination yielded that color, knowledge:story:crystals:powerspectrum}}. From what you know, there are some colors, notably Cyan, Purple, and Yellow who have no corresponding Power Crystals.\n\nIn toying with the crystals and the fields, pushing a crystal of a color adjacent a field (For example a {{Green Power Crystal}} into a Purple Field) results in the Power Crystal cracking and eventually disintigrating. Additionally you've learned that you can cast spells focused through a Power Crystal with varying results that seem to be mostly dependent on the spell.\n\nRecently you've also learned of {{Arcane Orientors}} that seem to be able to focus the power of a {{Power Crystal}} into a beam of energy that radiates that crystals power. Golden and Silver Orientors seem capable of pushign the power out or receiving and redirecting a beam from another Orientor. Though if the color of the incoming beam doesn't align with the {{Power Crystal}} inside, the crystal in the receiving Orientor shatters.";
		knowledge.associations = [
			"knowledge:crystals:spells",
			"knowledge:story:crystals:nature",
			"item:crystal:red",
			"item:crystal:blue",
			"item:crystal:green",
			"item:crystal:orange",
			"item:crystal:silver",
			"item:crystal:lime",
			"item:crystal:gold"
		];
		universe.createObject(knowledge);
		
		details.id = "userbar:" + details.type + ":" + character;
		details.character = character;
		switch(details.type) {
			case "type:investigating":
				details.userbar_actions.unshift({
					"id": knowledge.id,
					"name": knowledge.name,
					"icon": knowledge.icon
				});
				break;
		}
		universe.createObject(details);
		bars[character].push(details.id);
	});
});

characters.forEach(function(id) {
	universe.getObject(id, function(err, character) {
		if(character) {
			var knowledge = knowns[character.id];
			character.setValues({
				"userbars": bars[character.id]
			});
			if(character.knowledges.indexOf(knowledge) === -1) {
				character.addValues({
					"knowledges": [knowledge]
				});
			}
		}
	});
});
