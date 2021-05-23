/**
 * 
 * @class ExampleEventHandler
 * @constructor
 * @abstract
 */

/**
 * 
 * @method initialize
 * @param {Univers} universe
 * @return {Promise | null}
 */

/*
Note that javascript in the event folder that DOES NOT declare an initialize
	functional property will not be called. If a Promise is returned, the load
	process will wait for it to finish but a Promise is not required.

module.exports.initialize = function(universe) {
	return new Promise(function(done, fail) {
		
		// Note that player triggered events always start with "player:"
		universe.on("player:[Event Name]", function(event) {
			// Handle the event as needed
			console.log("Player Event: ", event);
		});
		
		// Complete initializing call
		done();
	});
};
*/
*
