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
 * @param {Object} event.message.type Original event type indicated by the UI
 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
 * @param {Object} event.message.data Typical location of data from the UI
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


/**
 * This tracks some piece of transitory data for something happening in the system
 * such as an entity taking damage or creating a potion. This is the object that the
 * event system passed around that has data for a specific piece.
 * 
 * This ties into a ChronicleEvent where a single ChronicleEvent may have several
 * UniverseEvents underneath it to track activity, such as an attack will have multiple
 * UniverseEvents:
 * + Entity Attacks
 * + General Broadcast of Attack to nearby
 * + Entity Defends
 * + General Broadcast of Defense to nearby
 * 
 * These events then tie back to the ChronicleEvent to denote and track the outcome.
 * @class UniverseEvent
 * @constructor
 * @abstract
 */

/**
 * The name of the event that fired, such as "entity:damaged".
 * 
 * This is the code name and not the abstract name used for the Occurrence name.
 * @property name
 * @type String
 */

/**
 * The Chronicle ID for the event. This is used to retrieve the full "raw" event from
 * the system for usage/cross checking.
 * @property id
 * @type String
 */
