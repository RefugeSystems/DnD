var Random = require("rs-random");

module.exports.initialize = function(universe) {
	
	/**
	 * 
	 * @event player:character:transform
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
	 * @param {String} event.message.data.character The character being transformed (Ideally also the current player
	 * 		character). TODO: UI display support for the new veil entity between the original entity and their new transformed
	 * 		entity.
	 * @param {String} event.message.data.transform The target to transform into
	 * @param {String} event.message.data.polymorph When set, stores the current entity data and replaces it with
	 * 		the transform source data instead of shimming a copy.
	 * @param {String} event.message.data.player The target to transform into
	 */
	universe.on("player:character:transform", function(event) {
		var player = event.message.data.player || event.player,
			character = event.message.data.character,
			transform = event.message.data.transform,
			polymorph = event.message.data.polymorph,
			meeting = universe.getActiveMeeting(),
			player_attr,
			handlers,
			handler,
			actions,
			action,
			mask,
			i;

		if(typeof(character) === "string") {
			character = universe.manager.entity.object[character];
		}
		if(typeof(transform) === "string") {
			transform = universe.manager.entity.object[transform];
		}
		if(typeof(player) === "string") {
			player = universe.manager.player.object[player];
		}
		
		// Manually pull the handler that should automatically manage reverting to the base form on 0HP
		handler = universe.manager.handler.object["handler:transformation:revert"];
		if(!handler) {
			universe.notifyMasters("Player transforming and unable to find transformation handler", event.message.data);
		}
		action = universe.manager.action.object["action:transformation:revert"];
		if(!action) {
			universe.notifyMasters("Player transforming and unable to find untransformation action", event.message.data);
		}

		if(player && character && transform && (player.gm || (character.owned[player.id] && event.player.attribute.playing_as === character.id))) {
			handlers = transform.handlers || [];
			if(handler) {
				handlers.push(handler.id);
			}
			actions = transform.actions || [];
			if(action) {
				actions.push(action.id);
			}

			mask = {};
			mask.id = Random.identifier("entity").toLowerCase();
			mask.name = character.name;
			mask.transform_character = character.id;
			mask.transform_player = player.id;
			mask.character = character.id;
			mask.skill_proficiency = character.skill_proficiency;
			mask.stat_intelligence = character.stat_intelligence;
			mask.stat_charisma = character.stat_charisma;
			mask.stat_wisdom = character.stat_wisdom;
			mask.initiative = character.initiative;
			mask.hp = transform.hp_max;
			mask.handlers = handlers;
			mask.actions = actions;
			mask.owned = {};
			mask.owned[player.id] = Date.now();
			mask.parent = transform.id;
			mask.effects = character.effects;
			mask.inventory = character.inventory;
			mask.equipped = character.equipped;
			mask.stealth = character.stealth;

			universe.createObject(mask, function(error, transformed) {
				if(error) {
					// TODO: Log Error
					universe.notifyMasters("Error during Player transformation creation: " + error.message, event.message.data);
				} else {
					// TODO: Update party list
					if(meeting) {
						if(meeting.entities.indexOf(transformed.id) === -1) {
							meeting.addValues({
								"entities": [transformed.id]
							});
						}
						meeting.subValues({
							"entities": [character.id]
						});
					}
					if(meeting = universe.getActiveSkirmish()) {
						if(meeting.combat_turn === character.id) {
							meeting.setValues({
								"combat_turn": transformed.id
							});
						}
						if(meeting.entities.indexOf(transformed.id) === -1) {
							meeting.addValues({
								"entities": [transformed.id]
							});
						}
						meeting.subValues({
							"entities": [character.id]
						});
					}
					/*
					timer.id = id;
					timer.icon = icon || "fa-duotone fa-hourglass";
					timer.name = name || "Timer";
					timer.timer_mark = Date.now() + duration;
					timer.is_active = active;
					timer.countdown = true;
					timer.ongoing = true;
					timer.type = "timer";
					activeTimers[id] = entry;
					timer = [timer];
					*/

					transformed.addValues({
						"active_events": [{
							"activate": "dialog:confirmation:send",
							"id": Random.identifier("action").toLowerCase(),
							"name": "Transformed",
							"icon": transformed.icon || "fa-solid fa-user",
							"description": "Currently transformation into " + transform.name,
							"type": "concentration",
							"send": "character:untransform",
							"okay_text": "End Transformation",
							"is_active": true,
							"ongoing": true
						}]
					});

					player_attr = Object.assign({}, player.attribute);
					player_attr.playing_as = transformed.id;
					player.setValues({
						"attribute": player_attr
					});
				}
			});

			if(transform.review) {
				universe.notifyMasters("Player transformed into an entity marked for Review", {
					"data": event.message.data,
					"info": transform.id
				});
			}
		}
	});
	
	/**
	 * 
	 * @event player:character:untransform
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
	 * @param {String} event.message.data.character 
	 */
	universe.on("player:character:untransform", function(event) {
		var character = event.message.data.character,
			meeting = universe.getActiveMeeting(),
			player = event.player,
			player_attr;

		if(typeof(character) === "string") {
			character = universe.manager.entity.object[character];
		}

		if(character && (player.gm || (character.owned[player.id] && character.transform_player === player.id && character.transform_character))) {
			player_attr = Object.assign({}, player.attribute);
			player_attr.playing_as = character.transform_character;
			// TODO: Update party list
			player.setValues({
				"attribute": player_attr
			});
			if(meeting) {
				if(meeting.entities.indexOf(character.transform_character) === -1) {
					meeting.addValues({
						"entities": [character.transform_character]
					});
				}
				meeting.subValues({
					"entities": [character.id]
				});
			}
			if(meeting = universe.getActiveSkirmish()) {
				if(meeting.combat_turn === character.id) {
					meeting.setValues({
						"combat_turn": character.transform_character
					});
				}
				if(meeting.entities.indexOf(character.transform_character) === -1) {
					meeting.addValues({
						"entities": [character.transform_character],
						"killed": [character.id]
					});
				}
				meeting.subValues({
					"entities": [character.id]
				});
			}
		}
	});
};
