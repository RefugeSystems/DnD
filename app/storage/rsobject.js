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
		 *
		 * @property _data
		 * @type {Object}
		 */
		this._data = details;
		/**
		 * 
		 * @property _classification
		 * @type String
		 */
		this._classification = manager.id;
	}

	/**
	 * Pulls values from
	 * @method updateFieldValues
	 * @param {Array} [delta] Optional array specifying the fields that have
	 * 		changed to reduce the update load.
	 */
	updateFieldValues() {
		var fields = this._manager.fieldIDs,
			field,
			x;

		// TODO: Finish advanced calculations and defaults
		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			switch(field.type) {
				case "string":
				case "number":
				case "boolean":
				case "object":
					this[fields[x]] = this._data[fields[x]];
					break;
				case "calculated":
					this[fields[x]] = this.calculateField(this._data[fields[x]]);
					break;
				case "formula":
					this[fields[x]] = this.reduceField(this._data[fields[x]]);
					break;
			}
		}
		
		// Maintain updated/created
		this.updated = Date.now();
		if(!this.created) {
			this.created = this._data.created;
		}

		this._universe.emit("object-update", {
			"id": this.id,
			"time": Date.now()
		});
	}
	
	
	calculateField(expression) {
		
	}
	
	
	reduceField(expression) {
		
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
		
		this._manager.writeData(result, () => {
			this.updateFieldValues();
			
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
		
		
	}
	
	
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
		json._classification = this._classification;
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
	if(typeof(a) === undefined || typeof(b) !== undefined) {
		return b;
	} else {
		return a;
	}
};

module.exports = RSObject;
