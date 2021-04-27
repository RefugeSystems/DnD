/**
 *
 * @class RSField
 * @constructor
 * @param {Object} specification
 */

var EventEmitter = require("events").EventEmitter,
	Anomaly = require("../management/anomaly"),
	valid = new RegExp("^[a-z][a-z_]+$");

/**
 * Reference to a field object by its name.
 * @property index
 * @type Object
 * @static
 * @private
 */
var index = {};

class RSField extends EventEmitter {
	constructor(specification) {
		super();
		if(!specification.name) {
			throw new Error("storage:field", this, "RSField specification requires a name", 50);
		}

		if(index[specification.name]) {
			throw new Error("RSField specification requires a unique name");
		} else if(!valid.test(specification.name)) {
			throw new Error("RSField name is invalid; Must match " + valid.toString());
		} else {
			index[specification.name] = this;
		}
		
		/**
		 * Specifies the underlying field name used against objects.
		 * @property id
		 * @type String
		 */
		this.id = specification.id;
		/**
		 * Name of this field for descriptive or display purposes.
		 * @property name
		 * @type String
		 */
		this.name = specification.name;
		/**
		 * Why this field exists and how its used. As fields are consistent across
		 * all types, a description of what the field is used for is key to upkeep.
		 * @property description
		 * @type String
		 */
		this.description = specification.description;
		/**
		 * Specifies the fields of the value referenced here to pull into the values
		 * of the object using this field. Each field ID is mapped to an operation
		 * type (+, -, =) that specifies how the value is pulled up from the noted
		 * value.
		 * @property inheritance
		 * @type Object
		 */
		this.inheritance = specification.inheritance || {};
		/**
		 * This limits the Object Types that can be referred to by this field.
		 *
		 * If left empty, the ID can reference any type.
		 * @property inheritable
		 * @type Array | String
		 */
		this.inheritable = specification.inheritable || [];
		/**
		 * Type determines how various operations against and displays of the field
		 * occur. Such as a "String" value might be specified as a "Dice" type which
		 * means addition requires a " + " seperator and a display may offer an option
		 * to roll the specified value.
		 *
		 * Available Types (Case sensitive):
		 * + string
		 * + number (Allows Decimals)
		 * + integer (Trims)
		 * + dice
		 * + array
		 * + object (Stored as a String and is parsed and maintained as a single object).
		 * 		Note that there are no atomic operations against objects as a field type,
		 * 		they change in their entirety with any changes.
		 *
		 * @property type
		 * @type String
		 * @default "string"
		 */
		this.type = (specification.type || "string").toLowerCase();
	}
	
	toString() {
		return "RSField[" + this.name + "]";
	}
}

module.exports = RSField;

/**
 *
 * @method getField
 * @static
 * @param {String} name
 * @return {RSField}
 */
module.exports.getField = function(name) {
	return index[name];
};

/**
 *
 * @method removeField
 * @static
 * @param {RSField | String} name
 */
/**
 * Emitted from the field itself to indicate that it has been removed.
 *
 * TypeManagers then use this to adjust their processing accordingly.
 * @event removed
 * @param  {Object} removed Field data.
 */
module.exports.removeField = function(name) {
	name = name.name || name;
	if(index[name]) {
		index[name].emit("removed", index[name]);
	}
	delete index[name];
};
