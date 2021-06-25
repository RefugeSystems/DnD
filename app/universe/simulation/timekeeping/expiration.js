/**
 * 
 * @class ChronicledExpiration
 * @extends ChronicleProcessor
 * @constructor
 */

/**
 * The type name used for occurrences in the universe. This is tied to processing
 * chronicled Occurrences.
 *
 * If this is not defined, the file is ignored by the universe when loading. Support
 * files or object definitions and such would fall into this category.
 * @property type
 * @type String
 */
module.exports.type = "object:expiration";

/**
 * 
 * @method initialize
 * @param  {[type]} universe [description]
 * @return {Promise} If any waiting is needed. Null if no waiting is needed.
 */
module.exports.initialize = function(universe) {

};

/**
 * 
 *
 * Note:  
 * Any errors that need handled are emitted on the universe.
 * @method process
 * @param {Universe} universe
 * @param {Occurrence} occurrence 
 * @param {Boolean} occurrence.reverse The direction in which to process the occurrence
 * @param {Function} completed Takes no arguments and called when complete.
 */
module.exports.process = function(universe, occurrence, completed) {
	console.log("Occurrence: ", occurrence);
	var target = universe.get(occurrence.target),
		event = JSON.parse(occurrence.event),
		object = universe.get(event.id),
		field = event.field,
		values = {};

	console.log(" > " + (!!target) + " | " + (!!object));
	/* Currently simply assuming time is correct
	if(object.time_end <= universe.time) {

	} else {
		universe.chronicle.addOccurrence("object:expiration", {"target": target.id, "id": object.id}, object.time_end);
	}
	*/

	if(object) {
		if(object.expires_to) {
			values.parent = object.expires_to;
			object.setValues(values);
		} else if(target && field) {
			values[field] = [object.id];
			target.subValues(values);
		}
	}

	completed();
};