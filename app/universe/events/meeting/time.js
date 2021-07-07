module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:meeting:start
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {String} event.message.meeting
	 * @param {Number} event.message.time
	 * @param {Array} event.message.players
	 */
	universe.on("player:meeting:start", function(event) {
		if(event.player.gm) {
			
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to modify meeting time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});

	/**
	 * 
	 * @event player:meeting:end
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {String} event.message.meeting
	 * @param {Number} event.message.time
	 */
	universe.on("player:meeting:end", function(event) {
		if(event.player.gm) {
			
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to modify meeting time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};