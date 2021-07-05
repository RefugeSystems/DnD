
module.exports.initialize = function(universe) {
	var manager = universe.manager.action;

	// ForEach used to create functional scopes
	manager.objectIDs.forEach(function(id) {
		universe.on(id, function(event) {
			console.log("Response: " + id);
			var entity = universe.get(event.source || event.entity);
			if(entity && entity.response && entity.response[id] && entity.response[id].length) {
				var response,
					i;

				for(i=0; i<entity.response[id].length; i++) {
					response = entity.response[id][i];
					if(response && !response.ui) {
						if(response.add) {
							entity.addValues(response.add);
						}
						if(response.sub) {
							entity.subValues(response.sub);
						}
						if(response.set) {
							entity.setValues(response.set);
						}
					}
				}
			}
		});
	});


	/**
	 * Generic action handling routing.
	 * 
	 * Ensures basic rights access on the source and/or entity object
	 * then re-emits for an action handler to process.
	 * @event player:action:perform
	 */
	 universe.on("player:action:perform", function(event) {
		console.log("Incoming: ", event.message.data);

		var perform,
			action,
			source,
			also,
			i;

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
			"roll": event.message.data.roll,
			"player": event.player.id
		};

		if(perform.action) {
			action = manager.object[perform.action];
			if(action && !action.disabled && !action.is_preview && perform.entity) {
				// perform.action = action;
				source = universe.get(perform.entity);
				if(source && (source.played_by === event.player.id || (source.owned && source.owned[event.player.id]) || event.player.gm)) {
					// perform.entity = source;
					universe.emit(perform.action, perform);

					if(action.also) {
						for(i=0; i<action.also.length; i++) {
							console.log("Also: " + action.also[i]);
							also = manager.object[action.also[i]];
							if(also && !also.disabled && !also.is_preview) {
								console.log(" > Emit: " + also.id);
								universe.emit(also.id, {
									"entity": source,
									"action": also
								});
							}
						}
					}
				} else {
					universe.emit("error", new universe.Anomaly("action:perform:error", "Player not allowed to perform action for entity", perform, 50, null, "entity:action"));
				}
			} else {
				universe.emit("error", new universe.Anomaly("action:perform:warning", "No action source found", perform, 40, null, "entity:action"));
			}
		} else {
			universe.emit("error", new universe.Anomaly("action:perform:warning", "No action specified", perform, 40, null, "entity:action"));
		}
	});
};
