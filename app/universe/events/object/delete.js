module.exports.initialize = function(universe) {

	var deleteObject = function(event, id) {
		universe.getObject(id, function(err, object) {
			if(err) {
				universe.emit("send", {
					"type": "notice",
					"mid": "delete:object",
					"recipient": event.player.id,
					"message": "Error finding object: " + id,
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
						"id": id
					},
					"timeout": 2000
				});
			}
		});
	};

	/**
	 * 
	 * @event player:delete:object
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
	 */
	universe.on("player:delete:object", function(event) {
		if(event.player.gm) {
			if(event.message.data.id) {
				deleteObject(event, event.message.data.id);
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

	/**
	 * 
	 * @event player:delete:objects
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
	 * @param {Array | String} event.message.objects Typical location of data from the UI
	 */
	universe.on("player:delete:objects", function(event) {
		var i;

		if(event.player.gm) {
			if(event.message.data.objects) {
				for(i=0; i<event.message.data.objects.length; i++) {
					deleteObject(event, event.message.data.objects[i]);
				}
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

	/**
	 * 
	 * @event player:delete:objects
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
	 * @param {Array | String} event.message.objects Typical location of data from the UI
	 */
	universe.on("player:delete:flag", function(event) {
		var object,
			i;

		if(event.player.gm) {
			if(event.message.data.objects) {
				for(i=0; i<event.message.data.objects.length; i++) {
					object = universe.get(event.message.data.objects[i]);
					if(object) {
						object.setValues({
							"is_deletable": true
						});
					}
				}
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
