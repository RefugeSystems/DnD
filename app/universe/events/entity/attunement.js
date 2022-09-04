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
			item,
			i;
		
		if(entity && items && items.length && (event.player.gm || entity.owned[event.player.id])) {
			for(i=0; i<items.length; i++) {
				if(item = universe.get(items[i])) {
					universe.emit("action:item:attune", {
						"player": event.player.id,
						"entity": entity,
						"item": item.id
					});
					entity.fireHandlers("action:item:attune", {
						"player": event.player.id,
						"entity": entity.id,
						"item": item.id
					});
					item.fireHandlers("action:item:attune", {
						"player": event.player.id,
						"entity": entity.id,
						"item": item.id
					});
				}
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
			item,
			i;
		
		if(entity && items && items.length && (event.player.gm || entity.owned[event.player.id])) {
			for(i=0; i<items.length; i++) {
				if(item = universe.get(items[i])) {
					universe.emit("action:item:unattune", {
						"player": event.player.id,
						"entity": entity,
						"item": item.id
					});
					entity.fireHandlers("action:item:unattune", {
						"player": event.player.id,
						"entity": entity.id,
						"item": item.id
					});
					item.fireHandlers("action:item:unattune", {
						"player": event.player.id,
						"entity": entity.id,
						"item": item.id
					});
				}
			}
		}
	});
	
	/**
	 * 
	 * @event action:item:attune
	 * @for Universe
	 * @param {Object} event
	 * @param {String} event.player Firing the control
	 * @param {String} event.entity Attuning
	 * @param {String} event.item Being attuned
	 */
	universe.on("action:item:attune", function(event) {
		var entity = event.entity || event.source,
			item = event.item,
			message;

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
					"attuned": entity.id,
					"creature": entity.id,
					"user": entity.id
				});
				entity.addValues({
					"attunements": [item.id]
				});
				universe.notifyMasters(entity.name + " attuned to " + item.name);
			} else {
				message = entity.name + " failed to attune to " + item.name;
				if(item.attunement_blocked) {
					message += "; Item blocks attunement";
				}
				if(entity.attunement_blocked) {
					message += "; Entity blocks attunement";
				}
				if(!entity.attunements) {
					message += "; Entity can not attune";
				} else if(entity.attunements.length >= entity.attune_max) {
					message += "; Entity has too many attunements";
				}
				universe.notifyMasters(message);
			}
		} else {
			universe.warnMasters("Attunement Failed", {
				"entity": entity?entity.id:"Unknown",
				"item": item?item.id:"Unknown",
				"inventory": entity?entity.inventory:null,
				"has?": entity && item && entity.inventory?entity.inventory.indexOf(item.id) !== -1:"No Inventory or Item"
			});
		}
	});

	/**
	 * 
	 * @event action:item:unattune
	 * @for Universe
	 * @param {String} event.player Firing the control
	 * @param {String} event.entity Unattuning
	 * @param {String} event.item Being unattuned
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
					"attuned": null,
					"creature": null,
					"user": null
				});
				entity.subValues({
					"attunements": [item.id]
				});
				universe.notifyMasters(entity.name + " Unattuned from " + item.name);
			}
		} else {
			universe.warnMasters("Unattunement Failed", {
				"entity": entity?entity.id:"Unknown",
				"item": item?item.id:"Unknown",
				"inventory": entity?entity.inventory:null,
				"has?": entity && item && entity.inventory?entity.inventory.indexOf(item.id) !== -1:"No Inventory or Item"
			});
		}
	});
};
