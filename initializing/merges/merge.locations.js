var fs = require("fs"),
	merging = require("./source/locations.json"),
	utility = require("./utility.js"),
	exporting = [],
	locked = {},
	merged,
	mod,
	id,
	i;

locked["location:world:somnicael"] = true;
locked["location:city:curell"] = true;

for(i=0; i<merging.length; i++) {
	merged = merging[i];
	mod = null;
	id = merged.id;
	try {
		// console.log("Merging: " + merged.name);
		merged.type = "type:" + merged.type;
		if(merged.mapKnowledge) {
			if(merged.mapKnowledge.indexOf(merged.name.toLowerCase()) !== -1) {
				merged.concealed = true;
			}
			merged.review = true;
		}
		delete(merged.mapKnowledge);
		if(merged.nation) {
			merged.nation = "nation:" + merged.nation;
		}
		
		if(!merged.icon) {
			merged.icon = "fas fa-map-marker";
		}
		if(merged.container) {
			merged.locaiton = merged.container;
		} else {
			merged.location = "location:world:somnicael";
		}
		delete(merged.container);
		merged.label = merged.name;

		merged.id = id;
		utility.finalize(merged);

		delete(merged.rate);
		delete(merged.imagePath);
		delete(merged.marking);
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
		delete(merged.creator);
		delete(merged.updated);
		delete(merged.updater);
		delete(merged.expansion);
		delete(merged.manualCharges);
		delete(merged._search);

		if(!locked[id]) {
			exporting.push(merged);
		} else {
			console.log(" [!] Skipped: " + merged.name);
		}
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("_locations.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
