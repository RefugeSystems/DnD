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
};
