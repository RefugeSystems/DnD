/**
 * 
 * @event player:error:retrieve
 * @for Universe
 * @param {Object} event With data from the system
 * @param {String} event.type The event name being fired, should match this event's name
 * @param {Integer} event.received Timestamp of when the server received the event
 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
 * @param {RSObject} event.player That triggered the event
 * @param {Object} event.message The payload from the UI
 * @param {Object} event.message.type Original event type indicated by the UI; Should be "error:retrieve"
 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
 * @param {Object} event.message.data Typical location of data from the UI
 */

module.exports.initialize = function(universe) {
	universe.on("player:error:retrieve", function(event) {
		console.log("Player Event: ", event);
		
		var constriction = Object.assign({}, event.message.data.constricted);
		
		if(event.player.id === event.message.data.player || event.player.master || event.player.gm) {
			constriction.type = "error:player";
			universe.chronicle.getEvents(event.message.data.from, event.message.to, constriction, function(err, events) {
				if(err) {
					console.error("Err: ", err);
				} else {
					// TODO: Send events with player as recipient
				}
			});
		}
	});
};
