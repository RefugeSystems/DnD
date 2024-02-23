var combat = require("./events/combat/utility.js"),
	Random = require("rs-random");

/**
 * 
 * @class UniverseUtility
 * @constructor
 */
class UniverseUtility {

	constructor(universe) {
		this.universe = universe;
		this.console = console;
	}

	get(id) {
		return this.universe.get(id);
	}

	/**
	 * 
	 * @method getChronicle
	 * @param {UniverseEvent} event 
	 * @return {ChronicleEvent}
	 */
	getChronicle(event) {

	}

	/**
	 * 
	 * @method sendDamages
	 * @param {String} source
	 * @param {Array | String} targets
	 * @param {String} [channel] Item/Feat/Spell/etc dealing the damage
	 * @param {Object} damage 
	 * @param {Number} [attack] Value rolled
	 * @param {Object | Number} [attacks] Mapping target id's to rolled attack values
	 * @param {String} [attack_skill] 
	 * @param {String} [message] Optional to display with the prompt
	 */
	sendDamages(source, targets, channel, damage, attack, attacks, attack_skill, message, form) {
		combat.sendDamages(source, targets, channel, damage, attack, attacks, attack_skill, message, form);
	}

	/**
	 * 
	 * @method sendSaves
	 * @param {String} source
	 * @param {Array | String} targets
	 * @param {Number} [level] 
	 * @param {String} [channel] Item/Feat/Spell/etc causing the save
	 * @param {String} [skill] To roll for save
	 * @param {Number} [difficulty] 
	 * @param {Object} [damage]
	 * @param {String} [message] Optional to display with the prompt
	 */
	sendSaves(source, targets, level, channel, skill, difficulty, damage, message, form) {
		combat.sendSaves(source, targets, level, channel, skill, difficulty, damage, message, form);
	}

	/**
	 * 
	 * @method grantEffects
	 * @param {Object} entity 
	 * @param {Array | String} effects 
	 */
	/**
	 * 
	 * @event entity:effects:gain
	 * @param {Object} entity 
	 * @param {Array | String} effects 
	 */
	grantEffects(entity, effects) {
		if(effects) {
			entity.addValues({
				"effects": effects
			});
			entity.fireHandlers("entity:effects:gain", {
				"effects": effects
			});
		}
	}

	/**
	 * 
	 * @param {RSObject} entity 
	 * @returns {Function}
	 */
	receiveGrantEffects(entity) {
		return (effects) => {
			this.grantEffects(entity, effects);
		};
	}

	/**
	 * 
	 * @method revokeEffects
	 * @param {Object} entity 
	 * @param {Array | Object} effects 
	 */
	/**
	 * 
	 * @event entity:effects:lost
	 * @param {Object} entity 
	 * @param {Array | Object} effects 
	 */
	removeEffects(entity, effects) {
		if(effects) {
			entity.subValues({
				"effects": effects
			});
			entity.fireHandlers("entity:effects:lost", {
				"effects": effects
			});
		}
	}

	/**
	 * 
	 * @method receiveRemoveEffects
	 * @param {RSObject} entity 
	 * @returns 
	 */
	receiveRemoveEffects(entity) {
		return (effects) => {
			this.removeEffects(entity, effects);
		};
	}

	/**
	 * 
	 * @method revokeEffects
	 * @param {Array | String} effects 
	 */
	revokeEffects(effects) {
		var effect,
			i;
		if(effects) {
			for(i=0; i<effects.length; i++) {
				effect = this.universe.get(effects[i]);
				if(effect) {
					effect.setValues({
						"revoked": this.universe.time,
						"unsyncable": true,
						"is_deletable": true
					});
				}
			}
		}
	}

	/**
	 * 
	 * @method applyWeather
	 * @param {String | Object} weather 
	 * @param {String | Object} meeting 
	 * @returns {Boolean}
	 */
	applyWeather(weather, meeting) {
		var transition,
			previous,
			entity,
			i;

		if(!meeting) {
			meeting = this.universe.get("setting:meeting");
		}
		if(meeting && typeof(meeting) === "string") {
			meeting = this.universe.get(meeting);
		}
		if(typeof(weather) === "string") {
			weather = this.universe.get(weather);
		}
		// console.log("Apply Weather: ");
		if(meeting && weather) {
			console.log("Apply Weather: ", meeting.id, weather.id);
			previous = this.universe.get(meeting.weather);
			transition = {
				"name": "Weather changing to " + weather.name,
				"type": "session:weather",
				"previous": meeting.weather,
				"current": weather.id,
				"meeting": meeting.id,
				"time": this.universe.time,
				"date": Date.now()
			};
			for(i=0; i<meeting.entities.length; i++) {
				entity = this.get(meeting.entities[i]);
				if(entity) {
					if(previous) {
						this.removeEffects(entity, previous.effects);
					}
					this.grantEffects(entity, weather.effects);
				}
			}
			meeting.addValues({
				"historical_events": [transition]
			});
			meeting.setValues({
				"weather": weather.id
			});
			this.universe.emit("send", transition);
			return true;
		}
		return false;
	}

	/**
	 * 
	 * @method playAudio
	 * @param {Object} players
	 * @param {String} audio
	 * @param {Number} [volume]
	 * @param {Number} [delay]
	 * @param {Number} [sync]
	 */
	playAudio(players, audio, volume, delay, sync) {
		console.log("Utility Audio Play Control: ", audio);
		if(typeof(volume) !== "number") {
			volume = 100;
		}
		this.universe.emit("master:control", {
			"control": "audio:play",
			"recipients": players,
			"data": {
				"audio": audio,
				"volume": volume,
				"delay": delay,
				"sync": sync
			}
		});
	}

