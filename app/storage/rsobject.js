/**
 *
 * @class RSObject
 * @constructor
 * @param {Universe} universe
 * @param {ClassManager} manager
 * @param {Object} details
 */
var valid = new RegExp("^[a-z][a-z0-9_]+:[a-z0-9:_]+$");

/**
 * Lists the fields that are acceptable for an object to define and still be considered
 * stackable.
 * @property stackRestricted
 * @type array
 * @private
 * @static
 */
var stackRestricted = [
	"id",
	"parent",
	"is_copy",
	"is_template",
	"attribute"
];

var fieldHasValue = function(value) {
	if(value === null || value === undefined) {
		return false;
	}

	if(typeof(value) === "object") {
		if(value instanceof Array) {
			return value.length !== 0;
		}
		return Object.keys(value).length !== 0;
	}
	return true;
};

var _ = require("lodash");
require("../extensions/array");

class RSObject {
	constructor(universe, manager, details) {
		if(!valid.test(details.id)) {
			// throw new Error("Invalid ID for Object");
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
		 * Special flag for details to create the object without registering it for
		 * updates. This is essentially to drive transient data such as editing  or
		 * shop previews.
		 * @property _disconnected
		 * @type Boolean
		 */
		this._disconnected = details._disconnected;
		/**
		 * Flag for objects with properties that don't have any additional keys set that
		 * affect the object; ie. only `id`, `parent`, `is_template`, `is_copy`, and
		 * `attribute` can be set.
		 * 
		 * See the `stackRestricted` private static array.
		 * @property _stackable
		 * @type Boolean
		 */
		this._stackable = false;
		/**
		 * Tracks warning flags for use of deprecated fields to aid with clean-up.
		 * 
		 * A field ID is mapped to true is usage is found and that field has a
		 * deprecated attribute.
		 * @property _deprecation
		 * @type Object
		 */
		this._deprecation = {};
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
		 * Stores the original formula before computation for computed values.
		 * Notably this stores the full formula after conditions and other effects.
		 * @property _formula
		 * @type Object
		 */
		this._formula = {};
		/**
		 * Maps a property to an array of IDs for other objects involved in computing
		 * the value.
		 * @propery _involved
		 * @type Object
		 */
		this._involved = {};
		/**
		 * Maps the previous field values from the last time this object was determined
		 * to have changed. This is used for noise reduction in update events.
		 * @propery _involved
		 * @type Object
		 */
		this._previous = {};
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
		 * Stores the combined _data properties of this object and its parent. If no
		 * parent is defined, then this is a reflection of the _data property.
		 * @property _combined
		 * @type Object
		 */
		this._combined = {};
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
		 * Holds the last calculated versions of this objects attached conditionals.
		 * These are replaced by recalculated versions during calculation and applied
		 * to the final versions during update.
		 * @property _conditionals
		 * @type Array
		 */
		this._conditionals = [];
		/**
		 * Stores the original value of all straight string fields or arrays as strings
		 * for quick change considerations against fields with any inheritance settings.
		 * @property _linkMask
		 * @type Object
		 */
		this._linkMask = {};
		/**
		 * Stores values of references for that field from the last calculation. On
		 * comparison change, the values are removed from dependency for the new values
		 * to be added.
		 * @property _calcRef
		 * @type Object
		 */
		this._calcRef = {};
		/**
		 * 
		 * @property _class
		 * @type String
		 */
		this._class = manager.id;
	}
	
	/**
	 * @method linkFieldValues
	 * @param {Boolean} [force] When true, ignores the _linkMask check. This is primarily used for universe initialization.
	 * @return {Promise} 
	 */
	linkFieldValues(force, debug) {
		// console.log("Link: " + this.id);
		return new Promise((done, fail) => {
			var relink = false,
				unlink = [],
				x;
				
			// console.log("relink scan");
			for(x=0; x<this._manager.inheritableFields.length; x++) {
				if(force || this._linkMask[this._manager.inheritableFields[x]] !== this._data[this._manager.inheritableFields[x]]) {
					if(!force && this._linkMask[this._manager.inheritableFields[x]]) {
						unlink.push(this._linkMask[this._manager.inheritableFields[x]]);
					}
					this._linkMask[this._manager.inheritableFields[x]] = this._data[this._manager.inheritableFields[x]];
					relink = true;
				}
			}
			// console.log("scan fin");
			 
			if(relink) {
				if(debug) {
					console.log("RSObject Relinking[" + this.id + "]: " + unlink);
				}
				this._universe.objectHandler.trackInheritance(this, this._manager.inheritableFields)
				.then(() => {
					// console.log("fin: ", unlink);
					if(unlink.length) {
						// console.log("unlink");
						return this._universe.objectHandler.untrackInheritance(this.id, unlink);
					}
				})
				.then(() => {
					done(this);
				})
				.catch(fail);
			} else {
				// console.log("no relink");
				done(this);
			}
		});
	}
	
	/**
	 * Abstract method for hooks into the update process
	 * @method preFieldCalculate
	 */
 	
 	/**
 	 * Abstract method for hooks into the update process
 	 * @method postFieldCalculate
 	 */
 	
 	/**
 	 * Abstract method for hooks into the update process
 	 * @method preFieldUpdate
 	 */
  	
  	/**
  	 * Abstract method for hooks into the update process
  	 * @method postFieldUpdate
  	 */
	
	/**
	 * Clear the _calc buffer and recalculate fields.
	 * @method recalculateFieldValues
	 */
	recalculateFieldValues(debug) {
		this._calcRef = {};
		this.calculateFieldValues(null, debug);
	}

	/**
	 * Calculate and set the `_calculated` property values for this object.
	 * @method calculateFieldValues
	 */
	calculateFieldValues(origins, debug) {
		// console.trace(" > Calculate: " + this._data.id);
		if(typeof(this.preFieldCalculate) === "function") {
			this.preFieldCalculate();
		}
		
		this._involved = {};
		var inheriting = [],
			inherit,
			loading,
			parent,
			source,
			fields,
			field,
			keys,
			i,
			v,
			x;

		if(this._data.parent && (parent = this._universe.objectHandler.retrieve(this._data.parent))) {
			fields = this._manager.fieldIDs;
			for(i=0; i<fields.length; i++) {
				if((this._data[fields[i]] === null || this._data[fields[i]] === undefined) && fields[i] !== "template" && fields[i] !== "is_template" /* TODO: Implement Field Attribute for no parental inheritance */) {
					this._combined[fields[i]] = parent._combined[fields[i]];
				} else {
					this._combined[fields[i]] = this._data[fields[i]];
				}
			}
		} else {
			this._combined = this._data;
		}
		this._calculated = {};

		
		
		// TODO: Investigate fixing errant variable references (See: i, v, x and their uses)
		inherit = (field, id) => {
			// console.log("Inherit: ", id);
			if(field.inheritanceFields && field.inheritanceFields.length) {
				source = this._universe.objectHandler.retrieve(id);
				var ifield,
					debugA,
					debugB;
				if(source && source._calculated) {
					// this._universe.objectHandler.trackInheritance(source, field.inheritanceFields);
					inheriting.push(source.id);
					for(i=0; i<field.inheritanceFields.length; i++) {
						ifield = this._manager.database.field[field.inheritanceFields[i]];
						if(debug) {
							debugA = JSON.stringify(this._calculated[field.inheritanceFields[i]]);
							debugB = JSON.stringify(source._calculated[field.inheritanceFields[i]]);
						}
						try {
							if(field.inheritanceFields[i] === debug || debug === true) {
								console.log("Inheriting Field[" + source.id + " -> " + field.inheritanceFields[i] + "]: ", source[field.inheritanceFields[i]], this._calculated[field.inheritanceFields[i]]);
							}
							switch(field.inheritance[field.inheritanceFields[i]]) {
								case "+=":
									// this._calculated[field.inheritanceFields[i]] = RSObject.addValues(this._calculated[field.inheritanceFields[i]], source._calculated[field.inheritanceFields[i]], ifield.type, "calculated", "+=");
									// this._calculated[field.inheritanceFields[i]] = RSObject.addValues(this._calculated[field.inheritanceFields[i]], source._calculated[field.inheritanceFields[i]], ifield.type, "calculated", "+=");
									this._calculated[field.inheritanceFields[i]] = RSObject.addValues(this._calculated[field.inheritanceFields[i]], source[field.inheritanceFields[i]], ifield.type, "calculated", "+=");
									break;
								case "+":
									// this._calculated[field.inheritanceFields[i]] = RSObject.addValues(this._calculated[field.inheritanceFields[i]], source._calculated[field.inheritanceFields[i]]);
									// this._calculated[field.inheritanceFields[i]] = RSObject.addValues(this._calculated[field.inheritanceFields[i]], source._calculated[field.inheritanceFields[i]], ifield.type);
									this._calculated[field.inheritanceFields[i]] = RSObject.addValues(this._calculated[field.inheritanceFields[i]], source[field.inheritanceFields[i]], ifield.type);
									break;
								case "-":
									// this._calculated[field.inheritanceFields[i]] = RSObject.subValues(this._calculated[field.inheritanceFields[i]], source._calculated[field.inheritanceFields[i]]);
									// this._calculated[field.inheritanceFields[i]] = RSObject.subValues(this._calculated[field.inheritanceFields[i]], source._calculated[field.inheritanceFields[i]], ifield.type);
									this._calculated[field.inheritanceFields[i]] = RSObject.subValues(this._calculated[field.inheritanceFields[i]], source[field.inheritanceFields[i]], ifield.type);
									break;
								case "=":
									// this._calculated[field.inheritanceFields[i]] = RSObject.setValues(this._calculated[field.inheritanceFields[i]], source._calculated[field.inheritanceFields[i]]);
									// this._calculated[field.inheritanceFields[i]] = RSObject.setValues(this._calculated[field.inheritanceFields[i]], source._calculated[field.inheritanceFields[i]], ifield.type);
									this._calculated[field.inheritanceFields[i]] = RSObject.setValues(this._calculated[field.inheritanceFields[i]], source[field.inheritanceFields[i]], ifield.type);
									break;
								case "~":
									if(this._calculated[field.inheritanceFields[i]] === undefined || this._calculated[field.inheritanceFields[i]] === null) {
										this._calculated[field.inheritanceFields[i]] = RSObject.setValues(this._calculated[field.inheritanceFields[i]], source._calculated[field.inheritanceFields[i]], ifield.type);
									}
									break;
								default:
									loading = {};
									loading.id = this.id;
									loading.value = this._combined[field.id];
									loading.field = field;
									loading.inheriting_field = ifield;
									loading.source = source.id || source;
									loading.full_source = !!source.id;
									// this._universe.emit("error", new this._universe.Anomaly("object:value:inheritance", "Failed to interpret object field inheritance.", 50, loading, null, this));
							}
							if(!this._involved[field.inheritanceFields[i]]) {
								this._involved[field.inheritanceFields[i]] = {};
							}
							// console.log(this.id + "[" + field.inheritanceFields[i] + "] -> " + source.id);
							if(source._combined[field.inheritanceFields[i]]) { // Intentionally ignoring 0, false, and other falsey values as they essentially aren't contributing
								switch(ifield.type) {
									case "object":
										if(Object.keys(source._combined[field.inheritanceFields[i]]).length) {
											this._involved[field.inheritanceFields[i]][source.id] = source._combined[field.inheritanceFields[i]];
										}
										break;
									case "array":
										if(source._combined[field.inheritanceFields[i]].length) {
											this._involved[field.inheritanceFields[i]][source.id] = source._combined[field.inheritanceFields[i]];
										}
										break;
									default:
										this._involved[field.inheritanceFields[i]][source.id] = source._combined[field.inheritanceFields[i]];
								}
							}
							if(field.inheritanceFields[i] === debug || debug === true) {
								console.log(" > Result: ", this._calculated[field.inheritanceFields[i]]);
							}
						} catch (e) {
							if(debug) {
								console.log("Ref Fail: " + this.id + " -> " + source.id + " @ " + field.id + "[" + (ifield?ifield.id:"") + "]", debugA, debugB, e);
							} else {
								console.log("Ref Fail: " + this.id + " -> " + source.id + " @ " + field.id + "[" + (ifield?ifield.id:"") + "]", e);
							}
						}
					}
				} else {
					loading = {};
					loading.id = this.id;
					loading.value = this._combined[field.id];
					loading.field = field;
					loading.source_id = id;
					// this._universe.emit("error", new this._universe.Anomaly("object:value:inheritance", "Failed to load object to pull inherited fields.", 50, loading, null, this));
				}
			}
		};
		
		/*
		fields = this._manager.fieldIDs;
		for(x=0; x<fields.length; x++) {
			this[fields[x]] = this._calculated[fields[x]];
		}
		*/
		
		// console.log("Calculating Self[" + this._data.id + "]");
		fields = this._manager.fieldIDs;
		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			if(field) {
				this._calculated[fields[x]] = this._combined[fields[x]];
				
				// Normalize Numeric Fields
				if(this._calculated[field.id]) {
					if(field.type === "number" && isNaN(this._calculated[field.id])) {
						this._calculated[field.id] = parseFloat(this._calculated[field.id]);
						if(isNaN(this._calculated[field.id]) && field.attribute) {
							this._calculated[field.id] = field.attribute.default || 0;
						} else {
							this._calculated[field.id] = 0;
						}
					} else if(field.type === "integer" && isNaN(this._calculated[field.id])) {
						this._calculated[field.id] = parseInt(this._calculated[field.id]);
						if(isNaN(this._calculated[field.id]) && field.attribute) {
							this._calculated[field.id] = field.attribute.default || 0;
						} else {
							this._calculated[field.id] = 0;
						}
					} else if((field.type === "object" && field.attribute && field.attribute.values === "integer") || field.type === "object:integer") {
						keys = Object.keys(this._calculated[field.id]);
						for(i=0; i<keys.length; i++) {
							this._calculated[field.id][keys[i]] = parseInt(this._calculated[field.id][keys[i]]);
						}
					}
				}
				/*
				if(this._combined[field.id] !== undefined && this._combined[field.id] !== null) {
					switch(field.type) {
						case "string":
						default:
						case "calculated":
						case "array":
						case "object":
						case "dice":
						case "formula": // formula Reduction handled in updateFieldValues
						case "number":
						case "boolean":
						case "object":
							this._calculated[fields[x]] = this._combined[fields[x]];
							break;
					}
				}
				*/
			}
		}
		
		fields = this._manager.inheritableFields;
		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			// console.log("Inheriting Field: ", field);
			if(field && this._calculated[field.id]) {
				if(this._calculated[field.id] instanceof Array) {
					for(v=0; v<this._calculated[field.id].length; v++) {
						inherit(field, this._calculated[field.id][v]);
					}
				} else {
					inherit(field, this._calculated[field.id]);
				}
			}
		}

