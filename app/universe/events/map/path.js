module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:map:path:add
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
	 * @param {String} event.message.data.location To update
	 * @param {Number} event.message.data.x
	 * @param {Number} event.message.data.y
	 */
	universe.on("player:map:path:add", function(event) {
		if(event.player.gm) {
			var location = event.message.data.location,
				x = event.message.data.x,
				y = event.message.data.y;
			if(typeof(location) === "string") {
				location = universe.manager.location.object[location];
			}
			if(location && typeof(x) === "number" && typeof(y) === "number") {
				location.addValues({
					"rendering_path": [x, y]
				});
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to modify meeting time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};
