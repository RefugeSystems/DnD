
module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:inventory:hide
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
	 * @param {Object} event.message.data.entity
	 * @param {Object} event.message.data.items
	 */
	universe.on("player:inventory:hide", function(event) {
		var entity = universe.get(event.message.data.entity),
			map = entity.inventory_hidden || {},
			items = event.message.data.items,
			i;
	
		if(event.player.gm || entity.owned[event.player.id] || entity.played_by === event.player.id) {
			for(i=0; i<items.length; i++) {
				map[items[i]] = true;
			}

			entity.setValues({
				"inventory_hidden": map
			});
		}
	});


	universe.on("player:refill:one", function(event) {
		var packPrice = parseFloat(universe.get("setting:price:pack") || .1),
			entity = universe.get(event.message.data.entity),
			object = universe.get(event.message.data.object),
			notification = {};

		notification.recipients = {};	
		notification.recipients[event.player.id] = true;
		notification.type = "notice";
		notification.timeout = 15000;
		notification.anchored = true;

		if(entity && object && entity.inventory.contains(object.id) && (entity.owned[event.player.id] || event.player.gm)) {
			if(object.charges_max && object.charges < object.charges_max) {
				if(packPrice <= entity.gold) {
					entity.subValues({
						"gold": packPrice
					});
					object.addValues({
						"charges": 1
					});
					notification.message = entity.name + " refilled 1 charge to " + object.name + " for " + packPrice + " gold";
					notification.icon = "fa-kit fa-regular-backpack-circle-check rs-green";
				} else {
					notification.message = entity.name + " can't pay the " + packPrice + " gold to refill " + object.name;
					notification.icon = "game-icon game-icon-two-coins rs-light-red";
				}
			} else {
				notification.message = object.name + " has no need for charges";
				notification.icon = "fa-kit fa-regular-backpack-circle-plus rs-yellow";
			}
		} else {
			notification.message = entity.name + " can't refill " + object.name + " as they do not have it";
			notification.icon = "fa-kit fa-regular-backpack-circle-plus rs-light-red";
		}

		universe.emit("send", notification);
	});

	universe.on("player:refill:all", function(event) {
		var packPrice = parseFloat(universe.get("setting:price:pack") || .1),
			entity = universe.get(event.message.data.entity),
			object = universe.get(event.message.data.object),
			notification = {};

		notification.recipients = {};	
		notification.recipients[event.player.id] = true;
		notification.type = "notice";
		notification.timeout = 15000;
		notification.anchored = true;

		if(entity && object && entity.inventory.contains(object.id) && (entity.owned[event.player.id] || event.player.gm)) {
			if(object.charges_max && object.charges < object.charges_max) {
				packPrice = packPrice * (object.charges_max - object.charges);
				if(packPrice < entity.gold) {
					entity.subValues({
						"gold": packPrice
					});
					object.setValues({
						"charges": object.charges_max
					});
					notification.message = entity.name + " refilled " + object.name + " for " + packPrice + " gold";
					notification.icon = "fa-kit fa-regular-backpack-circle-check rs-green";
				} else {
					notification.message = entity.name + " can't pay the " + packPrice + " gold to refill " + object.name;
					notification.icon = "game-icon game-icon-two-coins rs-light-red";
				}
			} else {
				notification.message = object.name + " has no need for charges";
				notification.icon = "fa-kit fa-regular-backpack-circle-plus rs-yellow";
			}
		} else {
			notification.message = entity.name + " can't refill " + object.name + " as they do not have it";
			notification.icon = "fa-kit fa-regular-backpack-circle-plus rs-light-red";
		}

		universe.emit("send", notification);
	});

	/**
	 * 
	 * @event player:inventory:reveal
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
	 * @param {Object} event.message.data.entity
	 * @param {Object} event.message.data.items
	 */
	 universe.on("player:inventory:reveal", function(event) {
		var entity = universe.get(event.message.data.entity),
			map = entity.inventory_hidden || {},
			items = event.message.data.items,
			i;
	
	
		if(event.player.gm || entity.owned[event.player.id] || entity.played_by === event.player.id) {
			for(i=0; i<items.length; i++) {
				map[items[i]] = false;
			}
			
			entity.setValues({
				"inventory_hidden": map
			});
		}
	});

	/**
	 * 
	 * @event player:inventory:sharing
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
	 * @param {Object} event.message.data.entity
	 * @param {Object} event.message.data.state
	 */
	 universe.on("player:inventory:sharing", function(event) {
		var entity = universe.get(event.message.data.entity),
			state = event.message.data.state,
			i;
	
		if(event.player.gm || entity.owned[event.player.id] || entity.played_by === event.player.id) {
			entity.setValues({
				"inventory_share": state
			});
		}
	});

	/**
	 * 
	 * @event player:inventory:pickup
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
	 * @param {Object} event.message.data.entity
	 * @param {Object} event.message.data.item
	 */
	 universe.on("player:inventory:pickup", function(event) {
		var entity = universe.get(event.message.data.entity),
			item = universe.get(event.message.data.item),
			meeting = universe.getCurrentMeeting();
	
		if(entity && item && item.location === entity.location) {
			entity.addValues({
				"inventory": item.id
			});
			if(!item.is_singular || item.is_unique) {
				item.setValues({
					"acquired_on": meeting?meeting.id:undefined,
					"acquire": universe.getTime(),
					"location": null
				});
			} else {
				item.setValues({
					"location": null
				});
			}
		}
	});

	/**
	 * Entity must have a location and an X & Y coordinate
	 * @event player:inventory:place
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
	 * @param {String} event.message.data.item
	 * @param {Number} [event.message.data.x] Optional X coordinate. Defaults to entity X location.
	 * @param {Number} [event.message.data.y] Optional Y coordinate. Defaults to entity Y location.
	 * @param {Number} [event.message.data.y] Optional Z coordinate. Defaults to entity Z location.
	 */
	 universe.on("player:inventory:place", function(event) {
		var entity = universe.get(event.message.data.entity),
			item = universe.get(event.message.data.item),
			x = event.message.data.x,
			y = event.message.data.y,
			z = event.message.data.z;
	
		if(entity && typeof(entity.x) === "number" && typeof(entity.y) === "number" && entity.location && entity.inventory.indexOf(item.id) !== -1) {
			entity.subValues({
				"inventory": item.id
			});
			item.setValues({
				"z": typeof(z) === "number"?z:entity.z || 0,
				"x": typeof(x) === "number"?x:entity.x,
				"y": typeof(y) === "number"?y:entity.y,
				"location": entity.location
			});
		}
	});
};
