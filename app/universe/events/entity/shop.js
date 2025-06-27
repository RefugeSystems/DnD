
var cleanID = new RegExp("[^a-z0-9_:]", "g"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {
	var randomStockPoint = .25,
		maxScan = 500,
		stringifyMap;

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
					"stocked_last": universe.time
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
			indexing = {},
			skw_rare = {},
			min_rare = {},
			max_rare = {},
			uniques = {},
			limits = {},
			types = {},
			wait = [],
			stockType,
			scanned,
			rarity,
			count,
			limit,
			item,
			type,
			i,
			j;
		
		if(shop) {
			try { // Server safety catch
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

					// Index the types that we want to stock
					for(i=0; i<shop.stocks.length; i++) {
						indexing[shop.stocks[i]] = true;
					}
					for(i=0; i<shop.stocks_randomly.length; i++) {
						indexing[shop.stocks_randomly[i]] = true;
					}

					// Index all of our items by type and rarity
					//		Here the `rarity` value is loaded with the item rarity for buffering purposes
					manager.forEach(function(item) {
						if(item && item.types) {
							for(j=0; j<item.types.length; j++) {
								type = item.types[j];
								if(indexing[type]) {
									// If we haven't seen this item type yet, index it and configure the rarity range
									if(!types[type]) {
										types[type] = {}; // Allow for direct indexing of the rarity
										min_rare[type] = shop.stock_rarity_min[type]?universe.calculator.computedDiceRoll(shop.stock_rarity_min[type], shop) || 0:0;
										max_rare[type] = shop.stock_rarity_max[type]?universe.calculator.computedDiceRoll(shop.stock_rarity_max[type], shop) || 0:0;
										skw_rare[type] = shop.stock_skew[type]?universe.calculator.computedDiceRoll(shop.stock_skew[type], shop) || 1:1;
										if(isNaN(min_rare[type])) {
											min_rare[type] = 90;
										}
										if(isNaN(max_rare[type])) {
											max_rare[type] = 100;
										}
										if(isNaN(skw_rare[type])) {
											skw_rare[type] = 1;
										} else if(skw_rare[type] < 0) {
											skw_rare[type] = 0;
										}
									}
									rarity = item.rarity;
									if(!item.is_preview && !item.is_copy && !item.is_stock_excluded && ((item.is_unique && shop.stocks_unique && !isHeld(item.id)) || (item.is_singular && shop.stocks_singular) || (item.is_template && shop.stocks_template)) && ((min_rare[type] === 0 && max_rare[type] === 0) || (!isNaN(rarity) && (min_rare[type] === 0 || min_rare[type] <= rarity) && (max_rare[type] === 0 || rarity <= max_rare[type])))) {
										if(!types[type][rarity]) {
											types[type][rarity] = [];
										}
										types[type][rarity].push(item);
									}
								}
							}
						}
					});

					// Stock the shop for this type
					//		Here the rarity value is the rarity we're looking to get for stocking the shop on 1 pass to stock a single item
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
						scanned = 0;
						count = 0;
						while(count < limits[type] && scanned < maxScan) {
							rarity = Math.floor(Random.guassian(min_rare[type], max_rare[type], skw_rare[type]));
							// item = types[type][rarity][Random.integer(types[type][rarity].length)];
							// console.log(" > Stock Considering: " + item.name + " [" + item.is_unique + ", " + item.is_singular + ", " + item.is_template + "]");
							// console.log("Stock Rarity Check:" + rarity);
							if(types[type] && types[type][rarity] && (item = types[type][rarity][Random.integer(types[type][rarity].length)])) {
								if(item.is_unique) {
									// console.log("  -> Stocking Unique: " + item.name + " [" + item.id + "]");
									if(!uniques[item.id]) {
										uniques[item] = true;
										inventory.push(item.id);
										// limits[type]--;
										types[type].purge(item);
										count++;
									}
								} else if(item.is_template) {
									// console.log("  -> Stocking Template: " + item.name + " [" + item.id + "]");
									wait.push(universe.copy(item, function(err, copy) {
										if(!err) {
											inventory.push(copy.id);
										}
									}));
									// limits[type]--;
									count++;
								} else if(item.is_singular) {
									// console.log("  -> Stocking Singular: " + item.name + " [" + item.id + "]");
									inventory.push(item.id);
									// limits[type]--;
									count++;
								}
							}
							scanned++;
						}
						if(scanned === maxScan) {
							console.log("Restock Warning[" + count + "/" + limits[type] + "]: " + type + " - Exceeded Max Scan:\n" + JSON.stringify(types[type], universe.utility.reduceArrays, 4));
						}
					};

					// Initiate the stocking process for each type that the shop stocks
					shop.stocks.forEach(stockType);
					// Check the randomly stocked items and stock them 25% of the time
					for(i=0; shop.stocks_randomly && i<shop.stocks_randomly.length; i++) {
						type = shop.stocks_randomly[i];
						if(Math.random() < randomStockPoint) {
							stockType(type);
						}
					}

					// Wait for remaining copies to be generated and then push them to the shop's inventory
					Promise.all(wait)
					.then(function() {
						shop.setValues({
							"inventory": inventory,
							"stocked_last": universe.time
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
			} catch(err) {
				// This is a general catch for any errors that may occur during the restocking process as this is fairly complicated and shouldn't drop the server
				universe.warnMasters("Error Restocking Shop: " + shop.name + " - " + err.message, {"shop": shop.id, "error": err, "stack": err.stack});
				console.log("Restock Error: ", err);
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
