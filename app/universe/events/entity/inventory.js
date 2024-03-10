
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
