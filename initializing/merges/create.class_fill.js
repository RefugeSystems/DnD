var fs = require("fs"),
	merging = require("./gap/classes.gap.json").import,
	classes = ["bard", "barbarian", "cleric", "druid", "fighter", "paladin", "ranger", "rogue", "warlock", "wizard"],
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
	for(l=1; l<=maxLevel; l++) {
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
		exporting.push(mod);
	}
}

fs.writeFile("_classes.fill.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});

module.exports.data = exporting;
