/**
 * 
 * @event player:give:copy
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
 * @param {Object} [event.message.data.source] Optional information information for the source of the copy
 * @param {Object} event.message.data.target To receive the object
 * @param {Object} event.message.data.object To be copied
 * @param {Object} event.message.data.field To which to add the copy, should essentially always be an Array
 */

var cleanID = new RegExp("[^a-z0-9_:]", "g"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {

	universe.on("player:give:copy", function(event) {
		if(event.player.gm) {
			var target = universe.get(event.message.data.target),
				object = universe.get(event.message.data.object),
				field = event.message.data.field, // TODO: Get actual field object for better checks?
				values = {},
				source,
				object;

			if(event.message.data.source) {
				source = universe.get(event.message.data.source);
			}

			if(object.is_template) {
				values.acquired = universe.time;

				if(object.duration) {
					values.expiration = universe.time + (parseInt(object.duration) || 0);
				}

				universe.copy(event.message.data.object, values, function(err, copy) {
					console.log("Copy Template: ", values, copy.id);
					if(copy.expiration) {
						// TODO: Setting an expiration in the far future then rewinding time invalidates the previous expirations as they
						//		are on the abandoned timeline. May need a fallback check on "time_end" field instead of relying on the
						//		chronicle. Or rescan all items and effects for future endings on a resumed forward.
						universe.chronicle.addOccurrence("object:expiration", {
							"target": target.id,
							"id": copy.id,
							"field": field
						}, copy.expiration);
					}
					values = {};
					values[field] = copy.id;
					target.addValues(values);
				});
			} else {
				values[field] = object.id;
				target.addValues(values);
			}
		} else {
			universe.emit("send", {
				"type": "notice",
				"mid": "universe:error",
				"recipients": universe.getMasters(),
				"message": "Access error: Non Game-Master Player attempted to give an item copy",
				"icon": "fas fa-exclamation-triangle rs-lightred",
				"anchored": true
			});
		}
	});
};