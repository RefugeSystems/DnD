var fs = require("fs"),
	merging = require("./source/effects.json"),
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
		if(merged.radius) {
			merged.effect_radius = merged.radius;
		}
		delete(merged.radius);
		if(merged.shape !== undefined) {
			merged.effect_shape = merged.shape;
		}
		delete(merged.shape);
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
		if(merged.damage_type) {
			merged.damage_type = "damage_type:" + merged.damageType;
		}
		if(merged.duration) {
			merged.duration = parseInt(merged.duration);
		}
		if(merged.duration < 0) {
			delete(merged.duration);
		}
		if(merged.granted) {
			merged.obscured = merged.granted;
		}
		delete(merged.granted);
		merged.spell_slots = merged.spellSlots;
		delete(merged.spellSlots);
		if(merged.armor === "") {
			delete(merged.armor);
		}

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
		delete(merged.requirement);
		delete(merged.usable);
		delete(merged.dispersible);
		delete(merged.parent);
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
		delete(merged.alignment);
		delete(merged.vampirism);
		delete(merged.condition);
		delete(merged.gender);
		delete(merged.muted);
		delete(merged.health);
		delete(merged.hidden);
		delete(merged.carry);
		delete(merged.heaviness);
		delete(merged.moves);
		delete(merged.magical);
		delete(merged.damageType);
		delete(merged.inspiration);
		delete(merged.consumable);
		delete(merged.restful);
		delete(merged.source);
		delete(merged.race);
		delete(merged.known);
		delete(merged.view);
		
		exporting.push(merged);
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("_effects.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
