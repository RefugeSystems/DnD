var fs = require("fs"),
	merging = require("./source/races.json"),
	utility = require("./utility.js"),
	exporting = [],
	merged,
	mod,
	id,
	i;

for(i=0; i<merging.length; i++) {
	merged = merging[i];
	mod = null;
	id = merged.id;
	try {
		// console.log("Merging: " + merged.name);
		utility.loadModifiers(merged);
		if(merged.nation) {
			merged.nation = "nation:" + merged.nation;
		}
		
		delete(merged.attribute);
		merged.attribute = merged.attribute || {};
		merged.attribute.young = merged.young;
		merged.attribute.old = merged.old;
		merged.attribute.light = merged.light;
		merged.attribute.heavy = merged.heavy;
		delete(merged.young);
		delete(merged.old);
		delete(merged.light);
		delete(merged.heavy);

		merged.id = id;
		utility.finalize(merged);

		delete(merged.rate);
		delete(merged.casted);
		delete(merged.ability);
		delete(merged.minimums);
		delete(merged.maximums);
		delete(merged.modifiers);
		delete(merged.coordinates);
		delete(merged.marking);
		delete(merged.classes);
		delete(merged.locked);
		delete(merged.requirement);
		delete(merged.created);
		delete(merged.updated);
		delete(merged.creator);
		delete(merged.updater);
		delete(merged.expansion);
		delete(merged.actions);
		delete(merged.manualCharges);
		delete(merged._search);
		delete(merged.alignment);
		delete(merged.vampirism);
		delete(merged.condition);
		delete(merged.gender);
		delete(merged.muted);
		delete(merged.health);
		delete(merged.carry);
		delete(merged.heaviness);
		delete(merged.moves);
		delete(merged.parent);
		if(merged.playable) {
			merged.parent = "race:root:character";
		}

		exporting.push(merged);
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("_races.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
