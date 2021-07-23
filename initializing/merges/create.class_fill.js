var fs = require("fs"),
	classes = ["bard", "barbarian", "cleric", "druid", "fighter", "monk", "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"],
	starts = {
		"bard": 3,
		"barbarian": 11,
		"cleric": 12,
		"druid": 3,
		"fighter": 3,
		"paladin": 10,
		"ranger": 10,
		"rogue": 11,
		"monk": 3,
		"sorcerer": 12,
		"warlock": 3,
		"wizard": 13
	},
	maxLevel = 30,
	exporting = [],
	archetype,
	mod,
	cl,
	c,
	l,
	i,
	p;

for(c=0; c<classes.length; c++) {
	cl = classes[c];
	for(l=starts[cl]; l<=maxLevel; l++) {
		mod = {};
		mod.id = "archetype:" + cl + ":" + l;
		mod.name = cl[0].toUpperCase() + cl.substring(1) + " (" + l + ")";
		if(l !== 1) {
			mod.needs = {};
			mod.needs["archetype:" + cl + ":" + (l - 1)] = 1;
		}
		if(l <= 20) {
			mod.playable = true;
		} else {
			mod.obscured = true;
		}
		mod.review = true;
		exporting.push(mod);
	}
}

fs.writeFile("_classes.fill.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});

module.exports.data = exporting;
