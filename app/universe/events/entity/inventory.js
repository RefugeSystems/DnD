
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
		console.log("Hide: ", event.message.data);
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
		console.log("Reveal: ", event.message.data);
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
		console.log("Reveal: ", event.message.data);
		var entity = universe.get(event.message.data.entity),
			state = event.message.data.state,
			i;
	
		if(event.player.gm || entity.owned[event.player.id] || entity.played_by === event.player.id) {
			entity.setValues({
				"inventory_share": state
			});
		}
	});
};
