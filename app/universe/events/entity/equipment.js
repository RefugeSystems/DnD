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
			main,
			item,
			set,
			i;
		
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		if(entity && entity.inventory && items && items.length && (entity.owned[event.player.id] || event.player.gm)) {
			set = {
				"user": entity.id
			};
			for(i=0; i<items.length; i++) {
				item = universe.manager.item.object[items[i]];
				if(item && entity.inventory.indexOf(item.id) !== -1 && entity.equipped.indexOf(item.id) === -1) {
					if(!entity.main_weapon && (item.melee || item.ranged || item.thrown)) {
						main = item.id;
					}
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
								"timeout": 15000,
								"anchored": true
							});
						}
					}
				});
				if(main) {
					entity.setValues({
						"main_weapon": main
					});
				}
				/**
				 * 
				 * @event entity:equipped
				 * @for RSObject
				 * @param {Array} equipment
				 * @param {Number} time
				 * @param {Number} date
				 */
				entity.fireHandlers("entity:equipped", {
					"equipment": equip
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
			unmain,
			item,
			set,
			i;
		
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		if(entity && items && items.length && (entity.owned[event.player.id] || event.player.gm)) {
			set = {
				"user": null
			};
			for(i=0; i<items.length; i++) {
				item = universe.manager.item.object[items[i]];
				if(item) {
					if(entity.main_weapon === item.id) {
						unmain = true;
					}
					item.setValues(set);
					equip.push(item.id);
				}
			}
			if(equip.length) {
				entity.subValues({"equipped": equip});
				if(unmain) {
					entity.setValues({
						"main_weapon": null
					});
				}
				/**
				 * 
				 * @event entity:unequipped
				 * @for RSObject
				 * @param {Array} equipment
				 * @param {Number} time
				 * @param {Number} date
				 */
				entity.fireHandlers("entity:unequipped", {
					"equipment": equip
				});
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
		if(entity && entity.inventory && items && items.length && (entity.owned[event.player.id] || event.player.gm)) {
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
		if(entity && entity.inventory && items && items.length && (entity.owned[event.player.id] || event.player.gm)) {
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

	/**
	  * 
	 * @event player:item:mainhand
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
	 * @param {String} event.message.data.item ID or null to clear hand
	 */
	universe.on("player:item:mainhand", function(event) {
		var entity = event.message.data.entity,
			item = event.message.data.item,
			notify = {},
			id;
		
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		if(entity && (entity.owned[event.player.id] || event.player.gm)) {
			if(item) {
				if(typeof(item) === "string" && universe.manager.item.object[item]) {
					item = universe.manager.item.object[item];
					id = item.id;
				} else if(typeof(item) === "object" && universe.manager.item.object[item.id]) {
					id = item.id;
				} else {
					item = null;
					id = null;
				}
			} else {
				item = null;
				id = null;
			}
			if(entity) {
				if(id && entity.equipped.indexOf(id) === -1) {
					notify = Object.assign({}, universe.getMasters());
					notify[event.player.id] = true;
					universe.emit("send", {
						"type": "notice",
						"icon": "fas fa-exclamation-triangle rs-lightred",
						"recipients": notify,
						"message": entity.name + " can not equip " + item.name + " to their main hand unless they have that item equipped",
						"data": event.message.data,
						"timeout": 7000,
						"anchored": true
					});
				} else {
					entity.setValues({
						"main_weapon": id
					});
					notify[event.player.id] = true;
					universe.emit("send", {
						"type": "notice",
						"icon": "fas fa-check rs-lightgreen",
						"recipients": notify,
						"message": item?entity.name + " equip " + item.name + " to their main hand":"Main hand unequipped",
						"data": event.message.data,
						"timeout": 7000,
						"anchored": true
					});
					/**
					 * 
					 * @event entity:mainhand
					 * @for RSObject
					 * @param {Array} equipment
					 * @param {Number} time
					 * @param {Number} date
					 */
					entity.fireHandlers("entity:equipped:mainhand", {
						"item": id
					});
				}
			} else {
				notify[event.player.id] = true;
				universe.emit("send", {
					"type": "notice",
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"recipients": notify,
					"message": "Unable to equip, creature missing",
					"data": event.message.data,
					"anchored": true
				});
			}
		}
	});
};
