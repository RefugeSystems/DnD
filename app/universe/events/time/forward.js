module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:time:forward
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message 
	 * @param {Object} event.message.data
	 * @param {Number} event.message.data.increment Duration To progress
	 * @param {Boolean} event.message.data.lock As true to skip occurrence and timeline processing
	 */
	universe.on("player:time:forward", function(event) {
		if(event.player.gm) {
			if(typeof(event.message.data.increment) === "number") {
				universe.forwardTime(event.message.data.increment, event.message.data.lock);
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to increment time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});

	/**
	 * 
	 * @event player:time:to
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message
	 * @param {Number} event.message.data
	 * @param {Number} event.message.data.time To skip to
	 * @param {Boolean} event.messag.datae.lock As true to skip occurrence and timeline processing
	 */
	universe.on("player:time:to", function(event) {
		if(event.player.gm) {
			if(typeof(event.message.data.time) === "number") {
				universe.toTime(event.message.data.time, event.message.data.lock);
			}
		} else {
			universe.handleError("universe:time", "Non-Gamemaster attempted to set time", null, {
				"player": event.player.id,
				"message": event.message
			});
		}
	});
};