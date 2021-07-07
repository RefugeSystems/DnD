module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:meeting:details
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {String} event.message.meeting
	 * @param {String} event.message.name
	 * @param {String} event.message.description
	 */
	universe.on("player:meeting:details", function(event) {
		var meeting = universe.manager.meeting.object[event.message.data.meeting];
		if(event.player.gm) {
			if(meeting) {
				meeting.setValues({
					"name": event.message.name,
					"description": event.message.description
				});
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to modify meeting time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};
