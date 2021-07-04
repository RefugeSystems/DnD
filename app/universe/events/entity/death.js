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

/**
 * 
 * @event player:death:fail
 * @for Universe
 */

module.exports.initialize = function(universe) {
	universe.on("player:death:save", function(event) {
		console.log("Death Save: ", event.message.data);
		universe.getObject(event.message.data.entity, function(err, object) {
			if(err) {
				// TODO:
				console.log("Err: ", err);
			} else {
				console.log("Saving...: ", object.death_save);
				if(!object.death_save || object.death_save < 3) {
					object.addValues({
						"death_save": 1
					});
					universe.chronicler.addOccurrence("entity:death:save", {
						"entity": object.id
					});
				}
			}
		});
	});

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
					universe.chronicler.addOccurrence("entity:death:fail", {
						"entity": object.id
					});
				}
			}
		});
	});
};
