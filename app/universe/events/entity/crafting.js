module.exports.initialize = function(universe) {

	var makeRecipe = function(recipe, meeting, payment, count, source, target, inputs, yields) {
		return new Promise(function(done, fail) {
			var errors = [],
				making = [],
				mask = {},
				entityID,
				entity,
				partID,
				part,
				make,
				all,
				i,
				j,
				k;

			mask.character = source.id;
			mask.caster = source.id;
			mask.source = source.id;

			source.subValues({
				"gold": payment
			});

			for(entityID in inputs) {
				entity = universe.get(entityID);
				if(entity) {
					for(partID in inputs[entityID]) {
						if(partID.startsWith("entity")) {
							meeting.subValues({
								"entities": inputs[entityID][partID]
							});
						} else {
							entity.subValues({
								"inventory": inputs[entityID][partID]
							});
						}
					}
				}
			}

			console.log(" >> Crafting:\n + " + recipe.id + "\n + " + meeting.id + "\n + " + source.id + "\n + " + target.id + "\n + Count: " + count + "\n Inputs:\n" + JSON.stringify(inputs, null, 4) + "\n <<<<<");

			if(recipe && yields && yields.length) {
				for(i=0; i<count; i++) {
					making.push(universe.copyArrayID(yields, mask)
					.then(function(copies) {
						return new Promise(function(done) {
							var modify = {},
								entity,
								i;
							if(recipe.is_entity_created)  {
								modify.entities = copies;
								meeting.addValues(modify, done);

								for(i=0; i<copies.length; i++) {
									entity = universe.get(copies[i]);
									entity.setValues({
										"owned": Object.assign({}, source.owned),
										"hp": entity.hp_max
									});
								}
							} else {
								if(recipe.field_track) {
									modify[recipe.field_track] = copies;
								}
								if(recipe.field_receive) {
									modify[recipe.field_receive] = copies;
								}
								target.addValues(modify, done);
							}
						});
					})
					.catch(function(error) {
						errors.push(error.message);
						console.log("Crafting Error: ", error);
					}));
				}
				Promise.all(making)
				.then(done)
				.catch(fail)
				.finally(function() {
					if(errors) {
						universe.notifyMasters("Crafting Errors from " + source.name + ": " + errors.join(", "));
					}
				});
			}
		});
	};

	/**
	 * 
	 * @event player:entity:craft:recipe
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
	 * @param {String} [event.message.data.meeting]
	 * @param {String} event.message.data.source
	 * @param {String} event.message.data.target
	 * @param {String} event.message.data.recipe
	 * @param {Integer} event.message.data.payment In gold for the recipe to cover missing materials or raw cost for
	 * 		the crafting action of the recipe.
	 * @param {Integer} event.message.data.count Number of times to repeat the recipe
	 * @param {Object} event.message.data.inputs Maps Object IDs to Class IDs to arrays of IDs to consume from them
	 * @param {Array} event.message.data.yields The selected yield from the recipe
	 */
	universe.on("player:entity:craft:recipe", function(event) {
		var meeting = universe.get(event.message.data.meeting),
			source = universe.get(event.message.data.source),
			target = universe.get(event.message.data.target),
			recipe = universe.get(event.message.data.recipe),
			payment = event.message.data.payment,
			inputs = event.message.data.inputs,
			yields = event.message.data.yields,
			count = event.message.data.count,
			report = [],
			changes,
			outputs,
			inputs,
			part,
			i,
			j,
			k;
		
		report.data = event.message.data;
		report.messages = [];

		if(count && 0 < count && source && target && inputs && (event.player.gm || source.owned[event.player.id])) {
			// TODO: Process Recipe
			makeRecipe(recipe, meeting, payment, count, source, target, inputs, yields)
			.then(function(res) {
				/**
				 * 
				 * @event entity:crafted
				 * @for Chronicle
				 * @param {String} source ID to craft and sent to target
				 * @param {String} target ID to receive
				 * @param {String} recipe ID to use
				 * @param {Number} payment Gold payment for crafting to cover missing ingredients or just the cost of
				 * 		performing the crafting action with the specified recipe.
				 * @param {Number} count Of times to craft the recipe (Inputs covers all iterations, so if count is 3 then
				 * 		the received inputs are the inputs for all 3 crafting iterations.)
				 * @param {Object} inputs Mapping Source ID for the components to the ID for the bucket of component part
				 * 		to fill from the recipe to an array of object IDs from that source fulfilling that bin.
				 * @param {String} [meeting]
				 * @param {Array} yields
				 */
				source.fireHandlers("entity:crafted", event.message.data, ["equipped", "feats", "effects", "inventory"]);
				/**
				 * TODO: Implement notice of crafting received.
				 * @event entity:trade:items
				 * @for Chronicle
				 * @param {String} source ID to craft and sent to target
				 * @param {String} target ID to receive
				 * @param {Array} items
				 */
				/*
				report = {};
				report.source = source.id;
				report.target = target.id;
				source.fireHandlers("entity:trade:items", event.message.data, ["equipped", "feats", "effects", "inventory"]);
				*/
			})
			.catch(function(error) {
				console.error("Crafting Error: ", error);
			});
		}

		if(report.length) {
			universe.notifyMasters("Crafting Issues for " + source.name + ": " + report.join(", "), event.message.data);
		}
	});



};
