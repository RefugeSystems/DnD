
module.exports.initialize = function(universe) {
	
	/**
	 * 
	 * @event action:rest:finish
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.entity The event name being fired, should match this event's name
	 * @param {String} [event.item] To attune
	 */
	universe.on("action:rest:finish", function(event) {
		// console.log("Finish long rest");
		var entity,
			item,
			feat,
			add,
			has,
			die,
			i;

		if(typeof(event.entity) === "object") {
			entity = event.entity;
		} else {
			entity = universe.manager.entity.object[event.entity];
		}
		
		if(entity) {
			// Track Last Rest for Exhaustion
			entity.setValues({
				"last_rest": universe.time
			});

			// Add hit die
			if(entity.hit_dice_max) {
				die = Object.keys(entity.hit_dice_max);
				add = {
					"hit_dice": {}
				};
				for(i=0; i<die.length; i++) {
					add.hit_dice[die[i]] = Math.ceil(parseInt(entity.hit_dice_max[die[i]])/2);
				}
				// console.log("Adding: ", add);
				entity.addValues(add);
			}

			// Attune if present
			item = event.item;
			if(typeof(item) === "string") {
				item = universe.get(item);
			}
			if(item && entity.inventory && entity.inventory.indexOf(item.id) !== -1) {
				universe.emit("action:item:attune", {
					"action": "action:item:attune",
					"entity": entity,
					"item": item
				});
			}

			// Recharge Items
			for(i=0; i<entity.inventory.length; i++) {
				item = universe.manager.item.object[entity.inventory[i]];
				if(item && !item.disabled && typeof(item.charges_max) === "number" && typeof(item.recharges_at_long) === "number" && item.recharges_at_long) {
					has = (item.recharges_long || 0) + 1;
					if(item.recharges_at_long <= has) {
						item.addValues({
							"recharges_long": -1 * item.recharges_long,
							"charges": item.recharges_amount_long
						});
					} else {
						item.addValues({
							"recharges_long": 1
						});
					}
				}
			}

			// Recharge Feats
			for(i=0; i<entity.feats.length; i++) {
				feat = universe.manager.feat.object[entity.feats[i]];
				if(feat && !feat.disabled && typeof(feat.charges_max) === "number" && typeof(feat.recharges_at_long) === "number" && feat.recharges_at_long) {
					has = (feat.recharges_long || 0) + 1;
					if(feat.recharges_at_long <= has) {
						feat.addValues({
							"recharges_long": -1 * feat.recharges_long,
							"charges": feat.recharges_amount_long
						});
					} else {
						feat.addValues({
							"recharges_long": 1
						});
					}
				}
			}
		}
	});

	/**
	 * 
	 * @event action:rest:short
	 * @for Universe
	 * @param {Object} event 
	 * @param {String | Object} event.entity
	 * @param {Object} event.result HitDie used
	 * @param {Integer} event.roll Health to heal 
	 * @param {String} [event.item] To attune
	 */
	universe.on("action:rest:short", function(event) {
		// console.log("Short: ", event.entity.id);
		var entity,
			item,
			feat,
			need,
			has,
			i;

		if(typeof(event.entity) === "object") {
			entity = event.entity;
		} else {
			entity = universe.manager.entity.object[event.entity];
		}
		
		if(entity) {
			// Update Hitdice Usage
			if(event.roll) {
				entity.addValues({
					"hp": event.roll
				});
			}
			// console.log("Sub: ", event.result);
			if(event.result) {
				entity.subValues({
					"hit_dice": event.result
				});
			}

			// Attune if present
			item = event.item;
			if(typeof(item) === "string") {
				item = universe.get(item);
			}
			if(item && entity.inventory && entity.inventory.indexOf(item.id) !== -1) {
				universe.emit("action:item:attune", {
					"action": "action:item:attune",
					"entity": entity,
					"item": item
				});
			}

			// Recharge Items
			for(i=0; i<entity.inventory.length; i++) {
				item = universe.manager.item.object[entity.inventory[i]];
				if(item && !item.disabled && typeof(item.charges_max) === "number" && typeof(item.recharges_at_short) === "number" && item.recharges_at_short) {
					has = (item.recharges_short || 0) + 1;
					if(item.recharges_at_short <= has) {
						item.addValues({
							"recharges_short": -1 * item.recharges_short,
							"charges": item.recharges_amount_short
						});
					} else {
						item.addValues({
							"recharges_short": 1
						});
					}
				}
			}

			// Recharge Feats
			for(i=0; i<entity.feats.length; i++) {
				feat = universe.manager.feat.object[entity.feats[i]];
				if(feat && !feat.disabled && typeof(feat.charges_max) === "number" && typeof(feat.recharges_at_short) === "number" && feat.recharges_at_short) {
					has = (feat.recharges_short || 0) + 1;
					if(feat.recharges_at_short <= has) {
						feat.addValues({
							"recharges_short": -1 * feat.recharges_short,
							"charges": feat.recharges_amount_short
						});
					} else {
						feat.addValues({
							"recharges_short": 1
						});
					}
				}
			}
		}
	});
};
