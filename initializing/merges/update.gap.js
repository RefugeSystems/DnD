var fs = require("fs"),
	merging = require("./gap/classes.gap.json").import,
	exporting = [],
	archetype,
	mod,
	i,
	l,
	p;

for(i=0; i<merging.length; i++) {
	archetype = merging[i];
	mod = archetype.name.split(" ");
	l = parseInt(mod[1]);
	p = l - 1;
	archetype.name = mod[0][0].toUpperCase() + mod[0].substring(1) + " (" + l + ")";
	archetype.needs = {};
	archetype.needs[archetype.id.replace(l, p)] = 1;
	exporting.push(archetype);
}

fs.writeFile("_classes.gap.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});

module.exports.data = exporting;
