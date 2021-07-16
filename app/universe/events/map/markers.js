var Random = require("rs-random");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:map:distance
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
	 * @param {Number} event.message.data.distance Value for `map_distance` property
	 */
	universe.on("player:map:distance", function(event) {
		if(event.player.gm) {
			var location = event.message.data.location,
				distance = event.message.data.distance;
			if(typeof(location) === "string") {
				location = universe.manager.location.object[location];
			}
			if(location && typeof(distance) === "number") {
				location.setValues({
					"map_distance": distance
				});
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
	 * @event player:map:mark
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
	 * @param {String} [event.message.data.id] Autocreated if omitted
	 * @param {String} event.message.data.color For the display color and other grouping
	 * @param {Boolean} event.message.data.standalone When true, no crosshair is displayed with the point
	 * @param {Boolean} event.message.data.pathed When true, a path connects like colored points
	 * @param {Number} [event.message.data.radial] When set, uses the location map_distance to render a circle around the point
	 * @param {String} [event.message.data.object] Maps the point to a specific object, but only in the case of radials.
	 * @param {Number} event.message.data.x
	 * @param {Number} event.message.data.y
	 */
	universe.on("player:map:mark", function(event) {
		var location = event.message.data.location,
			coordinate;
		if(typeof(location) === "string") {
			location = universe.manager.location.object[location];
		}
		if(location) {
			coordinate = {
				"id": event.message.data.id || Random.identifier("coordinate", 10),
				"color": event.message.data.color,
				"standalone": event.message.data.standalone,
				"object": event.message.data.object,
				"pathed": event.message.data.pathed,
				"radial": event.message.data.radial,
				"x": event.message.data.x,
				"y": event.message.data.y
			};
			location.addValues({
				"coordinates": [coordinate]
			});
		}
	});

	/**
	 * 
	 * @event player:map:unmark
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
	 * @param {String} event.message.data.id To dismiss
	 * @param {Array} event.message.data.ids 
	 */
	universe.on("player:map:unmark", function(event) {
		var location = event.message.data.location,
			coordinate;
		if(typeof(location) === "string") {
			location = universe.manager.location.object[location];
		}
		if(location) {
			if(event.message.data.id) {
				coordinate = {
					"id": event.message.data.id
				};
				location.subValues({
					"coordinates": [coordinate]
				});
			} else if(event.message.data.ids) {
				location.subValues({
					"coordinates": event.message.data.ids
				});
			} else {
				location.subValues({
					"coordinates": location.coordinates
				});
			}
		}
	});

	/**
	 * Set the location along with the x and y coordinates for a location, party, entity, item, skirmish, storm, or other
	 * object that has an x and y property. No check is performed to ensure the properties are present and the _data object
	 * will contain the values, however the omitted fields will prevent the object from expressing the values.
	 * @event player:map:location
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
	 * @param {String} event.message.data.location To place the object
	 * @param {String} event.message.data.object To update
	 * @param {Number} event.message.data.x
	 * @param {Number} event.message.data.y
	 */
	universe.on("player:map:location", function(event) {
		var location = event.message.data.location,
			object = event.message.data.object,
			x = event.message.data.x,
			y = event.message.data.y;

		if(typeof(location) === "string") {
			location = universe.manager.location.object[location];
		}
		if(typeof(object) === "string") {
			object = universe.get(object);
		}

		if(location && object) {
			object.setValues({
				"location": location.id,
				"x": x,
				"y": y
			});
		}
	});
};
