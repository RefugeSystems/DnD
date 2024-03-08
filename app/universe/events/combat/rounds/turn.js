/**
 * 
 * @class CombatRoundTurn
 * @constructor
 */

var Universe = require("../../../universe"),
	notifyMasterOnly = {
		"player:master": true
	};

/**
 * Sorting function to sort objects by initiative with rules for negotiating ties.
 * @method sortByInitiative
 * @static
 * @param {RSObject} a 
 * @param {RSObject} b 
 * @returns {Number}
 */
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

	if(a.dexterity > b.dexterity) {
		return -1;
	} else if(a.dexterity < b.dexterity) {
		return 1;
	}

	if(a.name < b.name) {
		return -1;
	} else if(a.name > b.name) {
		return 1;
	}
	
	return 0;
};

/**
 * 
 * @method initialize
 * @param {Universe} universe 
 */
module.exports.initialize = function(universe) {

	/**
	 * 
	 * @event player:skimish:turn
	 * @for Universe
	 * @deprecated USe the "player:skimish:turn:end" event
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
			/*
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
			*/
		} else {
			// TODO: Error handling and integrity warnings
		}
	});

	
	/**
	 * Game Master ending the current turn. Auto determine next entity and emit/set entity, turn, and round as needed.
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
			time = universe.time,
			date = Date.now(),
			entity;

		if(typeof(skirmish) === "string") {
			skirmish = universe.manager.skirmish.object[skirmish];
		}

		if(skirmish && skirmish.entities && event.player.gm) {
			entity = universe.get(skirmish.combat_turn);
			if(entity) {
				/**
				 * 
				 * @event entity:combat:turn:end
				 * @for Chronicle
				 * @param {String} skirmish
				 * @param {Number} time
				 * @param {Number} date
				 */
				entity.fireHandlers("entity:combat:turn:end", {
					"skirmish": skirmish.id,
					"time": time,
					"date": date
				});
			}
			nextTurn(skirmish);
		} else {
			// TODO: Error handling and integrity warnings
		}
	});

	/**
	 * Player self ending their turn. Then auto determine next entity and emit/set entity, turn, and round as needed.
	 * @event player:skimish:turn:end
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
	 universe.on("player:skimish:turn:end", function(event) {
		var skirmish = event.message.data.skirmish,
			entity = event.message.data.entity,
			time = universe.time,
			date = Date.now();

		if(typeof(skirmish) === "string") {
			skirmish = universe.manager.skirmish.object[skirmish];
		}
		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}

		if(skirmish && entity && skirmish.combat_turn === entity.id && (event.player.gm || entity.owned[event.player.id])) {
			/**
			 * 
			 * @event entity:combat:turn:end
			 * @for Chronicle
			 * @param {String} skirmish
			 * @param {Number} time
			 * @param {Number} date
			 */
			entity.fireHandlers("entity:combat:turn:end", {
				"skirmish": skirmish.id,
				"time": time,
				"date": date
			});
			nextTurn(skirmish);
		} else {
			// TODO: Error handling and integrity warnings
		}
	});

	/**
	 * 
	 * @method nextTurn
	 * @param {Skirmish} skirmish 
	 */
	var nextTurn = function(skirmish) {
		var up = universe.manager.entity.object[skirmish.combat_turn],
			time = universe.time,
			date = Date.now(),
			entities = [],
			current,
			entity,
			next,
			i;

		for(i=0; i<skirmish.entities.length; i++) {
			entity = skirmish.entities[i];
			if(typeof(entity) === "string") {
				entity = universe.manager.entity.object[entity];
			}
			if(entity && ((!entity.is_minion && !entity.is_npc) || (entity.hp !== 0 && entity.hp_max !== 0))) {
				if(typeof(entity.initiative) === "number") {
					entities.push(entity);
				} else if(!entity.is_npc && entity.owned && entity.id !== skirmish.combat_turn) {
					if(up) {
						universe.warnMasters("Initiative roll for " + entity.name, {
							"skill": "skill:initiative",
							"entity": entity.id
						});
					}
					universe.messagePlayers(entity.owned, "Roll Initiative for " + entity.name, "fa-solid fa-dice", {
						// ToMay: Add flags to sync back?
						"type": "dialog-open",
						"component": "dndDialogCheck",
						"storageKey": "store:roll:" + entity.id,
						"entity": entity.id,
						"skill": "skill:initiative",
						"hideFormula": true,
						"hideHistory": true,
						"closeAfterCheck": true
					}, 5000);
				}
			}
		}

		if(up && entities.indexOf(up) === -1) {
			// BLOCKED: Need event for "Request Roll"
			// TODO: Request Initiative Roll for Current Entity
			if(up.is_npc || up.is_minion) {
				up.setValues({
					"initiative": universe.calculator.compute("1d20 + " + (up.skill_check["skill:initiaitive"] || 0), up)
				});
				entities.push(up);
			}
		}
		if(up && entities.indexOf(up) === -1 && up.played_by) {
			universe.warnMasters("Need initiative roll for " + up.name, {
				"skill": "skill:initiative",
				"entity": up.id
			}, 5000);
			// universe.messagePlayers(up.owned, "Roll Initiative for " + up.name + " to end your turn", "fa-solid fa-dice", {
			// 	// ToMay: Add flags to sync back?
			// 	"type": "dialog-open",
			// 	"component": "dndDialogCheck",
			// 	"storageKey": "store:roll:" + up.id,
			// 	"entity": up.id,
			// 	"skill": "skill:initiative",
			// 	"hideFormula": true,
			// 	"hideHistory": true,
			// 	"closeAfterCheck": true
			// });
		} else if(entities.length) {
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
					/**
					 * 
					 * @event entity:combat:round:start
					 * @for Chronicle
					 * @param {String} skirmish
					 * @param {Number} time
					 * @param {Number} date
					 */
					entities[i].fireHandlers("entity:combat:round:start", {
						"skirmish": skirmish.id,
						"time": time,
						"date": date
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
			if(!entity.is_minion && !entity.is_npc && entity.played_by) {
				/**
				 * 
				 * @event entity:combat:turn:start
				 * @for Chronicle
				 * @param {String} skirmish
				 * @param {Number} time
				 * @param {Number} date
				 */
				// entity.fireHandlers("entity:combat:turn:start", {
				// 	"skirmish": skirmish.id,
				// 	"time": time,
				// 	"date": date
				// });
				universe.emit("send", {
					"type": "audio:queue",
					"audio": "audio:combat:turn",
					"control": "audio:play",
					"recipients": entity.owned
				});
				universe.emit("send", {
					"type": "audio:queue",
					"audio": "audio:combat:nextturn",
					"control": "audio:play",
					"recipients": notifyMasterOnly
				});
			}
			/**
			 * 
			 * @event entity:combat:turn:start
			 * @for Chronicle
			 * @param {String} skirmish
			 * @param {Number} time
			 * @param {Number} date
			 */
			entity.fireHandlers("entity:combat:turn:start", {
				"skirmish": skirmish.id,
				"time": time,
				"date": date
			});
			skirmish.setValues({
				"combat_turn": entity.id
			});

			if(entity.owned && Object.keys(entity.owned).length) {
				universe.messagePlayers(entity.owned, "It is \"" + entity.name + "\"'s turn in combat", null, null, 5000);
			}
			
			entity = entities[(next + 1)%entities.length];
			if(entity.owned && Object.keys(entity.owned).length) {
				universe.messagePlayers(entity.owned, "\"" + entity.name + "\" is on deck for combat", null, null, 5000);
			}
		} else {
			// TODO: Improve handling/feedback
			universe.warnMasters("Skirmish with no active entities");
		}
	};
};