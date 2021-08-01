module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:shop:checkout
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
	 * @param {Object} event.message.data.shop
	 * @param {Object} event.message.data.items
	 */
	universe.on("player:shop:checkout", function(event) {
		var entity = event.message.data.entity,
			shop = event.message.data.shop,
			items = event.message.data.items,
			purchasing = [],
			cost = 0,
			discount,
			item,
			i;
		
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		if(typeof(shop) === "string") {
			shop = universe.manager.entity.object[shop];
		}
		if(entity && shop && items && items.length && (event.player.gm || (entity.owned && entity.owned[event.player.id]))) {
			for(i=0; i<items.length; i++) {
				item = items[i];
				if(shop.inventory.indexOf(item) !== -1 && (item = universe.manager.item.object[item])) {
					cost += item.cost || 0;
					purchasing.push(item.id);
				}
			}
			if(shop.is_chest) {
				cost = 0;
			} else if(shop.discount) {
				discount = parseFloat(shop.discount[entity.id] || shop.discount.all || shop.discount.everyone || 0);
				if(typeof(discount) === "number" && 0 <= discount && discount <= 1) {
					cost = (1 - discount) * cost;
				} else {
					universe.warnMasters("Invalid discount for shop: " + shop.name, {"shop": shop.id, "entity": entity.id});
				}
			}
			if(cost <= entity.gold) {
				/**
				 * 
				 * @event entity:sold:items
				 * @for Chronicle
				 * @param {String} entity
				 * @param {String} shop
				 * @param {Array | String} items
				 * @param {Float} cost
				 */
				universe.chronicle.addOccurrence("entity:sold:items", {
					"entity": entity.id,
					"shop": shop.id,
					"items": purchasing,
					"cost": cost
				});
				shop.addValues({
					"history": [{
						"event": "sold:items",
						"time": universe.time,
						"gold": cost,
						"items": purchasing,
						"to": entity.id
					}]
				});
				shop.subValues({
					"inventory": purchasing
				});
				entity.addValues({
					"inventory": purchasing,
					"gold": -1 * cost,
					"history": [{
						"event": "recv:items",
						"time": universe.time,
						"cost": cost,
						"items": purchasing,
						"from": shop.id,
						"shop": shop.id
					}]
				});
				universe.emit("send", {
					"type": "notice",
					"recipient": event.player.id,
					"message": "Paid " + cost.toFixed(2) + " gold to " + shop.name + " for " + purchasing.length + " items.",
					"icon": "fas rs-light-green fa-dollar-sign",
					"data": {
						"cost": cost,
						"cart": items,
						"entity": entity.id,
						"shop": shop.id
					},
					"anchored": true
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"recipient": event.player.id,
					"message": "Not enough gold to checkout",
					"icon": "fas rs-light-red fa-comments-dollar",
					"data": {
						"cost": cost,
						"cart": items,
						"entity": entity.id,
						"shop": shop.id
					},
					"anchored": true
				});
			}
		}
	});
};
