
var Random = require("rs-random");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:skirmish:create
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
	 */
	universe.on("player:skirmish:create", function(event) {
		console.log("Create Incoming: ", event.message.data);
		var details = {};
		if(event.player.gm) {
			details.id = Random.identifier("skirmish", 10, 32).toLowerCase();
			details.is_active = true;
			universe.createObject(details);
		}
	});

	/**
	 * 
	 * @event player:skirmish:finish
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
	 * @param {Object} event.message.data.skirmish
	 */
	universe.on("player:skirmish:finish", function(event) {
		console.log("Finish Incoming: ", event.message.data);
		var skirmish = event.message.data.skirmish,
			entity,
			i;

		if(typeof(skirmish) === "string") {
			skirmish = universe.manager.skirmish.object[skirmish];
		}
		if(skirmish && event.player.gm) {
			skirmish.setValues({
				"time_end": universe.time,
				"is_active": false
			});

			if(skirmish.entities && skirmish.entities.length) {
				for(i=0; i<skirmish.entities.length; i++) {
					entity = universe.manager.entity.object[skirmish.entities[i]];
					if(entity) {
						entity.setValues({
							"initiative": null
						});
					}
				}
			}

			universe.emit("send", {
				"type": "combat:end:skirmish",
				"skirmish": skirmish.id,
				"id": skirmish.id
			});
		}
	});
};
