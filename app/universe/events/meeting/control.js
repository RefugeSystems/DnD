
var Random = require("rs-random");

module.exports.initialize = function(universe) {
	var second = 1000,
		minute = 60 * second,
		hour = 60 * minute,
		day = 24 * hour,
		week = 7 * day;

	var getNumber = new RegExp("([^0-9]+)([0-9]+)(.*)");

	var formatNumber = function(num) {
		if(num < 10) {
			return "000" + num;
		} else if(num < 100) {
			return "00" + num;
		} else if(num < 1000) {
			return "0" + num;
		} else {
			return num;
		}
	};

	var copy = function(source) {
		return JSON.parse(JSON.stringify(source));
	};

	/**
	 * 
	 * @event player:meeting:activate
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
	 * @param {String} event.message.data.meeting
	 */
	universe.on("player:meeting:activate", function(event) {
		var active = universe.manager.setting.object["setting:meeting"],
			meeting = event.message.data.meeting;
		
		if(active) {
			active = universe.manager.meeting.object[active.value];
			if(active && active.is_active) {
				active.setValues({
					"is_active": false
				});
			}
		}

		if(typeof(meeting) === "string") {
			meeting = universe.manager.meeting.object[meeting];
		}
		if(meeting) {
			universe.setTime(meeting.time, true);
			universe.manager.setting.object["setting:meeting"].setValues({
				"value": meeting.id
			});
			meeting.setValues({
				"is_active": true
			});
		} else {
			console.log("No Meeting Found: ", event.message.data.meeting);
		}
	});

	/**
	 * 
	 * @event player:meeting:generate
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
	 * @param {String} event.message.data.meeting
	 */
	universe.on("player:meeting:generate", function(event) {
		if(event.player.gm) {
			var meeting = event.message.data.meeting,
				generate,
				parts;

			if(typeof(meeting) === "string") {
				meeting = universe.manager.meeting.object[meeting];
			}
			if(meeting) {
				generate = {};
				parts = getNumber.exec(meeting.id);
				if(parts) {
					generate.id = parts[1] + formatNumber(parseInt(parts[2]) + 1) + (parts[3] || "");
				} else {
					generate.id = Random.identifier("meeting", 10, 32);
				}
				parts = getNumber.exec(meeting.name);
				if(parts) {
					generate.name = parts[1] + (parseInt(parts[2]) + 1) + (parts[3] || "");
				} else {
					generate.name = "Session";
				}

				generate.entities = copy(meeting.entities);
				generate.players = copy(meeting.players);
				generate.date = meeting.date + 2 * week;
				generate.meeting_previous = meeting.id;
				generate.time = universe.time;
				universe.createObject(generate, function(error, meet) {
					if(error) {
						universe.emit("send", {
							"type": "notice",
							"mid": "generate:meeting",
							"recipient": event.player.id,
							"message": "Meeting Creation Failed: " + error.message,
							"icon": "fas fa-exclamation-triangle rs-lightred",
							"error": error,
							"anchored": true
						});
					} else if(meet) {
						meeting.setValues({
							"time_end": universe.time,
							"meeting_next": meet.id
						});
					} else {
						console.log("No Error No Object?");
					}
				});
			} else {
				console.log("No Meeting? " + meeting.id);
			}
		} else {
			universe.emit("send", {
				"type": "notice",
				"mid": "generate:meeting",
				"recipient": event.player.id,
				"message": "Only Game Masters may generate Meetings",
				"icon": "fas fa-exclamation-triangle rs-lightred",
				"anchored": true
			});
		}
	});
};
