var NameGenerator = require("../../../management/nameGenerator");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:template:spawn
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
	 * @param {String} event.message.data.id Of the template to spawn
	 * @param {Object} [event.message.data.seed] Any optional leading data to apply to the matched field of the template
	 * @param {String} [event.message.data.seed.name] Example of seeding the name field to be a specific name
	 * @param {String} [event.message.data.seed._target] Special field to indicate the target entity by ID of the spawn
	 */
	universe.on("player:template:spawn", function(event) {
		var source = universe.get(event.message.data.id),
			meeting = universe.get(event.message.data.seed.meeting),
			target = universe.manager.entity.object[event.message.data.seed._target],
			mask = Object.assign({}, event.message.data.seed);
		
		if(source) {
			if(event.player.gm) {
				delete(mask.meeting);
				delete(mask._target);
				universe.copyPromise(source, mask)
				.then(function(copy) {
					if(target) {
						switch(copy._class) {
							case "spell":
								target.addValues({
									"known_spells": [copy.id]
								});
								break;
							case "item":
								target.addValues({
									"inventory": [copy.id]
								});
								break;
							case "knowledge":
								target.addValues({
									"knowledges": [copy.id]
								});
								break;
							case "feat":
								target.addValues({
									"feats": [copy.id]
								});
								break;
							case "effect":
								target.addValues({
									"effects": [copy.id]
								});
								break;
						}
					}
					switch(copy._class) {
						case "entity":
							if(meeting) {
								meeting.addValues({
									"entities": [copy.id]
								});
							}
							copy.setValues({
								"hp": copy.hp_max
							});
							break;
					}
					universe.emit("send", {
						"type": "notice",
						"mid": "universe:success",
						"recipients": universe.getMasters(),
						"message": event.player.name + " has spawned a template: \"" + source.name + "\" of \"" + copy.name + "\"" + (target ? " on \"" + target.name + "\"": ""),
						"icon": "fas fa-check rs-lightgreen",
						"timeout": 5000
					});
				})
				.catch(function(err) {
					console.log("Error cloning template: " + source.name, err);
					universe.emit("send", {
						"type": "notice",
						"mid": "universe:error",
						"recipients": universe.getMasters(),
						"message": "Unable to clone template: " + source.name + " - " + err.message,
						"icon": "fas fa-exclamation-triangle rs-lightred",
						"anchored": true
					});
				});
			} else {
				universe.emit("send", {
					"type": "notice",
					"mid": "universe:error",
					"recipients": universe.getMasters(),
					"message": event.player.name + " does not have permission to spawn a template: " + source.name,
					"icon": "fas fa-exclamation-triangle rs-lightred",
					"anchored": true
				});
			}
		} else {
			universe.emit("send", {
				"type": "notice",
				"mid": "universe:error",
				"recipients": universe.getMasters(),
				"message": "Unable to clone template as the specified template was not found: " + event.message.data.id,
				"icon": "fas fa-exclamation-triangle rs-lightred",
				"anchored": true
			});
		}
	});
};
