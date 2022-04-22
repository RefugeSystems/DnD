
var utility = require("../utility.js"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {

	/**
	 * 
	 * @event player:action:main:attack
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
	 * @param {String} [event.message.data.attack] The rolled attack check
	 * @param {String} [event.message.data.attack_skill] The skill used for the attack
	 * @param {String} [event.message.data.targets] Either a target or targets must be specified
	 * @param {String} event.message.data.damage damage_Type keys to value mapping
	 * @param {String} [event.message.data.channel] Item, Spell, or other ID for the cause of the damage if any.
	 * 		Null source requires Game Master player.
	 */
	universe.on("player:action:main:attack", function(event) {
		console.log("Player Attack: ", event.message.data);
		var channel = event.message.data.item || event.message.data.using || event.message.data.spell || event.message.data.channel,
			attack_skill = event.message.data.attack_skill,
			damage = event.message.data.result,
			attack = event.message.data.attack,
			targets = [],
			channel,
			target,
			source,
			keys,
			dmg,
			i;


		if(event.message.data.entity) {
			source = universe.get(event.message.data.entity);
		}

		if(event.message.data.using) {
			channel = universe.get(event.message.data.using);
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

		if(event.message.data.status === "Critical") {
			keys = Object.keys(damage);
			for(i=0; i<keys.length; i++) {
				if(typeof(damage[keys[i]]) === "number") {
					damage[keys[i]] *= 2;
				}
			}
		}

		if(targets.length) {
			if(source && (source.owned[event.player.id] || event.player.gm)) {
				utility.sendDamages(source, targets, channel, damage);
			} else if(!source && event.player.gm) {
				utility.sendDamages(null, targets, channel, damage);
			} else {
				console.log("Data Missing? ", !!source, event.player.id, source.owned);
			}
		} else {
			// TODO: Log bad event
			console.log("Target missing: ", event.message.data);
		}
	});
};
