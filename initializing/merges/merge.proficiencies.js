var fs = require("fs"),
	merging = require("./source/proficiencies.json"),
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
		if(merged.classId) {
			merged.subclassing = merged.classId.replace("class", "archetype") + ":1";
			merged.is_subclass = true;
		}
		delete(merged.classId);
		if(merged.classLevel) {
			merged.level = merged.classLevel;
		}
		delete(merged.classLevel);
		if(merged.archetypes) {
			merged.exclusives = merged.archetypes;
		}
		delete(merged.archetypes);
		merged.selectable = !merged.natural;
		delete(merged.natural);
		if(merged.next && merged.next !== "undefined") {
			merged.next = [merged.next];
		}
		
		if(merged.actionMap && Object.keys(merged.actionMap).length) {
			merged.note = (merged.note || "") + "\n\nPrevious Action Map:\n" + JSON.stringify(merged.actionMap, null, 4);
			merged.review = true;
		}
		delete(merged.actionMap);

		merged.id = id;
		utility.finalize(merged);

		delete(merged.previous);
		delete(merged._search);
		delete(merged.ability);
		delete(merged.expansion);
		delete(merged.expansion);
		delete(merged.creator);
		delete(merged.updater);

		exporting.push(merged);
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("_proficiencies.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
