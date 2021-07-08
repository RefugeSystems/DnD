
module.exports.initialize = function(universe) {

	/**
	 * 
	 * @event player:spell:prepare
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
	 * @param {String} event.message.data.entity
	 * @param {Array | String} event.message.data.spells
	 */
	universe.on("player:spells:prepare", function(event) {
		var entity = event.message.data.entity,
			spells = event.message.data.spells,
			prepared = [],
			notify,
			spell,
			i;

		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		
		if(entity && entity.spells_known && entity.spells && spells && spells.length) {
			for(i=0; i<spells.length; i++) {
				spell = universe.manager.spell.object[spells[i]];
				if(spell && !spell.disabled && !spell.is_preview && entity.spells_known[spell.id]) {
					prepared.push(spell.id);
				}
			}

			if(prepared.length) {
				entity.addValues({"spells": prepared}, function(err) {
					if(err) {
						// TODO: Better logging
						universe.handleError("equipment:equip", err);
						console.error(err);
					} else {
						if(entity._data.spells && typeof(entity.spells_maximum) === "number" && entity._data.spells.length > entity.spells_maximum) {
							notify = Object.assign({}, universe.getMasters());
							notify[event.player.id] = true;
							universe.emit("send", {
								"type": "notice",
								"icon": "fas fa-exclamation-triangle rs-lightred",
								"recipients": notify,
								"message": entity.name + " knows " + entity._data.spells.length + " Spells and has a maximum memorization of " + entity.spells_maximum,
								"data": event.message.data,
								"anchored": true
							});
						}
					}
				});
			}
		}
	});

	/**
	 * 
	 * @event player:spell:unprepare
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
	 * @param {String} event.message.data.entity
	 * @param {Array | String} event.message.data.spells
	 */
	universe.on("player:spells:unprepare", function(event) {
		var entity = event.message.data.entity,
			spells = event.message.data.spells,
			prepared = [],
			spell,
			set,
			i;

		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		
		if(entity && entity.spells_known && entity.spells && spells && spells.length) {
			for(i=0; i<spells.length; i++) {
				spell = universe.manager.spell.object[spells[i]];
				if(spell && !spell.disabled && !spell.is_preview) {
					prepared.push(spell.id);
				}
			}

			if(prepared.length) {
				entity.subValues({"spells": prepared});
			}
		}
	});
};
