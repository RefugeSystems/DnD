var	Random = require("rs-random");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:meeting:activity:info:add
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
	 * @param {String} event.message.data.info
	 * @param {String} event.message.data.meeting
	 * @param {Array} [event.message.data.name]
	 * @param {Array} [event.message.data.icon]
	 */
	universe.on("player:meeting:activity:info:add", function(event) {
		if(event.player.gm) {
			var entities = event.message.data.entities,
				meeting = event.message.data.meeting,
				name = event.message.data.name,
				icon = event.message.data.icon,
				id = event.message.data.info,
				entry = {},
				loading,
				info,
				i;

			info = universe.get(id);
			if(typeof(meeting) === "string") {
				meeting = universe.get(meeting);
			}
			
			if(info && meeting) {
				if(entities instanceof Array) {
					entry.entities = entities;
				} else {
					entities = meeting.entities;
					entry.entities = entities;
				}

				entry.name = name || info.name || "Activity";
				entry.icon = icon || "";
				entry.is_active = true;
				entry.ongoing = true;
				entry.time = universe.time;
				entry.date = Date.now();
				entry.info_id = info.id;
				entry.type = "info";
				entry.id = info.id;
				entry = [entry];
				for(i=0; i<entities.length; i++) {
					loading = universe.get(entities[i]);
					if(loading) {
						console.log("   ! " + loading.name);
						loading.addValues({
							"active_events": entry
						});
					}
				}
				meeting.addValues({
					"historical_events": entry
				});
			} else {
				console.log("Invalid data for reference activity");
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to add a reference active event", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
	/**
	 * 
	 * @event player:meeting:activity:info:sub
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
	 * @param {String} event.message.data.info
	 * @param {String} event.message.data.meeting
	 * @param {Array} [event.message.data.name]
	 * @param {Array} [event.message.data.icon]
	 */
	universe.on("player:meeting:activity:info:sub", function(event) {
		if(event.player.gm) {
			var entities = event.message.data.entities,
				meeting = event.message.data.meeting,
				name = event.message.data.name,
				icon = event.message.data.icon,
				id = event.message.data.info,
				entry = {},
				loading,
				info,
				i;

			if(typeof(meeting) === "string") {
				meeting = universe.get(meeting);
			}
			
			if(id && meeting) {
				if(entities instanceof Array) {
					entry.entities = entities;
				} else {
					entities = meeting.entities;
					entry.entities = entities;
				}
				
				info = {
					"active_events": [id]
				};
				for(i=0; i<entities.length; i++) {
					loading = universe.get(entities[i]);
					if(loading) {
						loading.subValues(info);
					}
				}

				entry.name = name || "Ended Activity";
				entry.icon = icon || "";
				entry.time = universe.time;
				entry.date = Date.now();
				entry.type = "info";
				entry.info_id = info;
				entry = [entry];
				meeting.addValues({
					"historical_events": entry
				});
			} else {
				console.log("No meeting for timer");
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to add a reference active event", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};
