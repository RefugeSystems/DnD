
module.exports.initialize = function(universe) {
	var combatUtility = require("../combat/utility"),
		manager = universe.manager.action;

	/**
	 * 
	 * @event player:action:count
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
	 * @param {String} event.message.data.action
	 * @param {Integer} event.message.data.delta
	 */
	 universe.on("player:action:count", function(event) {
		var action = event.message.data.action,
			entity = event.message.data.entity,
			change = event.message.data.delta,
			update;

		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}

		if(entity && entity.action_count && (event.player.gm || (entity.owned && entity.owned[event.player.id]))) {
			update = {};
			update.action_count = {};
			update.action_count[action] = change;
			entity.addValues(update);
		} else {
			universe.warnMasters("Entity action count change failed by player action", event.message.data);
		}
	 });

	/**
	 * General action bindings processed here.
	 * 
	 * This currently specifically applies to entity responses.
	 * 
	 * TODO: Expand processing to bind more dynamically to actions to allow creation and deletion while running.
	 * @event action
	 */
	manager.objectIDs.forEach(function(id) {
		// TODO: Improve at-response-time handling to allow actions to be created on the fly
		// console.log("Actionable - " + id);
		universe.on(id, function(event) {
			var entity = event.source || event.entity;
			if(typeof(entity) === "string") {
				entity = universe.get(entity);
			}
			// console.log("Action: ", event.action?event.action.id || event.action:"none?", entity?entity.id:"No Entityt");
			if(entity && entity.response && entity.response[id] && entity.response[id].length) {
				var response,
					rolled,
					rolls,
					ref,
					i,
					j;

				for(i=0; i<entity.response[id].length; i++) {
					response = entity.response[id][i];
					if(response && !response.ui && !response.is_display) {
						if(response.event) {
							switch(response.event) {
								case "damage_recur":
									rolls = Object.keys(response.damage);
									rolled = {};
									for(j=0; j<rolls.length; j++) {
										rolled[rolls[j]] = universe.calculator.computedDiceRoll(response.damage[rolls[j]], entity);
									}
									combatUtility.sendDamages(entity, [entity], response.channel || null, rolled);
									break;
								case "notice":
									universe.messagePlayers(entity.owned, response.message, response.icon);
									break;
								default:
									universe.warnMasters("Response with unknown event descriptor in entity " + entity.name, {
										"entity": entity,
										"response": response,
										"time": Date.now()
									});
							}
						} else {
							if(response.add) {
								entity.addValues(response.add);
							}
							if(response.sub) {
								entity.subValues(response.sub);
							}
							if(response.set) {
								entity.setValues(response.set);
							}
							if(response.add_roll) {
								rolls = Object.keys(response.add_roll);
								rolled = {};
								ref = [];
								for(j=0; j<rolls.length; j++) {
									rolled[rolls[j]] = universe.calculator.computedDiceRoll(response.add_roll[rolls[j]], entity, ref);
								}
								entity.addValues(rolled);
							}
							if(response.sub_roll) {
								rolls = Object.keys(response.sub_roll);
								rolled = {};
								ref = [];
								for(j=0; j<rolls.length; j++) {
									rolled[rolls[j]] = universe.calculator.computedDiceRoll(response.sub_roll[rolls[j]], entity, ref);
								}
								entity.subValues(rolled);
							}
							if(response.announced) {
								universe.messagePlayers(entity.owned, (response.name || "An event") + " happened to " + (entity.name || "a creature of yours"), response.icon);
							}
						}
					}
				}
			}
		});
	});

	/**
	 * Generic action handling routing.
	 * 
	 * Ensures basic rights access on the source and/or entity object
	 * then re-emits for an action handler to process.
	 * @event player:action:perform
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
	 * @param {Roll} event.message.data.roll
	 */
	 universe.on("player:action:perform", function(event) {
		var perform,
			action,
			source,
			also,
			i;

		perform = {
			"type": "entity:action",
			"activity": event.message.data.activity,
			"result": event.message.data.result,
			"damage": event.message.data.damage,
			"resist": event.message.data.resist,
			"entity": event.message.data.entity || event.message.data.source,
			"source": event.message.data.source || event.message.data.entity,
			"action": event.message.data.action,
			"target": event.message.data.target,
			"skill": event.message.data.skill,
			"check": event.message.data.check,
			"channel": event.message.data.using,
			"spell": event.message.data.spell,
			"item": event.message.data.item,
			"name": event.message.data.name,
			"roll": event.message.data.roll,
			"player": event.player.id
		};

		console.log("Perform: ", perform);

		if(perform.action) {
			action = manager.object[perform.action];
			if(action && !action.disabled && !action.is_preview && perform.entity) {
				perform.action = action;
				source = universe.get(perform.entity);
				if(source && (source.played_by === event.player.id || (source.owned && source.owned[event.player.id]) || event.player.gm)) {
					perform.entity = source;
					universe.emit(perform.action.id, perform);
					console.log("Performed: ", perform.action.id);

					if(action.also) {
						for(i=0; i<action.also.length; i++) {
							console.log("Also: " + action.also[i]);
							also = manager.object[action.also[i]];
							if(also && !also.disabled && !also.is_preview) {
								console.log(" > Emit: " + also.id);
								universe.emit(also.id, {
									"entity": source,
									"action": also
								});
							}
						}
					}
				} else {
					universe.emit("error", new universe.Anomaly("action:perform:error", "Player not allowed to perform action for entity", perform, 50, null, "entity:action"));
				}
			} else {
				universe.emit("error", new universe.Anomaly("action:perform:warning", "No action source found", perform, 40, null, "entity:action"));
			}
		} else {
			universe.emit("error", new universe.Anomaly("action:perform:warning", "No action specified", perform, 40, null, "entity:action"));
		}
	});
};
