


module.exports.initialize = function(universe) {
	/**
	 * Player self ending their turn. Then auto determine next entity and emit/set entity, turn, and round as needed.
	 * @event player:skimish:turn:end
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
	 * @param {String} event.message.data.entity
	 * @param {String} event.message.data.action
	 */
	universe.on("player:action:use", function(event) {
		var action = event.message.data.action,
			entity = event.message.data.entity,
			change;

		if(typeof(entity) === "string") {
			entity = universe.manager.entity.object[entity];
		}

		if(action && entity && (event.player.gm || entity.owned[event.player.id])) {
			change = {};
			change.action_count = {};
			change.action_count[action] = -1;
			entity.addValues(change);
		}
	});
};
