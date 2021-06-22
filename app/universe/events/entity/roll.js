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
 * @event player:action:perform
 * @for Universe
 */

module.exports.initialize = function(universe) {
	universe.on("player:action:check", function(event) {
		var entity,
			skill,
			roll = {
				"type": "entity:roll",
				"result": event.message.data.result,
				"entity": event.message.data.entity,
				"skill": event.message.data.skill,
				"target": event.message.data.target,
				"action": event.message.data.action,
				"name": event.message.data.name,
				"dice": event.message.data.dice,
				"recipients": universe.getMasters()
			};

		roll.recipients[event.player.id] = true;

		if(roll.target && (roll.action === "action:main:attack" || roll.action === "action:bonus:attack:light" || roll.action === "action:main:attack:extra")) {
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

					if(roll.dice.d20 && roll.dice.d20[0] === 1) {
						sending.message = "Miss";
					} else if(roll.dice.d20 && roll.dice.d20[0] === 20) {
						sending.message = "Critical";
					} else if(roll.result < object.armor) {
						sending.message = "Miss";
					} else {
						sending.message = "Hit";
					}
					universe.emit("send", sending);
				}
			});
		} else if(roll.skill === "skill:initiative") {
			skill = {"initiative":roll.result};
		} else if(roll.skill === "skill:investigation") {
			skill = {"investigation":roll.result};
		} else if(roll.skill === "skill:perception") {
			skill = {"perception":roll.result};
		} else if(roll.skill === "skill:stealth") {
			skill = {"stealth":roll.result};
		}

		console.log(" > " + roll.skill);
		if(skill) {
			console.log(" > " + roll.skill);
			entity = universe.get(roll.entity);
			if(entity) {
				console.log(" > " + roll.skill);
				entity.setValues(skill);
			}
		}

		universe.chronicle.addOccurrence("character:check", roll, Date.now(), null, event.player.id);
		universe.emit("send", roll);
	});

	universe.on("player:action:perform", function(event) {
		console.log("Incoming: ", event.message.data);

		var perform = {
			"type": "entity:action",
			"activity": event.message.data.activity,
			"result": event.message.data.result,
			"damage": event.message.data.damage,
			"resist": event.message.data.resist,
			"entity": event.message.data.entity,
			"action": event.message.data.action,
			"target": event.message.data.target,
			"skill": event.message.data.skill,
			"check": event.message.data.check,
			"item": event.message.data.using,
			"name": event.message.data.name,
			"player": event.player.id
		};

		universe.emit(perform.action, perform);
		
		/*
		if(actions[perform.action]) {
			universe.chronicle.addOccurrence("character:action", perform, Date.now(), null, event.player.id);
			actions[perform.action](event, perform, function(err, result) {
				if(err) {
					universe.emit("error", new universe.Anomaly("action:perform:fault", "Error performing action for player", perform, 50, err, "roll.js"));
				} else {
					if(result.send) {
						universe.emit("send", result.send);
					}
				}
			});
		}
		*/
	});


	var actions = {};
	/**
	 * 
	 * @event action:free:damage
	 * @for Universe
	 * @param {Object} event 
	 * @param {Object} perform 
	 * @param {Function} callback 
	 */
	actions["action:free:damage"] = function(event, perform, callback) {
		
	};
};