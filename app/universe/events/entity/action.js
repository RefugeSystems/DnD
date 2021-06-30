
module.exports.initialize = function(universe) {
	/**
	 * Generic action handling routing.
	 * 
	 * Ensures basic rights access on the source and/or entity object
	 * then re-emits for an action handler to process.
	 * @event player:action:perform
	 */
	 universe.on("player:action:perform", function(event) {
		// console.log("Incoming: ", event.message.data);

		var action,
			source,
			target,
			perform;

		perform = {
			"type": "entity:action",
			"activity": event.message.data.activity,
			"result": event.message.data.result,
			"damage": event.message.data.damage,
			"resist": event.message.data.resist,
			"entity": event.message.data.entity || event.message.data.source,
			"action": event.message.data.action,
			"target": event.message.data.target,
			"skill": event.message.data.skill,
			"check": event.message.data.check,
			"item": event.message.data.using,
			"name": event.message.data.name,
			"player": event.player.id
		};

		if(perform.action) {
			if(perform.entity) {
				source = universe.get(perform.entity);
				if(source && (source.played_by === event.player.id || (source.owned && source.owned[event.player.id]) || event.player.gm)) {
					universe.emit(perform.action, perform);
				} else {
					universe.emit("error", new universe.Anomaly("action:perform:warning", "Player not allowed to perform action for entity", perform, 40, null, "entity:action"));
				}
			} else {
				universe.emit("error", new universe.Anomaly("action:perform:warning", "No action source found", perform, 40, null, "entity:action"));
			}
		} else {
			universe.emit("error", new universe.Anomaly("action:perform:warning", "No action specified", perform, 40, null, "entity:action"));
		}
	});
};
