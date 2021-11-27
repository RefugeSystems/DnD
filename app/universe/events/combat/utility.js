var Random = require("rs-random");

var TRACKING_Limit = 18;

/**
 * 
 * @class CombatUtility
 * @constructor
 * @param {Universe} universe 
 */
module.exports.initialize = function(universe) {

	var activityPrefix = "activity:",
		tracking = {},
		alarms = {},
		logged = {},
		
		finishSave,
		sendSaves,
		sendSave,

		finishDamage,
		sendDamages,
		sendDamage,
		takeDamage;
	
	/**
	 * 
	 * @method takeDamage
	 * @deprecated
	 * @staitc
	 * @param {String} [activity]
	 * @param {RSObject} entity 
	 * @param {Object} damage 
	 * @param {Object} [resist] 
	 */
	/**
	 * 
	 * @method finishDamage
	 * @staitc
	 * @param {String} [activity]
	 * @param {RSObject} entity 
	 * @param {Object} damage 
	 * @param {Object} [resist] 
	 */
	takeDamage = module.exports.takeDamage = finishDamage = module.exports.finishDamage = function(activity, entity, damage, resist = {}) {
		var tracked = tracking[activity],
			log = logged[activity],
			waiting = [],
			was_damaged,
			adding,
			effect,
			notify,
			copy,
			i;

		if(tracked) {
			clearTimeout(alarms[activity]);
			delete(tracking[activity]);
			log.resist = resist;
			if(tracked.target.owned && Object.keys(tracked.target.owned).length) {
				notify = tracked.target.owned;
			} else {
				notify = universe.getMasters();
			}
			universe.emit("send", {
				"type": "dismiss-message",
				"mid": activityPrefix + activity,
				"recipients": notify
			});
		} else {
			log = {};
			log.target = entity.id;
			log.source = null;
			log.damage = damage;
			log.resist = resist;
		}
		if(damage) {
			universe.chronicle.addOccurrence("entity:damaged", log, universe.time, log.source, entity.id);
			was_damaged = resolveDamage(entity, damage, resist);
			if(tracked && tracked.source && tracked.target) {
				if(tracked.channel && tracked.channel.instilled && tracked.channel.instilled.length) {
					for(i=0; i<tracked.channel.instilled.length; i++) {
						effect = universe.get(tracked.channel.instilled[i]);
						if(!effect.damage_required || was_damaged) {
							waiting.push(universe.copyPromise(effect, {
								"character": tracked.target.id,
								"caster": tracked.source.id
							}));
						}
					}
				}
				if(tracked.effects && tracked.effects.length) {
					for(i=0; i<tracked.effects.length; i++) {
						effect = universe.get(tracked.effects[i]);
						if(!effect.damage_required || was_damaged) {
							waiting.push(universe.copyPromise(effect, {
								"character": tracked.target.id,
								"caster": tracked.source.id
							}));
						}
					}
				}
				if(waiting.length) {
					Promise.all(waiting)
					.then(function(effects) {
						adding = [];
						for(i=0; i<effects.length; i++) {
							adding.push(effects[i].id);
						}
						tracked.target.addValues({
							"effects": adding
						});
					})
					.catch(function(err) {
						universe.generalError("damage:taken", null, "Error while instilling channel effects", {
							"activity": activity,
							"log": log
						});
					});
				}
			}
		} else {
			try {
				universe.generalError("damage:taken", null, "No damage was received for entity:damaged event", {
					"activity": activity,
					"log": log
				});
			} catch(shouldNotHappen) {
				universe.generalError("damage:taken", new Error("No Damage") /* For Trace */, "No damage was received for entity:damaged event");
			}
		}
	};

	/**
	 * 
	 * @method finishSave
	 * @staitc
	 * @param {String} [activity]
	 * @param {RSObject} entity 
	 * @param {Object} save 
	 * @param {boolean} critical 
	 * @param {boolean} failure 
	 */
	finishSave = module.exports.finishSave = function(activity, entity, save, resist, critical, failure) {
		var tracked = tracking[activity],
			log = logged[activity],
			was_damaged,
			succeeded,
			castMask,
			buffer,
			notify,
			keys,
			i;
		
		if(!save) {
			save = 0;
		}
		if(tracked) {
			clearTimeout(alarms[activity]);
			delete(tracking[activity]);
			console.log("Cleared: " + activity);
			log.activity = activity;
			log.resist = resist;
			log.save = save;
			log.critical = critical;
			log.failure = failure;
			log.succeeded = succeeded = tracked.difficulty <= save;
			if(tracked.target.owned && Object.keys(tracked.target.owned).length) {
				notify = tracked.target.owned;
			} else {
				notify = universe.getMasters();
			}
			universe.emit("send", {
				"type": "dismiss-message",
				"mid": activityPrefix + activity,
				"recipients": notify
			});
		} else {
			log = {};
			log.activity = activity;
			log.target = null;
			log.source = entity.id;
			log.save = save;
			log.critical = critical;
			log.failure = failure;
		}
		universe.chronicle.addOccurrence("entity:saved", log, universe.time, log.source, entity.id);
		if(tracked && tracked.target) {
			castMask = {};
			castMask.caster = log.source;
			castMask.level = log.level;
			if(tracked.channel && tracked.channel.duration) {
				castMask.expiration = universe.time + tracked.channel.duration;
			}

			if(!failure && (critical || succeeded)) {
				console.log("Succeed [" + save + " vs. DC" + tracked.difficulty + "]");
				if(tracked.damage) {
					// TODO: Improve logic for spell damage reduction as cantrip vs. full spell []
					tracked.resist = tracked.resist || {};
					if(log.level) {
						keys = Object.keys(tracked.damage);
						for(i=0; i<keys.length; i++) {
							if(tracked.resist[keys[i]]) {
								tracked.resist[keys[i]] = " + 50%";
							} else {
								tracked.resist[keys[i]] = "50%";
							}
						}
					} else {
						tracked.damage = {};
					}
				}
			} else {
				console.log("Failure [" + save + " vs. DC" + tracked.difficulty + "]");
			}
			was_damaged = resolveDamage(entity, tracked.damage, tracked.resist);
			if(tracked.channel && tracked.channel.instilled && tracked.channel.instilled.length) {
				for(i=0; i<tracked.channel.instilled.length; i++) {
					buffer = universe.get(tracked.channel.instilled[i]);
					if(buffer && ((buffer.damage_required && was_damaged && buffer.hit_required && succeeded === false)
							|| (buffer.damage_required && was_damaged && !buffer.hit_required)
							|| (!buffer.damage_required && buffer.hit_required && succeeded === false)
							|| (!buffer.damage_required && !buffer.hit_required))) {
						universe.copy(buffer.id, castMask, function(err, effect) {
							universe.trackExpiration(effect, log.target, "effects");
							tracked.target.addValues({
								"effects": [effect.id]
							});
						});
					}
				}
			}


		} else {
			// No auto, just log to chronicle
		}
		console.log("Finishing Save: ", log);
	 };

	/**
	 * 
	 * @method resolveDamage
	 * @param {RSObject} entity 
	 * @param {Object} damage 
	 * @param {Object} resist 
	 * @returns {Boolean} True if damage was taken, false otherwise. If healing occurs, this will
	 * 		return true that "healing" "damage" was taken. Merely indicates HP changed.
	 */
	var resolveDamage = function(entity, damage, resist = {}) {
		if(!damage) {
			universe.generalError("damage:taken", new Error("No Damage") /* For Trace */, "No damage was received");
			return false;
		}
		var keys = Object.keys(damage),
			was_damaged = false,	
			received,
			add = {},
			temp_cap,
			i;

		add.hp_temp = 0;
		add.hp = 0; //entity.hp;
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
				add.hp += received;
			} else if(keys[i] === "damage_type:temphp") {
				add.hp_temp += received;
			} else {
				add.hp -= received;
			}
		}

		// if(add.hp < 0) {
		// 	add.hp = 0;
		// } else if(add.hp > entity.hp_max) { // This is also "passively" handled by the max configuration on the hp field
		// 	add.hp = entity.hp_max;
		// }

		if(entity.hp_temp && add.hp < 0) {
			temp_cap = -1 * entity.hp_temp;
			if(temp_cap <= add.hp) {
				add.hp_temp = add.hp;
				add.hp = 0;
			} else {
				add.hp_temp = temp_cap;
				add.hp -= temp_cap;
			}
		}

		// TODO: Process channel.instilled if any[#178704758]; was_damaged -> effect.damage_required
		if(add.hp !== 0) {
			was_damaged = true;
		}

		if(add.hp) {
			add.death_fail = 0;
			add.death_save = 0;
		}

		entity.addValues(add, function(err) {
			if(err) {
				universe.generalError("damage:taken", err, "Issue setting HP: " + err.message);
			}
		});

		return was_damaged;
	};

	/**
	 * 
	 * @method sendDamages
	 * @staitc
	 * @param {RSObject} [source] 
	 * @param {Array | RSObject} targets 
	 * @param {RSObject | String} [channel] 
	 * @param {Object} damage 
	 * @param {Object} [attack] Rolled attack value, if any
	 */
	 sendDamages = module.exports.sendDamages = function(source, targets, channel, damage, attack) {
		var id = Random.identifier(activityPrefix, 10, 32),
			activity,
			target,
			i;

		if(typeof(channel) === "string") {
			channel = universe.get(channel);
		}

		for(i=0; i<targets.length; i++) {
			target = targets[i];
			console.log("Multi - Sending: " + (target?target.id || target:"No Target"), "Source: " + (source?source.id || source:"No Source"));
			activity = id + ":" + target.id;
			tracking[activity] = {
				"gametime": universe.time,
				"time": Date.now(),
				"source": source,
				"target": target,
				"channel": channel,
				"attack": attack,
				"damage": damage
			};
			logged[activity] = {
				"gametime": universe.time,
				"source": source?source.id:null,
				"target": target.id,
				"channel": channel?channel.id:null,
				"attack": attack,
				"damage": damage
			};

			universe.chronicle.addOccurrence("entity:damaging", logged[activity], universe.time, logged[activity].source, logged[activity].target);
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
		if(!damage) {
			// TODO: Revise for better handling and update source calls to ensure damage is guarenteed
			damage = {};
			console.warn("Sending null damage");
			universe.emit("warning", {
				"message": "Null damage received",
				"source": source,
				"channel": channel
			});
		}
		var notify = function() {
			var tracked = tracking[activity];
			if(tracked && (!tracked.resend || tracked.resend < TRACKING_Limit)) {
				tracked.resend = (tracked.resend || 0) + 1;
				// TODO: UI for tracked visibility & expiry process for notifications to be deleted
				var type = Object.keys(damage),
					recipients,
					icon;
				if(type.length === 1 && type[0] === "damage_type:heal") {
					type = (target.nickname || target.name) + " receiving healing";
					icon = "fad fa-heartbeat rs-white rs-secondary-solid rs-secondary-green";
				} else {
					type = (target.nickname || target.name) + " taking damage";
					icon = "game-icon game-icon-crossed-slashes rs-lightred";
				}

				if(target.owned && Object.keys(target.owned).length) {
					recipients = target.owned;
				} else {
					recipients = universe.getMasters();
				}

				console.log(" > Sending: " + (target?target.id || target:"No Target"), "Source: " + (source?source.id || source:"No Source"), "Recipients: ", recipients);

				universe.emit("send", {
					"type": "notice",
					"mid": activityPrefix + activity,
					"message": type + (source?" from " + (source.nickname || source.name):""),
					"icon": icon,
					"anchored": true,
					"recipients": recipients,
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
				alarms[activity] = setTimeout(notify, 10000);
			} else {
				console.log("Send Damage - No Track - ", target?target.id || target:"No Target?");
			}
		};
		notify();
	};

	/**
	 * 
	 * @method sendSaves
	 * @staitc
	 * @param {RSObject} [source] 
	 * @param {Array | RSObject} targets 
	 * @param {Integer} [level] 
	 * @param {RSObject | String} [channel] 
	 * @param {Object} skill 
	 * @param {Integer} difficulty 
	 * @param {Object} damage 
	 */
	sendSaves = module.exports.sendSaves = function(source, targets, level, channel, skill, difficulty, damage) {
		if(!skill) {
			// TODO: better error
			universe.emit("error", new Error("Save called with no skill passed"));
			return null;
		}
		var id = Random.identifier(activityPrefix, 10, 32),
			activity,
			target,
			i;

		if(typeof(channel) === "string") {
			channel = universe.get(channel);
		}
		if(typeof(skill) === "string") {
			skill = universe.get(skill);
		}
		// A null skill shouldn't exist but is covered to support mal-formed spell objects
		if(skill === null || skill === undefined) {
			universe.warnMasters("No skill associated with spell: " + (channel?channel.name:"No spell?"), {
				"source": source?source.id:null,
				"spell": channel?channel.id:null,
				"skill": skill
			});
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
				"damage": damage,
				"difficulty": difficulty,
				"skill": skill,
				"level": level
			};
			logged[activity] = {
				"gametime": universe.time,
				"source": source?source.id:null,
				"target": target.id,
				"channel": channel?channel.id:null,
				"difficulty": difficulty,
				"damage": damage,
				"skill": skill?skill.id:null,
				"level": level
			};

			universe.chronicle.addOccurrence("entity:saving", logged[activity], universe.time, logged[activity].source, logged[activity].target);
			sendSave(activity, source, target, channel, skill, damage);
		}
	};

	/**
	 * Sends the damage notification and set an alarm to fire until completed
	 * @method sendSave
	 * @private
	 * @static
	 * @param {String} activity ID to complete for taking damage.
	 * @param {RSObject} [source] Entity or item dealing the damage, if any. For instance, may be undefined for environmental
	 * 		damage.
	 * @param {RSObject} target Entity being hurt.
	 * @param {Object} [channel] ID for the Spell, Item, or other method through which the damage is being delt, if any.
	 * @param {String | Object} skill To use for the save
	 */
	sendSave = function(activity, source, target, channel, skill, damage) {
		var notify = function() {
			var tracked = tracking[activity];
			if(tracked && (!tracked.resend || tracked.resend < TRACKING_Limit)) {
				tracked.resend = (tracked.resend || 0) + 1;
				var type,
					recipients,
					icon;

				type = (target.nickname || target.name) + " needs to save";
				icon = "fas fa-save";

				if(target.owned && Object.keys(target.owned).length) {
					recipients = target.owned;
				} else {
					recipients = universe.getMasters();
				}

				universe.emit("send", {
					"type": "notice",
					"mid": activityPrefix + activity,
					"message": type + (source?" from " + (source.nickname || source.name):"") + (channel?" against " + channel.name:""),
					"icon": icon,
					"anchored": true,
					"recipients": recipients,
					"emission": {
						"type": "dialog-open",
						"component": "dndDialogRoll",
						"storageKey": "store:roll:" + target,
						"action": "action:save:send",
						"activity": activity,
						"source": source?source.id:null,
						"entity": target.id,
						"channel": channel.id,
						"skill": skill?skill.id || skill:null,
						"damage": damage,
						"fill_damage": true,
						"closeAfterAction": true
					}
				});

				// sendDamages(activity, tracking[activity].source, tracking[activity].target, tracking[activity].channel?tracking[activity].channel.id:null, tracking[activity].damage);
				alarms[activity] = setTimeout(notify, 5000);
			}
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
		console.log("Sending Damage: ", event.message.data);
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

		if(damage) {
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
		} else {
			// TODO: Log bad event
			console.log("Damage missing: ", event.message.data);
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
				takeDamage(event.message.data.activity, entity, event.message.data.damage || {}, event.message.data.resist);
			 }
		} else {
			// TODO: Log bad event
			console.log("No entity for taking damage: ", event.message);
		}
	});

	/**
	 * 
	 * @event player:action:save:send
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
	 */
	universe.on("player:action:save:send", function(event) {
		var entity = universe.get(event.message.data.entity),
			critical = event.message.data.critical,
			failure = event.message.data.failure,
			activity = event.message.data.activity,
			resist = event.message.data.resist,
			save = event.message.data.check?event.message.data.check.computed:null;
		
		if(entity && activity) {
			finishSave(activity, entity, save, resist, critical, failure);
		}
	});

	/**
	 * 
	 * @event player:combat:clear:activity
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
	 * @param {Object} event.message.data.id Of the tracked action to be cleared
	 */
	universe.on("player:combat:clear:activity", function(event) {
		var id = event.message.data.id,
			notify = {},
			source,
			target;
		
		if(event.played.gm && id) {
			source = tracking[id].source;
			target = tracking[id].target;
			Object.assign(notify, universe.getMasters());
			Object.assign(notify, source.owners);
			Object.assign(notify, target.owners);
			universe.emit("send", {
				"type": "dismiss-message",
				"mid": activityPrefix + id,
				"recipients": notify
			});
		}
	});
} ;
