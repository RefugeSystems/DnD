var combat = require("../combat/utility.js"),
	utility = require("../utility.js");

/**
 * 
 * @method initialize
 * @param {Universe} universe 
 */
module.exports.initialize = function(universe) {

	/**
	 * 
	 * @event player:channel:use
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
	 * @param {String} event.message.data.source
	 * @param {Array | String} event.message.data.targets
	 * @param {Object} event.message.data.target_checks
	 * @param {Object} event.message.data.action_cost
	 * @param {String} event.message.data.channel_skill
	 * @param {String} event.message.data.channel
	 * @param {Array | RSRoll} event.message.data.checks
	 * @param {Object} event.message.data.damage
	 */
	universe.on("player:channel:use", function(event) {
		var channel = universe.get(event.message.data.channel),
			source = universe.get(event.message.data.source),
			action_cost = event.message.data.action_cost,
			targets = event.message.data.targets,
			target_checks = event.message.data.target_checks,
			checks = event.message.data.checks,
			damage = event.message.data.damage,
			successful = true,
			channel_skill,
			damage_checks,
			skill_check,
			loading,
			target,
			broad,
			check,
			skill,
			load,
			keys,
			roll,
			i;

		console.log("Target Checks: " + JSON.stringify(target_checks, null, 4));
		if(targets && targets instanceof Array) {
			universe.transcribeArray(targets);
		} else {
			targets = [];
		}
		if(targets.length === 0) {
			targets.push(source);
		}

		if(source && channel && (event.player.gm || source.owned[event.player.id])) {
			channel_skill = event.message.data.channel_skill || channel.dc_save || channel.skill;
			// Process Checks [TODO: This needs thought and may not be needed but probably exists as a step]
			
			if(channel_skill && channel.dc) {
				successful = false;
				if(checks) {
					for(i=0; i<checks.length && !skill_check; i++) {
						if(checks[i].skill === channel_skill) {
							skill_check = checks[i].roll?checks[i].roll.computed:0;
						}
					}
					successful = skill_check && ((channel.is_negative && skill_check <= channel.dc) || (!channel.is_negative && skill_check >= channel.dc));
				} else {
					successful = false;
				}
			}

			console.log("Use Success?" + successful + ": " + channel_skill + " - " + skill_check);
			
			if(event.message.data.form && event.message.data.form.audio) {
				universe.emit("roomctrl:play", event.message.data.form.audio);
			}
			if(event.message.data.form && event.message.data.form.playlist) {
				universe.emit("roomctrl:play", event.message.data.form.playlist);
			}
			if(channel.audio) {
				universe.emit("audio:play", channel.audio);
			}
			
			// Send Damage [TODO: This is currently handled by combat actions]
			if(successful) {
				console.log("Channel!");

				if(damage) {
					damage_checks = {};
					if(checks) {
						for(i=0; i<checks.length; i++) {
							check = checks[i];
							if(check.skill === channel_skill) {
								if(check.target) {
									damage_checks[check.target] = check;
								} else {
									broad = check;
								}
							}
						}
					}
					combat.sendDamages(source, targets, channel, damage, broad, damage_checks, undefined, undefined, event.message.data.form);
				}

				// Instill Effects
				if(channel.instilled) {
					for(i=0; i<targets.length; i++) {
						target = targets[i];
						utility.instillEffects(universe, channel.instilled, source, target, channel, false, false);
					}
				}
			}

			// Process Consume/Use
			if(channel.consume || (channel.yields && channel.yields.length)) {
				loading = utility.consumeObject(universe, source, channel, targets, target_checks);
			}

			// Finishing Touches
			if(action_cost) {
				source.subValues(action_cost);
			}
			
			/**
			 * @event item:used
			 * @for Chronicle
			 * @param {String} item
			 * @param {String} consume
			 * @param {Array | String} yields
			 */
			source.fireHandlers("item:used", {
				"item": channel.id,
				"consumed": channel.consume,
				"yields": channel.yields
			});
		} else {
			// Authorization issue
		}
	});

	/**
	 * 
	 * @event player:action:item:consume
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
	 * @param {String} event.message.data.source
	 * @param {Array | String} event.message.data.targets
	 * @param {Object} event.message.data.target_checks
	 * @param {Object} event.message.data.action_cost
	 * @param {String} event.message.data.channel
	 * @param {Array | RSRoll} event.message.data.checks
	 * @param {Object} event.message.data.damage
	 */
	universe.on("player:action:item:consume", function(event) {
		var channel = universe.get(event.message.data.channel),
			source = universe.get(event.message.data.source),
			targets = event.message.data.targets,
			target_checks = event.message.data.target_checks,
			checks = event.message.data.checks,
			damage = event.message.data.damage,
			loading,
			load,
			i;
		
		if(source && channel && (event.player.gm || source.owned[event.player.id])) {
			// Process Checks
			// Send Damage
			// Instill Effects
		} else {
			// Authorization issue
		}
	});
};
