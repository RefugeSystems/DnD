var exporting = [],
	lookup = {},
	naming = {},
	abbrv = {},
	build,
	find,
	keys,
	ref,
	res,
	id,
	i,
	j,
	k;

function add(...objects) {
	var result = {},
		keys,
		i,
		j;

	for(i=0; i<objects.length; i++) {
		keys = Object.keys(objects[i]);
		for(j=0; j<keys.length; j++) {
			if(result[keys[j]] === undefined) {
				result[keys[j]] = objects[i][keys[j]];
			} else if(typeof result[keys[j]] === "number") {
				result[keys[j]] += objects[i][keys[j]];
			} else if(typeof result[keys[j]] === "object") {
				result[keys[j]] = add(result[keys[j]], objects[i][keys[j]]);
			} else if(typeof result[keys[j]] === "string") {
				result[keys[j]] = result[keys[j]] + " + " + objects[i][keys[j]];
			} else {
				console.error("Unknown type for key: ", keys[j], result[keys[j]]);
			}
		}
	}

	return result;
}

function form(res) {
	res.is_template = null;
	res.duration = 3600;
	res.icon = "game-icon game-icon-atomic-slashes";
	res.level = 12;
	res.is_unique = null;
	res.actions = ["action:arcane:orbital:dismiss"];
	res.threat = 10;
	return res;
}

naming.r = "Red";
abbrv.r = "R";
lookup.r = {
    "damage_bonus_weapon": "1d6"
};
naming.g = "Green";
abbrv.g = "G";
lookup.g = {
    "stat_constitution": 2
};
naming.b = "Blue";
abbrv.b = "B";
lookup.b = {
	"armor": 2
};
naming.s = "Silver";
abbrv.s = "Si";
lookup.s = {
	"movement_ground": 8
};
naming.l = "Lime";
abbrv.l = "L";
lookup.l = {
	"skill_check": {
		"strength": 2,
		"dexterity": 2,
		"constitution": 2,
		"intelligence": 2,
		"wisdom": 2,
		"charisma": 2
	}
};
naming.o = "Gold";
abbrv.o = "Go";
lookup.o = {
	"spell_dc": 1,
	"spell_attack": 1
};

keys = Object.keys(lookup);
for(i=0; i<keys.length; i++) {
	for(j=0; j<keys.length; j++) {
		for(k=0; k<keys.length; k++) {
			res = add(lookup[keys[i]], lookup[keys[j]], lookup[keys[k]]);
			res.name = "Arcane Orbital (" + abbrv[keys[i]] + abbrv[keys[j]] + abbrv[keys[k]] + ")";
			res.id = "effect:orbital:" + keys[i] + keys[j] + keys[k];
			res.description = "A magical effect that grants the bonus of Power Crystals and is composed of the following crystals:  \n+ {{#item:crystal:" + naming[keys[i]].toLowerCase() + "}} \n+ {{#item:crystal:" + naming[keys[j]].toLowerCase() + "}}  \n+ {{#item:crystal:" + naming[keys[k]].toLowerCase() + "}}";
			exporting.push(form(res));
		}
	}
}

for(i=0; i<keys.length; i++) {
	for(j=0; j<keys.length; j++) {
		res = add(lookup[keys[i]], lookup[keys[j]]);
		res.name = "Arcane Orbital (" + abbrv[keys[i]] + abbrv[keys[j]] + ")";
		res.id = "effect:orbital:" + keys[i] + keys[j];
		res.description = "A magical effect that grants the bonus of Power Crystals and is composed of the following crystals:  \n+ {{#item:crystal:" + naming[keys[i]].toLowerCase() + "}} \n+ {{#item:crystal:" + naming[keys[j]].toLowerCase() + "}}";
		exporting.push(form(res));
	}
}

for(i=0; i<keys.length; i++) {
	res = add(lookup[keys[i]]);
	res.name = "Arcane Orbital (" + abbrv[keys[i]] + ")";
	res.id = "effect:orbital:" + keys[i];
	res.description = "A magical effect that grants the bonus of Power Crystals and is composed of the following crystals:  \n+ {{#item:crystal:" + naming[keys[i]].toLowerCase() + "}}";
	exporting.push(form(res));
}

console.log("Exported JSON:\n", exporting);
