/**
 * 
 * @event player:create:object
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
 */

var cleanID = new RegExp("[^a-z0-9_:]", "g"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {
	universe.on("player:create:object", function(event) {
		if(event.player.gm) {
			var classification = event.message.data.classification,
				details = event.message.data.details;

			if(details) {
				if(details.id) {
					details.id = details.id.toLowerCase().replace(cleanID, "");
				} else {
					details.id = Random.identifier(classification, 10, 32).toLowerCase();
				}

				universe.createObject(details, function(err, object) {
					if(err) {
						console.log("Err: ", err);
						universe.emit("send", {
							"type": "notice",
							"mid": "create:object",
							"recipient": event.player.id,
							"message": "Failed to create object: " + err.message,
							"icon": "fas fa-exclamation-triangle rs-lightred",
							"error": err,
							"anchored": true
						});
					} else {
						universe.emit("send", {
							"type": "notice",
							"mid": "create:object",
							"recipient": event.player.id,
							"message": "Complete: " + (object.name || object.id),
							"icon": "fas fa-check rs-lightgreen",
							"timeout": 2000
						});
					}
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"mid": "universe:error",
					"recipient": event.player.id,
					"message": "System error: No details present",
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"anchored": true
				});
			}
		} else {
			universe.emit("send", {
				"type": "notice",
				"mid": "create:object",
				"recipient": event.player.id,
				"message": "Only GMs can create objects here",
				"icon": "fas fa-exclamation-triangle rs-lightyellow",
				"anchored": true
			});
		}
	});
};