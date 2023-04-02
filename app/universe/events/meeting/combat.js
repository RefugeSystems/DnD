
var Random = require("rs-random");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:meeting:combat
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
	 * @param {String} event.message.data.meeting
	 */
	universe.on("player:meeting:combat", function(event) {
		var meeting = event.message.data.meeting,
			combatEntities = [],
			details = {},
			notify = [],
			location,
			entity,
			i;

		if(typeof(meeting) === "string") {
			meeting = universe.manager.meeting.object[meeting];
		}

		if(meeting && meeting.entities && meeting.entities.length && event.player.gm) {
			for(i=0; i<meeting.entities.length; i++) {
				entity = meeting.entities[i];
				if(typeof(entity) === "string") {
					entity = universe.manager.entity.object[entity];
				}
				if(entity && entity.is_combatable) {
					combatEntities.push(entity.id);
					if(entity.is_npc || entity.is_hostile) {
						entity.setValues({
							"initiative": Random.integer(20,1) + (entity.skill_check?entity.skill_check["skill:initiative"] || 0:0)
						});
					} else {
						entity.setValues({
							"initiative": null
						});
						if(universe.objectHasKey(entity.owned)) {
							notify.push(entity);
						}
					}
					if(!details.location && entity.location) {
						details.location = entity.location;
						if(details.location) {
							location = universe.manager.location.object[details.location];
						}
					}
				}
			}

			details.id = Random.identifier("skirmish", 10, 32).toLowerCase();
			details.is_active = true;
			details.start = universe.time;
			details.entities = combatEntities;
			details.time = universe.time;
			details.date = Date.now();
			details.icon = "fas fa-swords";
			details.name = "Skirmish" + (location?" in " + location.name:"");
			universe.createObject(details, function(err, skirmish) {
				if(err) {
					universe.handleError("meeting:combat:start", "Failed to start a skirmish", err);
				} else {
					for(i=0; i<notify.length; i++) {
						entity = notify[i];
						universe.messagePlayers(entity.owned, "Roll Initiative for " + entity.name, "fa-solid fa-dice", {
							"type": "dialog-open",
							"component": "dndDialogCheck",
							"storageKey": "store:roll:" + entity.id,
							"entity": entity.id,
							"skill": "skill:initiative",
							"hideFormula": true,
							"hideHistory": true,
							"closeAfterCheck": true
						});
					}
					meeting.addValues({
						"skirmishes": [skirmish.id]
					});
					universe.emit("send", {
						"type": "combat:start:skirmish",
						"skirmish": skirmish.id,
						"id": skirmish.id
					});
				}
			});
		} else {
			universe.handleError("meeting:combat:start", "Non-Gamemaster attempted to start combat", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};
