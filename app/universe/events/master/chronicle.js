module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:master:chronicle:range:get
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
	 * @param {String | Object} event.message.data.location
	 * @param {Object} event.message.data.image Specifies the constraints to which the viewer is to focus
	 */
	universe.on("player:master:control:map", function(event) {
		var chronicled,
			notify;

		if(event.player.gm) {
			
		} else {
			notify = Object.assign({}, universe.getMasters());
			notify[event.player.id] = true;
			universe.emit("send", {
				"type": "notice",
				"icon": "fas fa-exclamation-triangle rs-lightyellow",
				"recipients": notify,
				"message": "Only Game Masters may access the chronicle directly; " + event.player.name,
				"data": event.message.data,
				"timeout": 8000
			});
		}
	});
};
