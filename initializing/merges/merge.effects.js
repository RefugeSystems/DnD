var fs = require("fs"),
	RSObject = require("../../app/storage/rsobject"),
	modifiers = require("./modifiers.json"),
	merging = require("./source/effects.json"),
	exporting = [],
	modMap = {},
	addObjects,
	addValues,
	merged,
	rename,
	clean,
	remap,
	keys,
	mod,
	id,
	i,
	j,
	k;

clean = new RegExp("[A-Z]");

addObjects = function(a, b, type) {
	if(a && !b) {
		return b;
	} else if(!a && b) {
		return a;
	} else if(a && b) {
		var akeys = Object.keys(a),
			bkeys = Object.keys(b),
			checked = {},
			result = {},
			x;
		
		for(x=0; x<akeys.length; x++) {
			// console.log("> Adding Key: " + akeys[x]);
			result[akeys[x]] = addValues(a[akeys[x]], b[akeys[x]], type);
			checked[akeys[x]] = true;
		}
		for(x=0; x<bkeys.length; x++) {
			if(!checked[bkeys[x]]) {
				// console.log("> Adding Key: " + bkeys[x]);
				result[bkeys[x]] = addValues(a[bkeys[x]], b[bkeys[x]], type);
			}
		}
		
		return result;
	} else {
		return null;
	}
};

/**
 * 
 * @method addValues
 * @static
 * @param  {[type]} a    [description]
 * @param  {[type]} b    [description]
 * @param  {[type]} [type] [description]
 * @param  {[type]} [op] [description]
 * @return {[type]}      [description]
 */
addValues = function(a, b, type, op) {
	if(typeof(a) == "undefined" || a === null) {
		return b;
	} else if(typeof(b) == "undefined" || b === null) {
		return a;
	} else if(type || typeof(a) === typeof(b)) {
		if(!type) {
			if(a instanceof Array) {
				type = "array";
			} else {
				type = typeof(a);
			}
		}
		switch(type) {
			case "string":
				return a + " " + b;
			case "integer":
				return parseInt(a || 0) + parseInt(b || 0);
			case "number":
				return parseFloat(a || 0) + parseFloat(b || 0);
			case "object:dice":
			case "calculated":
			case "dice":
				if(typeof(a || b) === "object") {
					return addObjects(a, b, "calculated");
				} else {
					return (a || 0) + " + " + (b || 0);
				}
			case "array":
				try {
					return a.concat(b);
				} catch(e) {
					// console.log("A: ", a, "B: ", b, e);
					throw e;
					// return null;
				}
			case "boolean":
				return a && b;
			case "object":
				if(op === "+=") {
					// console.log("Op Add: ", a, b);
					return addObjects(a, b, "calculated");
				}
				return addObjects(a, b);
		}
	} else {
		if((typeof(a) === "string" && typeof(b) === "number") || (typeof(a) === "number" && typeof(b) === "string")) {
			return a + " + " + b;
		} else {
			throw new Error("Can not add values as types[" + type + "|" + typeof(a) + "|" + typeof(b) + "] do not match: " + (a?a.id:a) + "[" + (!!a) + "] | " + (b?b.id:b) + "[" + (!!b) + "]");
		}
	}
};

remap = function(object) {
	if(object) {
		var keys = Object.keys(object),
			i;

		for(i=0; i<keys.length; i++) {
			if(rename[keys[i]]) {
				object[rename[keys[i]]] = object[keys[i]];
				delete(object[keys[i]]);
			}
		}
	}
};

rename = {
	"slashing": "damage_type:slashing",
	"piercing": "damage_type:piercing",
	"crushing": "damage_type:crushing",
	"bludgeoning": "damage_type:bludgeoning",
	"fire": "damage_type:fire",
	"cold": "damage_type:cold",
	"acid": "damage_type:acid",
	"holy": "damage_type:holy",
	"lightning": "damage_type:lightning",
	"thunder": "damage_type:thunder",
	"heal": "damage_type:heal",
	"poison": "damage_type:poison",
	"force": "damage_type:force",
	"necrotic": "damage_type:necrotic",
	"psychic": "damage_type:psychic",
	"chromatic": "damage_type:chromatic",
	"radiant": "damage_type:radiant",
	"sonic": "damage_type:sonic"
};

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
		if(merged.actions || merged.bonusActions || merged.reactions || merged.moves) {
			merged.review = true;
			merged.note = merged.note || "";
			merged.note += "\n\nHad Action Costs - Main: " + merged.actions + ", Bonus: " + merged.bonusActions + ", Reaction: " + merged.reactions;
			merged.action_max = {};
			merged.action_max.main = parseInt(merged.actions) || 0;
			merged.action_max.movement = parseInt(merged.moves) || 0;
			merged.action_max.bonus = parseInt(merged.bonusActions) || 0;
			merged.action_max.reaction = parseInt(merged.reactions) || 0;
		}
		delete(merged.actions);
		delete(merged.bonusActions);
		delete(merged.reactions);
		delete(merged.moves);
		if(merged.movement) {
			merged.movement_ground = parseInt(merged.movement) * 8/5;
		}
		delete(merged.movement);
		if(merged.swim) {
			merged.movement_swim = parseInt(merged.swim) * 8/5;
		}
		delete(merged.swim);
		if(merged.fly) {
			merged.movement_fly = parseInt(merged.fly) * 8/5;
		}
		delete(merged.fly);
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
		if(merged.condition) {
			merged.review = true;
			merged.note = merged.note || "";
			merged.note += "\n\nPrevious Condition: " + JSON.stringify(merged.condition, null, 4);
		}
		delete(merged.condition);
		if(merged.conditions) {
			merged.review = true;
			merged.note = merged.note || "";
			merged.note += "\n\nPrevious Conditions: " + JSON.stringify(merged.conditions, null, 4);
		}
		delete(merged.conditions);
		if(merged.immunities) {
			merged.review = true;
			merged.note = merged.note || "";
			merged.note += "\n\nPrevious Immunities: " + JSON.stringify(merged.immunities, null, 4);
		}
		delete(merged.immunities);
		if(merged.feat) {
			merged.review = true;
			merged.note = merged.note || "";
			merged.note += "\n\nPreviously tied to a Feat: " + merged.feat;
		}
		delete(merged.feat);
		if(merged.granted) {
			merged.obscured = merged.granted;
		}
		delete(merged.granted);
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
		if(merged.armor === "") {
			delete(merged.armor);
		}


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

		if(merged.slotType) {
			merged.needs = {};
			merged.needs["slot:" + merged.slotType] = 1;
		}

		keys = Object.keys(merged);
		for(j=0; j<keys.length; j++) {
			switch(keys[j]) {
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

		keys = Object.keys(merged);
		for(j=0; j<keys.length; j++) {
			if(clean.test(keys[j])) {
				delete(merged[keys[j]]);
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

fs.writeFile("effects.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
