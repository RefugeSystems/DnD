var Random = require("rs-random");

module.exports.initialize = function(universe) {
	var tracking = {},
		alarms = {};

	/**
	 * 
	 * @method takeDamage
	 * @param {Object} entity 
	 * @param {Object} damage 
	 * @param {Object} resist 
	 */
	var takeDamage = function(entity, damage, resist) {
		var keys = Object.keys(damage),
			received,
			set = {},
			i;
		
		set.hp = entity.hp;
		if(!resist) {
			resist = {};
		}

		for(i = 0; i < keys.length; i++) {
			if(typeof(resist[keys[i]]) === "string") {
				resist[keys[i]] = universe.calculator.computedDiceRoll(resist[keys[i]], entity, undefined, damage[keys[i]]);
			}
			received = damage[keys[i]] - (resist[keys[i]] || 0);
			if(received < 0) {
				received = 0;
			}
			if(keys[i] === "damage_type:heal") {
				set.hp += received;
			} else {
				set.hp -= received;
			}
		}

		if(set.hp < 0) {
			set.hp = 0;
		} else if(set.hp > entity.hp_max) {
			set.hp = entity.hp_max;
		}

		if(set.hp) {
			set.death_fail = 0;
			set.death_save = 0;
		}

		entity.setValues(set, function(err) {
			if(err) {
				universe.generalError("attack:damage", err, "Issue setting HP: " + err.message);
			} else {
				
			}
		});
	};

	/**
	 * 
	 * @method sendDamage
	 * @private
	 * @param {String} activity ID for the exchange
	 * @param {Object} source 
	 * @param {Object} target 
	 * @param {String} channel 
	 * @param {Object} damage 
	 */
	var sendDamage = function(activity, source, target, channel, damage) {
		console.log("Sending: ", activity, source.id, target.id, channel, damage);
		var recipients;

		if(target.owned && Object.keys(target.owned).length) {
			recipients = target.owned;
		} else {
			recipients = universe.getMasters();
		}

		universe.emit("send", {
			"type": "notice",
			"mid": "activity::" + activity,
			"message": (target.nickname || target.name) + " taking damage from " + (source.nickname || source.name),
			"icon": "game-icon game-icon-crossed-slashes rs-lightred",
			"anchored": true,
			"recipients": recipients,
			"emission": {
				"type": "dialog-open",
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + target.id,
				"action": "action:damage:complete",
				"activity": activity,
				"source": source.id,
				"entity": target.id,
				"channel": channel,
				"damage": damage,
				"closeAfterAction": true
			}
		});
	};

	/**
	 * 
	 * @event action:free:damage
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type 
	 * @param {String} event.damage Mapping damage_type IDs to damage taken
	 * @param {String} event.resist  Mapping damage_type IDs to damage reduced of that type
	 * @param {String} event.entity Taking damage
	 * @param {String} event.action Being performed
	 * @param {String} event.target Taking the damage
	 * @param {String} event.source Of the damage if any
	 * @param {String} event.item Doing the damage
	 * @param {String} event.player Ordering the damage
	 * @param {Object} event.recipients To notify of the damage
	 */
	universe.on("action:free:damage", function(event) {
		var entity = event.target || event.entity,
			player = event.player;
		if(typeof(player) === "string") {
			player = universe.get(player);
		}
		if(typeof(entity) === "string") {
			entity = universe.get(entity);
		}
		if(player && (player.gm || entity.owned[event.player])) {
			universe.chronicle.addOccurrence("entity:damage", event, universe.time, entity.id, entity.id);
			takeDamage(entity, event.damage, event.resist);
		}
	});

	/**
	 * 
	 * @event action:main:attack
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.result Mapping damage_type IDs to damage taken
	 * @param {String} event.entity Taking damage
	 * @param {String} event.target Taking the damage
	 * @param {String} event.item Doing the damage
	 * @param {String} event.player Ordering the damage
	 */
	universe.on("action:main:attack", function(event) {
		var source = universe.get(event.entity),
			target = universe.get(event.target),
			channel = universe.get(event.item),
			id = Random.identifier("attack::", 10, 32),
			notify;

		if(source && source.owned[event.player]) {
			universe.chronicle.addOccurrence("entity:attack:start", event, universe.time, source.id, target.id);
			tracking[id] = {
				"time": Date.now(),
				"source": source,
				"target": target,
				"event": event
			};

			notify = function() {
				sendDamage(id, source, target, channel.id, event.result);
				alarms[id] = setTimeout(notify, 5000);
			};
			notify();
		}
	});

	/**
	 * 
	 * @event action:damage:complete
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.activity
	 * @param {String} event.damage 
	 * @param {String} event.resist 
	 * @param {String} event.player
	 */
	universe.on("action:damage:complete", function(event) {
		var attack = tracking[event.activity];
		console.log("Complete Damage: ", event);
		if(attack && attack.target.owned[event.player]) {
			clearTimeout(alarms[event.activity]);
			delete(tracking[event.activity]);
			universe.chronicle.addOccurrence("entity:attack:complete", event, universe.time, attack.source.id, attack.target.id);
			takeDamage(attack.target, event.damage, event.resist);
			universe.emit("send", {
				"type": "dismiss-message",
				"mid": "activity::" + event.activity,
				"recipients": attack.target.owned
			});
		}
	});


	/**
	 * 
	 * @event player:attack:start
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
	 * @param {String} event.message.data.source 
	 * @param {String} event.message.data.target 
	 * @param {String} event.message.data.damage
	 * @param {String} event.message.data.item
	 */
	universe.on("player:attack:start", function(event) {
		var source = universe.get(event.message.data.source),
			target = universe.get(event.message.data.target),
			channel = universe.get(event.message.data.item),
			id = Random.identifier("attack::", 10, 32);

		if(source && source.owned[event.player.id]) {
			universe.chronicle.addOccurrence("entity:attack:start", event.message.data, universe.time, source.id, target.id);
			tracking[id] = {
				"time": Date.now(),
				"source": source,
				"target": target,
				"event": event
			};
			sendDamage(id, source, target, channel.id, event.message.data.damage);
		}
	});

	/**
	 * 
	 * @event player:attack:complete
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
	 * @param {String} event.message.data.id Of the attack from the "attack:start" 
	 * @param {String} event.message.data.damage 
	 * @param {String} event.message.data.resist
	 */	
	universe.on("player:attack:complete", function(event) {
		var attack = tracking[event.message.data.id];

		if(attack && attack.target.owned[event.player.id]) {
			delete(tracking[event.message.data.id]);
			universe.chronicle.addOccurrence("entity:attack:complete", event.message.data, universe.time, attack.source.id, attack.target.id);
			takeDamage(attack.target, event.message.data.damage, event.message.data.resist);
		}
	});

	/**
	 * 
	 * @event player:spell:cast
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
	 * @param {String} event.message.data.source 
	 * @param {String} event.message.data.target 
	 * @param {String} event.message.data.damage
	 * @param {String} event.message.data.spell
	 */	
	universe.on("player:spell:cast", function(event) {
		var id = Random.identifier("cast::", 10, 32);
	});

	/**
	 * 
	 * @event player:spell:save
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
	 * @param {String} event.message.data.id 
	 * @param {String} event.message.data.save
	 */	
	universe.on("player:spell:save", function(event) {

	});
};
