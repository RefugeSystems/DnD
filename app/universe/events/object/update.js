module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:update:object
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
	 * @param {Object} [event.message.data.set] Set these values
	 * @param {Object} [event.message.data.add] Add these values
	 * @param {Object} [event.message.data.sub] Sub these values
	 */
	universe.on("player:update:object", function(event) {
		var object = universe.get(event.message.data.id),
			add = event.message.data.add,
			sub = event.message.data.sub,
			set = event.message.data.set;
		if(object && event.player.gm) {
			if(add) {
				object.addValues(add);
			}
			if(set) {
				object.setValues(set);
			}
			if(sub) {
				object.subValues(sub);
			}
		}
	});
	/**
	 * 
	 * @event player:refresh:object
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
	 * @param {Object} [event.message.data.set] Set these values
	 * @param {Object} [event.message.data.add] Add these values
	 * @param {Object} [event.message.data.sub] Sub these values
	 */
	universe.on("player:refresh:object", function(event) {
		var object = universe.get(event.message.data.id);
		if(object && (event.player.gm || (object.owned && object.owned[event.player.id]))) {
			object.refresh();
		}
	});

	/**
	 * 
	 * @event player:object:describe
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
	 * @param {Object} event.message.id
	 */
	universe.on("player:object:describe", function(event) {
		var description = event.message.data.description,
			note = event.message.data.note,
			id = event.message.data.id,
			entity,
			object,
			set,
			x;

		if(id && (object = universe.get(id)) && (event.player.gm || ((entity = universe.get(object.character) || universe.get(object.caster) || universe.get(object.user)) && entity.owned[event.player.id]))) {
			// console.log(" [object:describe]>> ", event.message.data);
			set = {
				"description": description
			};
			if(event.player.gm && note !== undefined)  {
				set.note = note;
			}
			if(event.player.gm || !object.is_singular) {
				object.setValues(set);
			}
		} else {
			// TODO: Security Event
		}
	});
};
