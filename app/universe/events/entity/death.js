module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:death:save
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
	universe.on("player:death:save", function(event) {
		universe.getObject(event.message.data.entity, function(err, object) {
			if(err) {
				// TODO:
				console.log("Err: ", err);
			} else {
				if(!object.death_save || object.death_save < 3) {
					object.addValues({
						"death_save": 1
					});
					universe.chronicle.addOccurrence("entity:death:save", {
						"entity": object.id
					});
				}
			}
		});
	});

	/**
	 * 
	 * @event player:death:unsave
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
	 * @param {Object} event.message.data.entity
	 */
	universe.on("player:death:unsave", function(event) {
		universe.getObject(event.message.data.entity, function(err, object) {
			if(err) {
				// TODO:
				console.log("Err: ", err);
			} else {
				if(object.death_save && 0 < object.death_save) {
					object.addValues({
						"death_save": -1
					});
					// TODO: Clear Chronicle? Possible only chronicle actual death and when someone goes down
					// universe.chronicle.addOccurrence("entity:death:save", {
					// 	"entity": object.id
					// });
				}
			}
		});
	});

	/**
	 * 
	 * @event player:death:fail
	 * @for Universe
	 */
	universe.on("player:death:fail", function(event) {
		universe.getObject(event.message.data.entity, function(err, object) {
			if(err) {
				// TODO:
				console.log("Err: ", err);
			} else {
				if(!object.death_fail || object.death_fail < 3) {
					object.addValues({
						"death_fail": 1
					});
					universe.chronicle.addOccurrence("entity:death:fail", {
						"entity": object.id
					});
				}
			}
		});
	});

	/**
	 * 
	 * @event player:death:unfail
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
	 * @param {Object} event.message.data.entity
	 */
	universe.on("player:death:unfail", function(event) {
		universe.getObject(event.message.data.entity, function(err, object) {
			if(err) {
				// TODO:
				console.log("Err: ", err);
			} else {
				if(object.death_fail && 0 < object.death_fail) {
					object.addValues({
						"death_fail": -1
					});
					// TODO: Clear Chronicle? Possible only chronicle actual death and when someone goes down
					// universe.chronicle.addOccurrence("entity:death:save", {
					// 	"entity": object.id
					// });
				}
			}
		});
	});
};
