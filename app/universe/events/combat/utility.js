const { randomGamma } = require("d3");
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

		successfulOutcome,
		finishDamage,
		sendDamages,
		sendDamage,
		takeDamage;
	
	/**
	 * 
	 * @method successfulOutcome
	 * @staitc
	 * @param {Object} log The source for the check
	 * @param {Number | String} log.check_difficulty The value that must be met or overcome
	 * @param {Number | String} log.check_outcome The rolled value by the initiator
	 * @param {String} [type] Optional specifier declaring the type of check being made.
	 * @return {Boolean}
	 */
	successfulOutcome = module.exports.successfulOutcome = function(log, type) {
		var dc = log.check_difficulty,
			roll = log.check_outcome,
			channel = log.channel,
			source = log.source,
			target = log.target;

		if(roll === undefined || roll === null || dc === undefined || dc === null) {
			return true;
		}

		if(typeof(dc) === "number" && typeof(roll) === "number") {
			return dc <= roll;
		}

		if(typeof(channel) === "string") {
			channel = universe.get(channel);
		}
		if(typeof(source) === "string") {
			source = universe.get(source);
		}
		if(typeof(target) === "string") {
			target = universe.get(target);
		}

		if(typeof(dc) === "string") {
			dc = universe.calculator.computedDiceRoll(dc, target);
		}
		if(typeof(roll) === "string") {
			roll = universe.calculator.computedDiceRoll(roll, source);
		}
		if(typeof(dc) === "number" && typeof(roll) === "number") {
			return dc <= roll;
		}
		
		// TODO: Consider filling in and computing missing rolls when channel data is present to guide
		switch(type) {
			/* Currently all rolls are on a "meets or exceeds" basis but the log is used to determine difficulties
			 * or other criteria to fill in missing data.
			 */
			case "attack":
				if(!dc) {
					dc = target.armor;
				}
				if(!roll) {
					roll = 0;
				}
				break;
			case "attack_save":
				if(!dc) {
					dc = channel.dc || source.spell_dc;
				}
				if(!roll) {
					roll = 0;
				}
				break;
			case "spell_save":
				if(!dc) {
					dc = channel.dc || source.spell_dc;
				}
				if(!roll) {
					roll = 0;
				}
				break;
			default:
		}

		return dc <= roll;
	};

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
			resisted = {},
			waiting = [],
			was_damaged,
			source,
			adding,
			effect,
			notify,
			events,
			copy,
			i;

		if(tracked) {
			// clearTimeout(alarms[activity]);
			delete(tracking[activity]);
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
			log.target = entity.id;
			log.source = null;
			log.channel = null;
			log.check_difficulty = 0;
			log.check_outcome = 0;
			log.original_damage = damage;
			log.damage = damage;
			tracked = {};
		}

		entity.subValues({
			"active_events": [activity]
		});

		if(log.source) {
			log.succeeded = successfulOutcome(log, "attack");
		} else {
			log.succeeded = true; // Master or Environment
		}
		if(damage) {
			if(log.succeeded) {
				log.damage = damage; // Update for what the player submitted as final damage
				log.resist_source = resist;
				was_damaged = resolveDamage(entity, damage, resist, resisted, tracked.source, tracked.channel);
				log.resist = resisted;

				if(was_damaged && (source = tracked.source || log.source)) {
					if(typeof(source) === "string") {
						source = universe.get(tracked.source);
					}
					source.fireHandlers("entity:damage:dealt", log);
				}

				// events = entity.active_events || {};
				// console.log("Delete Damage Activity[" + activity + "]: " + Object.keys(events).join());
				// events[activity] = null;
				// delete(events[activity]);
				entity.subValues({
					"active_events": [activity]
				});
				if(tracked && tracked.source && tracked.target) {
					// TODO: Improve conditions around instill to be able to not require damage and a hit
					if(tracked.channel && tracked.channel.instilled && tracked.channel.instilled.length) {
						for(i=0; i<tracked.channel.instilled.length; i++) {
							effect = universe.get(tracked.channel.instilled[i]);
							if(!effect.damage_required || was_damaged) {
								waiting.push(universe.copyPromise(effect, {
									"character": tracked.target.id,
									"caster": tracked.source.id,
									"expiration": effect.duration?universe.time + effect.duration:undefined
								}));
							}
						}
					}
					// TODO: Reconsider effects on an item/spell behaving like instill - these should probably merely add to the item/spell
					if(tracked.effects && tracked.effects.length) {
						for(i=0; i<tracked.effects.length; i++) {
							effect = universe.get(tracked.effects[i]);
							if(!effect.damage_required || was_damaged) {
								waiting.push(universe.copyPromise(effect, {
									"character": tracked.target.id,
									"caster": tracked.source.id,
									"expiration": effect.duration?universe.time + effect.duration:undefined
								}));
							}
						}
					}
					if(waiting.length) {
						Promise.all(waiting)
						.then(function(effects) {
							adding = [];
							for(i=0; i<effects.length; i++) {
								effect = effects[i];
								if(effect.expiration) {
									universe.trackExpiration(effect, tracked.target.id, "effects");
								}
								adding.push(effect.id);
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
				// log.damage = {};
				log.resist_source = damage;
				log.resist = damage;
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
		universe.chronicle.updateOccurrence(log.id, log, "entity:damaged", universe.time, log.source, entity.id);
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
			resisted = {},
			was_damaged,
			succeeded,
			castMask,
			damage,
			buffer,
			events,
			notify,
			keys,
			mask,
			i;
		
		if(!save) {
			save = 0;
		}
		if(tracked) {
			// clearTimeout(alarms[activity]);
			delete(tracking[activity]);
			console.log("Cleared: " + activity);
			log.activity = activity;
			log.resist = resist;
			log.save = save;
			log.critical = critical;
			log.failure = failure;
			log.succeeded = succeeded = !failure && (critical || tracked.difficulty <= save);
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
			tracked = {};
		}
		
		entity.subValues({
			"active_events": [activity]
		});

		if(tracked && tracked.target) {
			castMask = {};
			castMask.caster = log.source;
			castMask.level = log.level;
			if(tracked.channel && tracked.channel.duration) {
				castMask.expiration = universe.time + tracked.channel.duration;
			}

			if(succeeded) {
				console.log("Succeed [" + save + " vs. DC" + tracked.difficulty + "]");
				if(tracked.damage) {
					// TODO: Improve logic for spell damage reduction as cantrip vs. full spell []
					damage = log.damage = {};
					log.damage_source = {};
					keys = Object.keys(tracked.damage);
					if(log.level) {
						for(i=0; i<keys.length; i++) {
							log.damage_source[keys[i]] = tracked.damage[keys[i]] || 0;
							damage[keys[i]] = Math.ceil((tracked.damage[keys[i]] || 0)/2);
						}
					} else {
						for(i=0; i<keys.length; i++) {
							log.damage_source[keys[i]] = tracked.damage[keys[i]] || 0;
							damage[keys[i]] = 0;
						}
					}
					/*
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
					*/
				}
			} else {
				console.log("Failure [" + save + " vs. DC" + tracked.difficulty + "]");
				damage = tracked.damage;
			}
			log.resist_source = resist;
			was_damaged = resolveDamage(entity, damage, resist, resisted, tracked.source, tracked.channel);
			// was_damaged = resolveDamage(entity, damage, resist, resisted);
			log.resist = resisted;
			// events = entity.active_events || {};
			// console.log("Delete Save Activity[" + activity + "]: " + Object.keys(events).join());
			// delete(events[activity]);
			// was_damaged = resolveDamage(entity, tracked.damage, tracked.resist);
			// TODO: Conditional Instill
			if(tracked.channel && tracked.channel.instilled && tracked.channel.instilled.length) {
				for(i=0; i<tracked.channel.instilled.length; i++) {
					buffer = universe.get(tracked.channel.instilled[i]);
					mask = Object.assign({}, castMask);
					mask.character = tracked.target.id;
					mask.expiration = universe.time + buffer.duration;
					if(buffer && ((buffer.damage_required && was_damaged && buffer.hit_required && succeeded === false)
							|| (buffer.damage_required && was_damaged && !buffer.hit_required)
							|| (!buffer.damage_required && buffer.hit_required && succeeded === false)
							|| (!buffer.damage_required && !buffer.hit_required))) {
						universe.copy(buffer.id, mask, function(err, effect) {
							if(!err) {
								universe.trackExpiration(effect, tracked.target.id, "effects");
								tracked.target.addValues({
									"effects": [effect.id]
								});
							} else {
								console.log("Error tracking effect expiration from spell save: ", err);
							}
						});
					}
				}
			}
		} else {
			// No auto, just log to chronicle
		}
		universe.chronicle.updateOccurrence(log.id, log, "entity:saved", universe.time, log.source, entity.id);
		console.log("Finishing Save: ", log);
	 };

	/**
	 * Fired BEFORE bamage is passed into the entity. Modify the values in the handle to change the results.
	 * 
	 * Changing the hp and hp_temp values change how the source object's health is modified, the rest serve only
	 * as notes and have already been calculated.
	 * @event damage:incoming
	 * @param {Object} event
	 * @param {RSEntity} event.target
	 * @param {RSEntity} event.source
	 * @param {RSEntity} event.channel
	 * @param {Object} event.damage Mapping damage_type IDs to values
	 * @param {Object} event.resisted Mapping damage_type IDs to values
	 * @param {Object} event.resist Mapping damage_type IDs to values
	 * @param {Object} event.change
	 * @param {Integer} event.change.hp Change in HP that was determined and will be used
	 * @param {Integer} event.change.hp_temp Change in Temp HP that was determined and will be used
	 */
	/**
	 * Fired AFTER bamage is passed into the entity. Modifying the values is not recommended here as this is processed
	 * asynchronously by various handlers.
	 * @event damage:taken
	 * @param {Object} event
	 * @param {RSEntity} event.target
	 * @param {RSEntity} event.source
	 * @param {RSEntity} event.channel
	 * @param {Object} event.damage Mapping damage_type IDs to values
	 * @param {Object} event.resisted Mapping damage_type IDs to values
	 * @param {Object} event.resist Mapping damage_type IDs to values
	 * @param {Object} event.change
	 * @param {Integer} event.change.hp Change in HP that was determined and will be used
	 * @param {Integer} event.change.hp_temp Change in Temp HP that was determined and will be used
	 */
	/**
	 * 
	 * @method resolveDamage
	 * @param {RSObject} entity 
	 * @param {Object} damage 
	 * @param {Object} resist 
	 * @returns {Boolean} True if damage was taken, false otherwise. If healing occurs, this will
	 * 		return true that "healing" "damage" was taken. Merely indicates HP changed.
	 */
	var resolveDamage = function(entity, damage, resist = {}, resisted = {}, source, channel) {
		if(!damage) {
			universe.generalError("damage:taken", new Error("No Damage") /* For Trace */, "No damage was received");
			return false;
		}
		var keys = Object.keys(damage),
			conscious = 0 <= entity.hp,
			start_hp = entity.hp,
			was_damaged = false,
			event = {},
			transform,
			received,
			add = {},
			temp_cap,
			meeting,
			i;

		add.hp_temp = 0;
		add.hp = 0; //entity.hp;
		for(i = 0; i < keys.length; i++) {
			if(typeof(resist[keys[i]]) === "string") {
				resisted[keys[i]] = universe.calculator.computedDiceRoll(resist[keys[i]], entity, undefined, damage[keys[i]]) || 0;
			} else {
				resisted[keys[i]] = resist[keys[i]] || 0;
			}
			received = damage[keys[i]] - resisted[keys[i]];
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

		event.target = entity;
		event.source = source;
		event.channel = channel;
		event.resisted = resisted;
		event.resist = resist;
		event.damge = damage;
		event.channgel = channel;
		event.change = add;
		entity.processHandlers("damage:incoming", event, ["equipped", "feats", "effects"]);

		// console.log("Resisted: ", resisted);

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

		if(add.hp > 0 && (entity.death_fail || entity.death_save)) {
			entity.setValues({
				"death_fail": 0,
				"death_save": 0
			}); // TODO: Link with general error tracking for callback in universe, but if this fails, the latter ops will fail, so tracking there for now
			entity.fireHandlers("entity:consciousness:gained", {
			});
		}

		// console.log("Damage Set");
		entity.addValues(add, function(err) {
			if(err) {
				universe.generalError("damage:taken", err, "Issue setting HP: " + err.message);
			} else {
				// console.log("Damage Handler Fire");
				if(conscious && entity.hp === 0) {
					if(entity.transform_character) {
						universe.notifyMasters(entity.name + " has lost lost their transformation");
					} else {
						universe.notifyMasters(entity.name + " has lost consciousness");
					}
					entity.fireHandlers("entity:consciousness:lost", {});
					meeting.addValues({
						"killed": [entity.id]
					});
				} else if(!conscious && entity.hp !== 0) {
					universe.notifyMasters(entity.name + " has gained consciousness");
					entity.fireHandlers("entity:consciousness:gain", {});
				}
				entity.fireHandlers("entity:damaged", event);

				if(entity.hp <= 0 && entity.transform_character && (transform = universe.get(entity.transform_character))) {
					add.hp += start_hp;
					if(add.hp != 0) {
						add.hp_temp = 0;
						transform.addValues(add, function(err) {
							if(err) {
								universe.generalError("damage:taken", err, "Issue setting HP: " + err.message);
							} else {
								if(conscious && transform.hp === 0) {
									transform.fireHandlers("entity:consciousness:lost", {});
								} else if(!conscious && entity.hp !== 0) {
									transform.fireHandlers("entity:consciousness:gain", {});
								}
								// TODO: Transformation resolution needs centralized
								if(meeting = universe.getActiveMeeting()) {
									if(meeting.entities.indexOf(entity.transform_character) === -1) {
										meeting.addValues({
											"entities": [entity.transform_character]
										});
									}
									meeting.subValues({
										"entities": [transform.id]
									});
								}
								if(meeting = universe.getActiveSkirmish()) {
									if(meeting.combat_turn === entity.id) {
										meeting.setValues({
											"combat_turn": entity.transform_character
										});
									}
									if(meeting.entities.indexOf(entity.transform_character) === -1) {
										meeting.addValues({
											"entities": [entity.transform_character]
										});
									}
									meeting.subValues({
										"entities": [entity.id]
									});
								}
								transform.fireHandlers("entity:damaged", event, ["equipped", "feats", "effects"]);
							}
						});
					}
				}
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
	 * @param {Integer} [attack] Rolled attack value, if any
	 * @param {Object} [attacks] Rolled attack value per target, if any
	 * @param {String} [attack_skill] Skill ID for how the attack was performed (Main Hand, Off Hand, Spell Attack)
	 * @param {String} [message]
	 */
	 sendDamages = module.exports.sendDamages = function(source, targets, channel, damage, attack, attacks, attack_skill, message) {
		var id = Random.identifier(activityPrefix, 10, 32),
			time = universe.time,
			date = Date.now(),
			activity,
			target,
			atk,
			i;

		if(typeof(channel) === "string") {
			channel = universe.get(channel);
		}

		if(!targets) {
			console.log("[!] No Targets for Sending Damage: " + (source?source.id || source:"No Source"), (channel?channel.id || channel:"No Source"));
			targets = [];
		}

		console.log(" > Process Damages to Send: " + targets.join());
		for(i=0; i<targets.length; i++) {
			target = targets[i];
			if(typeof(target) === "string") {
				target = universe.get(target);
			}
			if(attacks && typeof(attacks[target.id]) !== "undefined") {
				atk = attacks[target.id];
			} else {
				atk = attack;
			}
			console.log("Multi - Sending: " + (target?target.id || target:"No Target"), "Source: " + (source?source.id || source:"No Source"));
			activity = id + ":" + target.id;
			tracking[activity] = {
				"activity": activity,
				"time": universe.time,
				"date": Date.now(),
				"source": source,
				"target": target,
				"channel": channel,
				"attack": atk, // Deprecating
				"check_outcome": atk, // Standardizing around "check_outcome" & "check_difficulty"
				"check_difficulty": target.armor,
				"damage": damage,
				"skill": attack_skill?attack_skill.id || attack_skill:undefined
			};
			logged[activity] = {
				"activity": activity,
				"time": universe.time,
				"source": source?source.id:null,
				"target": target.id,
				"channel": channel?channel.id:null,
				"attack": atk,
				"check_outcome": atk, // Standardizing around "check_outcome" & "check_difficulty"
				"check_difficulty": target.armor,
				"original_damage": damage,
				"damage": damage,
				"skill": attack_skill?attack_skill.id || attack_skill:undefined
			};
			/**
			 * Fired for the creature attacking
			 * @event entity:attacking
			 * @for Chronicle
			 * @param {String} [source] Of the attack. Null for direct or environmental like events
			 * @param {String} target Being attacked
			 * @param {String} [channel]
			 * @param {Object} damage
			 * @param {Number} time
			 * @param {Number} date
			 */
			if(source) {
				source.fireHandlers("entity:attacking", {
					"source": source?source.id:null,
					"target": target.id,
					"channel": channel?channel.id:null,
					"damage": damage,
					"time": time,
					"date": date
				});
			}
			/**
			 * Fired for the creature being attacked
			 * @event entity:attacked
			 * @for Chronicle
			 * @param {String} [source] Of the attack. Null for direct or environmental like events
			 * @param {String} target Being attacked
			 * @param {String} [channel]
			 * @param {Object} damage
			 * @param {Number} time
			 * @param {Number} date
			 */
			target.fireHandlers("entity:attacked", {
				"source": source?source.id:null,
				"target": target.id,
				"channel": channel?channel.id:null,
				"damage": damage,
				"time": time,
				"date": date
			});


			logged[activity].id = universe.chronicle.addOccurrence("entity:damaging", logged[activity], universe.time, logged[activity].source, logged[activity].target);
			sendDamage(activity, source, target, logged[activity].channel, damage, message);
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
	 * @param {String} [message]
	 */
	sendDamage = function(activity, source, target, channel, damage, message) {
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

		// var events = target.active_events || {};
		var emission,
			notify,
			firing,
			audio,
			item,
			i;

		emission = {
			"id": activity,
			"type": "dialog-open",
			"component": "dndDialogRoll",
			"storageKey": "store:roll:" + target,
			"action": "action:damage:recv",
			"activity": activity,
			"source": source?source.id:null,
			"attack": tracking[activity]?tracking[activity].attack:null,
			"timeout": 7000,
			"entity": target.id,
			"time": universe.time,
			"date": Date.now(),
			"channel": channel,
			"damage": damage,
			"fill_damage": true,
			"closeAfterAction": true,
			"message": message
		};

		if(damage["damage_type:heal"] || damage["damage_type:temphp"]) {
			emission.name = "Incoming Heal";
		} else {
			emission.name = "Incoming Attack";
		}

		// events[activity] = emission;
		target.addValues({
			"active_events": emission
		});

		if(source) {
			if(typeof(source) === "string") {
				source = universe.get(source);
			}
			firing = {
				"source": source.id,
				"channel": channel?channel.id||channel:null,
				"target": target.id,
				"damage": damage
			};
			/**
			 * Fired on the items, feats, and spells owned by the attacking
			 * entity when the attack is declared (Before damage dealt is know
			 * but the amount going out is present).
			 * @event source:attacked
			 * @param {String} source
			 * @param {String} target
			 * @param {String} [channel]
			 * @param {Object} damage Mapping damage_type IDs to the amount being
			 * 		dealt.
			 */
			if(source.inventory) {
				for(i=0; i<source.inventory.length; i++) {
					item = universe.get(source.inventory[i]);
					if(item) {
						item.fireHandlers("source:attacked", firing);
					}
				}
			}
			if(source.feats) {
				for(i=0; i<source.feats.length; i++) {
					item = universe.get(source.feats[i]);
					if(item) {
						item.fireHandlers("source:attacked", firing);
					}
				}
			}
			if(source.spells) {
				for(i=0; i<source.spells.length; i++) {
					item = universe.get(source.spells[i]);
					if(item) {
						item.fireHandlers("source:attacked", firing);
					}
				}
			}
		}

		if(channel) {
			if(typeof(channel) === "string") {
				channel = universe.get(channel);
			}
			if(channel.audio) {
				audio = universe.get(channel.audio);
			} else if(channel.audios) {
				audio = universe.get(channel.audios[Random.integer(channel.audios.length)]);
			}
			if(audio) {
				universe.utility.playAudio({"player:master":true}, audio.id, audio.volume || 100);
			}
		}

		notify = function() {
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
					"emission": emission
				});

				// sendDamages(activity, tracking[activity].source, tracking[activity].target, tracking[activity].channel?tracking[activity].channel.id:null, tracking[activity].damage);
				// alarms[activity] = setTimeout(notify, 10000);
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
	 * @param {String} [message]
	 */
	sendSaves = module.exports.sendSaves = function(source, targets, level, channel, skill, difficulty, damage, message) {
		if(!skill) {
			// TODO: better error
			universe.emit("error", new Error("Save called with no skill passed"));
			return null;
		}
		var id = Random.identifier(activityPrefix, 10, 32),
			activity,
			target,
			audio,
			item,
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

		if(channel) {
			if(typeof(channel) === "string") {
				channel = universe.get(channel);
			}
			if(channel.audio) {
				audio = universe.get(channel.audio);
			} else if(channel.audios) {
				audio = universe.get(channel.audios[Random.integer(channel.audios.length)]);
			}
			if(audio) {
				universe.utility.playAudio({"player:master":true}, audio.id, audio.volume || 100);
			}
		}

		for(i=0; i<targets.length; i++) {
			target = targets[i];
			if(typeof(target) === "string") {
				target = universe.get(target);
			}

			activity = id + ":" + target.id;
			tracking[activity] = {
				"activity": activity,
				"time": universe.time,
				"date": Date.now(),
				"source": source,
				"target": target,
				"channel": channel,
				"damage": damage,
				"difficulty": difficulty,
				"skill": skill,
				"level": level
			};
			logged[activity] = {
				"activity": activity,
				"time": universe.time,
				"source": source?source.id:null,
				"target": target.id,
				"channel": channel?channel.id:null,
				"difficulty": difficulty,
				"damage": damage,
				"skill": skill?skill.id:null,
				"level": level
			};

			logged[activity].id = universe.chronicle.addOccurrence("entity:saving", logged[activity], universe.time, logged[activity].source, logged[activity].target);
			sendSave(activity, source, target, channel, skill, damage, message);
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
	 * @param {String} [message]
	 */
	sendSave = function(activity, source, target, channel, skill, damage, message) {

		// var events = target.active_events || {};

		var emission,
			firing,
			item,
			i;

		emission = {
			"id": activity,
			"name": "Spell Save",
			"type": "dialog-open",
			"component": "dndDialogRoll",
			"storageKey": "store:roll:" + target,
			"action": "action:save:send",
			"activity": activity,
			"source": source?source.id:null,
			"entity": target.id,
			"channel": channel.id,
			"skill": skill?skill.id || skill:null,
			"timeout": 7000,
			"time": universe.time,
			"date": Date.now(),
			"damage": damage,
			"fill_damage": true,
			"closeAfterAction": true,
			"message": message
		};

		// events[activity] = emission;
		target.addValues({
			"active_events": emission
		});

		if(source) {
			if(typeof(source) === "string") {
				source = universe.get(source);
			}
			firing = {
				"source": source.id,
				"channel": channel?channel.id||channel:null,
				"target": target.id,
				"damage": damage
			};
			/**
			 * Fired on the items, feats, and spells owned by the attacking
			 * entity when the attack is declared (Before damage dealt is know
			 * but the amount going out is present).
			 * @event source:spellcasted
			 * @param {String} source
			 * @param {String} target
			 * @param {String} [channel]
			 * @param {Object} damage Mapping damage_type IDs to the amount being
			 * 		dealt.
			 */
			if(source.inventory) {
				for(i=0; i<source.inventory.length; i++) {
					item = universe.get(source.inventory[i]);
					if(item) {
						item.fireHandlers("source:spellcasted", firing);
					}
				}
			}
			if(source.feats) {
				for(i=0; i<source.feats.length; i++) {
					item = universe.get(source.feats[i]);
					if(item) {
						item.fireHandlers("source:spellcasted", firing);
					}
				}
			}
			if(source.spells) {
				for(i=0; i<source.spells.length; i++) {
					item = universe.get(source.spells[i]);
					if(item) {
						item.fireHandlers("source:spellcasted", firing);
					}
				}
			}
		}

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
					"emission": emission
				});

				// sendDamages(activity, tracking[activity].source, tracking[activity].target, tracking[activity].channel?tracking[activity].channel.id:null, tracking[activity].damage);
				// alarms[activity] = setTimeout(notify, 5000);
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
		console.log("Sending Damage[utility]: ", event.message.data);
		var damage = event.message.data.damage,
			targets = [],
			channel,
			attack,
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
		if(event.message.data.checks && event.message.data.checks.length) {
			attack = event.message.data.checks[0].result;
		}

		if(damage) {
			if(targets.length) {
				if(source && (source.owned[event.player.id] || event.player.gm)) {
					sendDamages(source, targets, channel, damage, attack, event.message.data.targeted_checks);
				} else if(!source && event.player.gm) {
					sendDamages(null, targets, channel, damage, attack, event.message.data.targeted_checks);
				} else {
					console.log("Source Authorization Issue[" + event.player.id + "]: ", (source?source.owned:"No Source"), event.message.data);
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

		if(event.message.data.check) {
			critical = event.message.data.check.is_critical || critical;
			failure = event.message.data.check.is_failure || failure;
		}
		
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
