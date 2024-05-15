module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:master:request:roll
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.data
	 * @param {Object} event.message.data.skill
	 * @param {Object} event.message.data.entities
	 */
	universe.on("player:master:request:roll", function(event) {
		if(event.player.gm && event.message.data) {
			var skill = universe.get(event.message.data.skill),
				entities = event.message.data.entities,
				entity,
				i;

			if(entities) {
				for(i=0; i<entities.length; i++) {
					entity = universe.get(entities[i]);
					if(entity) {
						console.log("Request " + skill.name + " Roll from " + entity.name);
						universe.utility.requestSkillCheck(entity, skill);
					}
				}
			} else {
				console.warn("No entities to roll for", event.message);
			}
		} else {
			universe.generalError("master:message:access", null, "Invalid attempt to request player rolls", {"player": event.player.id, "data": event.message.data});
		}
	});
};
