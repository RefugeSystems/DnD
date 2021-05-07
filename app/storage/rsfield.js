/**
 *
 * @class RSField
 * @constructor
 * @param {Object} specification
 */

var EventEmitter = require("events").EventEmitter,
	Anomaly = require("../management/anomaly"),
	validTypeValue = new RegExp("^[a-z]+$"),
	valid = new RegExp("^[a-z][a-z_]+$");

class RSField extends EventEmitter {
	constructor(specification) {
		super();
		if(!valid.test(specification.id)) {
			throw new Error("Invalid ID for Field: " + specification.id);
		}
		if(specification.type && !validTypeValue.test(specification.type)) {
			throw new Error("Invalid type (" + specification.type + ") value for Field (" + specification.id + ")");
		}
		if(!specification.name) {
			throw new Error("storage:field", this, "RSField specification requires a name", 50);
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
		 * all classes, a description of what the field is used for is key to upkeep.
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
		if(typeof(this.inheritance) === "string") {
			this.inheritance = JSON.parse(this.inheritance);
		}
		/**
		 * This limits the Object Classes that can be referred to by this field.
		 *
		 * If left empty, this field is treated as having no inheritance. If "*"
		 * is specified then the ID can reference any class.
		 * @property inheritable
		 * @type Array | String
		 */
		this.inheritable = specification.inheritable || [];
		if(typeof(this.inheritable) === "string") {
			this.inheritable = JSON.parse(this.inheritable);
		}
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
		 * + dice | calculcated | formula (Similar with subtle differences in UI handling)
		 * + array
		 * + file (Base64 encoded String with the data)
		 * + object (Stored as a String and is parsed and maintained as a single object).
		 * 		Note that there are no atomic operations against objects as a field type,
		 * 		they change in their entirety with any changes.
		 *
		 * @property type
		 * @type String
		 * @default "string"
		 */
		this.type = (specification.type || specification.ftype || "string").toLowerCase();
		/**
		 * 
		 * @property obscured
		 * @type Boolean
		 */
		this.obscured = specification.obscured || false;
		/**
		 * 
		 * @property attribute
		 * @type Object
		 */
		this.attribute = specification.attribute;
		if(typeof(this.attribute) === "string") {
			this.attribute = JSON.parse(this.attribute);
		}
		/**
		 * 
		 * @property updated
		 * @type Integer
		 */
		this.updated = specification.updated;
		/**
		 * 
		 * @property created
		 * @type Integer
		 */
		this.created = specification.created;
	}
	
	toString() {
		return "RSField[" + this.name + "]";
	}
}

module.exports = RSField;
