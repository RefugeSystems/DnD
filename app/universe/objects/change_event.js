/**
 * Has multiple properties matching field ID names that have
 * been modified as part of this change for quick loop check
 * reference.
 * @class ChangeEvent
 * @constructor
 * @param {String} id Of the RSObject starting the change.
 * @param {Function} callback 
 */
module.exports = function(universe, id, callback) {
	/**
	 * 
	 * @property time
	 * @type Integer
	 * @private
	 */
	var time = 0,
	/**
	 * Queue of IDs to process. Saved to double as the list
	 * of changed objects as well.
	 * @property queue
	 * @type {Array}
	 * @private
	 */
		queue = [id],
	/**
	 * Location within the queue.
	 * @property index
	 * @type Integer
	 * @private
	 */
		index = 0;
	
	/**
	 * Get array of Object IDs for Objects that had updates as
	 * part of this process.
	 * @method getTouchedObjects
	 * @return {Array} Of object IDs that should NOT be modified
	 * 		of trusted to update if retrieved while the change is
	 * 		processing.
	 */
	this.getTouchedObjects = function() {
		return queue;
	};
	
	/**
	 * 
	 * @method getStart
	 * @return {Integer} Start time for this change event.
	 */
	this.getStart = function() {
		return time;
	};
	
	
	this.fire = function() {
		time = Date.now();
		processNextObject();
	};
	
	
	var processNextObject = function() {
		// var processing = universe.
	};
	
	/**
	 * 
	 * @method addNextObjects
	 * @param {Array} objects 
	 */
	this.addNextObjects = function(objects) {
		queue = queue.concat(objects);
	};
	
	/**
	 * 
	 * @method getNextObject
	 * @return {String} ID of the next object to check.
	 */
	this.getNextObject = function() {
		return queue[index++];
	};
};
