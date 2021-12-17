var EventUtility = require("../utility.js"),
	cleanID = new RegExp("[^a-z0-9_:]", "g"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * Requires GameMaster
	 * @event player:knowledge:grant
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
	 * @param {String} event.message.data.knowledges To be copied
	 * @param {String} event.message.data.field To which to add the copy, should essentially always be an Array type field
	 */
	universe.on("player:knowledge:grant", function(event) {
		var entities = event.message.data.entities,
			knowledges = event.message.data.knowledges,
			meeting = universe.manager.setting.object["setting:meeting"];

		if(meeting && meeting.value) {
			meeting = meeting.value;
		} else {
			meeting = false;
		}

		if(event.player.gm && entities && entities.length) {
			entities.forEach(function(entity) {
				if(typeof(entity) === "string") {
					entity = universe.manager.entity.object[entity];
				}
				if(entity) {
					var waiting = [],
						mask = {},
						knowledge,
						i;

					mask.template_process = {};
					mask.character = entity.id;
					mask.caster = entity.id;
					mask.user = entity.id;
					mask.is_template = false;
					mask.is_copy = true;
					mask.acquired = universe.time;
					if(meeting) {
						mask.acquired_in = meeting;
					}

					for(i=0; i<knowledges.length; i++) {
						knowledge = knowledges[i];
						if(typeof(knowledge) === "string") {
							knowledge = universe.manager.knowledge.object[knowledge];
						}
						if(knowledge && !knowledge.disabled && !EventUtility.hasID(universe, knowledge.id, entity.knowledges)) {
							waiting.push(new Promise(function(done, fail) {
								universe.copy(knowledge, mask, function(err, copy) {
									if(err) {
										fail(err);
									} else {
										done(copy.id);
									}
								});
							}));
						} else {
							console.log("Unknown, Disabled, or Possessed Knowledge:  ", knowledges[i].id || knowledges[i]);
						}
					}
					console.log("Waiting..." + waiting.length);
					if(waiting.length) {
						Promise.all(waiting)
						.then(function(adding) {
							console.log("Adding Knowledge: ", adding);
							entity.addValues({
								"knowledges": adding
							});
						})
						.catch(function(err) {
							console.log("Grant Fail: ", err);
							universe.handleError("knowledge:grant", err);
						});
					}
				}
			});
		}
	});

	/**
	 * 
	 * Requires GameMaster
	 * @event player:knowledge:revoke
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
	 * @param {Array | String} event.message.data.knowledges IDs to be revoked. MUST be strings.
	 * @param {String} event.message.data.field To which to add the copy, should essentially always be an Array type field
	 */
	universe.on("player:knowledge:revoke", function(event) {
		var entities = event.message.data.entities,
			knowledges = event.message.data.knowledges;

		if(event.player.gm && entities && entities.length) {
			entities.forEach(function(entity) {
				if(typeof(entity) === "string") {
					entity = universe.manager.entity.object[entity];
				}
				if(entity && entity.knowledges) {
					var revoking = [],
						removing = {},
						knowledge,
						i;

					for(i=0; i<knowledges.length; i++) {
						knowledge = knowledges[i];
						if(typeof(knowledge) === "string") {
							removing[knowledge] = true;
						}
					}
					for(i=0; i<entity.knowledges.length; i++) {
						knowledge = universe.manager.knowledge.object[entity.knowledges[i]];
						if(knowledge && (removing[knowledge.id] || removing[knowledge.parent])) {
							revoking.push(knowledge.id);
						}
					}
					if(revoking.length) {
						entity.subValues({
							"knowledges": revoking
						});
					}
				}
			});
		}
	});

	/**
	 * 
	 * 
	 * @event player:knowledge:create
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
	 * @param {String} event.message.data.entity Making the knowledge
	 * @param {String} event.message.data.name
	 * @param {String} event.message.data.description
	 * @param {String} [event.message.data.category]
	 * @param {Array | String} event.message.data.associations Of the knowledge
	 */
	universe.on("player:knowledge:create", function(event) {
		var entity = universe.get(event.message.data.entity),
			associations = event.message.data.associations,
			knowledge,
			source,
			share,
			i;

		if(entity && (event.player.gm || entity.owned[event.player.id])) {
			if(!(associations instanceof Array)) {
				associations = [associations];
			}
			knowledge = {};
			knowledge.id = Random.identifier("knowledge").toLowerCase();
			knowledge.name = event.message.data.name;
			knowledge.description = event.message.data.description;
			knowledge.associations = associations;
			knowledge.acquired = universe.time;
			knowledge.acquired_in = universe.manager.setting.object["setting:meeting"].value;
			knowledge.category = event.message.data.category;
			knowledge.character = entity.id;
			knowledge.source = entity.id;
			universe.createObject(knowledge, function(error, object) {
				if(error) {
					universe.handleError("knowledge:create", error);
				} else {
					entity.addValues({
						"knowledges": [object.id]
					});
					if(share) {
						share();
					}
				}
			});
		} else {
			// Access Error
			console.warn("Missing entity or ownership to create knowledge: ", event.message.data);
		}
	});

	/**
	 * 
	 * 
	 * @event player:knowledge:share
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
	 * @param {String} event.message.data.entity Sharing the knowledge
	 * @param {Array | String} event.message.data.targets Entity IDs
	 * @param {String} event.message.data.knowledge
	 */
	universe.on("player:knowledge:share", function(event) {
		var entity = universe.get(event.message.data.entity),
			knowledge = universe.get(event.message.data.knowledge),
			targets = event.message.data.targets,
			mask;

		if(entity && (event.player.gm || (entity && entity.owned[event.player.id])) && knowledge && targets && targets.length && entity.knowledges && entity.knowledges.indexOf(knowledge.id) !== -1) {
			targets.forEach(function(target, i) { // Scope Targets to scope for keeping reference | keep index for current error logging, possible clean up later
				target = universe.get(target);
				if(target && target._class === "entity" ) {
					mask = {};
					mask.acquired_in = universe.manager.setting.object["setting:meeting"].value;
					mask.acquired = universe.time;
					mask.character = target.id;
					mask.source = entity.id;
					universe.copy(knowledge, mask, function(error, object) {
						if(error) {
							// TODO: Copy Fault | Likely a much deeper issue, speicific logging later
						} else {
							target.addValues({
								"knowledges": object.id
							});
						}
					});
				} else {
					// TODO: Unknown Object ID
					console.warn("Unknown or non-entity target ID: " + targets[i]);
				}
			});
		} else {
			// TODO: Access or Possession error
			console.warn("Share failed: ", !!entity, !!knowledge, targets?targets.length:null, entity.knowledges?entity.knowledges.indexOf(knowledge.id) !== -1:null);
		}
	});

	/**
	 * 
	 * 
	 * @event player:knowledge:append
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
	 * @param {String} event.message.data.entity 
	 * @param {Array | String} event.message.data.associations
	 * @param {String} event.message.data.knowledge
	 */
	universe.on("player:knowledge:append", function(event) {
		var entity = universe.get(event.message.data.entity),
			knowledge = universe.get(event.message.data.knowledge),
			associations = event.message.data.associations;

		if(entity && associations && (event.player.gm || (entity && entity.owned[event.player.id])) && knowledge && knowledge.character === entity.id &&  entity.knowledges && entity.knowledges.indexOf(knowledge.id) !== -1) {
			knowledge.addValues({
				"associations": associations
			});
		} else {
			// TODO: Access or Possession error
			console.warn("Share failed: ", !!entity, !!knowledge, entity.knowledges?entity.knowledges.indexOf(knowledge.id) !== -1:null);
		}
	});
};
