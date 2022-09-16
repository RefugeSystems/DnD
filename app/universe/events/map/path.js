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
	 * @param {Number | String} event.message.data.x When a string is passed it is assumed to be an object ID and
	 * 		used as such in the viewer.
	 * @param {Number} event.message.data.y Optional if X is a string.
	 */
	universe.on("player:map:path:add", function(event) {
		if(event.player.gm) {
			var location = event.message.data.location,
				x = event.message.data.x,
				y = event.message.data.y;
			if(typeof(location) === "string") {
				location = universe.manager.location.object[location];
			}
			if(location) {
				if(typeof(x) === "number" && typeof(y) === "number") {
					location.addValues({
						"rendering_path": [{"x": x, "y": y}]
					});
				} else if(typeof(x) === "string") {
					location.addValues({
						"rendering_path": [x]
					});
				}
			} else {
				console.log("No location found at " + event.message.data.location);
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to modify meeting time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
	
	/**
	 * 
	 * @event player:map:path:remove
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
	 * @param {String} [event.message.data.x]
	 */
	 universe.on("player:map:path:remove", function(event) {
		if(event.player.gm) {
			var location = event.message.data.location,
				x = event.message.data.x,
				index,
				path;
			if(typeof(location) === "string") {
				location = universe.manager.location.object[location];
			}
			if(location) {
				path = location.rendering_path || [];
				if(typeof(x) === "string") {
					index = path.indexOf(x);
					if(index !== -1) {
						path.splice(index, 1);
						location.setValues({
							"rendering_path": path
						});
					}
				} else {
					path.splice(path.length - 1);
					location.setValues({
						"rendering_path": path
					});
				}
			} else {
				console.log("No location found at " + event.message.data.location);
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to modify meeting time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};
