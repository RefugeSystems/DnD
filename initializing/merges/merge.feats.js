var fs = require("fs"),
	merging = require("./source/feats.json"),
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
		merged = utility.loadModifiers(merged);
		// console.log("Modified: ", merged);
		if(merged.radius) {
			merged.effect_radius = merged.radius;
		}
		delete(merged.radius);
		if(merged.shape !== undefined) {
			merged.effect_shape = merged.shape;
		}
		delete(merged.shape);
		if(merged.verbal === true) {
			merged.cast_uses_verbal = true;
		}
		delete(merged.verbal);
		if(merged.somatic === true) {
			merged.cast_uses_gestures = true;
		}
		delete(merged.somatic);
		if(typeof(merged.material) === "string") {
			merged.cast_uses_material = merged.material.split(",");
		}
		delete(merged.material);
		if(typeof(merged.school) === "string") {
			merged.type = "type:magic:" + merged.school;
		}
		delete(merged.school);
		if(merged.target) {
			merged.targets = ["type:" + merged.target];
		}
		delete(merged.target);
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
		if(merged.damageType) {
			merged.damage_type = "damage_type:" + merged.damageType;
		}
		delete(merged.damageType);
		if(merged.duration) {
			merged.duration = parseInt(merged.duration);
		}
		if(merged.duration < 0) {
			delete(merged.duration);
		}
		if(merged.condition) {
			merged.review = true;
			merged.note = merged.note || "";
			merged.note += "\n\nPrevious Condition: " + JSON.stringify(merged.condition, null, 4);
		}
		delete(merged.condition);
		if(merged.castTime) {
			merged.cast_time = parseInt(merged.castTime);
		}
		delete(merged.castTime);
		
		merged.selectable = !merged.natural;
		delete(merged.natural);

		if(!id.startsWith("feat:")) {
			console.log("Update Feat: " + id);
			id = "feat:" + id;
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
		delete(merged.actions);
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
		delete(merged.carry);
		delete(merged.heaviness);
		delete(merged.moves);
		delete(merged.magical);
		delete(merged.hidden);
		delete(merged.hidden);
		delete(merged.hidden);
		delete(merged.hidden);
		delete(merged.hidden);

		exporting.push(merged);
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("_feats.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});

module.exports.data = exporting;