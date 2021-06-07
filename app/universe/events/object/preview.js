/**
 * 
 * @event player:preview:object
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
	universe.on("player:preview:object", function(event) {
		var classification = event.message.data.classification,
			details = event.message.data.details;

		details.id = classification + ":preview:" + event.player.id;
		details.obscured = true;

		universe.createObject(details, function(err, object) {
			if(err) {
				universe.emit("send", {
					"type": "notice",
					"mid": "create:object",
					"recipient": event.player.id,
					"message": "Failed to generate object preview: " + err.message,
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"error": err,
					"anchored": true
				});
			} else {
				console.log("Preview Generated: ", object.toJSON());
			}
		});
	});
};
