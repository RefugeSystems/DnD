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

module.exports.initialize = function(universe) {
	universe.on("player:delete:object", function(event) {
		if(event.player.gm) {
			if(event.message.data.id) {
				universe.getObject(event.message.data.id, function(err, object) {
					if(err) {
						universe.emit("send", {
							"type": "notice",
							"mid": "delete:object",
							"recipient": event.player.id,
							"message": "Error finding object: " + event.message.data.id,
							"icon": "fas fa-exclamation-triangle rs-lightred",
							"anchored": true
						});
					} else if(object) {
						universe.deleteObject(object, function(err) {
							if(err) {
								universe.emit("send", {
									"type": "notice",
									"mid": "delete:object",
									"recipient": event.player.id,
									"message": "Failed to delete object: " + err.message,
									"icon": "fas fa-exclamation-triangle rs-lightred",
									"error": err,
									"anchored": true
								});
							} else {
								universe.emit("send", {
									"type": "notice",
									"mid": "delete:object",
									"recipient": event.player.id,
									"message": "Deleted: " + object.name,
									"icon": "fas fa-check rs-lightgreen",
									"timeout": 2000
								});
							}
						});
					} else {
						universe.emit("send", {
							"type": "notice",
							"mid": "delete:object",
							"recipient": event.player.id,
							"message": "No Matching ID",
							"icon": "fas fa-exclamation-triangle rs-lightyellow",
							"details": {
								"id": event.message.data.id
							},
							"timeout": 2000
						});
					}
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"mid": "universe:error",
					"recipient": event.player.id,
					"message": "System error: No ID present",
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"anchored": true
				});
			}
		} else {
			universe.emit("send", {
				"type": "notice",
				"mid": "delete:object",
				"recipient": event.player.id,
				"message": "Only GMs can delete objects here",
				"icon": "fas fa-exclamation-triangle rs-lightyellow",
				"anchored": true
			});
		}
	});
};