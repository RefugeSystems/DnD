var	Random = require("rs-random");

module.exports.initialize = function(universe) {
	var activeTimers = {};

	/**
	 * 
	 * @event player:meeting:timer
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
	 * @param {String} event.message.data.id
	 * @param {String} event.message.data.meeting
	 * @param {Number} event.message.data.duration
	 * @param {Array} [event.message.data.entities] Defaults to meeting entities
	 * @param {Array} [event.message.data.is_active]
	 * @param {Array} [event.message.data.name]
	 * @param {Array} [event.message.data.icon]
	 */
	universe.on("player:meeting:timer", function(event) {
		if(event.player.gm) {
			var duration = event.message.data.duration,
				entities = event.message.data.entities,
				meeting = event.message.data.meeting,
				active = event.message.data.is_active,
				name = event.message.data.name,
				icon = event.message.data.icon,
				id = event.message.data.id,
				entry = {},
				timer = {},
				loading,
				i;

			if(typeof(meeting) === "string") {
				meeting = universe.get(meeting);
			}
			if(id && meeting && duration) {
				timer.id = id;
				timer.icon = icon || "fa-duotone fa-hourglass";
				timer.name = name || "Timer";
				timer.timer_mark = Date.now() + duration;
				timer.is_active = active;
				timer.countdown = true;
				timer.ongoing = true;
				timer.type = "timer";
				activeTimers[id] = entry;
				timer = [timer];
				if(!(entities instanceof Array)) {
					entities = meeting.entities;
				}
				entry.name = "Starting Timer: " + (name || id);
				entry.entities = entities;
				entry.time = universe.time;
				entry.data = Date.now();
				entry.timer = timer;
				for(i=0; i<entities.length; i++) {
					loading = universe.get(entities[i]);
					if(loading) {
						loading.addValues({
							"active_events": timer
						});
					}
				}
				meeting.addValues({
					"historical_events": [entry]
				});
			} else {
				console.log("No meeting for timer");
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to start a timer", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
	/**
	 * 
	 * @event player:meeting:untime
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
	 * @param {String} event.message.data.id
	 * @param {String} event.message.data.meeting
	 * @param {Array} [event.message.data.entities] Defaults to active timer entities or meeting entities if no matching
	 * 		active timer is found.
	 */
	universe.on("player:meeting:untime", function(event) {
		if(event.player.gm) {
			var entities = event.message.data.entities,
				meeting = event.message.data.meeting,
				id = event.message.data.id,
				entry = Object.assign({}, activeTimers[id] || {}),
				name = entry.timer?entry.timer.name:null,
				loading,
				timer,
				i;

			if(typeof(meeting) === "string") {
				meeting = universe.get(meeting);
			}
			if(id && meeting) {
				delete(activeTimers[id]);
				timer = [id];
				if(!(entities instanceof Array)) {
					if(entry.entities) {
						entities = entry.entities;
					} else {
						entities = meeting.entities;
						entry.entities = entities;
					}
				} else {
					entry.entities = entities;
				}
				entry.name = "Removing Timer: " + (name || id);
				entry.time = universe.time;
				entry.data = Date.now();
				for(i=0; i<entities.length; i++) {
					loading = universe.get(entities[i]);
					if(loading) {
						loading.subValues({
							"active_events": timer
						});
					}
				}
				meeting.addValues({
					"historical_events": [entry]
				});
			} else {
				console.log("No meeting for timer");
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to start a timer", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};
