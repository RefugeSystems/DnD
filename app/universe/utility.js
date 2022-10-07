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
	sendDamages(source, targets, channel, damage, attack, attacks, attack_skill, message) {
		combat.sendDamages(source, targets, channel, damage, attack, attacks, attack_skill, message);
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
	sendSaves(source, targets, level, channel, skill, difficulty, damage, message) {
		combat.sendSaves(source, targets, level, channel, skill, difficulty, damage, message);
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
	 * @method info
	 * @param {*} ...message
	 */
	print(...message) {
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
}

module.exports = UniverseUtility;
