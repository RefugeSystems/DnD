
module.exports.initialize = function(universe) {
	
	/**
	 * 
	 * @event player:items:attune
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
	universe.on("player:items:attune", function(event) {
		var entity = universe.get(event.message.data.entity),
			items = event.message.data.items,
			i;
		
		if(entity && items && items.length && (event.player.gm || entity.owned[event.player.id])) {
			for(i=0; i<items.length; i++) {
				universe.emit("action:item:attune", {
					"entity": entity,
					"item": items[i]
				});
			}
		}
	});
	
	/**
	 * 
	 * @event player:items:unattune
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
	 * @param {String} event.message.data.entity ID
	 * @param {Array} event.message.data.items Of Item IDs
	 */
	universe.on("player:items:unattune", function(event) {
		var entity = universe.get(event.message.data.entity),
			items = event.message.data.items,
			i;
		
		if(entity && items && items.length && (event.player.gm || entity.owned[event.player.id])) {
			for(i=0; i<items.length; i++) {
				universe.emit("action:item:unattune", {
					"entity": entity,
					"item": items[i]
				});
			}
		}
	});
	
	/**
	 * 
	 * @event action:item:attune
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.entity The event name being fired, should match this event's name
	 */
	universe.on("action:item:attune", function(event) {
		var entity = event.entity || event.source,
			item = event.item;

		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		if(typeof(item) === "string") {
			item = universe.manager.item.object[item];
		}
		
		if(entity && item && entity.inventory && entity.inventory.indexOf(item.id) !== -1) {
			if(item.attunes && !item.attunement_blocked && !entity.attunement_blocked && entity.attunements && entity.attunements.length < entity.attune_max) {
				item.setValues({
					"attuned_on": universe.time,
					"attuned_to": entity.id, // Potential future proofing
					"attuned": entity.id
				});
				entity.addValues({
					"attunements": [item.id]
				});
			}
			universe.notifyMasters(entity.name + " attuned to " + item.name);
		} else {
			universe.warnMasters("Attunement Failed", {
				"entity": entity.id,
				"item": item.id,
				"inventory": entity.inventory,
				"has?": entity.inventory?entity.inventory.indexOf(item.id) !== -1:"No Inventory"
			});
		}
	});

	/**
	 * 
	 * @event action:item:unattune
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.entity The event name being fired, should match this event's name
	 */
	 universe.on("action:item:unattune", function(event) {
		var entity = event.entity || event.source,
			item = event.item;

		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		if(typeof(item) === "string") {
			item = universe.manager.item.object[item];
		}
		
		if(entity && item && entity.inventory && entity.inventory.indexOf(item.id) !== -1) {
			if(item.attunes && !item.attunement_locked && !entity.attunement_locked) {
				item.setValues({
					"attuned_on": null,
					"attuned_to": null, // Potential future proofing
					"attuned": null
				});
				entity.subValues({
					"attunements": [item.id]
				});
			}
			universe.notifyMasters(entity.name + " Unattuned from " + item.name);
		} else {
			universe.warnMasters("Unattunement Failed", {
				"entity": entity.id,
				"item": item.id,
				"inventory": entity.inventory,
				"has?": entity.inventory?entity.inventory.indexOf(item.id) !== -1:"No Inventory"
			});
		}
	});
};
