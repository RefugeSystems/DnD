/**
 *
 * @class RSObject
 * @constructor
 * @param {Universe} universe
 * @param {ClassManager} manager
 * @param {Object} details
 */

var valid = new RegExp("^[a-z][a-z0-9:_]+$");

require("../extensions/array");

class RSObject {
	constructor(universe, manager, details) {
		if(!valid.test(details.id)) {
			throw new Error("Invalid ID for Object");
		}
		if(!details.id.startsWith(manager.id)) {
			throw new Error("Object ID must start with class ID");
		}
		/**
		 * 
		 * @property id
		 * @type String
		 */
		this.id = details.id;
		/**
		 * 
		 * @property _parent
		 * @type String
		 */
		this._parent = details._parent || undefined;
		/**
		 * 
		 * @property _grid
		 * @type String
		 */
		this._grid = details._grid || undefined;
		/**
		 * 
		 * @property _x
		 * @type String
		 */
		this._x = details._x || undefined;
		/**
		 * 
		 * @property _y
		 * @type String
		 */
		this._y = details._y || undefined;
		/**
		 * 
		 * @property updated
		 * @type String
		 */
		this.updated = details.updated;
		/**
		 * 
		 * @property created
		 * @type String
		 */
		this.created = details.created;
		/**
		 *
		 * @property _universe
		 * @type Universe
		 */
		this._universe = universe;
		/**
		 *
		 * @property _manager
		 * @type TypeManager
		 */
		this._manager = manager;
		/**
		 * The raw data describing this object.
		 * @property _data
		 * @type Object
		 */
		this._data = details;
		/**
		 * An initial Field Link computes data for all specified fields to this object.
		 *
		 * Thie represents the base level state for this object based on the _data object
		 * and omits field inheritance. This mainly hinges on "computed" field types.
		 * @property _calculated
		 * @type Object
		 */
		this._calculated = {};
		/**
		 * Stores the original value of all straight string fields or arrays as strings
		 * for quick change considerations against fields with any inheritance settings.
		 * @property _linkMask
		 * @type {Object}
		 */
		this._linkMask = {};
		/**
		 * 
		 * @property _class
		 * @type String
		 */
		this._class = manager.id;
	}
	
	/**
	 * @method linkFieldValues
	 * @return {Promise} 
	 */
	linkFieldValues() {
		console.log("Link: " + this.id);
		return new Promise((done, fail) => {
			var relink = false,
				unlink = [],
				x;
				
			console.log("relink scan");
			for(x=0; x<this._manager.inheritableFields.length; x++) {
				if(this._linkMask[this._manager.inheritableFields[x]] !== this._data[this._manager.inheritableFields[x]]) {
					if(this._linkMask[this._manager.inheritableFields[x]]) {
						unlink.push(this._linkMask[this._manager.inheritableFields[x]]);
					}
					this._linkMask[this._manager.inheritableFields[x]] = this._data[this._manager.inheritableFields[x]];
					relink = true;
				}
			}
			console.log("scan fin");
			 
			if(relink) {
				console.log("relink");
				this._universe.objectHandler.trackInheritance(this, this._manager.inheritableFields)
				.then(() => {
					console.log("fin");
					if(unlink.length) {
						console.log("unlink");
						return this._universe.objectHandler.untrackInheritance(this.id, unlink);
					}
				})
				.then(() => {
					done(this);
				})
				.catch(fail);
			} else {
				console.log("no relink");
				done(this);
			}
		});
	}
	
	/**
	 * Calculate and set the `_calculated` property values for this object.
	 * @method updateFieldValues
	 */
	calculateFieldValues() {
		var fields = this._manager.fieldIDs,
			field,
			x;

		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			switch(field.type) {
				case "calculated":
					this._calculated[fields[x]] = this.calculateField(this._data[fields[x]]);
					break;
				default:
				case "formula": // formula Reduction handled in updateFieldValues
				case "string":
				case "number":
				case "boolean":
				case "object":
					this._calculated[fields[x]] = this._data[fields[x]];
					break;
			}
		}
		
		// Maintain updated/created
		this.updated = Date.now();
		if(!this.created) {
			this.created = this._data.created;
		}
		
