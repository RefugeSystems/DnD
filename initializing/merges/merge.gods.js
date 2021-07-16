var fs = require("fs"),
	merging = require("./source/gods.json"),
	utility = require("./utility.js"),
	exporting = [],
	merged,
	mod,
	id,
	i;


for(i=0; i<merging.length; i++) {
	merged = merging[i];
	id = merged.id;
	try {
		// console.log("Merging: " + merged.name);
		merged.playable = merged.worshipable;
		delete(merged.spellSlots);
		merged.alignment = "alignment:" + merged.alignment;
		
		delete(merged.requirement);
		delete(merged._search);
		delete(merged.effects);
		delete(merged.creator);
		delete(merged.updater);

		merged.id = id;
		if(merged.name.indexOf("[") === -1) {
			utility.finalize(merged);
			exporting.push(merged);
		} else {
			console.log(" [!] Skipped: " + merged.name);
		}
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("_gods.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});

module.exports.data = exporting;