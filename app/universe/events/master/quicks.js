module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:master:assume
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
	 * @param {String} event.message.data.entity
	 */
	universe.on("player:master:assume", function(event) {
		var entity = event.message.data.entity,
			attributes = Object.assign({}, event.player.attribute);
		if(entity && event.player.gm) {
			attributes.playing_as = entity;
			event.player.setValues({
				"attribute": attributes
			});
		}
	});
	/**
	 * 
	 * @event player:master:obscure
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
	 * @param {String} event.message.data.object
	 * @param {Boolean} event.message.data.obscured State
	 */
	universe.on("player:master:obscure", function(event) {
		var object = event.message.data.object;
		if(typeof(object) === "string") {
			object = universe.get(object);
		}
		if(object && event.player.gm) {
			object.setValues({
				"obscured": !!event.message.data.obscured
			});
		}
	});
	/**
	 * 
	 * @event player:master:recolor
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
	 * @param {String} event.message.data.object
	 * @param {Boolean} event.message.data.color
	 */
	universe.on("player:master:recolor", function(event) {
		var object = event.message.data.object;
		if(typeof(object) === "string") {
			object = universe.get(object);
		}
		console.log("Recolor: ", event.message.data);
		if(object && event.player.gm) {
			object.setValues({
				"color_flag": event.message.data.color
			});
		}
	});
};
