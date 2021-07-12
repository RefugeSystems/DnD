var fs = require("fs"),
	RSObject = require("../../app/storage/rsobject"),
	modifiers = require("./modifiers.json"),
	merging = require("./source/items.json"),
	exporting = [],
	modMap = {},
	addObjects,
	addValues,
	merged,
	rename,
	remap,
	keys,
	mod,
	id,
	i,
	j,
	k;



for(i=0; i<modifiers.length; i++) {
	mod = modMap[modifiers[i].id] = modifiers[i];
	keys = Object.keys(mod);
	for(j=0; j<keys.length; j++) {
		if(mod[keys[j]] && typeof(mod[keys[j]]) === "object" && Object.keys(mod[keys[j]]).length === 0) {
			delete(mod[keys[j]]);
		}
	}
}

for(i=0; i<merging.length; i++) {
	merged = merging[i];
	mod = null;
	id = merged.id;
	try {
		console.log("Merging: " + merged.name);
		if(merged.modifiers) {
			for(j=0; j<merged.modifiers.length; j++) {
				mod = modMap[merged.modifiers[j]];
				if(mod) {
					merged = addValues(merged, mod);
				} else {
					console.log("Missing Modifier: " + merged.modifiers[j]);
				}
			}
		}
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
		if(merged.template !== undefined) {
			merged.is_template = merged.template;
		}
		delete(merged.reactions);
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
		if(merged.damage_type) {
			merged.damage_type = "damage_type:" + merged.damageType;
		}
		if(merged.duration) {
			merged.duration = parseInt(merged.duration);
		}
		if(merged.duration < 0) {
			delete(merged.duration);
		}
		if(merged.effects) {
			merged.instilled = parseInt(merged.effects);
		}
		delete(merged.effects);

		if(merged.chargesMax) {
			merged.charges_max = merged.chargesMax;
		}
		delete(merged.chargesMax);
		if(merged.rechargeShort) {
			merged.recharges_at_short = merged.rechargeShort;
		}
		delete(merged.rechargeShort);
		if(merged.rechargeLong) {
			merged.recharges_at_long = parseInt(merged.rechargeLong);
		}
		delete(merged.rechargeLong);
		if(merged.castTime) {
			merged.cast_time = parseInt(merged.castTime);
		}
		delete(merged.castTime);
		if(merged.mapKnowledge) {
			merged.concealed = true;
			merged.review = true;
		}
		delete(merged.mapKnowledge);
		if(merged.nation) {
			merged.nation = "nation:" + merged.nation;
		}
		
		if(merged.actionMap && Object.keys(merged.actionMap).length) {
			merged.note = (merged.note || "") + "\n\nPrevious Action Map:\n" + JSON.stringify(merged.actionMap, null, 4);
			merged.review = true;
		}
		delete(merged.actionMap);
		merged.range_minimum = merged.innerRange;
		delete(merged.innerRange);
		merged.range_maximum = merged.outerRange;
		delete(merged.outerRange);
		merged.range_normal = merged.range;
		delete(merged.range);
		merged.spell_slots = merged.spellSlots;
		delete(merged.spellSlots);
		if(merged.throws && Object.keys(merged.throws).length) {
			merged.skill_check = merged.skill_check || {};
			keys = Object.keys(merged.throws);
			for(k=0; k<keys.length; k++) {
				merged.skill_check["skill:" + keys[k]] = merged.throws[keys[k]];
			}
		}
		delete(merged.throws);
		if(merged.saveAdvantages && Object.keys(merged.saveAdvantages).length) {
			merged.skill_advantage = merged.skill_advantage || {};
			keys = Object.keys(merged.saveAdvantages);
			for(k=0; k<keys.length; k++) {
				merged.skill_advantage["skill:" + keys[k]] = 1;
			}
		}
		delete(merged.saveAdvantages);
		if(merged.advantages && Object.keys(merged.advantages).length) {
			merged.skill_advantage = merged.skill_advantage || {};
			keys = Object.keys(merged.advantages);
			for(k=0; k<keys.length; k++) {
				merged.skill_advantage["skill:" + keys[k]] = 1;
			}
		}
		delete(merged.advantages);
		if(merged.saveDisadvantages && Object.keys(merged.saveDisadvantages).length) {
			merged.skill_advantage = merged.skill_advantage || {};
			keys = Object.keys(merged.saveDisadvantages);
			for(k=0; k<keys.length; k++) {
				merged.skill_advantage["skill:" + keys[k]] = -1;
			}
		}
		delete(merged.saveDisadvantages);
		if(merged.disadvantages && Object.keys(merged.disadvantages).length) {
			merged.skill_advantage = merged.skill_advantage || {};
			keys = Object.keys(merged.disadvantages);
			for(k=0; k<keys.length; k++) {
				merged.skill_advantage["skill:" + keys[k]] = -1;
			}
		}
		delete(merged.disadvantages);



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

		if(merged.slotType) {
			merged.needs = {};
			merged.needs["slot:" + merged.slotType] = 1;
		}

		keys = Object.keys(merged);
		for(j=0; j<keys.length; j++) {
			switch(keys[j]) {
				case "attribute":
					merged.stat = merged[keys[j]];
					delete(merged[keys[j]]);
					break;
				case "damage":
					remap(merged[keys[j]]);
					break;
				case "reduction":
					merged.resist = merged[keys[j]];
					delete(merged.reduction);
					remap(merged.reduction);
					break;
			}
		}

		merged.id = id;
		exporting.push(merged);
		// if(merged.name && merged.name.indexOf("deprecated") === -1) {
		// 	exporting.push(merged);
		// }
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("items.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
