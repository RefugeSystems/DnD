var Random = require("rs-random");

/**
 * 
 * @class CombatUtility
 * @constructor
 * @param {Universe} universe 
 */
module.exports.initialize = function(universe) {

	var tracking = {},
		alarms = {},
		logged = {},
		
		sendDamages,
		sendDamage,
		takeDamage;
	
	/**
	 * 
	 * @method takeDamage
	 * @staitc
	 * @param {String} [activity]
	 * @param {RSObject} entity 
	 * @param {Object} damage 
	 * @param {Object} [resist] 
	 */
	 takeDamage = module.exports.takeDamage = function(activity, entity, damage, resist = {}) {
		var tracked = tracking[activity],
			log = logged[activity],
			keys = Object.keys(damage),
			was_damaged = false,
			received,
			set = {},
			i;
		
		if(tracked) {
			clearTimeout(alarms[activity]);
			delete(tracking[activity]);
			log.resist = resist;
			universe.emit("send", {
				"type": "dismiss-message",
				"mid": "activity::" + activity,
				"recipients": tracked.target.owned
			});
		} else {
			log = {};
			log.target = entity.id;
			log.source = null;
			log.damage = damage;
			log.resist = resist;
		}
		universe.chronicle.addOccurrence("damaged", log, universe.time, log.source, entity.id);

		set.hp = entity.hp;
		for(i = 0; i < keys.length; i++) {
			if(typeof(resist[keys[i]]) === "string") {
				resist[keys[i]] = universe.calculator.computedDiceRoll(resist[keys[i]], entity, undefined, damage[keys[i]]);
			}
			received = damage[keys[i]] - (resist[keys[i]] || 0);
			// TODO: Handle feats/effects that allow heal on damage type over-resist
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

		// TODO: Process channel.instilled if any[#178704758]; was_damaged -> effect.damage_required
		if(set.hp !== entity.hp) {

		}

		if(set.hp) {
			set.death_fail = 0;
			set.death_save = 0;
		}

		entity.setValues(set, function(err) {
			if(err) {
				universe.generalError("damage:taken", err, "Issue setting HP: " + err.message);
			} else {
				
			}
		});
	};

	/**
	 * 
	 * @method sendDamages
	 * @staitc
	 * @param {String} activity ID for the exchange
	 * @param {RSObject} [source] 
	 * @param {Array | RSObject} targets 
	 * @param {RSObject | String} [channel] 
	 * @param {Object} damage 
	 */
	 sendDamages = module.exports.sendDamages = function(source, targets, channel, damage) {
		var id = Random.identifier("attack::", 10, 32),
			activity,
			target,
			i;

		if(typeof(channel) === "string") {
			channel = universe.get(channel);
		}

		for(i=0; i<targets.length; i++) {
			target = targets[i];
			activity = id + ":" + target.id;
			tracking[activity] = {
				"gametime": universe.time,
				"time": Date.now(),
				"source": source,
				"target": target,
				"channel": channel,
				"damage": damage
			};
			logged[activity] = {
				"gametime": universe.time,
				"source": source?source.id:null,
				"target": target.id,
				"channel": channel?channel.id:null,
				"damage": damage
			};

			universe.chronicle.addOccurrence("damaging", logged[activity], universe.time, logged[activity].source, logged[activity].target);
			sendDamage(activity, source, target, logged[activity].channel, damage);
		}
	};

	/**
	 * Sends the damage notification and set an alarm to fire until completed
	 * @method sendDamage
	 * @private
	 * @static
	 * @param {String} activity ID to complete for taking damage.
	 * @param {RSObject} [source] Entity or item dealing the damage, if any. For instance, may be undefined for environmental
	 * 		damage.
	 * @param {RSObject} target Entity being hurt.
	 * @param {String} [channel] ID for the Spell, Item, or other method through which the damage is being delt, if any.
	 * @param {Object} damage Being dealth, with damage_type ID keys mapped to values
	 */
	sendDamage = function(activity, source, target, channel, damage) {
		var notify = function() {
			var type = Object.keys(damage),
				icon;
			if(type.length === 1 && type[0] === "damage_type:heal") {
				type = (target.nickname || target.name) + " receiving healing";
				icon = "fad fa-heartbeat rs-white rs-secondary-solid rs-secondary-green";
			} else {
				type = (target.nickname || target.name) + " taking damage";
				icon = "game-icon game-icon-crossed-slashes rs-lightred";
			}

			universe.emit("send", {
				"type": "notice",
				"mid": "activity::" + activity,
				"message": type + (source?" from " + (source.nickname || source.name):""),
				"icon": icon,
				"anchored": true,
				"recipients": target.owned || universe.getMasters(),
				"emission": {
					"type": "dialog-open",
					"component": "dndDialogRoll",
					"storageKey": "store:roll:" + target,
					"action": "action:damage:recv",
					"activity": activity,
					"source": source?source.id:null,
					"entity": target.id,
					"channel": channel,
					"damage": damage,
					"fill_damage": true,
					"closeAfterAction": true
				}
			});

			// sendDamages(activity, tracking[activity].source, tracking[activity].target, tracking[activity].channel?tracking[activity].channel.id:null, tracking[activity].damage);
			alarms[activity] = setTimeout(notify, 5000);
		};
		notify();
	};

	/**
	 * 
	 * @event player:damage:send
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
	 * @param {String} [event.message.data.source] Required unless the player is the Game Master
	 * @param {String} [event.message.data.target] Either a target or targets must be specified
	 * @param {String} [event.message.data.targets] Either a target or targets must be specified
	 * @param {String} event.message.data.damage damage_Type keys to value mapping
	 * @param {String} [event.message.data.channel] Item, Spell, or other ID for the cause of the damage if any.
	 * 		Null source requires Game Master player.
	 */
	universe.on("player:action:damage:send", function(event) {
		var damage = event.message.data.damage,
			targets = [],
			channel,
			target,
			source,
			i;


		if(event.message.data.source) {
			source = universe.get(event.message.data.source);
		}

		if(event.message.data.channel) {
			channel = universe.get(event.message.data.channel);
		}

		if(event.message.data.target) {
			target = universe.get(event.message.data.target);
			if(target) {
				targets.push(target);
			}
		}
		if(event.message.data.targets) {
			for(i=0; i<event.message.data.targets.length; i++) {
				target = universe.get(event.message.data.targets[i]);
				if(target) {
					targets.push(target);
				}
			}
		}

		if(targets.length) {
			if(source && (source.owned[event.player] || event.player.gm)) {
				sendDamages(source, targets, channel, damage);
			} else if(!source && event.player.gm) {
				sendDamages(null, targets, channel, damage);
			}
		} else {
			// TODO: Log bad event
			console.log("Target missing: ", event.message.data);
		}
	});

	/**
	 * 
	 * @event player:damage:recv
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
	 * @param {Object} event.message.data.entity Being harmed
	 * @param {String} [event.message.data.activity] Activity being completed if any. Null to allow players to
	 * 		arbitrarily take damage for non-tracked events.
	 * @param {Object} event.message.data.damage To take
	 * @param {Object} event.message.data.resist 
	 */
	 universe.on("player:action:damage:recv", function(event) {
		 var entity = universe.get(event.message.data.entity);
		 if(entity) {
			 if(entity.owned[event.player.id] || entity.played_by === event.player.id || event.player.gm) {
				takeDamage(event.message.data.activity, entity, event.message.data.damage, event.message.data.resist);
			 }
		} else {
			// TODO: Log bad event
			console.log("No entity for taking damage: ", event.message);
		}
	});
} ;
