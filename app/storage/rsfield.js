/**
 *
 *
 * Note: All property values are sibject to mutation and therefore should ONLY
 * be accessed by reference to the field object when needed.
 * @class RSField
 * @constructor
 * @param {Object} specification
 */

// Could implement reflection and obscure the "set" process, however this is avoided
// 		to maintain performance.

var EventEmitter = require("events").EventEmitter,
	Anomaly = require("../management/anomaly"),
	validTypeValue = new RegExp("^[a-z:]+$"),
	valid = new RegExp("^[a-z][a-z:_]*$");

class RSField extends EventEmitter {
	constructor(specification) {
		super();
		if(!valid.test(specification.id)) {
			throw new Anomaly("storage:field", "Invalid ID for Field", 60, specification);
		}
		if(specification.type && !validTypeValue.test(specification.type)) {
			throw new Anomaly("storage:field", "Invalid type value for Field: " + specification.id, 60, specification);
		}
		if(!specification.name) {
			throw new Anomaly("storage:field", "RSField specification requires a name: " + specification.id, 60, specification);
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
		 * CSS Classing for the icon associated with this field.
		 * @property icon
		 * @type String
		 */
		this.icon = specification.icon;
		/**
		 * Why this field exists and how its used. As fields are consistent across
		 * all classes, a description of what the field is used for is key to upkeep.
		 * @property description
		 * @type String
		 */
		this.description = specification.description;
		/**
		 * Order in which to display this field when applicable
		 * @property ordering
		 * @type Integer
		 */
		this.ordering = specification.ordering;
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
		 * Array of the fields involved in inheritance.
		 * @property inheritanceFields
		 * @type String | Array
		 */
		this.inheritanceFields = Object.keys(this.inheritance);
		
		/**
		 * This limits the Object Classes that can be referred to by this field.
		 *
		 * If left empty or null, this field is treated as having no inheritance.
		 * If it is an empty array then the ID can reference any class.
		 * @property inheritable
		 * @type Array | String
		 */
		this.inheritable = specification.inheritable;
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
		/**
		 * Optional flag to block parental inheritance of the value on this field.
		 * @property attribute.no_parental
		 * @type Boolean
		 */
		/**
		 * For Object and Array values with inheritance, this is either "key" to indicate
		 * that the inheritance ID is within the Key or "value" to indicate that the IDs
		 * are object IDs within the universe/
		 * @property attribute.inherited
		 * @type String
		 */
		/**
 		 * Used with Array types to inidcate the expected maximum size for the array.
 		 * @property attribute.limit
 		 * @type Integer
 		 */
		/**
 		 * The value to be set for this field when the value is currently undefined.
 		 * @property attribute.default
 		 */
		/**
 		 * Flag to hide the field from general system displays for the object
 		 * @property attribute.displayed
 		 * @type Boolean
 		 */
		/**
 		 * Indicates the size above which this field should display on general system readouts.
 		 * These values generally range from 1 to 100 with "5" for "Small" system readouts
 		 * and "90" for full length readouts. Above 100 should be considered debugging territory.
 		 * @property attribute.display_size
 		 * @type Integer
 		 * @default 100
 		 */
		/**
 		 * Indicates that this field represents a primary universe value.
 		 * @property attribute.primary_stat
 		 * @type Integer
 		 */
		/**
 		 * Indicate to include the value of this field in the generated search string for the object.
 		 *
 		 * Only works for string typed fields.
 		 * @property attribute.searchable
 		 * @type Integer
 		 */
 		this.attribute = specification.attribute;
		if(typeof(this.attribute) === "string") {
			try {
				this.attribute = JSON.parse(this.attribute);
			} catch(parseException) {
				
			}
		}
		if(!this.attribute) {
			this.attribute = {};
		}
		if(!this.attribute.display_size) {
			this.attribute.display_size = 90;
		}
		/**
 		 * Used to map values to a display string in the case of simple values, such
		 * as mapping a "scale" integer to a label for the size.
 		 * @property displayed_as
 		 * @type Object
 		 */
 		this.displayed_as = specification.displayed_as;
		if(typeof(this.displayed_as) === "string") {
			try {
				this.displayed_as = JSON.parse(this.displayed_as);
			} catch(parseException) {
				this.displayed_as = {};
			}
		}
		if(!this.displayed_as) {
			this.displayed_as = {};
		}
		/**
		 * 
		 * @property updated
		 * @type Integer
		 */
		this.updated = specification.updated || Date.now();
		/**
		 * 
		 * @property created
		 * @type Integer
		 */
		this.created = specification.created || Date.now();
		
		/**
		 * 
		 * @property _search
		 * @type String
		 */
		this._search = this.id + " ::: " + this.name.toLowerCase();

		this.updateSpecification(specification);
	}
	
	updateSpecification(specification) {
		var keys = Object.keys(specification),
			x;
			
		for(x=0; x<keys.length; x++) {
			if(keys[x][0] !== "_" && keys[x] !== "id") {
				this[keys[x]] = specification[keys[x]];
			}
		}
		
		if(typeof(this.inheritance) === "string") {
			this.inheritance = JSON.parse(this.inheritance);
		}
		this.inheritanceFields = this.inheritance?Object.keys(this.inheritance):undefined;
		if(typeof(this.inheritable) === "string") {
			this.inheritable = JSON.parse(this.inheritable);
		}
		this.type = (specification.type || specification.ftype || "string").toLowerCase();
		if(typeof(this.attribute) === "string") {
			this.attribute = JSON.parse(this.attribute);
		}
		if(typeof(this.displayed_as) === "string") {
			try {
				this.displayed_as = JSON.parse(this.displayed_as);
			} catch(wtf) {
				console.trace("Filed Update Error?: " + this.displayed_as, this.displayed_as);
				this.displayed_as = {};
			}
		}
		if(!this.attribute) {
			this.attribute = {};
		}
		this.updated = Date.now();
		this._search = this.id + " ::: " + this.name.toLowerCase();
		this.emit("changed");
	}
	
	toString() {
		return "RSField[" + this.name + "]";
	}
}

module.exports = RSField;
