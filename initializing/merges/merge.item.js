var fs = require("fs"),
	merging = require("./source/items.json"),
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
		
		if(merged.type) {
			merged.types = ["type:" + merged.type];
		}
		delete(merged.type);
		if(merged.save) {
			merged.cast_save = "skill:" + merged.save;
		}
		delete(merged.save);
		if(merged.castWith) {
			merged.cast_with = "skill:" + merged.castWith;
		}
		delete(merged.castWith);
		if(merged.instanceOf) {
			merged.parent = merged.instanceOf;
		}
		delete(merged.instanceOf);
		if(merged.attuned !== undefined) {
			merged.attunes = merged.attuned;
		}
		delete(merged.attuned);
		if(merged.attunedTo !== undefined) {
			merged.attuned = merged.attunedTo;
		}
		delete(merged.attunedTo);
		if(merged.duration) {
			merged.duration = (parseInt(merged.duration) || 0) * 6;
		}
		if(merged.duration < 0) {
			delete(merged.duration);
		}
		if(merged.castTime) {
			merged.cast_time = parseInt(merged.castTime);
		}
		delete(merged.castTime);
		if(merged.slotType) {
			merged.equip_slots = {};
			merged.equip_slots["slot:" + merged.slotType] = -1;
			if(merged.slotType === "hand") {
				merged.review = true;
			}
		}
		delete(merged.slotType);
		if(merged.attribute) {
			merged.stat = merged.attribute;
		}
		delete(merged.attribute)

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
		delete(merged.manualCharges);
		delete(merged._search);

		exporting.push(merged);
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("_items.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
