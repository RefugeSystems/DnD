var cleanID = new RegExp("[^a-z0-9_:]", "g"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {
	var maxScan = 100;

	/**
	 * Delete all copies of an item from a shop's inventory
	 * @event player:stock:clear
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
	 * @param {String} event.message.data.id Of the shop to stock
	 * @param {Object} [event.message.data.seed] Any optional leading data to apply to the matched type or rarity for
	 * 		restocking the shop
	 * @param {String} [event.message.data.seed.type:potion] Example of seeding the Potion type to be stocked with a
	 * 		specific count or formula (ie. '8', '4 + location.level', or '2d4')
	 */
	universe.on("player:stock:clear", function(event) {
		// console.log("Restocking Shop: ", event.message.data.id);
		var shop = universe.get(event.message.data.id),
			manager = universe.manager.item,
			limits = {},
			item,
			i;
		
		if(shop) {
			if(event.player.gm) {
				// Not Persisting: Loop over current inventory and delete copies then clear inventory
				for(i=0; i<shop.inventory.length; i++) {
					item = manager.object[shop.inventory[i]];
					if(item && item.is_copy) {
						manager.delete(item);
					}
				}

				shop.setValues({
					"inventory": [],
					"stocked_last": universe.time,
				});
				
				universe.chronicle.addOccurrence("shop:clear", {"source": shop.id, "limits": limits}, universe.time, shop.id);
				universe.emit("send", {
					"type": "notice",
					"mid": "universe:success",
					"recipients": universe.getMasters(),
					"message": "Shop Stock Cleared: " + shop.name,
					"icon": "fas fa-check rs-lightgreen",
					"anchored": true
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"mid": "universe:error",
					"recipients": universe.getMasters(),
					"message": "Access error: Non Game-Master Player attempted to clear a shop",
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"anchored": true
				});
			}
		} else {
			universe.emit("send", {
				"type": "notice",
				"mid": "universe:error",
				"recipients": universe.getMasters(),
				"message": "Unable to find shop to clear: " + event.message.data.id,
				"icon": "fas fa-exclamation-triangle rs-lightred",
				"anchored": true
			});
		}
	});

	/**
	 * 
	 * @event player:stock:shop
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
	 * @param {String} event.message.data.id Of the shop to stock
	 * @param {Object} [event.message.data.seed] Any optional leading data to apply to the matched type or rarity for
	 * 		restocking the shop
	 * @param {String} [event.message.data.seed.type:potion] Example of seeding the Potion type to be stocked with a
	 * 		specific count or formula (ie. '8', '4 + location.level', or '2d4')
	 */
	universe.on("player:stock:shop", function(event) {
		// console.log("Restocking Shop: ", event.message.data.id);
		var shop = universe.get(event.message.data.id),
			manager = universe.manager.item,
			inventory = [],
			uniques = {},
			limits = {},
			types = {},
			wait = [],
			stockType,
			count,
			limit,
			item,
			type,
			i,
			j;
		
		if(shop) {
			if(event.player.gm) {
				if(!shop.stocks_persist) {
					// Not Persisting: Loop over current inventory and delete copies then clear inventory
					for(i=0; i<shop.inventory.length; i++) {
						item = manager.object[shop.inventory[i]];
						if(item && item.is_copy) {
							manager.delete(item);
						}
					}
				} else {
					// Persisting: Loop over and count the current inventory
					for(i=0; i<shop.inventory.length; i++) {
						item = manager.object[shop.inventory[i]];
						if(item) {
							for(j=0; j<item.types.length; j++) {
								type = item.types[j];
								if(!limits[type]) {
									limits[type] = 0;
								}
								limits[type]--;
							}
						}
					}
					inventory.push.apply(inventory, shop.inventory);
				}

				manager.forEach(function(item) {
					if(item && item.types) {
						for(j=0; j<item.types.length; j++) {
							type = item.types[j];
							if(!types[type]) {
								types[type] = [];
							}
							if( !item.is_stock_excluded && ((item.is_unique && shop.stocks_unique && !isHeld(item.id)) || (item.is_singular && shop.stocks_singular) || (item.is_template && shop.stocks_template) )) {
								types[type].push(item);
							}
						}
					}
				});

				stockType = function(type) {
					if(limits[type] === undefined) {
						limits[type] = 0;
					}
					if(shop.stock_point && shop.stock_point[type]) {
						limit = universe.calculator.computedDiceRoll(shop.stock_point[type], shop);
					} else {
						limit = Random.integer(4);
					}
					limits[type] += limit;
					count = 0;
					while(count < limits[type] && 0 < types[type].length && count < maxScan) {
						item = types[type][Random.integer(types[type].length)];
						// console.log(" > Stock Considering: " + item.name + " [" + item.is_unique + ", " + item.is_singular + ", " + item.is_template + "]");
						if(item.is_unique) {
							// console.log("  -> Stocking Unique: " + item.name + " [" + item.id + "]");
							if(!uniques[item.id]) {
								uniques[item] = true;
								inventory.push(item.id);
								limits[type]--;
								types[type].purge(item);
							}
						} else if(item.is_template) {
							// console.log("  -> Stocking Template: " + item.name + " [" + item.id + "]");
							wait.push(universe.copy(item, function(err, copy) {
								if(!err) {
									inventory.push(copy.id);
								}
							}));
							limits[type]--;
						} else if(item.is_singular) {
							// console.log("  -> Stocking Singular: " + item.name + " [" + item.id + "]");
							inventory.push(item.id);
							limits[type]--;
						}
						count++;
					}
				};

				shop.stocks.forEach(stockType);
				for(i=0; shop.stocks_randomly && i<shop.stocks_randomly.length; i++) {
					type = shop.stocks_randomly[i];
					if(Math.random() < 0.25) {
						// console.log("Randomly Stocked: ", type);
						stockType(type);
					} else {
						// console.log("Randomly Skipped: ", type);
					}
				}

				Promise.all(wait)
				.then(function() {
					shop.setValues({
						"inventory": inventory,
						"stocked_last": universe.time,
					});
					universe.chronicle.addOccurrence("shop:restock", {"source": shop.id, "limits": limits}, universe.time, shop.id);
					universe.emit("send", {
						"type": "notice",
						"mid": "universe:success",
						"recipients": universe.getMasters(),
						"message": "Shop Restocked: " + shop.name,
						"icon": "fas fa-check rs-lightgreen",
						"anchored": true
					});
				})
				.catch(function(err) {
					universe.emit("send", {
						"type": "notice",
						"mid": "universe:error",
						"recipients": universe.getMasters(),
						"message": "Error Restocking Shop: " + shop.name + " - " + err.message,
						"icon": "fas fa-exclamation-triangle rs-lightred",
						"anchored": true
					});
					console.log("Restock Error: ", err);
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"mid": "universe:error",
					"recipients": universe.getMasters(),
					"message": "Access error: Non Game-Master Player attempted to restock a shop",
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"anchored": true
				});
			}
		} else {
			universe.emit("send", {
				"type": "notice",
				"mid": "universe:error",
				"recipients": universe.getMasters(),
				"message": "Unable to find shop to restock: " + event.message.data.id,
				"icon": "fas fa-exclamation-triangle rs-lightred",
				"anchored": true
			});
		}
	});

	var isHeld = function(itemid) {
		var entity,
			i;

		for(i=0; i<universe.manager.entity.objectIDs.length; i++) {
			entity = universe.manager.entity.object[universe.manager.entity.objectIDs[i]];
			if(entity && entity.inventory.indexOf(itemid) !== -1) {
				return true;
			}
		}

		return false;
	};
};
