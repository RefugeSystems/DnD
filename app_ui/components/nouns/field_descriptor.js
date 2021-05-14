

/**
 * 
 * @class FieldDescription
 * @constructor
 * @param {Object} details
 */
class FieldDescriptor {
	
	constructor(details) {
		Object.assign(this, details);
	}

	/**
	 * 
	 * @property label
	 * @type String
	 */

	/**
	 * 
	 * @property property
	 * @type String
	 */

	/**
	 * 
	 * @property type
	 * @type String
	 * @default text
	 * @optional
	 */

	/**
	 * 
	 * @property options
	 * @type Array | Object
	 */
	
	
	/**
	 * Flag to direct the system to just use the ifled type
	 * as a raw input control. Useful for things like "date"
	 * if the target browser has good native support.
	 * @property follow_type
	 * @type Boolean
	 */
}
