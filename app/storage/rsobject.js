/**
 *
 * @class RSObject
 * @constructor
 * @param {Universe} universe
 * @param {RSTypeManager} manager
 * @param {String} id
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
		
	}
	
	/**
	 * 
	 * @method getField
	 * @param {String} name Matching the Field ID to be used.
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
		
	}
	
	/**
	 *
	 * When 
	 * @method setField
	 * @param {String} name Matching the Field ID to be used.
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
		
	}
}
