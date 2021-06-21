/**
 * 
 * @event player:time:forward
 * @for Universe
 * @param {Object} event With data from the system
 * @param {String} event.type The event name being fired, should match this event's name
 * @param {Integer} event.received Timestamp of when the server received the event
 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
 * @param {RSObject} event.player That triggered the event
 * @param {Object} event.message The payload from the UI
 * @param {Object} event.message.increment
 */
module.exports.initialize = function(universe) {

	universe.on("player:time:forward", function(event) {
		if(event.player.gm) {
			universe.forwardTime(event.message.data.increment);
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to increment time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};
