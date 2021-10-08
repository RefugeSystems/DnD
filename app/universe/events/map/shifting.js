module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:map:control
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
	 * @param {Object} event.message.data.location To display
	 * @param {Integer} event.message.data.shown_at Date used as an update prevention for mis-timed transitions
	 * @param {Object} event.message.data.image Specifying how the map should be rendered
	 */
	universe.on("player:map:control", function(event) {
		if(event.player.gm) {
			
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to perform a map control", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});

	/**
	 * 
	 * @event player:map:view
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
	 * @param {Object} event.message.data.location To display
	 * @param {Integer} event.message.data.shown_at Date used as an update prevention for mis-timed transitions
	 * @param {Object} event.message.data.image Specifying how the map should be rendered
	 */
	universe.on("player:map:view", function(event) {
		if(event.player.gm) {
			
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to send a map view point", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};
