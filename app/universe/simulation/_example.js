// Note: Files starting with "_" are NOT loaded by the universe. This is used as
// 		a simple on/off switch

/**
 * 
 * @class ChronicleProcessor
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
module.exports.type = "Example";

/**
 * 
 * @method initialize
 * @param  {[type]} universe [description]
 * @return {Promise} If any waiting is needed. Null if no waiting is needed.
 */
module.exports.initialize = function(universe) {
	return new Promise(function(done, fail) {
		
		// Note that player triggered events always start with "player:"
		universe.on("player:example", function(event) {
			// Handle the event as needed
			console.log("Player Event: ", event);
		});
		
		// Complete initializing call
		done();
	});
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
	completed();
};
