module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:inventory:give
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
	 * @param {Object} event.message.data.entity
	 * @param {Object} event.message.data.target
	 * @param {Object} event.message.data.items
	 */
	universe.on("player:inventory:give", function(event) {
		var entity = event.message.data.entity,
			target = event.message.data.target,
			items = event.message.data.items,
			exchanging = [],
			summary = [],
			update,
			item,
			i;
		
		if(typeof(entity) === "string") {
			entity = universe.get(entity);
		}
		if(typeof(target) === "string") {
			target = universe.get(target);
		}
		if(entity) {
			if((entity.owned[event.player.id] || entity.played_by === event.player.id || event.player.gm) && entity.inventory && target && target.inventory && items && items.length) {
				for(i=0; i<items.length; i++) {
					item = universe.manager.item.object[items[i]];
					if(item && entity.inventory.indexOf(item.id) !== -1) {
						if(entity.equipped && entity.equipped.indexOf(item.id) === -1) {
							exchanging.push(item.id);
							summary.push(item.name);
							if(!item.is_singular || item.is_special) {
								item.setValues({
									"acquired_in": universe.manager.setting.object["setting:meeting"].value,
									"acquired": universe.time,
									"character": null,
									"user": null
								});
							}
						} else {
							universe.messagePlayer(event.player, "Can not give item \"" + item.name + "\" because it is currently equipped");
						}
					}
				}
			}
		} else if(event.player.gm) {
			for(i=0; i<items.length; i++) {
				item = universe.manager.item.object[items[i]];
				if(item) {
					exchanging.push(item.id);
					summary.push(item.name);
					if(!item.is_singular || item.is_special) {
						item.setValues({
							"acquired_in": universe.manager.setting.object["setting:meeting"].value,
							"acquired": universe.time,
							"character": null,
							"user": null
						});
					}
				}
			}
		}
		if(exchanging.length) {
			if(entity) {
				update = {
					"inventory": exchanging
				};
				entity.subValues(update);
				update = {
					"history": [{
						"event": "give:items",
						"time": universe.time,
						"items": exchanging,
						"to": target.id
					}]
				};
				entity.addValues(update);
			}
			if(5 < summary.length) {
				summary.push("Plus " + summary.splice(4).length + " more items");
			}
			summary = "<ul><li>" + summary.join("</li><li>") + "</li></ul>";
			update = {
				"inventory": exchanging,
				"history": [{
					"event": "recv:items",
					"time": universe.time,
					"items": exchanging,
					"from": entity?entity.id:undefined
				}]
			};
			target.addValues(update);
			universe.chronicle.addOccurrence("entity:trade:items", {
				"source": entity?entity.id:undefined,
				"target": target.id,
				"items": exchanging
			});
			universe.emit("send", {
				"type": "notice",
				"recipient": event.player.id,
				"message": "<span>Gave " + exchanging.length + " items to " + target.name + ":<span>" + summary,
				"timeout": 5000
			});
			universe.emit("send", {
				"type": "notice",
				"recipients": target.owned,
				"message": "<span>" + target.name + " received " + exchanging.length + (entity?" items from " + entity.name:" items") + ":<span>" + summary,
				"timeout": 5000
			});
		}
	});

	/**
	 * 
	 * @event player:inventory:drop
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
	 * @param {Object} event.message.data.entity
	 * @param {Object} event.message.data.target
	 * @param {Object} event.message.data.items
	 */
	universe.on("player:inventory:drop", function(event) {
		var entity = event.message.data.entity,
			items = event.message.data.items,
			exchanging = [],
			summary = [],
			meeting,
			update,
			item,
			i;
		
		if(typeof(entity) === "string") {
			entity = universe.get(entity);
		}
		if(entity && (entity.owned[event.player.id] || entity.played_by === event.player.id || event.player.gm) && entity.inventory && items && items.length) {
			for(i=0; i<items.length; i++) {
				item = universe.manager.item.object[items[i]];
				if(item && entity.inventory.indexOf(item.id) !== -1) {
					if(entity.equipped && entity.equipped.indexOf(item.id) === -1) {
						exchanging.push(item.id);
						summary.push(item.name);
						item.setValues({
							"character": null,
							"user": null
						});
					} else {
						universe.messagePlayer(event.player, "Can not give item \"" + item.name + "\" because it is currently equipped");
					}
				}
			}
		}
		if(exchanging.length) {
			if(5 < summary.length) {
				summary.push("Plus " + summary.splice(4).length + " more items");
			}
			summary = "<ul><li>" + summary.join("</li><li>") + "</li></ul>";
			update = {
				"inventory": exchanging
			};
			entity.subValues(update);
			update = {
				"history": [{
					"event": "drop:items",
					"time": universe.time,
					"items": exchanging
				}]
			};
			entity.addValues(update);
			universe.chronicle.addOccurrence("entity:drop:items", {
				"source": entity.id,
				"items": exchanging
			});
			universe.emit("send", {
				"type": "notice",
				"recipient": event.player.id,
				"message": "<span>Dropped " + exchanging.length + " items:</span>" + summary,
				"timeout": 5000
			});
			meeting = universe.manager.meeting.object[universe.manager.setting.object["setting:meeting"].value];
			if(meeting)  {
				console.log("Meeting: " + meeting.id + " | " + meeting.is_active);
			} else {
				console.log("No Meeting");
			}
			if(meeting && meeting.is_active) {
				meeting.addValues({
					"items": exchanging
				});
			}
		}
	});
};
