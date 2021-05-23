/* * <-- Remove the space between astriks for documentation purposes
 * 
 * @event player:example
 * @for Universe
 * @param {Object} event With data from the system
 * @param {String} event.type The event name being fired, should match this event's name
 * @param {Integer} event.received Timestamp of when the server received the event
 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
 * @param {RSObject} event.player That triggered the event
 * @param {Object} event.message The payload from the UI
 */

/*
Note that javascript in the event folder that DOES NOT declare an initialize
	functional property will not be called. If a Promise is returned, the load
	process will wait for it to finish but a Promise is not required.

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
*/
