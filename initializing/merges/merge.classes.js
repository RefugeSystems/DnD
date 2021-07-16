var fs = require("fs"),
	merging = require("./source/classes.json"),
	modifiers = require("./modifiers.json"),
	utility = require("./utility.js"),
	exporting = [],
	modMap = {},
	addObjects,
	addValues,
	classing,
	merged,
	keys,
	root,
	mod,
	id,
	i,
	j;

for(i=0; i<modifiers.length; i++) {
	mod = modMap[modifiers[i].id] = modifiers[i];
}

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

for(i=0; i<merging.length; i++) {
	merged = merging[i];
	mod = null;
	root = merged.id.replace("class:", "");
	id = "archetype:" + root;
	try {
		utility.loadModifiers(merged);

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
		
		delete(merged.requirement);
		delete(merged._search);
		delete(merged.feats);
		delete(merged.obscured);
		delete(merged.creator);
		delete(merged.updater);

		keys = Object.keys(merged.modifiers);
		for(j=0; j<keys.length; j++) {
			classing = Object.assign({}, merged);
			mod = modMap[merged.modifiers[keys[j]][0]];
			if(mod) {
				// console.log(" [√] Merging: " + merged.name);
				classing = addValues(classing, mod);
				classing.id = id + ":" + keys[j];
				classing[root] = 1;
				utility.finalize(classing);
				if(keys[j] != 1) {
					classing.name += " (" + keys[j] + ")";
					classing.obscured = true;
				} else {
					classing.root = true;
				}
				exporting.push(classing);
			} else {
				console.log(" [!] Skipping: " + merged.name + " - Missing Modifier: ", merged.modifiers[keys[j]]);
			}
		}
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

fs.writeFile("_classes.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});

module.exports.data = exporting;