		this._universe.objectHandler.pushChanged("object-update", {
			"id": this.id,
			"time": Date.now()
		});
	}

	/**
	 * Calculate and set the `_calculated` property values for this object.
	 * @method updateFieldValues
	 */
	updateFieldValues() {
		var inheriting,
			inherit,
			loading,
			source,
			fields,
			field,
			i,
			v,
			x;
		
		// TODO: Investigate fixing errant variable references (See: i, v, x and their uses)
		inherit = (id) => {
			console.log("Inherit: ", id);
			var source = this._universe.objectHandler.retrieve(id);
			if(source) {
				for(i=0; i<field.inheritanceFields.length; i++) {
					switch(field.inheritance[field.inheritanceFields[i]]) {
						case "+":
							this[field.inheritanceFields[i]] = RSObject.addValues(this[field.inheritanceFields[i]], source[field.inheritanceFields[i]]);
							break;
						case "-":
							this[field.inheritanceFields[i]] = RSObject.subValues(this[field.inheritanceFields[i]], source[field.inheritanceFields[i]]);
							break;
						case "=":
							this[field.inheritanceFields[i]] = RSObject.setValues(this[field.inheritanceFields[i]], source[field.inheritanceFields[i]]);
							break;
						default:
							loading = {};
							loading.id = this._calculated[field.id];
							this._universe.emit("error", new this._universe.Anomaly("object:value:inheritance", "Failed to load object to pull inherited fields.", 50, loading, null, this));
					}
				}
			} else {
				loading = {};
				loading.id = this._calculated[field.id];
				this._universe.emit("error", new this._universe.Anomaly("object:value:inheritance", "Failed to load object to pull inherited fields.", 50, loading, null, this));
			}
		};
		
		fields = this._manager.fieldIDs;
		for(x=0; x<fields.length; x++) {
			this[fields[x]] = this._calculated[fields[x]];
		}
		
		fields = this._manager.inheritableFields;
		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			console.log("Inheriting Field: ", field);
			if(field && this._calculated[field.id]) {
				if(this._calculated[field.id] instanceof Array) {
					for(v=0; v<this._calculated[field.id].length; v++) {
						inherit(this._calculated[field.id][v]);
					}
				} else {
					inherit(this._calculated[field.id]);
				}
			}
		}
		
		
		fields = this._manager.fieldIDs;
		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			switch(field.type) {
				case "formula":
					this[fields[x]] = this.reduceField(this._data[fields[x]]);
					break;
			}
		}
	}

	/**
	 *
	 * @method getValue
	 * @param {Array | String} name Matching the Field ID to be used.
	 * @param {Integer} [index]
	 * @param {Function} callback Of structure function(err, value).
	 * @return {String | Number | Boolean | Object} Based on the RSField definition
	 * 		for the referenced value.
	 */
	getValue(name, index, callback) {
		if(!callback) {
			console.trace("GetValue: ", name, index, callback);
		}
		// console.log("GetValue: ", name, index, this.toJSON());
		setTimeout(() => {
			if(typeof(name) === "string") {
				name = name.split(".");
			}
			if(typeof(index) === "function") {
				callback = index;
				index = 0;
			} else if(index === undefined || index === null) {
				index = 0;
			}
			// console.log("Get Value[ " + this.id + " ] @" + index + " - ", name);
			if(name[index] === "this") {
				this.getValue(name, index + 1, callback);
			} else if(index + 1 === name.length) {
				callback(null, this[name[index]]);
			} else if(typeof(this[name[index]]) === "object" && index + 2 === name.length) {
				callback(null, this[name[index]][name[index + 1]]);
			} else if(this[name[index]]) {
				// console.log("Request More: " + name + " @" + index);
				this._universe.requestObject(this[name[index]], function(err, object) {
					if(err) {
						callback(err, null);
					} else if(object) {
						object.getValue(name, index + 1, callback);
					} else {
						callback(null, null);
					}
				});
			} else {
				callback(new Error("Unable to follow value path @" + index + ": " + name.join()), null);
			}
		}, 0);
	}
	
	/**
	 * Retrieves the value of the identified field from the `_calculated` property on
	 * this object.
	 *
	 * As `linkFieldValues` keeps all relevent objects loaded for the universe to access,
	 * this method is 
	 * 
	 * @method calculatedValue
	 * @param {Array | String} name Matching the Field ID to be used.
	 * @param {Integer} [index]
	 * @param {Array} [referenced]
	 * @return {String | Number | Boolean | Object} Based on the RSField definition
	 * 		for the referenced value.
	 */
	calculatedValue(name, index, referenced) {
		if(typeof(name) === "string") {
			name = name.split(".");
		}
		if(index instanceof Array) {
			referenced = index;
			index = 0;
		} else if(index === undefined || index === null) {
			index = 0;
		}
		
		var details,
			follow;
		
		if(name[index] === "this") {
			return this.calculatedValue(name, index + 1);
		} else if(index + 1 === name.length) {
			if(referenced) {
				referenced.push(this);
			}
			return this._calculated[name[index]];
		} else if(typeof(this[name[index]]) === "object" && index + 2 === name.length) {
			if(referenced) {
				referenced.push(this);
			}
			return this._calculated[name[index]][name[index + 1]];
		} else if(this[name[index]]) {
			follow = this._universe.objectHandler.retrieve(this._calculated[name[index]]);
			if(follow) {
				return follow.calculatedValue(name, index + 1);
			} else {
				details = {};
				details.name = name;
				details.index = index;
				details.value = this._calculated[name[index]];
				this._universe.emit("error", new this._universe.Anomaly("object:field:value", "Failed to follow a reference value for the specified dot-walking", 40, details, null, this));
				return null;
			}
		} else {
			details = {};
			details.name = name;
			details.index = index;
			details.value = this._calculated[name[index]];
			this._universe.emit("error", new this._universe.Anomaly("object:field:value", "Failed to follow a reference value for the specified dot-walking", 40, details, null, this));
			return null;
		}
	}
	
	/**
	 * @method calculateField
	 * @return {String | Number} 
	 */
	calculateField(value) {
		return value;
	}
	
	/**
	 * @method reduceField
	 * @return {String} 
	 */
	reduceField(value) {
		return value;
	}
	
	
	promiseValue(name) {
		return new Promise((done, fail) => {
			this.getValue(name, 0, function(err, value) {
				if(err) {
					fail(err);
				} else {
					done(value);
				}
			});
		});
	}
	
	
	addValues(delta, callback) {
		var result = {},
			field,
			x;
		
		for(x=0; x<this._manager.fieldIDs.length; x++) {
			field = this._manager.fieldIDs[x];
			if(delta[field.id] !== undefined) {
				result[field.id] = this._data[field.id] = RSObject.addValues(this._data[field.id], delta[field.id], field.type);
			}
		}
		
		result.id = this.id;
		this._manager.writeData(result, (err) => {
			if(err) {
				callback(err, this);
			} else {
				this.updateFieldValues();
				callback(null, this);
			}
		});
	}
	
	
	subValues(delta, callback) {
		var result = {},
			field,
			x;
		
		for(x=0; x<this._manager.fieldIDs.length; x++) {
			field = this._manager.fieldIDs[x];
			if(delta[field.id] !== undefined) {
				result[field.id] = this._data[field.id] = RSObject.subValues(this._data[field.id], delta[field.id], field.type);
			}
		}
		
		result.id = this.id;
		this._manager.writeData(result, (err) => {
			if(err) {
				callback(err, this);
			} else {
				this.updateFieldValues();
				callback(null, this);
			}
		});
	}
	
	/**
	 * This method is unique in that changes to reference fields update the universe linking for change tracking.
	 * As such, this is one of the 2 methods responsible for interacting with the Universe however all work is handled
	 * by `linkFieldValues` which this calls after setting and storing the values, followed by `updateFieldValues`
	 * to adjust for the new state.
	 * @method setValues
	 * @param {[type]}   delta    [description]
	 * @param {Function} callback [description]
	 */
	setValues(delta, callback) {
		var result = {},
			field,
			x;
		
		for(x=0; x<this._manager.fieldIDs.length; x++) {
			field = this._manager.fieldIDs[x];
			if(delta[field.id] !== undefined) {
				result[field.id] = this._data[field.id] = RSObject.setValues(this._data[field.id], delta[field.id], field.type);
			}
		}
		
		result.id = this.id;
		this._manager.writeData(result, (err) => {
			if(err) {
				callback(err, this);
			} else {
				this.linkFieldValues()
				.then(() => {
					this.updateFieldValues();
					callback(null, this);
				})
				.catch((err) => {
					callback(err, this);
				});
			}
		});
		
	}
	
	/**
	 * 
	 * @method checkValue
	 * @param {String} field 
	 * @param {String | Number | Boolean | Object | Array} value
	 * @return {Boolean} 
	 */
	checkValue(id, value) {
		var field = this._manager.database.field[id];
		if(!field) {
			throw new Error("Unknown field: " + id);
		}
		switch(field.type) {
			case "object":
				return typeof(value) === "object";
			case "array":
				return value instanceof Array;
			case "number":
			case "integer":
				return typeof(value) === "number";
			case "boolean":
				return typeof(value) === "boolean";
			case "string":
			case "text":
			default:
				return typeof(value) === "string";
		}
	}

	/**
	 *
	 * @method checkConditional
	 * @param {Object} condition
	 * @param {TypeManager} [manager] For the Conditional type. If omitted, the
	 * 		static RSField.ConditionalType constant is checked (and set if it is
	 * 		not already) to pull the conditional type from the "conditional"
	 * 		table.
	 * @return {Boolean}
	 */
	checkConditional(manager, condition) {

	}
	
	/**
	 * Get the raw JSON value of this object based on the current data and the
	 * class fields.
	 * @method toJSON
	 * @return {Object} 
	 */
	toJSON() {
		var json = {},
			keys,
			x;
		
		if(this._manager && this._manager.fieldIDs) {
			for(x=0; x<this._manager.fieldIDs.length; x++) {
				json[this._manager.fieldIDs[x]] = this[this._manager.fieldIDs[x]];
			}
		} else {
			keys = Object.keys(this);
			for(x=0; x<keys.length; x++) {
				if(keys[x][0] !== "_") {
					json[keys[x]] = this[keys[x]];
				}
			}
		}
		
		json.id = this.id;
		json._class = this._class;
		json._linkMask = this._linkMask;
		json._calculated = this._calculated;
		json._data = this._data;
		json.created = this.created;
		json.updated = this.updated;
		json._grid = this._grid;
		json._x = this._x;
		json._y = this._y;
		return json;
	}
}

