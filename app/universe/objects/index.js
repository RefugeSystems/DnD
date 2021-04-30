/**
 * Handles Object cross talk and updates.
 * @class RSObjectReferrer
 * @constructor
 */

var ChangeEvent = require("./change_event");

module.exports = (function() {
	var database = null,
		inheritance = {},
		
	
	this.initialize = function(configuration) {
		return new Promise(function(done, fail) {
			trace.managers = {};
			var initializing = [],
				manager,
				x;
			
			// TODO: Add logic for database type consideration?
			database = new startup.RSDatabase(startup.configuration.database);
			
			// TODO: Load RSField Data
			
			
			// TODO: Initialize types with field data
			for(x=0; x<types.length; x++) {
				manager = database.getTypeManager(types[x]);
				initializing.push(manager.initialize());
				trace[types[x]] = manager;
			}
			
			Promise.all(initializing)
			.then(function() {
				done(managers);
			})
			.catch(fail);
		});
	};
	
	/**
	 * 
	 * @method trackInheritance
	 * @param  {RSObject} source 
	 * @param  {RSObject} effected 
	 */
	this.trackInheritance = function(source, effected) {
		
	}

	/**
	 * 
	 * @method untrackInheritance
	 * @param  {RSObject} source 
	 * @param  {RSObject} effected 
	 */
	 this.untrackInheritance = function(source, effected) {
		
	}

	/**
	 * 
	 * @method pushChanged
	 * @param {String} id 
	 */
	this.pushChanged = function(id, callback) {
		var changing = new ChangeEvent(is, callback);
		_trackChanging(id, changing)
	}
	
	/**
	 * 
	 * @method trackChanging
	 * @private
	 * @param {Object} changing Used for trackign what objects have
	 * 		been changed as a crude loop prevention
	 */
	var trackChanging = function(changing) {
		
	};
})();
