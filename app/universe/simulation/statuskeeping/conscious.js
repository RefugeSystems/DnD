/**
 * 
 * @class ChronicledHealthStatus
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
module.exports.type = "entity:health";

/**
 * 
 * @method initialize
 * @param  {[type]} universe [description]
 * @return {Promise} If any waiting is needed. Null if no waiting is needed.
 */
module.exports.initialize = function(universe) {

};
 