const { contourDensity } = require("d3");

module.exports.initialize = function(universe) {

	/**
	 * 
	 * @event player:spell:prepare
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
	 * @param {String} event.message.data.entity
	 * @param {Array | String} event.message.data.spells
	 */
	universe.on("player:spells:prepare", function(event) {
		var entity = event.message.data.entity,
			spells = event.message.data.spells,
			prepared = [],
			cantrip_count,
			spell_count,
			notify,
			spell,
			i;

		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		
		if(entity && entity.spells_known && entity.spells && spells && spells.length) {
			for(i=0; i<spells.length; i++) {
				spell = universe.manager.spell.object[spells[i]];
				if(spell && !spell.disabled && !spell.is_preview && entity.spells_known.indexOf(spell.id) !== -1) {
					prepared.push(spell.id);
				}
			}

			if(prepared.length) {
				entity.addValues({"spells": prepared, "spells_prepared": prepared}, function(err) {
					if(err) {
						// TODO: Better logging
						universe.handleError("equipment:equip", err);
						console.error(err);
					} else {
						cantrip_count = 0;
						spell_count = 0;
						for(i=0; i<entity._data.spells_prepared.length; i++) {
							spell = universe.manager.spell.object[entity._data.spells_prepared[i]];
							if(spell) {
								if(spell.level === 0 || isNaN(spell.level)) {
									cantrip_count++;
								} else if(spell.level > 0) {
									spell_count++;
								}
							}
						}
						if(typeof(entity.spells_maximum) === "number" && spell_count > entity.spells_maximum) {
							notify = Object.assign({}, universe.getMasters());
							notify[event.player.id] = true;
							universe.emit("send", {
								"type": "notice",
								"icon": "fas fa-exclamation-triangle rs-lightred",
								"recipients": notify,
								"message": entity.name + " has prepared " + spell_count + " Spells and has a maximum preparation of " + entity.spells_maximum,
								"data": event.message.data,
								"anchored": true
							});
						}
						if(typeof(entity.cantrips_maximum) === "number" && cantrip_count > entity.cantrips_maximum) {
							notify = Object.assign({}, universe.getMasters());
							notify[event.player.id] = true;
							universe.emit("send", {
								"type": "notice",
								"icon": "fas fa-exclamation-triangle rs-lightred",
								"recipients": notify,
								"message": entity.name + " has prepared " + cantrip_count + " Cantrips and has a maximum preparation of " + entity.cantrips_maximum,
								"data": event.message.data,
								"anchored": true
							});
						}
					}
				});
			}
		}
	});

	/**
	 * 
	 * @event player:spell:unprepare
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
	 * @param {String} event.message.data.entity
	 * @param {Array | String} event.message.data.spells
	 */
	universe.on("player:spells:unprepare", function(event) {
		var entity = event.message.data.entity,
			spells = event.message.data.spells,
			prepared = [],
			spell,
			set,
			i;

		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}
		
		if(entity && entity.spells && spells && spells.length) {
			for(i=0; i<spells.length; i++) {
				spell = universe.manager.spell.object[spells[i]];
				if(spell && !spell.disabled && !spell.is_preview) {
					prepared.push(spell.id);
				}
			}

			if(prepared.length) {
				entity.subValues({"spells": prepared, "spells_prepared": prepared});
			}
		}
	});

	/**
	 * 
	 * @event player:spell:grant
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
	 * @param {Array | String} event.message.data.entities
	 * @param {Array | String} event.message.data.spells
	 */
	universe.on("player:spells:grant", function(event) {
		var entities = event.message.data.entities,
			spells = event.message.data.spells;

		if(entities && entities.length) {
			entities.forEach(function(entity) {
				if(typeof(entity) === "string") {
					entity = universe.manager.entity.object[entity];
				}
				if(entity) {
					var waiting = [],
						mask = {},
						spell,
						i;

					mask.acquired = universe.time;
					mask.template_process = {};
					mask.is_template = false;
					mask.caster = entity.id;
					mask.user = entity.id;
					mask.is_copy = true;

					for(i=0; i<spells.length; i++) {
						spell = spells[i];
						if(typeof(spell) === "string") {
							spell = universe.manager.spell.object[spell];
						}
						if(spell && !spell.disabled) {
							waiting.push(new Promise(function(done, fail) {
								universe.copy(spell, mask, function(err, copy) {
									if(err) {
										fail(err);
									} else {
										done(copy.id);
									}
								});
							}));
						} else {
							console.log("Unknown or Disabled spell? " + spells[i]);
						}
					}
					console.log("Waiting..." + waiting.length);
					if(waiting.length) {
						Promise.all(waiting)
						.then(function(adding) {
							console.log("Adding Spells: ", adding);
							entity.addValues({
								"spells_known": adding
							});
						})
						.catch(function(err) {
							console.log("Grant Fail: ", err);
							universe.handleError("spell:grant", err);
						});
					}
				}
			});
		}
	});

	/**
	 * 
	 * Requires GameMaster
	 * @event player:spells:revoke
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
	 * @param {String} [event.message.data.source] Optional information for the source of the copy
	 * @param {String} event.message.data.target To receive the object
	 * @param {Array | String} event.message.data.spells IDs to be revoked. MUST be strings.
	 * @param {String} event.message.data.field To which to add the copy, should essentially always be an Array type field
	 */
	universe.on("player:spells:revoke", function(event) {
		var entities = event.message.data.entities,
			spells = event.message.data.spells;

		if(event.player.gm && entities && entities.length) {
			entities.forEach(function(entity) {
				if(typeof(entity) === "string") {
					entity = universe.manager.entity.object[entity];
				}
				if(entity && entity.spells) {
					var revoking = [],
						removing = {},
						spell,
						i;

					for(i=0; i<spells.length; i++) {
						spell = spells[i];
						if(typeof(spell) === "string") {
							removing[spell] = true;
						}
					}
					for(i=0; i<entity.spells.length; i++) {
						spell = universe.manager.spell.object[entity.spells[i]];
						if(spell && (removing[spell.id] || removing[spell.parent])) {
							revoking.push(spell.id);
						}
					}
					if(revoking.length) {
						entity.subValues({
							"spells": revoking
						});
					}
				}
			});
		}
	});
};
