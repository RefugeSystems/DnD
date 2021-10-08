module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:master:control:map
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.type Original event type indicated by the UI; Should be "error:report"
	 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
	 * @param {Object} event.message.data Typical location of data from the UI
	 * @param {String | Object} event.message.data.location
	 * @param {Object} event.message.data.image Specifies the constraints to which the viewer is to focus
	 */
	universe.on("player:master:control:map", function(event) {
		var location = event.message.data.location,
			image = event.message.data.image,
			notify;

		if(typeof(location) === "string") {
			location = universe.manager.location.object[location];
		}

		if(event.player.gm && location && location.map) {
			if(!location.disabled && !location.is_disabled && !location.is_preview) {
				universe.emit("master:control", {
					"type": "master:control",
					"control": "map",
					"data": {
						"location": location.id,
						"image": image
					}
				});
			} else {
				notify = {};
				notify[event.player.id] = true;
				universe.emit("send", {
					"type": "notice",
					"icon": "fas fa-exclamation-triangle rs-lightyellow",
					"recipients": notify,
					"message": "Can't set maps to a disabled or preview location",
					"data": event.message.data,
					"timeout": 8000
				});
			}
		} else {
			notify = Object.assign({}, universe.getMasters());
			notify[event.player.id] = true;
			universe.emit("send", {
				"type": "notice",
				"icon": "fas fa-exclamation-triangle rs-lightyellow",
				"recipients": notify,
				"message": "Can't set map to an undefined location or a location with no map and you must be a Game Master to do so.",
				"data": event.message.data,
				"timeout": 8000
			});
		}
	});
	/**
	 * 
	 * @event player:master:control:map
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.type Original event type indicated by the UI; Should be "error:report"
	 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
	 * @param {Object} event.message.data Typical location of data from the UI
	 * @param {String | Object} event.message.data.location
	 * @param {Object} event.message.data.image Specifies the constraints to which the viewer is to focus
	 */
	universe.on("player:master:control:mapview", function(event) {
		var location = event.message.data.location,
			image = event.message.data.image,
			notify;

		if(typeof(location) === "string") {
			location = universe.manager.location.object[location];
		}

		if(location && location.map) {
			if(event.player.gm) {
				universe.emit("master:control", {
					"type": "master:control",
					"control": "mapview",
					"data": {
						"location": location.id,
						"zoom": event.message.data.zoom,
						"x": event.message.data.x,
						"y": event.message.data.y
					}
				});
			} else {
				universe.handleError("control:mapview", "Non-Gamemaster attempted to send a map view", null, {
					"player": event.player.id,
					"location": location.id
				});
			}
		} else {
			universe.handleError("control:mapview", "Location not found or no associated map", null, {
				"player": event.player.id,
				"location": event.message.data.location,
				"found": !!location
			});
		}
	});
};
