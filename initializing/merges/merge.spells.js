const { merge } = require("grunt");

var fs = require("fs"),
	merging = require("./source/spells.json"),
	utility = require("./utility.js"),
	exporting = [],
	modMap = {},
	merged,
	keys,
	mod,
	id,
	i,
	j;

for(i=0; i<merging.length; i++) {
	merged = merging[i];
	mod = null;
	id = merged.id;
	try {
		// console.log("Merging: " + merged.name);
		if(merged.range) {
			merged.range_normal = merged.range;
		}
		delete(merged.range);
		merged = utility.loadModifiers(merged);
		switch(merged.type) {
			case "cast":
				delete(merged.type);
				break;
			case "attack":
				merged.cast_attack = true;
				delete(merged.type);
				break;
			default:
				merged.type = "type:" + merged.type;
		}
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
		if(typeof(merged.class) === "string") {
			merged.archetypes = [merged.class.replace("class", "archetype") + ":1"];
		} else {
			merged.review = true;
		}
		delete(merged.class);
		if(merged.target) {
			merged.targets = ["type:" + merged.target];
		}
		delete(merged.target);
		merged.action_cost = {};
		if(merged.actions) {
			merged.action_cost.main = 1;
		}
		delete(merged.actions);
		if(merged.bonusActions) {
			merged.action_cost.bonus = 1;
		}
		delete(merged.bonusActions);
		if(merged.reactions) {
			merged.action_cost.reaction = 1;
		}
		delete(merged.reactions);
		if(merged.ritual === "always" || merged.ritual === "can") {
			merged.ritual = true;
		} else {
			merged.ritual = false;
		}
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
			merged.duration = parseInt(merged.duration) * 6;
		}
		if(merged.duration < 0) {
			delete(merged.duration);
		}
		if(merged.effects) {
			merged.instilled = parseInt(merged.effects);
		}
		delete(merged.effects);
		if(merged.castTime) {
			merged.cast_time = parseInt(merged.castTime);
		}
		delete(merged.castTime);
		if(merged.attribute) {
			merged.stat = merged.attribute;
		}
		delete(merged.attribute);
		
		if(!id.startsWith("spell:")) {
			console.log("Update spell: " + id);
			id = "spell:" + id;
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
		delete(merged.creator);
		delete(merged.updated);
		delete(merged.updater);
		delete(merged.expansion);
		delete(merged.manualCharges);
		delete(merged._search);

		exporting.push(merged);
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("_spells.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});

module.exports.data = exporting;