var utility = module.exports,
	RSObject = require("../../app/storage/rsobject.js"),
	modifiers = require("./modifiers.json"),
	modMap = {},
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
	},
	
	
	html = new RegExp("<span class=\"rs-(darkorange|orange)\">([^<]+)</span>", "g"),
	date = new RegExp("<span class=\"rs-lightblue\">([^<]+)</span>", "g"),
	tags = /\$\{([^\},]+)(,[^\},]+)?(,[^\},]+)?\}\$/g,
	hunt = /\$\{"content":[^"]*"([^\\,"]+?)".*?\}\$/g,
	cleanid = new RegExp("[^a-zA-Z0-9_:]+", "g"),
	clean = new RegExp("[A-Z]"),

	rebuildDescription,
	addObjects,
	addValues,
	remap,
	mod,
	sk,
	i,
	j,
	k,
	x,
	y;

for(i=0; i<modifiers.length; i++) {
	mod = modMap[modifiers[i].id] = modifiers[i];
}

utility.finalize = function(merged) {
	var keys = Object.keys(merged),
		buffer,
		i,
		j,
		k;

	/***
	 * BASIC CLEANUP
	 */

	for(j=0; j<keys.length; j++) {
		if(merged[keys[j]] && typeof(merged[keys[j]]) === "object" && Object.keys(merged[keys[j]]).length === 0) {
			delete(merged[keys[j]]);
		}
	}

	/***
	 * FLAT REMAPS
	 */
	if(merged.alignment) {
		merged.alignment = "alignment:" + merged.alignment;
	}
	if(merged.description) {
		merged.description = rebuildDescription(merged.description);
	}
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

	/***
	 * DELETE AND FLAG
	 */
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

	/***
	 * GENERAL REMAPS
	 */
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
	
	if(merged.spellMemory) {
		if(merged.spellMemory.cantrip) {
			merged.cantrips_maximum = parseInt(merged.spellMemory.cantrip);
		}
		buffer = Object.keys(merged.spellMemory);
		merged.spells_maximum = 0;
		for(j=0; j<buffer.length; j++) {
			merged.spells_maximum += parseInt(merged.spellMemory[buffer[j]]) || 0;
		}
	}
	delete(merged.spellMemory);
	if(merged.template !== undefined) {
		merged.is_template = merged.template;
	}
	delete(merged.template);
	if(merged.target) {
		merged.targets = ["type:" + merged.target];
	}
	delete(merged.target);
	if(merged.maxHealth) {
		merged.hp_max = merged.maxHealth
	}
	delete(merged.maxHealth);
	if(merged.health) {
		merged.hp = merged.health;
	}
	delete(merged.health);
	if(merged.tempHealth) {
		merged.hp_temp = merged.tempHealth;
	}
	delete(merged.tempHealth);
	if(merged.hitDice) {
		merged.hit_dice_max = {};
		merged.hit_dice_max[merged.hitDice] = 1
	}
	delete(merged.hitDice);

	if(merged.damageType) {
		merged.damage_type = "damage_type:" + merged.damageType;
	}
	delete(merged.damageType);
	if(merged.chargesMax) {
		merged.charges_max = merged.chargesMax;
	}
	delete(merged.chargesMax);
	if(merged.rechargeShort) {
		merged.recharges_amount_short = merged.rechargeShort;
	}
	delete(merged.rechargeShort);
	if(merged.rechargeLong) {
		merged.recharges_amount_long = parseInt(merged.rechargeLong);
	}
	delete(merged.rechargeLong);
	
	if(merged.recharge) {
		merged.recharges_amount_long = merged.recharge;
	}
	delete(merged.recharge);
	if(merged.rechargeRate) {
		merged.recharges_at_long = parseInt(merged.rechargeRate);
	}
	delete(merged.rechargeRate);
	if(merged.itemDC) {
		merged.dc = merged.itemDC;
	}
	delete(merged.itemDC);
	if(merged.spellAttack) {
		merged.spell_attack = merged.spellAttack;
	}
	delete(merged.spellAttack);
	if(merged.spellDC) {
		merged.spell_dc = merged.spellDC;
	}
	delete(merged.spellDC);
	if(merged.hitMain) {
		merged.skill_check = merged.skill_check || {};
		merged.skill_check["skill:mainhand"] = merged.hitMain;
	}
	delete(merged.hitMain);
	if(merged.hitOff) {
		merged.skill_check = merged.skill_check || {};
		merged.skill_check["skill:offhand"] = merged.hitOff;
	}
	delete(merged.hitOff);
	if(merged.minRange) {
		merged.range_minimum = parseInt(merged.minRange) * 8/5;
	}
	delete(merged.minRange);
	if(merged.innerRange) {
		merged.range_normal = parseInt(merged.innerRange) * 8/5;
	}
	delete(merged.innerRange);
	if(typeof(merged.range) === "string" || typeof(merged.range) === "number") {
		merged.range_normal = parseInt(merged.range) * 8/5;
	}
	delete(merged.innerRange);
	if(merged.outerRange) {
		merged.range_maximum = parseInt(merged.outerRange) * 8/5;
	}
	delete(merged.outerRange);

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
	if(merged.movement) {
		merged.movement_ground = parseInt(merged.movement) * 8/5;
	}
	delete(merged.movement);
	if(merged.duration) {
		merged.duration = parseInt(merged.duration) * 6;
	}
	if(merged.duration <= 0) {
		delete(merged.duration);
	}
	if(merged.spellSlots !== null && typeof(merged.spellSlots) === "object") {
		k = Object.keys(merged.spellSlots);
		x = {};
		for(i=0; i<k.length; i++) {
			x[k[i]] = merged.spellSlots[k[i]];
		}
		merged.spell_slot_max = x;
	}
	delete(merged.spellSlots);

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

	if(merged.throwProficiency) {
		merged.skill_proficiency = {};
		buffer = Object.keys(merged.throwProficiency);
		for(k=0; k<buffer.length; k++) {
			merged.skill_proficiency["skill:" + buffer[k]] = 1;
		}
	}
	delete(merged.throwProficiency);
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

	/***
	 * DAMAGE REMAP
	 */
	if(merged.damage) {
		remap(merged.damage);
	}
	if(merged.reduction) {
		merged.resist = merged.reduction
		remap(merged.resist);
	}
	delete(merged.reduction);

	/***
	 * FINAL CLEANUP
	 */
	keys = Object.keys(merged);
	for(j=0; j<keys.length; j++) {
		if(clean.test(keys[j])) {
			delete(merged[keys[j]]);
		}
	}

	merged.id = merged.id.replace(cleanid,"").toLowerCase();
	delete(merged.modifiers);
};

utility.loadModifiers = function(merged) {
	if(merged.modifiers) {
		for(j=0; j<merged.modifiers.length; j++) {
			mod = modMap[merged.modifiers[j]];
			if(mod) {
				// console.log("Loading: ", merged, mod);
				merged = RSObject.addValues(merged, mod);
				// console.log("Result: ", merged);
			} else {
				console.log("Missing Modifier: " + merged.modifiers[j]);
			}
		}
	}
	// Needed in Classes, Deleted in Finalize
	// delete(merged.modifiers);
	return merged;
};

addObjects = utility.addObjects = function(a, b, type) {
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
			try {
				result[akeys[x]] = addValues(a[akeys[x]], b[akeys[x]], type);
			} catch(e) {
				throw new Error("Failed to add Key " + akeys[x] + ": " + e.message);
			}
			checked[akeys[x]] = true;
		}
		for(x=0; x<bkeys.length; x++) {
			if(!checked[bkeys[x]]) {
				try {
					result[bkeys[x]] = addValues(a[bkeys[x]], b[bkeys[x]], type);
				} catch(e) {
					console.log("Failed to add Key " + akeys[x] + ": ", e);
				}
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
addValues = utility.addValues = function(a, b, type, op) {
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

remap = utility.remap = function(object) {
	if(object) {
		var keys = Object.keys(object),
			i;

		for(i=0; i<keys.length; i++) {
			if(rename[keys[i]]) {
				if(object[keys[i]]) {
					object[rename[keys[i]]] = object[keys[i]];
				}
				delete(object[keys[i]]);
			}
		}
	}
};

rebuildDescription = utility.rebuildDescription = function(changing) {
	var description = changing,
		replace,
		match;
	while(match = hunt.exec(changing)) {
		if(match[0].length < 3) {
			description = description.replace(match[0], match[1]);
		} else if(isNaN(match[0])) {
			description = description.replace(match[0], "{{" + match[1] + "}}");
		} else {
			description = description.replace(match[0], "{{@" + match[1] + "}}");
		}
	}
	// console.log(" [√] Tags");
	while(match = html.exec(changing)) {
		description = description.replace(match[0], "{{" + match[2] + "}}");
	}
	// console.log(" [√] HTML");
	while(match = date.exec(changing)) {
		description = description.replace(match[0], "{{@" + match[1] + "}}");
	}
	// console.log(" [√] Dates");
	while(match = tags.exec(changing)) {
		replace = match[1];
		if(match[2]) {
			if(match[3]) {
				replace += match[3];
			} else {
				replace += ",";
			}
			replace += match[2];
		}
		description = description.replace(match[0], "{{" + replace + "}}");
	}
	// console.log(" [√] Refactor");
	return description;
};
