(function() {
	var skipped = /[^a-zA-Z0-9]/g,
		spacing = /[ _-]/g;


	var locationScanClasses = ["location", "entity", "item"];

	var sizeViewDistanceEquation = function(size) {
		return Math.floor(Math.pow(size - 1, 1.7) * 8 + 12);
	};

	var sizeViewReference = {};
	(function() {
		for(var i=1; i<21; i++) {
			sizeViewReference[i] = sizeViewDistanceEquation(i);
		}
	})();

	/**
	 *
	 * @class Utility
	 * @namespace rsSystem
	 * @constructor
	 * @static
	 */
	var utility = rsSystem.utility = {
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		},
		/**
		 *
		 * @method idFromName
		 * @param {String} name
		 * @return {String}
		 */
		"idFromName": function(name) {
			if(name) {
				return name.toLowerCase().replace(spacing, ":").replace(skipped, "");
			}
			return "";
		},
		/**
		 * 
		 * @method setUniverse
		 * @param {RSUniverse} universe 
		 */
		"setUniverse": function(universe) {
			utility.universe = universe;
		},
		/**
		 *
		 * @method uniqueByID
		 * @param {Array} corpus The array to clean.
		 * @return {Array} The passed array that is now cleaned.
		 */
		"uniqueByID": function(corpus) {
			if(!corpus) {
				return corpus;
			}

			var track = {},
				x;

			for(x=corpus.length-1; 0<=x; x--) {
				if(track[corpus[x].id]) {
					corpus.splice(x, 1);
				} else {
					track[corpus[x].id] = true;
				}
			}

			return corpus;
		},
		/**
		 * 
		 * @method forceReload
		 */
		"forceReload": function() {
			navigator.serviceWorker.controller.postMessage({
				"action": "update"
			});
			location.reload();
		},
		/**
		 * 
		 * @method testNeeds
		 * @param {Entity} entity
		 * @param {Object} target
		 * @return {Boolean} 
		 */
		"testNeeds": function(entity, target) {
			var keys,
				key,
				i;

			if(target.needs) {
				keys = Object.keys(target.needs);
				for(i=0; i<keys.length; i++) {
					key = keys[i];
					switch(typeof(target.needs[key])) {
						case "boolean":
							if(entity[key] !== target.needs[key]) {
								return false;
							}
							break;
						case "number":
							if(entity[key] < target.needs[key]) {
								return false;
							}
							break;
						case "string":
							if(entity[key] && target.needs[key].indexOf(entity[key]) === -1) {
								return false;
							}
							break;
						case "object":
							if(target.needs[key] instanceof Array) {
								if(target.needs[key].intersection(entity[key]).length === 0) {
									return false;
								}
							} else {
								return false;
							}
							break;
						default:
							return false;
					}
				}
			}

			return true;
		},
		/**
		 * 
		 * @method isOwner
		 * @param {RSObject} record 
		 * @param {RSPlayer} player 
		 * @returns {Boolean}
		 */
		"isOwner": function(record, player) {
			player = this.player || player;

			if(player && player.master) {
				return true;
			}

			if(record.is_public) {
				return true;
			} else if(record.is_private) {
				return false;
			} else if(player && record.owner === player.id) {
				return true;
			} else if(record.owners && player && record.owners.indexOf(player.id) !== -1) {
				return true;
			} else if(!record.owner && (!record.owners || record.owners.length === 0)) {
				return true;
			} else {
				return false;
			}
		},
		/**
		 * Check if an object is disabled or obscured.
		 * @method isValid
		 * @param {RSObject} object 
		 * @returns {Boolean}
		 */
		"isValid": function(object) {
			return object && !object.is_preview && !object.disabled && !object.is_disabled && !object.inactive && !object.is_inactive;
		},
		/**
		 * 
		 * @method hasCommonKey
		 * @param {Object} object 
		 * @param {Array} array 
		 * @return {Boolean} True if the object contains a key that matches a value in the array.
		 */
		"hasCommonKey": function(object, array) {
			var keys,
				i;

			if(!object || !array) {
				return false;
			}

			if(array instanceof Array) {
				for(i=0; i<array.length; i++) {
					if(object[array[i]]) {
						return true;
					}
				}
			} else if(typeof(array) === "object") {
				keys = Object.keys(array);
				for(i=0; i<keys.length; i++) {
					if(object[keys[i]] !== undefined && object[keys[i]] !== null) {
						return true;
					}
				}
			}
			
			return false;
		},
		/**
		 * 
		 * @method expandParentalKeys 
		 * @param {Array | String | Object} source Of objects or string IDs to which to add any relevent parental object's or IDs.
		 * @return {Array | String} IDs of the contained objects and all of their parents.
		 */
		"expandParentalKeys": function(source) {
			var parental = [],
				strings,
				lookup,
				parent,
				i;

			if(source instanceof Array) {
				strings = typeof(source[0]) === "string";
				for(i=0; i<source.length; i++) {
					if(strings) {
						lookup = rsSystem.universe.get(source[i]);
					} else {
						lookup = source[i];
					}
					if(lookup) {
						parental.push(lookup.id);
						while(lookup.parent && (parent = rsSystem.universe.get(lookup.parent))) {
							parental.push(parent.id);
							lookup = parent;
						}
					}
				}
			} else {
				if(typeof(source) === "string") {
					lookup = rsSystem.universe.get(source);
				} else {
					lookup = source;
				}
				if(lookup) {
					parental.push(lookup.id);
					while(lookup.parent && (parent = rsSystem.universe.get(lookup.parent))) {
						parental.push(parent.id);
						lookup = parent;
					}
				}
			}

			return parental;
		},
		/**
		 *
		 * For copying a class instantiation, recommend `.clone(true)` to get the functions
		 * and to rebind them.
		 * 
		 * For copying flat objects or arrays, recommend `.clone()` as the functions needn't
		 * be cloned.
		 * 
		 * @method clone
		 * @param {Object} [source] 
		 * @param {Boolean} [functions] When set, functions are set on the clone but are
		 * 		not bound by default
		 * @return {Object}
		 */
		 "clone": function(source, functions) {
			var clone = JSON.parse(JSON.stringify(source)),
				keys,
				i;
	
			if(functions) {
				keys = Object.keys(source);
				for(i=0; i<keys.length; i++) {
					if(typeof(source[keys[i]]) === "function") {
						clone[keys[i]] = source[keys[i]].bind(clone);
					}
				}
			}
			return clone;
		},
		/**
		 * Get the object describing the class for the specified object.
		 * @method getClass
		 * @param {String | Object} object Whose class is to be retrieved. Either the object it self or its ID.
		 * @return {RSClass}
		 */
		"getClass": function(object) {
			if(!object) {
				return null;
			}
			if(typeof(object) !== "string") {
				object = object.id;
			}
			if(typeof(object) !== "string") {
				return null;
			}

			var id = object.indexOf(":");
			if(id === -1) {
				return null;
			}
			id = object.substring(0, id);
			return rsSystem.universe.index.classes[id];
		},
		/**
		 * 
		 * @method hasParent
		 * @param {String | Object} object
		 * @param {String} id
		 * @return {Boolean}
		 * 
		 */
		"hasParent": function(object, id) {
			if(!object) {
				return false;
			}
			if(!id) {
				return true;
			}
			if(typeof(object) === "string") {
				object = rsSystem.universe.get(object);
			}
			while(object) {
				if(object.id === id) {
					return true;
				}
				object = rsSystem.universe.get(object.parent);
			}
			return false;
		},
		/**
		 * Get an array of IDs which meet the passed parent ID.
		 * @method getByParentID
		 * @param {String} id For which to scan
		 * @param {Object} source Object to scan for the passed values
		 * @param {Array} [fields] To scan for values
		 * @return {Array}
		 */
		"getByParentID": function(id, source, fields) {
			var found = [],
				manager,
				field,
				value,
				f,
				j;
	
			if(typeof(source) === "string") {
				source = rsSystem.universe.get(source);
			}
	
			if(source && (manager = rsSystem.universe.index.classes[source._class])) {
				fields = fields || manager.fields;
				for(f=0; f<fields.length; f++) {
					field = rsSystem.universe.index.fields[fields[f]];
					if(field && (value = source[field.id])) {
						if(field.inheritable) {
							// Check Parental Chain
							if(value instanceof Array) {
								for(j=0; j<value.length; j++) {
									if(value[j] && (value[j] === id || value[j].id === id)) {
										found.unshift(id);
									} else if(rsSystem.utility.hasParent(value[j], id)) {
										found.push(value[j]);
									}
								}
							} else if((value === id)) {
								found.unshift(id);
							} else if(typeof(value) === "object") {
								if(value.id === id) {
									found.unshift(id);
								} else if(rsSystem.utility.hasParent(value,id)) {
									found.push(value.id);
								}
							}
						} else {
							// Flat Check
							if(value instanceof Array) {
								for(j=0; j<value.length; j++) {
									if(value[j] === id) {
										found.unshift(id);
									}
								}
							} else if((typeof(value) === "object" && value.id === id) || (value === id)) {
								found.unshift(id);
							}
						}
					} else {
						if(field) {
							// this.console.log("No value for field:" + fields[f]);
						} else {
							console.log("No field: " + fields[f]);
						}
					}
				}
			}
	
			return found;
		},
		/**
		 * 
		 * @method hasParentalKey
		 * @param {Object} source 
		 * @param {String} id 
		 * @return {Boolean}
		 */
		"hasParentalKey": function(source, id) {
			var strings,
				lookup,
				i;

			if(source instanceof Array) {
				strings = typeof(source[0]) === "string";
				for(i=0; i<source.length; i++) {
					if(strings) {
						lookup = rsSystem.universe.get(source[i]);
					} else {
						lookup = source[i];
					}
					if(lookup) {
						if(lookup.id === id) {
							return true;
						}
						while(lookup = rsSystem.universe.get(lookup.parent)) {
							if(lookup.id === id) {
								return true;
							}
						}
					}
				}
			} else {
				if(typeof(source) === "string") {
					lookup = rsSystem.universe.get(source);
				} else {
					lookup = source;
				}
				if(lookup) {
					if(lookup.id === id) {
						return true;
					}
					while(lookup = rsSystem.universe.get(lookup.parent)) {
						if(lookup.id === id) {
							return true;
						}
					}
				}
			}

			return false;
		},
		/**
		 * 
		 * @method hasDamage
		 * @param {RSObject} object 
		 * @return {Boolean}
		 */
		"hasDamage": function(object) {
			return object && rsSystem.utility.isNotEmpty(object.damage);
		},
		/**
		 * Test if an object contains no properties.
		 * @method isEmpty
		 * @param {Object} object 
		 * @return {Boolean} Returns true if the object is falsey or has no children
		 */
		"isEmpty": function(object) {
			if(!object) {
				return true;
			}
			for(var i in object) {
				return false;
			}
			return true;
		},
		/**
		 * Test if an object contains properties.
		 * @method isNotEmpty
		 * @param {Object} object 
		 * @return {Boolean} Returns has children
		 */
		"isNotEmpty": function(object) {
			if(!object) {
				return false;
			}
			for(var i in object) {
				return true;
			}
			return false;
		},
		/**
		 * 
		 * TODO: This, in theory, should be removed and leverage the server obscuring data instead, however
		 * 		this is proving expensive
		 * @method getName
		 * @param {RSObject} [entity] Optional entity from whose perspective the entity should be named.
		 * @param {RSObject} object 
		 * @return {String} The name of the object according to the passed entity
		 */
		"getName": function(entity, object) {
			if(object.obscured || object.is_obscured) {
				return "Unknown";
			}
			if(object.is_concealed && object.concealment && object.concealment.name) {
				return object.concealment.name;
			}
			if(object.must_know) {
				if(entity) {
					if(isNaN(object.must_know)) {
						if(entity.knowledge_matrix[object.must_know] && entity.knowledge_matrix[object.must_know].length !== 0) {
							return object.nickname || object.name;
						}
					} else if(entity.knowledge_matrix[object.id] && object.must_know <= entity.knowledge_matrix[object.id].length) {
						return object.nickname || object.name;
					}
				}
				return "Unknown";
			} else {
				return object.nickname || object.name;
			}
		},

		/**
		 * Search a location for all objects. Mostly for general information for Game Masters when viewing location information.
		 * @method scanLocation
		 * @param {RSUniverse} universe 
		 * @param {RSLocation} location 
		 * @param {Object} [result] Used for recursive calls to contained locations or can be specified to build across multiple
		 * 		locations.
		 * @return {Object} With properties for every class found at the location as well as contained locations pointing
		 * 		to lists of found IDs; ie. {"entity": [], "location": [], "item": [], "weather": []}.
		 * 		Additionally possess a "_scanned" list and a "_scanCheck" object properties noting the IDs of all locations
		 * 		that were scanned. This doubles as cyclic referencing prevention.
		 */
		"scanLocation": function(universe, location, result) {
			var start,
				scan,
				test,
				cls,
				i,
				j,
				k;

			if(!result) {
				start = Date.now();
			}

			if(!result) {
				result = {};
				result._scanCheck = {};
				result._scanned = [];
			}

			// Validate and Scan Location properties
			if(!location) {
				console.warn("No location passed: ", universe, location, result);
			}

			// Scan for Contents
			if(!result._scanCheck[location.id]) {
				if(location.links_to && utility.isValid(test = universe.index.location[location.links_to])) {
					utility.scanLocation(universe, test, result);
				}
				if(location.interior && utility.isValid(test = universe.index.location[location.interior])) {
					utility.scanLocation(universe, test, result);
				}

				result._scanCheck[location.id] = location;
				result._scanned.push(location.id);
				for(k=0; k<locationScanClasses.length; k++) {
					cls = locationScanClasses[k];
					if(!result[cls]) {
						result[cls] = [];
					}
					for(i=0; i<universe.listing[cls].length; i++) {
						scan = universe.listing[cls][i];
						if(utility.isValid(scan) && scan.location === location.id) {
							result[cls].push(scan);
							if(cls === "location") {
								utility.scanLocation(universe, scan, result);
							}
							if(scan.interior && utility.isValid(test = universe.index.location[scan.interior])) {
								utility.scanLocation(universe, test, result);
							}
							if(scan.links_to && utility.isValid(test = universe.index.location[scan.links_to])) {
								utility.scanLocation(universe, test, result);
							}
						}
					}
				}
			}

			if(start) {
				console.warn("Scan Duration: " + (Date.now() - start) + "ms");
			}

			return result;
		},
		/**
		 * 
		 * @method distanceTo
		 * @param {RSUniverse} universe 
		 * @param {RSObject} from 
		 * @param {RSObject} to 
		 * @returns {Integer} Studs between the 2 objects if they share a location and have position, null otherwise. If the location has
		 * 		no dimensions defined, this returns undefined instead as a subtle error message but this is treated as allowable and
		 * 		dismissed.
		 */
		"distanceTo": function(universe, from, to) {
			var location,
				distance;

			if(from && to && from.location === to.location && typeof(from.x) === "number" && typeof(from.y) === "number" && typeof(to.x) === "number" && typeof(to.y) === "number") {
				location = universe.index.location[from.location];
				if(location) {
					if(location.width && location.height) {
						distance = rsSystem.math.distance.points2D(from.x/100 * location.width, from.y/100 * location.height, to.x/100 * location.width, to.y/100 * location.height);
						return Math.floor(distance + .5);
					} else {
						// No distance defined on location
						return undefined;
					}
				} else {
					console.warn("Distance calculation with undefined location: ", {
						"location": from.location,
						"from": from,
						"to": to
					});
				}
			}
			return null;
		},
		/**
		 * Get the average of all numbers passed to the function and in arrays that are passed to the function.
		 * @method average
		 * @param  {...any} values 
		 * @returns {Number} The average of all numbers received.
		 */
		"average": function(...values) {
			var count = 0,
				sum = 0,
				i,
				j;
	
			for(i=0; i<values.length; i++) {
				if(values[i] instanceof Array) {
					for(j=0; j<values[i].length; j++) {
						if(typeof(values[i][j]) === "number") {
							sum += values[i][j];
							count++;
						}
					}
				} else {
					if(typeof(values[i]) === "number") {
						sum += values[i];
						count++;
					}
				}
			}
	
			return sum/count;
		},
		/**
		 * Compare the IDs and parental IDs of the objects (1 ancestry). If matched with is_unique set
		 * on either object, they are considered similar enough to be considered not unique to one another.
		 * @method isUniqueTo
		 * @param {RSObject} source 
		 * @param {RSObject | Array} compare Either an object or an array of objects.
		 * @param {Boolean} [unique] Force uniqueness regardless of individual record settings.
		 * @returns {Boolean} True when the source and compare objects should be considered to differ enough
		 * 		to be considered unique to one another.
		 */
		"isUniqueTo": function(source, compare, unique) {
			if(compare) {
				if(source) {
					if(compare instanceof Array) {
						for(var i=0; i<compare.length; i++) {
							if(utility.checkUniqueness(source, compare[i], unique)) {
								return false;
							}
						}
					} else {
						return !utility.checkUniqueness(source, compare, unique);
					}
					return true;
				} else {
					return false;
				}
			} else {
				return true;
			}
		},
		/**
		 * Exhaust a parental chain checking for the ID.
		 * @method checkUniqueness
		 * @param {RSObject} source
		 * @param {RSObject} compare
		 * @param {Boolean} [unique] Force uniqueness regardless of individual record settings.
		 * @return {RSObject} Matched object if their is a unique collision. Null if the ID is unique to the passed start. 
		 */
		"checkUniqueness": function(source, compare, unique) {
			if(typeof(source) === "string") {
				source = rsSystem.universe.get(source);
			}
			if(typeof(compare) === "string") {
				compare = rsSystem.universe.get(compare);
			}

			if(compare && source) {
				if(source.id === compare.id && (unique || compare.is_unique || source.is_unique)) {
					return compare;
				}

				while(compare = rsSystem.universe.get(compare.parent)) {
					if(source.id === compare.id && (unique || compare.is_unique || source.is_unique)) {
						return compare;
					}
				}
			}

			return null;
		},
		/**
		 * 
		 * @method isVisibleTo
		 * @param {RSUniverse} universe 
		 * @param {RSObject} entity 
		 * @param {RSObject} object 
		 * @returns {Boolean} Indicating if the entity can see the object factoring in size and the entity's view range.
		 */
		"isVisibleTo": function(universe, entity, object) {
			var distance = utility.distanceTo(universe, entity, object),
				visibility = entity.view || 48,
				size = object.size || 1;

			if(typeof(object.stealth) === "number" && ( (typeof(entity.perception) === "number" && entity.perception < object.stealth) || ((entity.perception === 0 || typeof(entity.perception) !== "number") && entity.passive_perception < object.stealth)) ) {
				// Object is stealthed to entity (Active Check and Can Not See, or No Active thus passive check and Can Not See)
				return false;
			} else if(distance) {
				return distance < sizeViewReference[size] && distance < visibility;
			}
			return false;
		},
		/**
		 * 
		 * TODO: Boolean reductions
		 * @method isKnownBy
		 * @param {RSEntity} entity Indicates the Knowledge Matrix to leverage
		 * @param {RSObject} object To test for knowledge
		 */
		"isKnownBy": function(entity, object) {
			if(object.must_know) {
				if(isNaN(object.must_know)) {
					if(entity.knowledge_matrix[object.must_know] && entity.knowledge_matrix[object.must_know].length !== 0) {
						return true;
					}
				} else if(entity.knowledge_matrix[object.id] && object.must_know <= entity.knowledge_matrix[object.id].length) {
					return true;
				}
				return false;
			}
			return true;
		},
		/**
		 * TODO: Expand to handle more specific cases
		 * TODO: This, in theory, should be removed and leverage the server obscuring data instead, however
		 * 		this is proving expensive
		 * @method getKnownProperty
		 * @param {RSObject} entity 
		 * @param {RSObject} object 
		 * @param {String} property 
		 * @return {String} The name of the object according to the passed entity
		 */
		"getKnownProperty":function(entity, object, property) {
			if(object.must_know) {
				if(isNaN(object.must_know)) {
					if(entity.knowledge_matrix[object.must_know] && entity.knowledge_matrix[object.must_know].length !== 0) {
						return object[property];
					}
				} else if(entity.knowledge_matrix[object.id] && object.must_know <= entity.knowledge_matrix[object.id].length) {
					return object[property];
				}
				if(object.concealment && object.concealment[property]) {
					return object.concealment[property];
				}
				return "Unknown";
			} else {
				return object[property];
			}
		},
		/**
		 * 
		 * @method showInfo
		 * @deprecated Use embeded `info` method from storage component. View/Base/Target break up has been replaced by object references.
		 * @param {Object} view 
		 * @param {Object} base 
		 * @param {Object} target 
		 */
		"showInfo": function(view, base, target) {
			if(view && view.id && rsSystem.utility.isOwner(view)) {
				rsSystem.EventBus.$emit("display-info", {
					"target": target,
					"record": view,
					"base": base
				});
			}
		},
		/**
		 * 
		 * @method clearObject
		 * @param {Object} object 
		 */
		"clearObject": function(object) {
			var keys = Object.keys(object),
				i;
			for(i=0; i<keys.length; i++) {
				Vue.delete(object, keys[i]);
			}
		},
		/**
		 *
		 * @method sortByID
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortByID": function(a, b) {
			if((a.ordering === undefined || a.ordering === null) && b.ordering !== undefined && b.ordering !== null) {
				return 1;
			} else if((b.ordering === undefined || b.ordering === null) && a.ordering !== undefined && a.ordering !== null) {
				return -1;
			}
			if(a.ordering !== undefined && b.ordering !== undefined && a.ordering !== null && b.ordering !== null) {
				if(a.ordering < b.ordering) {
					return -1;
				} else if(a.ordering > b.ordering) {
					return 1;
				}
			}

			if(a.id < b.id) {
				return -1;
			} else if(a.id > b.id) {
				return 1;
			}
			console.error("Matching IDs Found? ", a, b);
			return 0;
		},
		/**
		 *
		 * @method sortByInitiative
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortByInitiative": function(a, b) {
			if((a.initiative === undefined || a.initiative === null) && b.initiative !== undefined && b.initiative !== null) {
				return 1;
			} else if((b.initiative === undefined || b.initiative === null) && a.initiative !== undefined && a.initiative !== null) {
				return -1;
			}
			if(a.initiative !== undefined && b.initiative !== undefined && a.initiative !== null && b.initiative !== null) {
				if(a.initiative < b.initiative) {
					return 1;
				} else if(a.initiative > b.initiative) {
					return -1;
				}
			}
			if(a.dexterity < b.dexterity) {
				return 1;
			} else if(a.dexterity > b.dexterity) {
				return -1;
			}
			if(a.name < b.name) {
				return -1;
			} else if(a.name > b.name) {
				return 1;
			}
			return 0;
		},
		/**
		 *
		 * @method sortByTime
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortByTime": function(a, b) {
			if((a.time === undefined || a.time === null) && b.time !== undefined && b.time !== null) {
				return -1;
			} else if((b.time === undefined || b.time === null) && a.time !== undefined && a.time !== null) {
				return 1;
			}
			if(a.time !== undefined && b.time !== undefined && a.time !== null && b.time !== null) {
				if(a.time < b.time) {
					return -1;
				} else if(a.time > b.time) {
					return 1;
				}
			}

			if(a.name < b.name) {
				return 1;
			} else if(a.name > b.name) {
				return -1;
			}
			
			return 0;
		},
		/**
		 *
		 * @method sortByName
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortByName": function(a, b) {
			if((a.name === undefined || a.name === null) && b.name !== undefined && b.name !== null) {
				return 1;
			} else if((b.name === undefined || b.name === null) && a.name !== undefined && a.name !== null) {
				return -1;
			} else if(a.name < b.name) {
				return -1;
			} else if(a.name > b.name) {
				return 1;
			}
			return 0;
		},
		/**
		 *
		 * @method sortTrueData
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortTrueData": function(a, b) {
			var aName,
				bName;

			if((a.ordering === undefined || a.ordering === null) && b.ordering !== undefined && b.ordering !== null) {
				return 1;
			} else if((b.ordering === undefined || b.ordering === null) && a.ordering !== undefined && a.ordering !== null) {
				return -1;
			}
			if(a.ordering !== undefined && b.ordering !== undefined && a.ordering !== null && b.ordering !== null) {
				if(a.ordering < b.ordering) {
					return -1;
				} else if(a.ordering > b.ordering) {
					return 1;
				}
			}

			if(a.name !== undefined && b.name !== undefined && a.name !== null && b.name !== null) {
				aName = a.name.toLowerCase();
				bName = b.name.toLowerCase();
				if(aName < bName) {
					return -1;
				} else if(aName > bName) {
					return 1;
				}
			}

			if(a.updated || b.updated) {
				if((a.name === undefined || a.name === null) && b.name !== undefined && b.name !== null) {
					return -1;
				}
				if((b.name === undefined || b.name === null) && a.name !== undefined && a.name !== null) {
					return 1;
				}

				if((a.updated === undefined || a.updated === null) && b.updated !== undefined && b.updated !== null) {
					return -1;
				}
				if((b.updated === undefined || b.updated === null) && a.updated !== undefined && a.updated !== null) {
					return 1;
				}

				if(a.updated < b.updated) {
					return -1;
				} else if(a.updated > b.updated) {
					return 1;
				}
			}

			if(a.id < b.id) {
				return -1;
			} else if(a.id > b.id) {
				return 1;
			}

			return 0;
		},
		/**
		 *
		 * @method sortData
		 * @param a
		 * @param b
		 * @return {Number}
		 */
		"sortData": function(a, b) {
			var aName,
				bName;

			if((a.ordering === undefined || a.ordering === null) && b.ordering !== undefined && b.ordering !== null) {
				return 1;
			} else if((b.ordering === undefined || b.ordering === null) && a.ordering !== undefined && a.ordering !== null) {
				return -1;
			}
			if(a.ordering !== undefined && b.ordering !== undefined && a.ordering !== null && b.ordering !== null) {
				if(a.ordering < b.ordering) {
					return -1;
				} else if(a.ordering > b.ordering) {
					return 1;
				}
			}

			if(a.name !== undefined && b.name !== undefined && a.name !== null && b.name !== null) {
				aName = a.name.toLowerCase();
				bName = b.name.toLowerCase();
				if(aName < bName) {
					return -1;
				} else if(aName > bName) {
					return 1;
				}
			}

			if(a.updated || b.updated) {
				if((a.name === undefined || a.name === null) && b.name !== undefined && b.name !== null) {
					return -1;
				}
				if((b.name === undefined || b.name === null) && a.name !== undefined && a.name !== null) {
					return 1;
				}

				if((a.updated === undefined || a.updated === null) && b.updated !== undefined && b.updated !== null) {
					return -1;
				}
				if((b.updated === undefined || b.updated === null) && a.updated !== undefined && a.updated !== null) {
					return 1;
				}

				if(a.updated < b.updated) {
					return -1;
				} else if(a.updated > b.updated) {
					return 1;
				}
			}

			if(a.id < b.id) {
				return -1;
			} else if(a.id > b.id) {
				return 1;
			}

			return 0;
		}
	};

	utility.sizeViewReference = sizeViewReference;
})();
