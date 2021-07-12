const { clearNonPrintableCharacter } = require("xss");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:equip:items
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
	 * @param {Array | String} event.message.data.items
	 */
	universe.on("player:equip:items", function(event) {
		console.log("Equip: ", event.message.data);
		var entity = event.message.data.entity,
			items = event.message.data.items,
			equip = [],
			item,
			set,
			i;
		
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		if(entity && entity.inventory && items && items.length) {
			set = {
				"user": entity.id
			};
			for(i=0; i<items.length; i++) {
				item = universe.manager.item.object[items[i]];
				if(item && entity.inventory.indexOf(item.id) !== -1) {
					item.setValues(set);
					equip.push(item.id);
				}
			}
			if(equip.length) {
				entity.addValues({"equipped": equip}, function(err) {
					if(err) {
						// TODO: Better logging
						universe.handleError("equipment:equip", err);
						console.error(err);
					} else {
						var slots = Object.keys(entity.equip_slots),
							warnings = [],
							notify,
							slot,
							j;
						for(j=0; j<slots.length; j++) {
							if(entity.equip_slots[slots[j]] < 0 && (slot = universe.manager.slot.object[slots[j]])) {
								warnings.push(slot.name);
							}
						}
						if(warnings.length) {
							notify = Object.assign({}, universe.getMasters());
							notify[event.player.id] = true;
							universe.emit("send", {
								"type": "notice",
								"icon": "fas fa-exclamation-triangle rs-lightred",
								"recipients": notify,
								"message": entity.name + " is over-equipped in some slots: " + warnings.join(", "),
								"data": event.message.data,
								"anchored": true
							});
						}
					}
				});
			} else {
				console.log("nothing to equi[p");
			}
		} else {
			console.log("No entity");
		}
	});

	/**
	 * 
	 * @event player:unequip:items
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
	 * @param {Array | String} event.message.data.items
	 */
	universe.on("player:unequip:items", function(event) {
		var entity = event.message.data.entity,
			items = event.message.data.items,
			equip = [],
			item,
			set,
			i;
		
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		if(entity && items && items.length) {
			set = {
				"user": null
			};
			for(i=0; i<items.length; i++) {
				item = universe.manager.item.object[items[i]];
				if(item) {
					item.setValues(set);
					equip.push(item.id);
				}
			}
			if(equip.length) {
				entity.subValues({"equipped": equip});
			}
		}
	});

	/**
	  * Only works for items where `is_copy` is true. This is essentially to protect
	  * the parent data, though should be inconsequential.
	 * @event player:items:verstility:2handed
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
	 * @param {Array | String} event.message.data.items
	 */
	universe.on("player:items:verstility:1handed", function(event) {
		var entity = event.message.data.entity,
			items = event.message.data.items,
			item,
			i;
		
		if(typeof(entity) === "string") {
			entity = universe.manager.item.object[entity];
		}
		if(entity && entity.inventory && items && items.length) {
			for(i=0; i<items.length; i++) {
				item = universe.get(items[i]);
				if(item && item.is_copy && entity.inventory.indexOf(item.id) !== -1 && item.versatile && item.versatility[1] && item.parent !== item.versatility[1]) {
					item.setValues({
						"parent": item.versatility[1]
					});
				}
			}
		}
	});

	 /**
	  * Only works for items where `is_copy` is true. This is essentially to protect
	  * the parent data, though should be inconsequential.
	  * @event player:items:verstility:2handed
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
	  * @param {Array | String} event.message.data.items
	  */
	universe.on("player:items:verstility:2handed", function(event) {
		var entity = event.message.data.entity,
			items = event.message.data.items,
			item,
			i;
		
		if(typeof(entity) === "string") {
			entity = universe.manager.item.object[entity];
		}
		if(entity && entity.inventory && items && items.length) {
			for(i=0; i<items.length; i++) {
				item = universe.get(items[i]);
				if(item && item.is_copy && entity.inventory.indexOf(item.id) !== -1 && item.versatile && item.versatility[2] && item.parent !== item.versatility[2]) {
					item.setValues({
						"parent": item.versatility[2]
					});
				}
			}
		}
	});
};