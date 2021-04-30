/**
 *
 * @class RSObject
 * @constructor
 * @param {Object} details
 * @param {Universe} universe
 * @param {RSTypeManager} manager
 */
class RSObject {
	constructor(details, universe, manager) {
		/**
		 *
		 * @property universe
		 * @type Universe
		 */
		this.universe = universe;
		/**
		 *
		 * @property manager
		 * @type TypeManager
		 */
		this.manager = manager;
		/**
		 * 
		 * @property type
		 * @type String
		 */
		this.type = manager.id;
		/**
		 *
		 * @property _data
		 * @type {Object}
		 */
		this._data = details;

		this.updateFields();
	}

	/**
	 * Pulls values from
	 * @method updateFields
	 * @param {Array} [delta] Optional array specifying the fields that have
	 * 		changed to reduce the update load.
	 */
	updateFields(delta) {
		var x;

		if(!delta) {
			delta = this.manager.fieldNames;
		}

		// TODO: Finish advanced calculations and defaults
		for(x=0; x<delta.length; x++) {
			this[delta[x]] = this._data[delta[x]];
		}

		this.universe.emit("object-update", {
			"id": this.id,
			"delta": delta,
			"time": Date.now()
		});
	}

	/**
	 *
	 * @method getField
	 * @param {Array | String} name Matching the Field ID to be used. If an array is
	 * 		passed, then this is broken down automatically for precuror indexing.
	 * @param {Array | String} [precursor] Defines the leading portion of the
	 * 		reference. For instance to get the object's parent value where the
	 * 		object specifies an existing value, the name would be the field
	 * 		(For Example; "name"), and precursor could be `"parent"` or `["parent"]`.
	 * 		This could additionally be something such as `["location", "location",
	 * 		"location"]` in reference to "name" to essentially go 3 locations deep
	 * 		and retrieve the name. Not that if the chain doesn't have enough
	 * 		references to follow, this stops. This may also refer to "Object" type
	 * 		fields on this RSObject.
	 * @param {Integer} [index] Indicating where in the precursor array we are
	 * 		referencing. This defaults to 0 and is incremented internal but can
	 * 		be specified at the time of call.
	 * @return {String | Number | Boolean | Object} Based on the RSField definition
	 * 		for the referenced value.
	 */
	getField(name, precursor, index) {
		if(name instanceof Array) {
			precursor = name;
			name = precursor.pop();
			index = 0;
		}
		if(precursor && index < precursor.length) {

		} else {
			return this[name];
		}
	}

	/**
	 *
	 * @method setField
	 * @param {Array | String} name Matching the Field ID to be used. If an array is
	 * 		passed, then this is broken down automatically for precuror indexing.
	 * @param {String | Number | Boolean | Object} value To put into the field.
	 * 		In the case of referential fields, this should be the String ID value
	 * 		of the object to reference.
	 * @param {Array | String} [precursor] Defines the leading portion of the
	 * 		reference. For instance to get the object's parent value where the
	 * 		object specifies an existing value, the name would be the field
	 * 		(For Example; "name"), and precursor could be `"parent"` or `["parent"]`.
	 * 		This could additionally be something such as `["location", "location",
	 * 		"location"]` in reference to "name" to essentially go 3 locations deep
	 * 		and retrieve the name. Not that if the chain doesn't have enough
	 * 		references to follow, this stops. This may also refer to "Object" type
	 * 		fields on this RSObject.
	 * @param {Integer} [index] Indicating where in the precursor array we are
	 * 		referencing. This defaults to 0 and is incremented internal but can
	 * 		be specified at the time of call.
	 * @return {String | Number | Boolean | Object} Based on the RSField definition
	 * 		for the referenced value.
	 */
	setField(name, value, precursor, index) {
		if(name instanceof Array) {
			precursor = name;
			name = precursor.pop();
			index = 0;
		}

		if(precursor && index < precursor.length) {

		} else {
			this[name] = value;
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
}

module.exports = RSObject;
