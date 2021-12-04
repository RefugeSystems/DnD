/**
 * 
 * @event player:action:check
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

/**
 * 
 * @event player:action:check
 * @for Universe
 */

module.exports.initialize = function(universe) {
	universe.on("player:action:check", function(event) {
		console.log("Check: ", event.message.data);
		var entity,
			skill,
			roll = {
				"type": "entity:roll",
				"result": event.message.data.result,
				"entity": event.message.data.entity,
				"skill": event.message.data.skill,
				"target": event.message.data.target,
				"channel": event.message.data.channel,
				"action": event.message.data.action,
				"level": event.message.data.spell_level,
				"name": event.message.data.name,
				"dice": event.message.data.dice,
				"time": universe.time,
				"roll": event.message.data.roll,
				"critical": event.message.data.critical,
				"failure": event.message.data.failure,
				"recipients": universe.getMasters()
			};

		roll.recipients[event.player.id] = true;

		if(roll.skill === "skill:initiative") {
			skill = {"initiative":roll.result};
		} else if(roll.skill === "skill:investigation") {
			skill = {"investigation":roll.result};
		} else if(roll.skill === "skill:perception") {
			skill = {"perception":roll.result};
		} else if(roll.skill === "skill:stealth") {
			skill = {"stealth":roll.result};
		}
		if(skill) {
			// console.log("Has");
			entity = universe.get(roll.entity);
			if(entity) {
				// console.log("Set");
				entity.setValues(skill);
			}
		}

		if(roll.target && (roll.action === "action:main:attack" || roll.action === "action:bonus:attack:light" || roll.action === "action:main:attack:extra" || roll.skill === "skill:offhand" || roll.skill === "skill:mainhand")) {
			universe.getObject(roll.target, function(err, object) {
				if(err) {
					// TODO:
					console.log("Err: ", err);
				} else {
					console.log("Roll: ", roll.result, " vs. ", object.armor);
					var sending = {
						"entity": roll.entity,
						"type": "action:status",
						"recipient": event.player.id
					};

					roll.difficulty = object.armor || 0;
					if(roll.dice.d20 && roll.dice.d20[0] === 1) {
						sending.message = "Miss";
						roll.succeeded = false;
					} else if(roll.dice.d20 && roll.dice.d20[0] === 20) {
						sending.message = "Critical";
						roll.succeeded = true;
					} else if(roll.result < object.armor) {
						sending.message = "Miss";
						roll.succeeded = false;
					} else {
						sending.message = "Hit";
						roll.succeeded = true;
					}
					universe.emit("send", sending);
				}
				universe.chronicle.addOccurrence("character:check", roll, Date.now(), roll.source || roll.entity, roll.target);
				universe.emit("send", roll);
			});
		} else {
			universe.chronicle.addOccurrence("character:check", roll, Date.now(), roll.source || roll.entity, roll.target);
			universe.emit("send", roll);
		}
	});
};
