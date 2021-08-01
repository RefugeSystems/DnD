
module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:entity:level
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
	 * @param {Object} event.message.data.spells_known
	 * @param {Object} event.message.data.proficiencies
	 * @param {Object} event.message.data.archetypes
	 * @param {Object} event.message.data.hp_rolled
	 * @param {Object} event.message.data.feats
	 */
	universe.on("player:entity:level", function(event) {
		var entity = event.message.data.entity,
			notify = Object.assign({}, universe.getMasters()),
			leveling = {},
			wait = [],
			spells_known,
			spells,
			feats,
			copy,
			mask,
			i,
			j;
		
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		notify[event.player.id] = true;

		if(entity && (event.player.gm || (entity.owned && entity.owned[event.player.id]))) {
			if(event.message.data.spells_known) {
				mask = {};
				mask.character = entity.id;
				mask.caster = entity.id;
				mask.user = entity.id;
				mask.acquired = universe.time;
				wait.push(universe.copyArrayID(event.message.data.spells_known, mask)
				.then(function(copies) {
					spells_known = copies;
				}));
			}
			if(event.message.data.spells) {
				mask = {};
				mask.character = entity.id;
				mask.caster = entity.id;
				mask.user = entity.id;
				mask.acquired = universe.time;
				wait.push(universe.copyArrayID(event.message.data.spells, mask)
				.then(function(copies) {
					spells = copies;
				}));
			}
			if(event.message.data.feats) {
				mask = {};
				mask.character = entity.id;
				mask.user = entity.id;
				mask.acquired = universe.time;
				wait.push(universe.copyArrayID(event.message.data.feats, mask)
				.then(function(copies) {
					feats = copies;
				}));
			}
			Promise.all(wait)
			.then(function() {
				leveling.hp_rolled = event.message.data.hp_rolled || 0;
				leveling.archetypes = event.message.data.archetypes;
				leveling.proficiencies = event.message.data.proficiencies;
				leveling.knowledges = event.message.data.knowledges;
				leveling.level = 1;
				leveling.point_pool = {
					"level": -1
				};
				if(spells_known) {
					leveling.spells_known = spells_known;
				}
				if(spells) {
					leveling.spells = spells;
				}
				if(feats) {
					leveling.feats = feats;
				}
				return new Promise(function(done, fail) {
					entity.addValues(leveling, function(error, object) {
						if(error) {
							fail(error);
						} else {
							universe.emit("send", {
								"type": "notice",
								"icon": "fas fa-check rs-lightgreen",
								"recipients": notify,
								"message": entity.name + " leveled up to level " + object.level,
								"data": {
									"message": event.message.data,
									"level": leveling
								},
								"anchored": true
							});
						}
					});
				});
			})
			.catch(function(err) {
				universe.emit("send", {
					"type": "notice",
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"recipients": notify,
					"message": entity.name + " failed to level due to a server error: " + err.message,
					"data": {
						"message": event.message.data,
						"error": err
					},
					"anchored": true
				});
			});
		} else {
			universe.emit("send", {
				"type": "notice",
				"icon": "fas fa-exclamation-triangle rs-lightred",
				"recipients": notify,
				"message": "Unable to finish leveling " + entity.name + " due to access restrictions",
				"data": event.message.data,
				"anchored": true
			});
		}
	});
};
