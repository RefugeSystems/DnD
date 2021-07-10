var fs = require("fs"),
	RSObject = require("../../app/storage/rsobject"),
	modifiers = require("./modifiers.json"),
	merging = require("./source/archetypes.json").export,
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

		if(merged.classId) {
			merged.subclassing = merged.classId.replace("class", "archetype") + ":1";
			merged.is_subclass = true;
		}
		delete(merged.classId);
		if(merged.classLevel) {
			merged.level = merged.classLevel;
		}
		delete(merged.classLevel);
		if(merged.archetypes) {
			merged.exclusives = merged.archetypes;
		}
		delete(merged.archetypes);
		if(merged.active !== true) {
			merged.review = true;
		}
		delete(merged.active);
		if(merged.next && merged.next !== "undefined") {
			merged.next = [merged.next];
		}
		
		if(merged.actionMap && Object.keys(merged.actionMap).length) {
			merged.note = (merged.note || "") + "\n\nPrevious Action Map:\n" + JSON.stringify(merged.actionMap, null, 4);
			merged.review = true;
		}
		delete(merged.actionMap);

		delete(merged.previous);
		delete(merged._search);
		delete(merged.ability);
		delete(merged.expansion);
		delete(merged.expansion);
		delete(merged.creator);
		delete(merged.updater);

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

fs.writeFile("archetypes.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
