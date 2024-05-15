// Key Vars: source, universe, event, utility

universe.off("object:template:generated", universe.nameNPCs);
universe.nameNPCs = function(template) {
	/* Datasets
	'dataset:human:female'
	'dataset:halforc:male'
	'dataset:halforc:female'
	'dataset:gnome:female'
	'dataset:gnome:male'
	'dataset:halfling:male'
	'dataset:halfling:female'
	'dataset:elven:female'
	'dataset:elven:male'
	'dataset:tiefling:female'
	'dataset:tiefling:male'
	'dataset:dwarf:female'
	'dataset:dwarf:male'
	'dataset:dragonborn:female'
	'dataset:dragonborn:male'
	*/

	utility.log("HI3");

	var dataset,
		name,
		mapping = {
		"race:human": {
			"gender:male": "dataset:human:male",
			"gender:female": "dataset:human:female",
			"gender:agender": "dataset:human:female",
			"gender:nonbinary": "dataset:human:male"
		},
		"race:halforc": {
			"gender:male": "dataset:halforc:male",
			"gender:female": "dataset:halforc:female",
			"gender:agender": "dataset:halforc:female",
			"gender:nonbinary": "dataset:halfoc:male"
		},
		"race:gnome": {
			"gender:male": "dataset:gnome:male",
			"gender:female": "dataset:gnome:female",
			"gender:agender": "dataset:gnome:female",
			"gender:nonbinary": "dataset:gnome:male"
		},
		"race:halfling": {
			"gender:male": "dataset:halfling:male",
			"gender:female": "dataset:halfling:female",
			"gender:agender": "dataset:halfling:female",
			"gender:nonbinary": "dataset:halfling:male"
		},
		"race:elf": {
			"gender:male": "dataset:elven:male",
			"gender:female": "dataset:elven:female",
			"gender:agender": "dataset:elven:female",
			"gender:nonbinary": "dataset:elven:male"
		},
		"race:tiefling": {
			"gender:male": "dataset:tiefling:male",
			"gender:female": "dataset:tiefling:female",
			"gender:agender": "dataset:tiefling:female",
			"gender:nonbinary": "dataset:tiefling:male"
		},
		"race:dwarf": {
			"gender:male": "dataset:dwarf:male",
			"gender:female": "dataset:dwarf:female",
			"gender:agender": "dataset:dwarf:female",
			"gender:nonbinary": "dataset:dwarf:male"
		},
		"race:dragonborn": {
			"gender:male": "dataset:dragonborn:male",
			"gender:female": "dataset:dragonborn:female",
			"gender:agender": "dataset:dragonborn:female",
			"gender:nonbinary": "dataset:dragonborn:male"
		}
	};

	if((!template.name || template.name.length < 6 || template.name.indexOf("NPC") !== -1 || template.name.indexOf("npc") !== -1) && mapping[template.race] && mapping[template.race][template.gender] && (dataset = universe.get(mapping[template.race][template.gender])) && (name = utility.getRandomName(dataset))) {
		template.setValues({
			"name": name
		});
	}
};
universe.on("object:template:generated", universe.nameNPCs);