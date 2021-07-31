
var sortByInitiative = function(a, b) {
	if((a.initiative === undefined || a.initiative === null) && b.initiative !== undefined && b.initiative !== null) {
		return 1;
	} else if((b.initiative === undefined || b.initiative === null) && a.initiative !== undefined && a.initiative !== null) {
		return -1;
	}
	if(a.initiative !== undefined && b.initiative !== undefined && a.initiative !== null && b.initiative !== null) {
		if(a.initiative < b.initiative) {
			return 1;
		} else if(a.initiative > b.initiative) {
			return -1;
		}
	}

	if(a.name < b.name) {
		return -1;
	} else if(a.name > b.name) {
		return 1;
	}
	
	return 0;
};

module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:skimish:turn
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
	 * @param {String} event.message.data.skirmish
	 * @param {String} event.message.data.entity
	 */
	universe.on("player:skimish:turn", function(event) {
		var skirmish = event.message.data.skirmish,
			entity = event.message.data.entity;

		if(typeof(skirmish) === "string") {
			skirmish = universe.manager.skirmish.object[skirmish];
		}
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}

		if(entity && skirmish && skirmish.entities && skirmish.entities.indexOf(entity.id) !== -1 && event.player.gm) {
			universe.emit("action:combat:turn:end", {
				"action": "action:combat:turn:end",
				"entity": skirmish.combat_turn
			});
			universe.emit("action:combat:turn:start", {
				"action": "action:combat:turn:start",
				"entity": entity
			});
			universe.emit("combat:turn", {
				"skirmish": skirmish.id,
				"turn": entity.id
			});
			skirmish.setValues({
				"combat_turn": entity.id
			});
		} else {
			// TODO: Error handling and integrity warnings
		}
	});

	
	/**
	 * Auto determine next entity and emit/set entity, turn, and round as needed.
	 * @event player:skimish:turn:next
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
	 * @param {String} event.message.data.skirmish
	 */
	 universe.on("player:skimish:turn:next", function(event) {
		var skirmish = event.message.data.skirmish,
			entities = [],
			current,
			entity,
			next,
			i;

		if(typeof(skirmish) === "string") {
			skirmish = universe.manager.skirmish.object[skirmish];
		}

		if(skirmish && skirmish.entities && event.player.gm) {
			for(i=0; i<skirmish.entities.length; i++) {
				entity = skirmish.entities[i];
				if(typeof(entity) === "string") {
					entity = universe.manager.entity.object[entity];
				}
				if(entity && typeof(entity.initiative) === "number") {
					entities.push(entity);
				}
			}

			if(entities.length) {
				entities.sort(sortByInitiative);
				if(skirmish.combat_turn) {
					for(i=0; i<entities.length; i++) {
						if(entities[i].id === skirmish.combat_turn) {
							current = i;
							next = i + 1;
							break;
						}
					}
					if(entities.length <= next) {
						next = 0;
					}
				} else {
					current = 0;
					next = 0;
				}
				entity = entities[next];
				if(next === 0) {
					if(current !== 0) {
						universe.forwardTime(6);
					}
					for(i=0; i<entities.length; i++) {
						universe.emit("action:combat:round:start", {
							"action": "action:combat:round:start",
							"entity": entities[i]
						});
					}
					universe.emit("combat:round", {
						"skirmish": skirmish.id,
						"turn": entity.id
					});
				}
				universe.emit("action:combat:turn:end", {
					"action": "action:combat:turn:end",
					"entity": skirmish.combat_turn
				});
				universe.emit("action:combat:turn:start", {
					"action": "action:combat:turn:start",
					"entity": entity
				});
				universe.emit("combat:turn", {
					"skirmish": skirmish.id,
					"turn": entity.id
				});
				skirmish.setValues({
					"combat_turn": entity.id
				});

				if(entity.owned && Object.keys(entity.owned).length) {
					universe.messagePlayers(entity.owned, "It is \"" + entity.name + "\"'s turn in combat");
				}
				
				entity = entities[(next + 1)%entities.length];
				if(entity.owned && Object.keys(entity.owned).length) {
					universe.messagePlayers(entity.owned, "\"" + entity.name + "\" is on deck for combat");
				}
			} else {
				// TODO: Improve handling/feedback
				universe.warnMasters("Skirmish with no active entities");
			}
		} else {
			// TODO: Error handling and integrity warnings
		}
	});
};