/**
 * 
 * @method getClassFromID
 * @static
 * @param {String} id
 * @return {String} The Class ID for the passed Object ID.
 */
RSObject.getClassFromID = function(id) {
	var index = id.indexOf(":");
	if(index === -1) {
		return null;
	}
	return id.substring(0, index);
};

RSObject.addObjects = function(a, b) {
	var keys = Object.keys(a),
		result = {},
		x;
	
	keys.uniquely.apply(keys, Object.keys(b));
	for(x=0; x<keys.length; x++) {
		result[keys[x]] = RSObject.addValues(a[keys[x]], b[keys[x]]);
	}
	
	return result;
};

RSObject.addValues = function(a, b, type) {
	if(!type) {
		type = typeof(a);
	}
	if(typeof(a) === undefined) {
		return b;
	} else if(typeof(b) === undefined) {
		return a;
	} else if(typeof(a) === typeof(b)) {
		switch(type) {
			case "string":
				return a + " " + b;
			case "integer":
			case "number":
				return a + b;
			case "calculated":
			case "dice":
				return a + " + " + b;
			case "array":
				return a.concat(b);
			case "boolean":
				return a && b;
			case "object":
				return RSObject.addObjects(a, b);
		}
	} else {
		throw new Error("Can not add values as types do not match");
	}
};