	/**
	 * 
	 * @method stopAudio
	 * @param {Object} players
	 * @param {String} audio
	 * @param {Number} [delay]
	 * @param {Number} [sync]
	 */
	stopAudio(players, audio, delay, sync) {
		this.universe.emit("master:control", {
			"control": "audio:stop",
			"recipients": players,
			"data": {
				"audio": audio,
				"delay": delay,
				"sync": sync
			}
		});
	}

	/**
	 * 
	 * @method dismissMessage
	 * @param {Object} players
	 * @param {String} id
	 */
	dismissMessage(players, id) {
		this.universe.emit("send", {
			"type": "dismiss-message",
			"mid": id,
			"recipients": players
		});
	}

	/**
	 * 
	 * @method dropItems
	 * @param {Object} entity 
	 * @param {Array | String} items Array of Item IDs to drop. Repeated IDs drop that item multiple times.
	 * @param {Boolean} [notify] Defaults to false. When true notifies the entity owners of the number of items
	 * 		dropped.
	 * @param {Boolean} [warn] Defaults to true. When true notifies the entity owners when an item can't be dropped
	 * 		such as when it's equipped.
	 */
	dropItems(entity, items, notify, warn = true) {
		var exchanging = [],
			meeting,
			update,
			item,
			i;
		
		if(typeof(entity) === "string") {
			entity = this.universe.get(entity);
		}
		if(typeof(items) === "string") {
			items = [items];
		}
		if(entity && entity.inventory && items && items.length) {
			for(i=0; i<items.length; i++) {
				item = this.universe.manager.item.object[items[i]];
				if(item && entity.inventory.indexOf(item.id) !== -1) {
					if(entity.equipped && entity.equipped.indexOf(item.id) === -1) {
						exchanging.push(item.id);
						item.setValues({
							"character": null,
							"user": null
						});
					} else if(warn) {
						this.universe.messagePlayers(entity.owned, entity.name + " can not drop item \"" + item.name + "\" because it is currently equipped");
					}
				}
			}
		}
		if(exchanging.length) {
			update = {
				"inventory": exchanging
			};
			entity.subValues(update);
			update = {
				"history": [{
					"event": "drop:items",
					"time": this.universe.time,
					"items": exchanging
				}]
			};
			entity.addValues(update);
			this.universe.chronicle.addOccurrence("entity:drop:items", {
				"source": entity.id,
				"items": exchanging
			});
			if(notify) {
				this.universe.emit("send", {
					"type": "notice",
					"recipients": entity.owned,
					"message": "Dropped " + exchanging.length + " items",
					"timeout": 5000
				});
			}
			meeting = this.universe.manager.meeting.object[this.universe.manager.setting.object["setting:meeting"].value];
			if(meeting && meeting.is_active) {
				meeting.addValues({
					"items": exchanging
				});
			}
		}
	}

	/**
	 * Check if the passed object has the indicated parent ID (Or is specifically that ID).
	 * @method hasParent
	 * @param {Object} object 
	 * @param {String} id 
	 * @return {Boolean} False with no object, true with no ID. True if the object at any point has the
	 * 		ID as a parent. False otherwise
	 */
	hasParent(object, id) {
		if(!object) {
			return false;
		}
		if(!id) {
			return true;
		}
		if(typeof(object) === "string") {
			object = this.universe.get(object);
		}
		while(object) {
			if(object.id === id) {
				return true;
			}
			object = this.universe.get(object.parent);
		}
		return false;
	}

	/**
	 * Get an array of IDs which meet the passed parent ID.
	 * @method getByParentID
	 * @param {String} id For which to scan
	 * @param {Object} source Object to scan for the passed values
	 * @param {Array} [fields] To scan for values
	 */
	getByParentID(id, source, fields) {
		var found = [],
			manager,
			field,
			value,
			f,
			j;

		if(typeof(source) === "string") {
			source = this.universe.get(source);
		}

		if(source && (manager = this.universe.manager[source._class])) {
			fields = fields || manager.fieldIDs;
			for(f=0; f<fields.length; f++) {
				field = manager.fieldUsed[fields[f]];
				if(field && (value = source[field.id])) {
					if(field.inheritable) {
						// Check Parental Chain
						if(value instanceof Array) {
							for(j=0; j<value.length; j++) {
								if(value[j] && (value[j] === id || value[j].id === id)) {
									found.unshift(id);
								} else if(this.hasParent(value[j], id)) {
									found.push(value[j]);
								}
							}
						} else if((value === id)) {
							found.unshift(id);
						} else if(typeof(value) === "object") {
							if(value.id === id) {
								found.unshift(id);
							} else if(this.hasParent(value,id)) {
								found.push(value.id);
							}
						}
					} else {
						// Flat Check
						if(value instanceof Array) {
							for(j=0; j<value.length; j++) {
								if(value[j] === id) {
									found.unshift(id);
								}
							}
						} else if((typeof(value) === "object" && value.id === id) || (value === id)) {
							found.unshift(id);
						}
					}
				} else {
					if(field) {
						// this.console.log("No value for field:" + fields[f]);
					} else {
						this.console.log("No field: " + fields[f]);
					}
				}
			}
		}

		return found;
	}

	/**
	 * 
	 * @method print
	 * @param {*} ...message
	 */
	print(...message) {
		this.console.log.apply(this.console.log, message);
	}

	/**
	 * 
	 * @method log
	 * @param {*} ...message
	 */
	log(...message) {
		this.console.log.apply(this.console.log, message);
	}

	/**
	 * 
	 * @method info
	 * @param {*} ...message
	 */
	info(...message) {
		this.console.log.apply(this.console.log, message);
	}

	/**
	 * 
	 * @method warn
	 * @param {*} ...message
	 */
	warn(...message) {
		this.console.warn.apply(this.console.log, message);
	}
}

module.exports = UniverseUtility;
