module.exports.initialize = function(universe) {
	
	/**
	 * 
	 * @event player:master:quick:set
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
	 * @param {String} event.message.data.field
	 * @param {String | Number | Boolean} event.message.data.value
	 */
	universe.on("player:quick:set", function(event) {
		var source = event.player.attribute.playing_as,
			object = event.message.data.object,
			field = event.message.data.field,
			value = event.message.data.value,
			set = {};

		if(typeof(object) === "string") {
			object = universe.get(object);
		}
		if(object && (event.player.gm || source === object.character || source === object.caster || source == object.source || source == object.user || object.owned[event.player.id])) {
			set[field] = value;
			object.setValues(set);
		}
	});

	/**
	 * 
	 * @event player:master:quick:add
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
	 * @param {String} event.message.data.field
	 * @param {String | Number | Boolean} event.message.data.value
	 */
	universe.on("player:quick:add", function(event) {
		var source = event.player.attribute.playing_as,
			object = event.message.data.object,
			field = event.message.data.field,
			value = event.message.data.value,
			set = {};

		if(typeof(object) === "string") {
			object = universe.get(object);
		}
		if(object && (event.player.gm || source === object.character || source === object.caster || source == object.source || source == object.user || object.owned[event.player.id])) {
			set[field] = value;
			object.addValues(set);
		}
	});

	/**
	 * 
	 * @event player:master:quick:sub
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
	 * @param {String} event.message.data.field
	 * @param {String | Number | Boolean} event.message.data.value
	 */
	universe.on("player:master:quick:sub", function(event) {
		var source = event.player.attribute.playing_as,
			object = event.message.data.object,
			field = event.message.data.field,
			value = event.message.data.value,
			set = {};

		if(typeof(object) === "string") {
			object = universe.get(object);
		}
		if(object && (event.player.gm || source === object.character || source === object.caster || source == object.source || source == object.user || object.owned[event.player.id])) {
			set[field] = value;
			object.subValues(set);
		}
	});
};