		// this._universe.objectHandler.trackReference(this, inheriting);
		
		fields = this._manager.fieldIDs;
		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			if(field && field.attribute) {
				// Gaurentee Objects and Arrays where no value is set
				if(this._calculated[field.id] === undefined || this._calculated[field.id] === null) {
					if(field.type === "object" || field.type === "object:dice" || field.type === "object:integer") {
						if(field.attribute.default) {
							// Risky: This maintains deeper mutatable references in complex cases
							this._calculated[field.id] = Object.assign({}, field.attribute.default);
						} else {
							this._calculated[field.id] = {};
						}
					} else if(field.type === "array") {
						if(field.attribute.default) {
							// Risky: This maintains deeper mutatable references in even trivial cases
							this._calculated[field.id] = [].concat(field.attribute.default);
						} else {
							this._calculated[field.id] = [];
						}
					} else if(typeof(field.attribute.default) !== "undefined"){
						this._calculated[field.id] = field.attribute.default;
					}
				} else if(typeof(field.attribute.min) === "number" && this[field.id] < field.attribute.min) {
					this[field.id] = field.attribute.min;
				} else if(typeof(field.attribute.max) === "number" && this[field.id] > field.attribute.max) {
					this[field.id] = field.attribute.max;
				}
				// Cast final calculated values as needed
				if(this._calculated[fields[x]]) {
					switch(field.attribute.nested_value_type) { // Really only for casting nested values
						case "number":
							if(field.type === "object") {
								keys = Object.keys(this._calculated[fields[x]]);
								for(i=0; i<keys.length; i++) {
									this._calculated[fields[x]][keys[i]] = parseInt(this._calculated[fields[x]][keys[i]]);
								}
							} else if(field.type instanceof Array) {
								for(i=0; i<this._calculated[fields[x]].length; i++) {
									this._calculated[fields[x]][i] = parseInt(this._calculated[fields[x]][i]);
								}
							}
							break;
						case "boolean":
							if(field.type === "object") {
								keys = Object.keys(this._calculated[fields[x]]);
								for(i=0; i<keys.length; i++) {
									this._calculated[fields[x]][keys[i]] = !!this._calculated[fields[x]][keys[i]];
								}
							} else if(field.type instanceof Array) {
								for(i=0; i<this._calculated[fields[x]].length; i++) {
									this._calculated[fields[x]][i] = !!this._calculated[fields[x]][i];
								}
							}
					}
				}
				if(field.attribute.deprecated && this._data[field.id] !== null && this._data[field.id] !== undefined && !this._deprecation[field.id]) {
					console.warn("Deprecated field[" + field.id + "] has value for object[" + this.id + "]");
					this._deprecation[field.id] = true;
				}
			}
		}
		
		if(typeof(this.postFieldCalculate) === "function") {
			this.postFieldCalculate();
		}
		
		// console.log("Calculated Self[" + this._data.id + "]");
		// this._universe.objectHandler.pushCalculated(this.id);
		this._universe.objectHandler.pushUpdated(this.id, origins);
	}

	/**
	 * Calculate and set the `_calculated` property values for this object.
	 * @method updateFieldValues
	 * @param {Object} origins
	 * @param {Boolean} suppress The updated event, typically in lieu of a smaller
	 * 		update such as a delta.
	 */
	updateFieldValues(origins, suppress, debug) {
		// console.trace(" > Update: " + this._data.id);
		if(debug) {
			console.log(" > Update: " + this._data.id);
		}
		if(typeof(this.preFieldUpdate) === "function") {
			this.preFieldUpdate();
		}
		
		// this._involved = {};
		var fields = this._manager.fieldIDs,conditional,
			inherit,
			loading,
			source,
			parent,
			field,
			keys,
			i,
			x;

		this._search = "";
		
		// Establish Base Values
		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			// if(field && this._calculated[field.id] !== undefined && this._calculated[field.id] !== null) {
			if(field && this._calculated[field.id] !== undefined) {
				if(this._calculated[field.id] === null) {
					this[fields[x]] = null;
				} else {
					switch(field.type) {
						case "calculated":
							// this._calculated[fields[x]] = this.calculateField(fields[x], this._data[fields[x]]);
							break;
						case "markdown":
						case "string":
							if(field.attribute.searchable) {
								// TODO: Follow inheritable fields to get the inheriting object name instead of the ID
								this._search += ":::" + this._calculated[field.id].toLowerCase();
							}
						default:
						case "dice":
						case "formula": // formula Reduction handled in updateFieldValues
						case "number":
						case "boolean":
							this[fields[x]] = this._calculated[fields[x]];
							break;
						case "object:integer":
						case "object:dice":
						case "object":
							this[fields[x]] = Object.assign({}, this._calculated[fields[x]]);
							break;
						case "array":
							this[fields[x]] = [].concat(this._calculated[fields[x]]);
							break;
					}
				}
			}
		}
		
		// Fill in Parent Values where this is doesn't have that field filled
		/*
		if(this._data.parent) {
			parent = this._universe.objectHandler.retrieve(this._data.parent);
			if(parent) {
				for(x=0; x<fields.length; x++) {
					if(this._calculated[fields[x]] === undefined || this._calculated[fields[x]] === null) {
						field = this._manager.database.field[fields[x]];
						if(field && !field.attribute.no_parental && parent._calculated[field.id] !== undefined && parent._calculated[field.id] !== null) {
							switch(field.type) {
								case "calculated":
									// this._calculated[fields[x]] = this.calculateField(fields[x], parent[fields[x]]);
									break;
								case "string":
									if(field.attribute.searchable) {
										this._search += ":::" + parent._calculated[field.id].toLowerCase();
									}
								default:
								case "formula": // formula Reduction handled in updateFieldValues
								case "number":
								case "boolean":
								case "object":
									this[fields[x]] = parent._calculated[fields[x]];
									break;
							}
						}
					}
				}
			} else {
				// TODO: Improved error handling
				// console.error("Unknown Parent[" + this._data.parent + "] for Object[" + this._data.id + "]");
			}
		}
		*/
		
		// Establish Calculated Values
		// console.log("Updating Self[" + this._data.id + "]");
		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			if(field && this._calculated[field.id] !== undefined && this._calculated[field.id] !== null) {
				if(debug) {
					console.log(" > Update Field[" + this._data.id + "] - " + field.id + ": ", this._calculated[field.id]);
				}
				switch(field.type) {
					case "calculated":
						this[fields[x]] = this.calculateField(fields[x], this._calculated[fields[x]]);
						if(field.attribute.searchable) {
							this._search += " ::: " + this[field[x]];
						}
						break;
					default:
					case "array":
					case "object":
					case "dice":
					case "formula": // formula Reduction handled in updateFieldValues
					case "string":
					case "number":
					case "boolean":
					case "object":
						// this._calculated[fields[x]] = this._data[fields[x]];
						break;
				}
			}
		}
		
		// Fill in Parent Values where this is doesn't have that field filled
		/*
		if(this._data.parent) {
			parent = this._universe.objectHandler.retrieve(this._data.parent);
			if(parent) {
				// console.log("Found Parent[" + parent.id + "] for Object[" + this._data.id + "]");
				for(x=0; x<fields.length; x++) {
					if(this._calculated[fields[x]] === undefined || this._calculated[fields[x]] === null) {
						field = this._manager.database.field[fields[x]];
						if(field && !field.attribute.no_parental && parent._calculated[field.id] !== undefined && parent._calculated[field.id] !== null) {
							switch(field.type) {
								case "calculated":
									this[fields[x]] = this.calculateField(fields[x], parent._calculated[fields[x]]);
									break;
								default:
								case "formula": // formula Reduction handled in updateFieldValues
								case "string":
								case "number":
								case "boolean":
								case "object":
									// this._calculated[fields[x]] = parent[fields[x]];
									break;
							}
						}
					} else {
						// console.log("Non-null Parent Field: " + fields[x] + " -> ", this._calculated[fields[x]]);
					}
				}
			} else {
				// TODO: Improved error handling
				// console.error("Unknown Parent[" + this._data.parent + "] for Object[" + this._data.id + "]");
			}
		}
		*/
		
		// Consider Conditional Values
		if(this.conditionals) {
			this._conditionals.splice(0);
			for(x=0; x<this.conditionals.length; x++) {
				loading = this._universe.manager.conditional.object[this.conditionals[x]];
				if(loading) {
					if(this.checkConditional(loading)) {
						this._conditionals.push(loading);
					}
				} else {
					loading = {};
					loading.id = this.id;
					loading.conditionals = this.conditionals;
					loading.conditional = this.conditionals[x];
					loading.index = x;
					// this._universe.emit("error", new this._universe.Anomaly("object:value:conditional", "Undefined conditional present in object", 40, loading, null, this));
				}
			}
			if(debug) {
				console.log(" > Gathder Conditionals[" + this._data.id + "] - " + field.id + ": ", this._conditionals);
			}
			
			for(x=0; x<this._conditionals.length; x++) {
				conditional = this._conditionals[x];
				for(i=0; i<this._manager.fieldIDs.length; i++) {
					field = this._manager.fieldUsed[this._manager.fieldIDs[i]];
					/*
					if(this._conditionals[x].adds && (loading = this.computeValues(field, this._conditionals[x].adds[field.id]))) {
						this[field.id] = RSObject.addValues(this[field.id], loading, field.type);
					} else if(this._conditionals[x].subs && (loading = this.computeValues(field, this._conditionals[x].adds[field.id]))) {
						this[field.id] = RSObject.subValues(this[field.id], loading, field.type);
					} else if(this._conditionals[x].sets && (loading = this.computeValues(field, this._conditionals[x].adds[field.id]))) {
						this[field.id] = RSObject.setValues(this[field.id], loading, field.type);
					}
					*/
					if(conditional.adds && (loading = conditional.adds[field.id])) {
						this[field.id] = RSObject.addValues(this[field.id], loading, field.type);
					} else if(conditional.subs && (loading = conditional.adds[field.id])) {
						this[field.id] = RSObject.subValues(this[field.id], loading, field.type);
					} else if(conditional.sets && (loading = conditional.adds[field.id])) {
						this[field.id] = RSObject.setValues(this[field.id], loading, field.type);
					}
				}
			}
		}

		// Final Field Checks
		for(x=0; x<fields.length; x++) {
			field = this._manager.database.field[fields[x]];
			if(field) {
				// Reduce Dice Fields
				if(this[field.id] && (field.type === "dice" || field.type === "object:dice")) {
					if(typeof(this[field.id]) === "object") {
						keys = Object.keys(this[field.id]);
						this._formula[field.id] = {};
						for(i=0; i<keys.length; i++) {
							if(typeof(this[field.id][keys[i]]) === "string") {
								this._formula[field.id][keys[i]] = this[field.id][keys[i]];
								this[field.id][keys[i]] = this._universe.calculator.reducedDiceRoll(this[field.id][keys[i]], this);
							}
						}
					} else {
						this._formula[field.id] = this[field.id];
						this[field.id] = this._universe.calculator.reducedDiceRoll(this[field.id], this);
					}
				}
				// Normalize Numeric Fields
				if(field.type === "number") {
					if(isNaN(this[field.id])) {
						this[field.id] = parseFloat(this[field.id]);
						if(isNaN(this[field.id]) && field.attribute) {
							this[field.id] = field.attribute.default || 0;
						} else {
							this[field.id] = 0;
						}
					} else if(typeof(this[field.id]) === "number") {
						if(typeof(field.attribute.fixed) === "number") {
							this[field.id] = parseFloat(this[field.id].toFixed(field.attribute.fixed));
						}
					}
				} else if(field.type === "integer" && isNaN(this[field.id])) {
					this[field.id] = parseInt(this[field.id]);
					if(isNaN(this[field.id]) && field.attribute) {
						this[field.id] = field.attribute.default || 0;
					} else {
						this[field.id] = 0;
					}
				} else if((field.type === "object" && field.attribute && field.attribute.values === "integer") || field.type === "object:integer") {
					keys = Object.keys(this[field.id]);
					for(i=0; i<keys.length; i++) {
						this[field.id][keys[i]] = parseInt(this[field.id][keys[i]]);
					}
				} else if(field.type === "calculated" && isNaN(this[field.id])) {
					this._formula[field.id] = this[field.id];
					this[field.id] = this._universe.calculator.computedDiceRoll(this[field.id], this);
				} else if(field.type === "object:calculated" && isNaN(this[field.id])) {
					keys = Object.keys(this[field.id]);
					this._formula[field.id] = {};
					for(i=0; i<keys.length; i++) {
						this._formula[field.id][keys[i]] = this[field.id][keys[i]];
						this[field.id][keys[i]] = this._universe.calculator.computedDiceRoll(this[field.id][keys[i]], this);
					}
				}
				// Defaults (For null computations) & Bounds
				if(this[field.id] === null || this[field.id] === undefined || this[field.id] === "") {
					if(typeof(field.attribute.default) !== "undefined") {
						this[field.id] = field.attribute.default;
					} else if(field.type === "object" || field.type === "object:dice") {
						this[field.id] = {};
					} else if(field.type === "array") {
						this[field.id] = [];
					}
				} else if(typeof(field.attribute.min) === "number" && this[field.id] < field.attribute.min) {
					this[field.id] = field.attribute.min;
				} else if(typeof(field.attribute.max) === "number" && this[field.id] > field.attribute.max) {
					this[field.id] = field.attribute.max;
				}

				/* Check if an object HAS a deprecated value. Shifted to only warn on PROVIDING deprecated values during calculation
				if(field.attribute.deprecated && this[field.id] !== null && this[field.id] !== undefined && !this._deprecation[field.id] && fieldHasValue()) {
					console.warn("Deprecated field[" + field.id + "] has value for object[" + this.id + "]");
					this._deprecation[field.id] = true;
				}
				*/
			}
		}

		// TODO: Implement field attribute specification for concealment, needs additional UI consideration for controlled visibility (See: Game Masters)
		if(this.is_concealed) {
			if(this.concealment) {
				keys = Object.keys(this.concealment);
				for(i=0; i<keys.length; i++) {
					if(keys[i][0] !== "_" && keys[i] !== "id") {
						this[keys[i]] = this.concealment[keys[i]];
					}
				}
			} else {
				this.name = "Unknown";
				this.nickname = null;
				this.description = "Unknown";
			}
		}
		
		// Maintain updated/created
		this.updated = Date.now();
		if(!this.created) {
			this.created = this._data.created;
		}
		
		if(typeof(this.postFieldUpdate) === "function") {
			this.postFieldUpdate();
		}

		if(this.is_preview) {
			this.name += " (Preview)";
		}

		if(debug) {
			console.log(" > Updated[" + this.id + "]");
		}

		/* Stacking is being removed for now to address memory usage issues, possible return with improved load/unload controls
		keys = Object.keys(this._data);
		if(keys.length > stackRestricted.length) {
			this._stackable = false;
		} else {
			this._stackable = null;
			for(i=0; i<keys.length && this._stackable === null; i++) {
				if(stackRestricted.indexOf(keys[i]) !== -1) {
					this._stackable = false;
					break;
				}
			}
			if(this._stackable === null) {
				this._stackable = true;
			}
		}
		*/

		// console.log("Updated Self[" + this._data.id + "]");
		// this._universe.objectHandler.pushUpdated(this.id);

		if(!suppress && this.changed()) {
			for(i=0; i<this._manager.fieldIDs.length; i++) {
				field = this._manager.fieldIDs[i];
				switch(typeof(this[field])) {
					case "object":
						if(this[field] === null) {
							this._previous[field] = null;
						} else {
							this._previous[field] = RSObject.copyObjectValue(this[field]);
						}
						break;
					default:
						this._previous[field] = this[field];
						break;
				}
			}
			this._universe.emit("object-updated", this);
		}
	}

	/**
	 * 
	 * @method changed
	 * @return {Boolean}
	 */
	changed() {
		var field,
			i;

		for(i=0; i<this._manager.fieldIDs.length; i++) {
			field = this._manager.fieldIDs[i];
			if(!_.isEqual(this._previous[field], this[field])) {
			// if(!RSObject.isEqual(this._previous[field], this[field])) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 
	 * @param {String | Object} field 
	 * @param {String | Number | Object} object 
	 */
	computeValues(field, value) {
		if(value === null || value === undefined) {
			return null;
		}

		var filled,
			keys,
			i;

		switch(field.type) {
			case "object:calculated":
			case "object:dice":
			case "object":
				keys = Object.keys(value);
				filled = {};
				for(i=0; i<keys.length; i++) {
					filled[keys[i]] = this._universe.calculator.computedDiceRoll(value[keys[i]], this);
				}
				break;
			case "calculated":
				filled = this._universe.calculator.computedDiceRoll(value, this);
				break;
			default:
				filled = 0;
		}

		return filled;
	}

	/**
	 *
	 * @method fetchValue
	 * @param {Array | String} name Matching the Field ID to be used.
	 * @param {Integer} [index]
	 * @return {String | Number | Boolean | Object} Based on the RSField definition
	 * 		for the referenced value.
	 */
	fetchValue(name, index) {
		var trace;
		if(typeof(name) === "string") {
			name = name.split(".");
		}
		if(index === undefined || index === null) {
			index = 0;
		}
		if(name[index] === "this") {
			return this.fetchValue(name, index + 1);
		} else if(index + 1 === name.length) {
			return this[name[index]];
		} else if(this[name[index]] !== null && typeof(this[name[index]]) === "object" && index + 2 === name.length) {
			return this[name[index]][name[index + 1]];
		} else if(this[name[index]]) {
			// console.log("Request More: " + name + " @" + index);
			trace = this._universe.get(this[name[index]]);
			if(trace) {
				return trace.fetchValue(name, index + 1);
			} else {
				return null;
			}
		} else {
			return null;
		}
	}

	/**
	 *
	 * @method getValue
	 * @async
	 * @param {Array | String} name Matching the Field ID to be used.
	 * @param {Integer} [index]
	 * @param {Function} callback Of structure function(err, value).
	 */
	getValue(name, index, callback) {
		if(!callback) {
			// console.trace("GetValue: ", name, index, callback);
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
	 */
	/**
	 * Retrieves the value of the identified field from the top level of this object, following
	 * any references as needed.
	 * @method calculatedValue
	 * @param {Array | String} name Matching the Field ID to be used.
	 * @param {Integer} [index]
	 * @param {Array | String} [referenced] Tracks the ID of RSObjects used in
	 * 		retrieving the described value. Only the final object should add itself.
	 * 		Intermediate objects don't matter for this array.
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

		// console.log(" [@] Compute[" + this.id + "]: ", name[index], " -> ", this[name[index]], referenced);
		if(name[index] === "this") {
			// console.log(" [=<] > " + this[name[index]]);
			return this.calculatedValue(name, index + 1, referenced);
		} else if(index + 1 === name.length) {
			if(referenced) {
				referenced.push(this.id);
			}
			// console.log(" [=T] > " + this[name[index]], referenced);
			// return this._calculated[name[index]];
			return this[name[index]];
		} else if(this[name[index]] !== null && typeof(this[name[index]]) === "object" && index + 2 === name.length) {
			// console.log(" [=O] > " + this[name[index]]);
			if(referenced) {
				referenced.push(this.id);
			}
			// return this._calculated[name[index]][name[index + 1]];
			return this[name[index]][name[index + 1]];
		} else if(this[name[index]]) {
			// console.log(" [==] > " + this[name[index]]);
			// follow = this._universe.objectHandler.retrieve(this._calculated[name[index]]);
			follow = this._universe.objectHandler.retrieve(this[name[index]]);
			if(follow) {
				return follow.calculatedValue(name, index + 1, referenced);
			} else {
				details = {};
				details.name = name;
				details.index = index;
				// details.value = this._calculated[name[index]];
				details.value = this[name[index]];
				// TODO: These anomalies are generally expected
				this._universe.emit("info", new this._universe.Anomaly("object:field:value", "Failed to follow a reference value for the specified dot-walking", 20, details, null, this));
				return null;
			}
		} else {
			// console.log(" [=!] > " + this[name[index]]);
			details = {};
			details.name = name;
			details.index = index;
			// details.value = this._calculated[name[index]];
			details.value = this[name[index]];
			this._universe.emit("info", new this._universe.Anomaly("object:field:value", "Failed to follow a reference value for the specified dot-walking", 20, details, null, this));
			return null;
		}
	}
	
	/**
	 * Calculate the value of the field based on this object's current values.
	 *
	 * This happens against the object's _calculated object and is the subsurface
	 * computation for the non-inherited calculation step.
	 *
	 * Additionally this step handles determining the objects (aside from itself)
	 * involved in the calculation and registering the reference dependency with
	 * the universe.
	 * @method calculateField
	 * @param {String} field Name for calcRef mask reference.
	 * @param {String | Number} value For the field to be copmuted.
	 * @return {String | Number} 
	 */
	calculateField(field, value, tracked) {
		// console.log("Calculate Field[" + this.id + " . " + field + "]: ", value);
		var referenced = tracked || [],
			compare,
			parsed,
			keys,
			i;
		
		if(value === null || value === undefined) {
			return null;
		}

		if(this._data.parent) {
			referenced.push(this._data.parent);
		}
		value = this._universe.calculator.computedDiceRoll(value, this, referenced);
		// console.log(" [R]> ", referenced);
		compare = referenced.join(",");
		// console.log(" [C:" + this.id + "]> ", tracked, referenced);
		if(!tracked) {
			if(this._calcRef[field] !== compare) {
				// console.log(" [Calc:" + this.id + "]> ", tracked, referenced);
				if(this._calcRef[field]) {
					// console.log(" [u]> ", compare);
					this._universe.objectHandler.untrackReference(this, this._calcRef[field].split(","));
					// this._universe.objectHandler.untrackInheritance(this, this._calcRef[field].split(","));
				}
				// console.log(" [T]> ", referenced);
				if(!this._involved[field]) {
					this._involved[field] = [];
				}
				// this._involved[field] = this._involved[field].concat(referenced);
				for(i=0; i<referenced.length; i++) {
					this._involved[field][referenced[i]] = true;
				}
				this._universe.objectHandler.trackReference(this, referenced);
				// this._universe.objectHandler.trackInheritance(this, referenced);
				this._calcRef[field] = compare;
			}
		} else {
			tracked.push(this.id);
		}
		
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
			this.getValue(name, 0, (err, value) => {
				if(err) {
					fail(err);
				} else {
					done(value);
				}
			});
		});
	}
	
	
	addValues(delta, callback) {
		delta.updated = Date.now();
		var result = {},
			details,
			field,
			keys,
			i,
			x;
		
		// console.log("Delta: ", delta);
		for(x=0; x<this._manager.fieldIDs.length; x++) {
			field = this._manager.fieldUsed[this._manager.fieldIDs[x]];
			if(field && delta[field.id] !== undefined) {
				result[field.id] = this._data[field.id] = RSObject.addValues(this._data[field.id], delta[field.id], field.type);
				// console.log(" - Adding: ", result[field.id]);
				if(field.attribute) {
					this.levelField(field, result);
				}
			}
		}
		
		result.id = this.id;
		this._manager.writeObjectData(result, (err) => {
			if(err) {
				details = {};
				details.id = this.id;
				details.result = result;
				details.delta = delta;
				// this._universe.emit("error", new this._universe.Anomaly("object:write:fault", "Failed to store object data", 50, details, err, this));
			}
		});
		
		// Update links as needed for new Data
		this.linkFieldValues()
		.then(() => {
			this.calculateFieldValues();
			this.updateFieldValues();
			// this.updateFieldValues(true);
			// this._universe.emit("object-updated", this.getDelta(delta));
			if(typeof(callback) === "function") {
				callback(null, this);
			}
		})
		.catch((err) => {
			if(typeof(callback) === "function") {
				callback(err, this);
			}
		});
	}
	
	
	subValues(delta, callback) {
		delta.updated = Date.now();
		var result = {},
			details,
			field,
			x;
		
		for(x=0; x<this._manager.fieldIDs.length; x++) {
			field = this._manager.fieldUsed[this._manager.fieldIDs[x]];
			if(field && delta[field.id] !== undefined) {
				result[field.id] = this._data[field.id] = RSObject.subValues(this._data[field.id], delta[field.id], field.type);
				if(field.attribute) {
					this.levelField(field, result);
				}
			}
		}
		
		result.id = this.id;
		this._manager.writeObjectData(result, (err) => {
			if(err) {
				details = {};
				details.id = this.id;
				details.result = result;
				details.delta = delta;
				// this._universe.emit("error", new this._universe.Anomaly("object:write:fault", "Failed to store object data", 50, details, err, this));
			}
		});
		
		// Update links as needed for new Data
		this.linkFieldValues()
		.then(() => {
			this.calculateFieldValues();
			this.updateFieldValues();
			// this.updateFieldValues(true);
			// this._universe.emit("object-updated", this.getDelta(delta));
			if(typeof(callback) === "function") {
				callback(null, this);
			}
		})
		.catch((err) => {
			if(typeof(callback) === "function") {
				callback(err, this);
			}
		});
	}
	
	/**
	 * This method is unique in that changes to reference fields update the universe linking for change tracking.
	 * As such, this is one of the 2 methods responsible for interacting with the Universe however all work is handled
	 * by `linkFieldValues` which this calls after setting and storing the values, followed by `updateFieldValues`
	 * to adjust for the new state.
	 * @method setValues
	 * @param {Object} delta
	 * @param {Function} callback
	 */
	setValues(delta, callback) {
		delta.updated = Date.now();
		var result = {},
			details,
			field,
			x;
		
		for(x=0; x<this._manager.fieldIDs.length; x++) {
			field = this._manager.fieldUsed[this._manager.fieldIDs[x]];
			if(field && delta[field.id] !== undefined) {
				this._data[field.id] = result[field.id] = RSObject.setValues(this._data[field.id], delta[field.id], field.type);
				if(field.attribute) {
					this.levelField(field, result);
				}
			}
		}
		
		// Write Data but don't wait
		result.id = this.id;
		this._manager.writeObjectData(result, (err) => {
			if(err) {
				details = {};
				details.id = this.id;
				details.result = result;
				details.delta = delta;
				// this._universe.emit("error", new this._universe.Anomaly("object:write:fault", "Failed to store object data", 50, details, err, this));
			}
		});
		
		// Update links as needed for new Data
		this.linkFieldValues()
		.then(() => {
			this.calculateFieldValues();
			this.updateFieldValues();
			// this.updateFieldValues(undefined, true);
			// this._universe.emit("object-updated", this.getDelta(delta));
			if(typeof(callback) === "function") {
				callback(null, this);
			}
		})
		.catch((err) => {
			if(typeof(callback) === "function") {
				callback(err, this);
			}
		});
	}

	refresh() {
		this.linkFieldValues()
		.then(() => {
			this.calculateFieldValues();
			this.updateFieldValues();
		})
		.catch((err) => {
			this._universe.warnMasters("Failed to refresh " + this.name + " [" + this.id + "]", {"id": this.id, "error": err});
		});
	}

	
	levelField(field, result) {
		var keys,
			i;

		if(typeof(field.attribute.max) === "number" && this._data[field.id] > field.attribute.max) {
			this._data[field.id] = result[field.id] = field.attribute.max;
		} else if(typeof(field.attribute.min) === "number" && this._data[field.id] < field.attribute.min) {
			this._data[field.id] = result[field.id] = field.attribute.min;
		}
		if(typeof(field.attribute.max) === "number" && typeof(result[field.id]) === "object") {
			keys = Object.keys(result[field.id]);
			for(i=0; i<keys.length; i++) {
				if(typeof(result[field.id][keys[i]]) === "number" && result[field.id][keys[i]] > field.attribute.max) {
					result[field.id][keys[i]] = field.attribute.max;
				}
			}
		}
		if(result[field.id] !== undefined && result[field.id] !== null) {
			if(typeof(field.attribute.min) === "number" && typeof(result[field.id]) === "object") {
				keys = Object.keys(result[field.id]);
				for(i=0; i<keys.length; i++) {
					if(typeof(result[field.id][keys[i]]) === "number" && result[field.id][keys[i]] < field.attribute.min) {
						result[field.id][keys[i]] = field.attribute.min;
					}
				}
			}
			if(result[field.id] && field.attribute.limit && result[field.id].length > field.attribute.limit) {
				result[field.id].splice(field.attribute.limit);
			}
			if(result[field.id] && field.attribute.bound_max) {
				switch(typeof(result[field.id])) {
					case "number":
						if(typeof(this[field.attribute.bound_max]) === "number" && result[field.id] > this[field.attribute.bound_max]) {
							this._data[field.id] = result[field.id] = this[field.attribute.bound_max];
						// } else if(typeof(result[field.id]) === "number" && result[field.id] > 0) {
						// 	this._data[field.id] = result[field.id] = 0;
						}
						break;
					case "object":
						if(typeof(this[field.attribute.bound_max]) === "object") {
							keys = Object.keys(result[field.id]);
							for(i=0; i<keys.length; i++) {
								if(typeof(this[field.attribute.bound_max][keys[i]]) === "number" && result[field.id][keys[i]] > this[field.attribute.bound_max][keys[i]]) {
									result[field.id][keys[i]] = this[field.attribute.bound_max][keys[i]]; // _data references same object
								// } else if(typeof(result[field.id][keys[i]]) === "number" && result[field.id][keys[i]] > 0) {
								// 	result[field.id][keys[i]] = 0; // _data references same object
								}
							}
						}
						break;
				}
			}
			if(result[field.id] && field.attribute.bound_min) {
				switch(typeof(result[field.id])) {
					case "number":
						if(typeof(this[field.attribute.bound_min]) === "number" && result[field.id] < this[field.attribute.bound_min]) {
							this._data[field.id] = result[field.id] = this[field.attribute.bound_min];
						// } else if(typeof(result[field.id]) === "number" && result[field.id] < 0) {
						// 	this._data[field.id] = result[field.id] = 0;
						}
						break;
					case "object":
						if(typeof(this[field.attribute.bound_min]) === "object") {
							keys = Object.keys(result[field.id]);
							for(i=0; i<keys.length; i++) {
								if(typeof(this[field.attribute.bound_min][keys[i]]) === "number" && result[field.id][keys[i]] < this[field.attribute.bound_min][keys[i]]) {
									result[field.id][keys[i]] = this[field.attribute.bound_min][keys[i]]; // _data references same object
								// } else if(typeof(result[field.id][keys[i]]) === "number" && result[field.id][keys[i]] < 0) {
								// 	result[field.id][keys[i]] = 0; // _data references same object
								}
							}
						}
						break;
				}
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
	 * Check if the passed conditional should be applied to this object or not.
	 * @method checkConditional
	 * @param {Object} condition
	 * @param {TypeManager} [manager] For the Conditional type. If omitted, the
	 * 		static RSField.ConditionalType constant is checked (and set if it is
	 * 		not already) to pull the conditional type from the "conditional"
	 * 		table.
	 * @return {Boolean}
	 */
	checkConditional(conditional) {
		var result,
			field,
			value,
			ref,
			x;
		
		if(conditional.conditions) {
			for(x=0; x<conditional.conditions.length; x++) {
				ref = [];
				result = this._universe.calculator.computedDiceRoll(conditional.conditions[x], this, ref);
				if(typeof(result) !== "number" || result === 0) {
					return false;
				}
			}
		}
		if(conditional.condition && conditional.ifop) {
			for(x=0; x<conditional._fields_condition.length; x++) {
				field = conditional._fields_condition[x];
				value = this.fetchValue(conditional.condition[field]) || conditional.condition[field];
				if(!RSObject.checkCondition(this[field], conditional.ifop[field], value)) {
					return false;
				}
			}
		}
		
		return true;
	}
	
	/**
	 * Calculate and store the changes to apply to this object from the passed
	 * conditional.
	 * 
	 * Conditional value adjustments may depend on the current state of this object.
	 * To control, the results are calculated for all valid conditionals and stored
	 * to `_conditionals` to be applied after.
	 * @method fillConditional
	 * @return {Object} With computed values filled in for the various keys.
	 */
	fillConditional(conditional) {
		var result = {},
			field,
			x;
			
		result.add = {};
		if(conditional.add) {
			result.add = {};
			for(x=0; x<conditional._fields_add.length; x++) {
				field = conditional._fields_add[x];
				if(!this._involved[field]) {
					this._involved[field] = [];
				}
				this._involved[field].push(conditional.id);
				// result.add[field] = this._universe.calculator.compute(conditional.add[field], this);
				result.add[field] = conditional.add[field];
			}
		}
		
		result.sub = {};
		if(conditional.sub) {
			for(x=0; x<conditional._fields_sub.length; x++) {
				field = conditional._fields_sub[x];
				if(!this._involved[field]) {
					this._involved[field] = [];
				}
				this._involved[field].push(conditional.id);
				// result.sub[field] = this._universe.calculator.compute(conditional.sub[field], this);
				result.sub[field] = conditional.sub[field];
			}
		}
		
		result.set = {};
		if(conditional.set) {
			for(x=0; x<conditional._fields_set.length; x++) {
				field = conditional._fields_set[x];
				if(!this._involved[field]) {
					this._involved[field] = [];
				}
				this._involved[field].push(conditional.id);
				// result.set[field] = this._universe.calculator.compute(conditional.set[field], this);
				result.set[field] = conditional.set[field];
			}
		}
		return result;
	}
	
	/**
	 *
	 * Currently a naive implementation, takes the set fields and adds dice and
	 * calculcated fields for a simple set.
	 * @method getDelta
	 * @param {Object} op Object used in the operation to add, sub, or set.
	 * @return {Object} With the modified properties and additional fields that
	 * 		should be considered as part of the change. Typically computed fields.
	 */
	getDelta(op) {
		var delta = {},
			field,
			x;
			
		for(x=0; x<this._manager.fields.length; x++) {
			field = this._manager.fields[x];
			if(!field.attribute.server_only && (op[field.id] !== undefined || field.type === "calculcated" || field.type === "dice")) {
				delta[field.id] = this[field.id];
			}
		}
		
		delta.id = this.id;
		delta._class = this._class;
		delta._invloved = this._invloved;
		return delta;
	}
	
	/**
	 * Get the raw JSON value of this object based on the current data and the
	 * class fields.
	 *
	 * The "attribute" object is guarenteed by this method, even if the class
	 * does not explicitly feature it.
	 * @method toJSON
	 * @param {Boolean} [include] Keys with a leading "_".
	 * @return {Object} 
	 */
	toJSON(include) {
		var calculated = Object.assign({}, this._calculated),
			data = Object.assign({}, this._data),
			formulas = {},
			json = {},
			field,
			keys,
			x;
		
		if(this._manager && this._manager.fieldIDs) {
			for(x=0; x<this._manager.fieldIDs.length; x++) {
				field = this._manager.fieldUsed[this._manager.fieldIDs[x]];
				if(field) {
					if(!field.attribute || !field.attribute.server_only) {
						if(this[field.id] !== null && this[field.id] !== undefined) {
							json[field.id] = this[field.id];
						} else {
							json[field.id] = null;
						}
						if(field.type === "calculated" || field.type === "dice" || field.type === "object:dice" || field.type === "object:calculated") {
							formulas[field.id] = this._calculated[field.id];
						}
					} else {
						delete(calculated[field.id]);
						delete(data[field.id]);
					}
				}
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
		json._involved = this._involved;
		json._search = this._search;
		json._data = data;
		json._stackable = this._stackable;
		json._conditionals = this._conditionals;
		if(include) {
			json._linkMask = this._linkMask;
			json._combined = this._combined;
			json._previous = this._previous;
			json._formula = this._formula;
			json._calculated = calculated;
			json._calcRef = this._calcRef;
			json._grid = this._grid;
			json._x = this._x;
			json._y = this._y;
		} else {
			json._formula = this._formula;
			json._calculated = formulas;
		}
		if(!json.attribute) {
			json.attribute = {};
		}
		json.created = this.created;
		json.updated = this.updated;
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

/**
 * 
 * @method addObjects
 * @static
 * @param  {[type]} a [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
RSObject.addObjects = function(a, b, type) {
	if(a && !b) {
		return a;
	} else if(!a && b) {
		return b;
	} else if(a && b) {
		var akeys = Object.keys(a),
			bkeys = Object.keys(b),
			checked = {},
			result = {},
			x;
		
		for(x=0; x<akeys.length; x++) {
			result[akeys[x]] = RSObject.addValues(a[akeys[x]], b[akeys[x]], type);
			checked[akeys[x]] = true;
		}
		for(x=0; x<bkeys.length; x++) {
			if(!checked[bkeys[x]]) {
				result[bkeys[x]] = RSObject.addValues(a[bkeys[x]], b[bkeys[x]], type);
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
RSObject.addValues = function(a, b, type, op) {
	if((a === undefined || a === null || a === "undefined") && (b === undefined || b === null || b === "undefined")) {
		return null;
	} else if(a == undefined || a === null || a === "undefined") {
		return b;
	} else if(b == undefined || b === null || b === "undefined") {
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
			case "markdown":
			case "string":
			case "icon":
				return a + " " + b;
			case "integer":
				return parseInt(a || 0) + parseInt(b || 0);
			case "number":
				return parseFloat(a || 0) + parseFloat(b || 0);
			case "object:dice":
			case "calculated":
			case "dice":
				if(typeof(a || b) === "object") {
					return RSObject.addObjects(a, b, "calculated");
				} else {
					return (a || 0) + " + " + (b || 0);
				}
			case "array":
				try {
					return a.concat(b);
				} catch(e) {
					// console.log("A: ", a, JSON.stringify(a), e);
					throw e;
					// return null;
				}
			case "boolean":
				return a && b;
			case "object":
				if(op === "+=") {
					// console.log("Op Add: ", a, b);
					return RSObject.addObjects(a, b, "calculated");
				}
				return RSObject.addObjects(a, b);
		}
	} else {
		if(typeof(a) === "number") {
			if(isNaN(b)) {
				return a + " + " + b;
			} else {
				return a + parseFloat(b);
			}
		} else if(typeof(b) === "number") {
			if(isNaN(a)) {
				return a + " + " + b;
			} else {
				return a + parseFloat(a);
			}
		} else {
			throw new Error("Can not add values as types[" + type + "|" + typeof(a) + "|" + typeof(b) + "] do not match: " + (a?a.id||a:a) + "[" + (!!a) + "] | " + (b?b.id||b:b) + "[" + (!!b) + "]");
		}
	}
};

/**
 * 
 * @method subObjects
 * @static
 * @param  {[type]} a [description]
 * @param  {[type]} b [description]
 * @param  {[type]} type [description]
 * @return {[type]}   [description]
 */
RSObject.subObjects = function(a, b, type) {
	if(a && !b) {
		return a;
	} else if(!a && b) {
		return a;
	} else if(a && b) {
		var akeys = Object.keys(a),
			bkeys = Object.keys(b),
			checked = {},
			result = {},
			x;
		
		for(x=0; x<akeys.length; x++) {
			result[akeys[x]] = RSObject.subValues(a[akeys[x]], b[akeys[x]], type);
			checked[akeys[x]] = true;
		}
		for(x=0; x<bkeys.length; x++) {
			if(!checked[bkeys[x]]) {
				result[bkeys[x]] = RSObject.subValues(a[bkeys[x]], b[bkeys[x]], type);
			}
		}
		
		return result;
	} else {
		return null;
	}

	/*
	if(!a) {
		a = {};
	}
	if(!b) {
		b = {};
	}

	var keys = Object.keys(a),
		result = {},
		x;
	
	keys.uniquely.apply(keys, Object.keys(b));
	for(x=0; x<keys.length; x++) {
		result[keys[x]] = RSObject.subValues(a[keys[x]], b[keys[x]]);
	}
	
	return result;
	*/
};

/**
 * 
 * @method subValues
 * @static
 * @param  {[type]} a    [description]
 * @param  {[type]} b    [description]
 * @param  {[type]} [type] [description]
 * @return {[type]}      [description]
 */
RSObject.subValues = function(a, b, type) {
	var buffer,
		lookup,
		index,
		id,
		i;

	// Level set for string differences; Affects object mapped values from the editor, need to add better tracking for object subvalues to keep them settled correctly
	if(parseInt(a) == a && parseInt(b) == b) {
		type = "number";
		a = parseInt(a);
		b = parseInt(b);
	} else if(type === "string" && typeof(b) === "number") {
		b = b.toString();
	} else if(type === "number" && typeof(b) === "string") {
		a = a.toString();
		type = "string";
	}

	if(typeof(a) === "undefined") {
		switch(typeof(b)) {
			case "markdown":
			case "string":
				return "";
			case "integer":
			case "number":
				return b === undefined ? b : -1 * b;
			case "calculated":
			case "dice":
				if(typeof(a || b) === "object") {
					return RSObject.subObjects(a, b);
				} else {
					return b === undefined ? b : "-1 * (" + b + ")";
				}
			case "array":
				return [];
			case "boolean":
				return !b;
			case "object":
				return {};
		}
	} else if(typeof(b) === "undefined") {
		return a;
	} else if(type || typeof(a) === typeof(b)) {
		if(!type) {
			if(a instanceof Array) {
				type = "array";
			} else {
				type = typeof(a);
			}
		}

		// console.log("A[" + typeof(a) + "]: " + a + " | B[" + typeof(b) + "]: " + b);
		
		// console.log(" > A[" + typeof(a) + "]: " + a + " | B[" + typeof(b) + "]: " + b);

		switch(type) {
			case "markdown":
			case "string":
			case "icon":
				return a.replace(b, "");
			case "integer":
			case "number":
				return a - b;
			case "calculated":
			case "dice":
				if(typeof(a || b) === "object") {
					return RSObject.subObjects(a, b);
				} else {
					return a + " - (" + b + ")";
				}
			case "array":
				lookup = {};
				for(i=0; i<b.length; i++) {
					if(b[i]) {
						id = b[i].id || b[i];
						if(lookup[id]) {
							lookup[id]++;
						} else {
							lookup[id] = 1;
						}
					}
				}
				buffer = [].concat(a);
				for(i=buffer.length - 1; 0<=i; i--) {
					if(buffer[i]) { // Arrays reasonable do not have nulls so "filtering them out" here should not happen nor be a problem
						id = buffer[i].id || buffer[i];
						if(lookup[id]) {
							buffer.splice(i, 1);
							lookup[id]--;
						}
					}
				}
				return buffer;
			case "boolean":
				return a && !b;
			case "object":
				return RSObject.subObjects(a, b);
		}
	} else {
		throw new Error("Can not sub values as types do not match: " + typeof(a) + ":" + a + ", " +  typeof(b) + ":" + b);
	}
};

/**
 * 
 * @method setObjects
 * @static
 * @param  {[type]} a [description]
 * @param  {[type]} b [description]
 * @return {[type]}   [description]
 */
RSObject.setObjects = function(a, b, type) {
	if(!b) {
		return a;
	}
	if(!a) {
		return b;
	}
	
	var akeys = Object.keys(a),
		bkeys = Object.keys(b),
		checked = {},
		result = {},
		x;
	
	for(x=0; x<akeys.length; x++) {
		result[akeys[x]] = RSObject.setValues(a[akeys[x]], b[akeys[x]], type);
		checked[akeys[x]] = true;
	}
	for(x=0; x<bkeys.length; x++) {
		if(!checked[bkeys[x]]) {
			result[bkeys[x]] = RSObject.setValues(a[bkeys[x]], b[bkeys[x]], type);
		}
	}
	
	return result;
};

/**
 * 
 * @method setValues
 * @static
 * @param a 
 * @param b 
 * @param {String} [type]
 * @return The value to be set.
 */
RSObject.setValues = function(a, b, type) {
	if(b === null) {
		return null;
	} else if(typeof(b) === "undefined") {
		return a;
	} else if(type === "array" || (a instanceof Array && b instanceof Array)) {
		return b;
	} else if(typeof(a) === "object" && typeof(b) === "object") {
		return RSObject.setObjects(a, b, type);
	} else {
		return b;
	}
};

/**
 * 
 * @method checkCondition
 * @static
 * @param from 
 * @param {String} op 
 * @param to 
 * @return {Boolean} 
 */
RSObject.checkCondition = function(from, op, to) {
	switch(op) {
		case "has":
			if(!from) {
				return false;
			} else if(typeof(from) === "string" || (from instanceof Array)) {
				return from.indexOf(to) !== -1;
			} else {
				return false;
			}
			break;
		case "hasnot":
			if(!from) {
				return true;
			} else if(typeof(from) === "string" || (from instanceof Array)) {
				return from.indexOf(to) === -1;
			} else {
				return true;
			}
			break;
		case "isin":
			if(!to) {
				return false;
			} else if(typeof(to) === "string" || (to instanceof Array)) {
				return to.indexOf(from) !== -1;
			} else {
				return false;
			}
			break;
		case "isnotin":
			if(!to) {
				return true;
			} else if(typeof(to) === "string" || (to instanceof Array)) {
				return to.indexOf(from) === -1;
			} else {
				return true;
			}
			break;
		case "<=":
			return from <= to;
			/*
			if(!from && to) {
				return true;
			} else if(from && !to) {
				return false;
			} else if(!from && !to) {
				return true;
			} else {
				return from <= to;
			}
			break;
			*/
		case "<":
			return from < to;
			/*
			if(!from && to) {
				return true;
			} else if(from && !to) {
				return false;
			} else if(!from && !to) {
				return true;
			} else {
				return from < to;
			}
			break;
			*/
		case "!=":
			return from != to;
			/*
			if(!from && to) {
				return true;
			} else if(from && !to) {
				return true;
			} else if(!from && !to) {
				return false;
			} else {
				return from != to;
			}
			break;
			*/
		case "=":
			return from === to;
			/*
			if(!from && to) {
				return false;
			} else if(from && !to) {
				return false;
			} else if(!from && !to) {
				return true;
			} else {
				return from == to;
			}
			break;
			*/
		case ">":
			return from > to;
			/*
			if(!from && to) {
				return false;
			} else if(from && !to) {
				return true;
			} else if(!from && !to) {
				return false;
			} else {
				return from > to;
			}
			break;
			*/
		case ">=":
			return from >= to;
			/*
			if(!from && to) {
				return false;
			} else if(from && !to) {
				return true;
			} else if(!from && !to) {
				return true;
			} else {
				return from >= to;
			}
			break;
			*/
		default:
			throw new Error("Invalid conditional operation: " + op);
	}
};

/**
 * 
 * @method isEqual
 * @static
 * @param a 
 * @param b
 * @return {Boolean} 
 */
RSObject.isEqual = function(a, b) {
	var type,
		keys,
		i;

	if(a === b) {
		return true;
	}
	if( (!a && b) || (!b && a) ) {
		return false;
	}
	
	if((type = typeof(a)) !== typeof(b)) {
		return false;
	}

	if(a && b && type === "object") {
		keys = Object.keys(a);
		for(i=0; i<keys.length; i++) {
			if(!RSObject.isEqual(a[keys[i]], b[keys[i]])) {
				return false;
			}
		}
	} else {
		// All other cases should have been handled by the opening "===" by this point
		return false;
	}

	return true;
};

/**
 * 
 * @method copyObjectValue
 * @static
 * @param {Object} object 
 * @returns {Object}
 */
RSObject.copyObjectValue = function(object) {
	return JSON.parse(JSON.stringify(object));
};

module.exports = RSObject;
