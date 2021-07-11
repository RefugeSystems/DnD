var fs = require("fs"),
	RSObject = require("../../app/storage/rsobject"),
	modifiers = require("./modifiers.json"),
	merging = require("./source/characters.json"),
	exporting = [],
	modMap = {},
	addObjects,
	addValues,
	merged,
	rename,
	remap,
	inv,
	cleanid,
	clean,
	keys,
	mod,
	id,
	i,
	j,
	k,
	r,
	x;

cleanid = new RegExp("[^a-zA-Z0-9_:]+", "g");
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
					console.log(" > Missing Modifier: " + merged.modifiers[j]);
				}
			}
		}

		merged.stat_strength = merged.strength;
		merged.stat_dexterity = merged.dexterity;
		merged.stat_constitution = merged.constitution;
		merged.stat_intelligence = merged.intelligence;
		merged.stat_wisdom = merged.wisdom;
		merged.stat_charisma = merged.charisma;
		delete(merged.strength);
		delete(merged.dexterity);
		delete(merged.constitution);
		delete(merged.intelligence);
		delete(merged.wisdom);
		delete(merged.charisma);
		if(merged.type) {
			merged.type = "type:" + merged.type;
		}
		if(merged.health) {
			merged.hp = merged.health;
		}
		delete(merged.health);
		if(merged.tempHealth) {
			merged.hp_temp = merged.tempHealth;
		}
		delete(merged.tempHealth);
		if(merged.user) {
			merged.review = true;
			merged.owned = merged.owned || {};
			merged.owned[merged.user] = "review";
		}
		delete(merged.user);
		if(merged.owner) {
			merged.review = true;
			merged.owned = merged.owned || {};
			merged.owned[merged.owner] = "review";
		}
		delete(merged.owner);
		if(merged.viewRange) {
			merged.view = merged.viewRange;
		}
		delete(merged.viewRange);
		if(merged.viewRange) {
			merged.view = merged.viewRange;
		}
		delete(merged.viewRange);
		if(merged.viewRange) {
			merged.view = merged.viewRange;
		}
		delete(merged.viewRange);

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
		if(merged.discounts) {
			merged.discount = merged.discount || {};
			merged.discount = Object.assign(merged.discount, merged.discounts);
		}
		delete(merged.discounts);
		if(merged.discount) {
			merged.discount = merged.discount || {};
			merged.discount["all"] = merged.discount;
		} else if(merged.discountGeneral) {
			merged.discount = merged.discount || {};
			merged.discount["all"] = merged.discountGeneral;
		}
		delete(merged.discountGeneral);
		delete(merged.discount);
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

		if(merged.memorized) {
			merged.spells = merged.memorized;
		}
		delete(merged.memorized);
		if(merged.maxHealth) {
			merged.hp_max = parseInt(merged.maxHealth);
		}
		delete(merged.maxHealth);
		if(merged.isStore) {
			merged.is_shop = merged.isStore;
		}
		delete(merged.isStore);
		if(merged.hitDice) {
			merged.hit_dice = merged.hitDice;
		}
		delete(merged.hitDice);
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
		if(merged.coin) {
			merged.gold = parseFloat(parseFloat(merged.coin).toFixed(2));
		}
		delete(merged.coin);
		if(merged.template) {
			merged.is_template =  merged.template;
		}
		delete(merged.template);
		if(merged.nation) {
			merged.nation = "nation:" + merged.nation;
		}
		if(merged.gender) {
			merged.gender = "gender:" + merged.gender;
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
		switch(merged.size) {
			case "itsy":
				merged.size = 2;
				break;
			case "tiny":
				merged.size = 3;
				break;
			case "small":
				merged.size = 4;
				break;
			case "medium":
				merged.size = 5;
				break;
			case "large":
				merged.size = 6;
				break;
			case "huge":
				merged.size = 7;
				break;
		}
		
		if(merged.alignment) {
			merged.alignment = "alignment:" + merged.alignment;
		}
		if(merged.weight) {
			merged.weight = parseInt(merged.weight);
		}
		if(merged.age) {
			merged.age = parseInt(merged.age);
		}
		if(merged.height) {
			merged.height = parseInt(merged.height);
		}
		merged.range_minimum = merged.innerRange;
		delete(merged.innerRange);
		merged.range_maximum = merged.outerRange;
		delete(merged.outerRange);
		merged.range_normal = merged.range;
		delete(merged.range);
		merged.spell_slots = merged.spellSlots;
		delete(merged.spellSlots);
		if(merged.knowledge) {
			sk = Object.keys(merged.knowledge);
			inv = [];
			r = {};
			for(k=0; k<sk.length; k++) {
				if(merged.knowledge[sk[k]]) {
					for(x=0; x<merged.knowledge[sk[k]].length; x++) {
						if(!r[merged.knowledge[sk[k]][x]]) {
							r[merged.knowledge[sk[k]][x]] = true;
							if(typeof(merged.knowledge[sk[k]][x]) === "string") {
								if(merged.knowledge[sk[k]][x].startsWith("knowledge")) {
									inv.push(merged.knowledge[sk[k]][x]);
								} else {
									console.log(" > Invalid Knowledge Reference: " + merged.knowledge[sk[k]][x]);
								}
							}
						}
					}
				}
			}
			merged.knowledges = inv;
		}
		delete(merged.knowledge);
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
		if(merged.level) {
			merged.archetypes = merged.archetypes || [];
			keys = Object.keys(merged.level);
			for(k=0; k<keys.length; k++) {
				inv = "archetype:" + keys[k].replace("class:", "") + ":";
				for(x=1; x<=merged.level[keys[k]]; x++) {
					merged.archetypes.push(inv + x);
				}
			}
			merged.level = merged.level.self || 0;
		}
		if(merged.equipment) {
			merged.equipped = [];
			inv = Object.keys(merged.equipment);
			for(k=0; k<inv.length; k++) {
				merged.equipped.push(merged.equipment[inv[k]]);
			}
		}
		if(merged.inventory) {
			sk = Object.keys(merged.inventory);
			inv = [];
			for(k=0; k<sk.length; k++) {
				for(x=0; x<merged.inventory[sk[x]]; x++) {
					inv.push(sk[k]);
				}
			}
			merged.inventory = inv;
		}
		if(id.indexOf("npc:") !== -1) {
			merged.is_npc = true;
		}
		delete(merged.equipment);
		delete(merged.actions);
		delete(merged.bonusActions);
		delete(merged.reactions);

		delete(merged.advantages);
		delete(merged.assessment);
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
		delete(merged.charges);
		delete(merged.overviewMaxHistory);
		delete(merged.overviewVersion);
		delete(merged.statePuzzle);
		delete(merged.immunities);
		delete(merged.experience);
		delete(merged.reactions);
		delete(merged.actions);
		delete(merged.bonusActions);
		delete(merged.proficiencies);
		delete(merged.rolls);
		delete(merged.state);
		delete(merged.user);
		delete(merged.experience);
		delete(merged.messages);
		delete(merged.recharging);
		delete(merged.acquired);
		delete(merged.notes);
		delete(merged.moves);
		delete(merged.modified);
		delete(merged.collections);
		delete(merged.known);
		if(merged.spell_slots instanceof Array) {
			inv = {};
			for(k=0; k<merged.spell_slots.length; k++) {
				inv[k] = merged.spell_slots[k];
			}
			merged.spell_slots = inv;
		}

		keys = Object.keys(merged);
		for(j=0; j<keys.length; j++) {
			if(clean.test(keys[j])) {
				delete(merged[keys[j]]);
			}
		}

		merged.id = "entity:" + id.replace(cleanid, "").toLowerCase();
		if(merged.name.indexOf("---") === -1) {
			exporting.push(merged);
		}
		// if(merged.name && merged.name.indexOf("deprecated") === -1) {
		// 	exporting.push(merged);
		// }
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("characters.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
