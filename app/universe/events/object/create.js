var cleanID = new RegExp("[^a-z0-9_:]", "g"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {
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
	universe.on("player:create:object", function(event) {
		if(event.player.gm) {
			var classification = event.message.data.classification,
				details = event.message.data.details,
				release;

			if(details) {
				if(details.id) {
					details.id = details.id.toLowerCase().replace(cleanID, "");
				} else {
					details.id = Random.identifier(classification, 10, 32).toLowerCase();
				}

				universe.modifyObject(details, function(err, object) {
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
						// If Tracking a release in the universe, note modifications to this object through this hook (Event for the noun editor)
						release = universe.getActiveRelease();
						if(release && (!release.associations || release.associations.indexOf(object.id) === -1) && !universe.manager[object._class].attribute.no_track_release) {
							release.addValues({
								"associations": [object.id]
							});
						}

						// Emit change notice
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

	/**
	 * 
	 * @event player:shim:object
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
	universe.on("player:shim:object", function(event) {
			var classification = event.message.data.classification,
				details = event.message.data.details,
				entity = event.message.data.entity,
				recipients = {},
				cleaned = {},
				release;

		recipients[event.player.id] = true;
		recipients["player:master"] = true;

		entity = universe.get(entity);
		if(classification && details && entity) {
			if(details.id) {
				cleaned.id = details.id.toLowerCase().replace(cleanID, "");
			} else {
				cleaned.id = Random.identifier(classification, 10, 32).toLowerCase();
			}
			cleaned.name = details.name;
			cleaned.icon = details.icon;
			cleaned.description = details.description;
			cleaned.level = details.level;
			cleaned.character = entity.id;
			cleaned.creator = entity.id;
			cleaned.review = true;

			universe.modifyObject(cleaned, function(err, object) {
				if(err) {
					console.log("Err: ", err);
					universe.emit("send", {
						"type": "notice",
						"mid": "create:object",
						"recipients": recipients,
						"message": "Failed to create object: " + err.message,
						"icon": "fas fa-exclamation-triangle rs-lightred",
						"error": err,
						"anchored": true
					});
				} else {
					// If Tracking a release in the universe, note modifications to this object through this hook (Event for the noun editor)
					release = universe.getActiveRelease();
					if(release && (!release.associations || release.associations.indexOf(object.id) === -1) && !universe.manager[object._class].attribute.no_track_release) {
						release.addValues({
							"associations": [object.id]
						});
					}

					entity.addValues({
						"inventory": [object.id]
					});

					// Emit change notice
					universe.emit("send", {
						"type": "notice",
						"mid": "create:object",
						"recipients": recipients,
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
				"recipients": recipients,
				"message": "System error: Missing key details",
				"icon": "fas fa-exclamation-triangle rs-lightred",
				"anchored": true
			});
		}
	});
};