RSObject.subObjects = function(a, b) {
	var keys = Object.keys(a),
		result = {},
		x;
	
	keys.uniquely.apply(keys, Object.keys(b));
	for(x=0; x<keys.length; x++) {
		result[keys[x]] = RSObject.subValues(a[keys[x]], b[keys[x]]);
	}
	
	return result;
};

RSObject.subValues = function(a, b, type) {
	if(!type) {
		type = typeof(a);
	}
	if(typeof(a) === undefined) {
		switch(type) {
			case "string":
				return "";
			case "integer":
			case "number":
				return b === undefined ? b : -1 * b;
			case "calculated":
			case "dice":
				return b === undefined ? b : "-1 * (" + b + ")";
			case "array":
				return [];
			case "boolean":
				return !b;
			case "object":
				return {};
		}
	} else if(typeof(b) === undefined) {
		return a;
	} else if(typeof(a) === typeof(b)) {
		switch(type) {
			case "string":
				return a.replace(b, "");
			case "integer":
			case "number":
				return a - b;
			case "calculated":
			case "dice":
				return a + " - (" + b + ")";
			case "array":
				return a.difference(b);
			case "boolean":
				return a && !b;
			case "object":
				return RSObject.subObjects(a, b);
		}
	} else {
		throw new Error("Can not add values as types do not match");
	}
};

RSObject.setObjects = function(a, b) {
	var keys = Object.keys(a),
		result = {},
		x;
	
	keys.uniquely.apply(keys, Object.keys(b));
	for(x=0; x<keys.length; x++) {
		result[keys[x]] = RSObject.setValues(a[keys[x]], b[keys[x]]);
	}
	
	return result;
};

RSObject.setValues = function(a, b, type) {
	if(b === null) {
		return undefined;
	} else if(typeof(a) === undefined || typeof(b) !== undefined) {
		return b;
	} else {
		return a;
	}
};

module.exports = RSObject;
