
module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:dismiss:message
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.type Original event type indicated by the UI
	 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
	 * @param {Object} event.message.data Typical location of data from the UI
	 * @param {Object} event.message.data.id Of the message to be dismissed
	 */
	 universe.on("player:dismiss:message", function(event) {
		var id = event.message.data.id,
			notify = {};
		notify[event.player.id] = true;
		universe.emit("send", {
			"type": "dismiss-message",
			"mid": id,
			"recipients": notify
		});
	});
	
	/**
	 * 
	 * @event player:dismiss:message
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.type Original event type indicated by the UI
	 * @param {Object} event.message.sent The timestamp at which the event was sent by the UI (By the User's time)
	 * @param {Object} event.message.data Typical location of data from the UI
	 * @param {Object} event.message.data.id Of the message to be dismissed
	 */
	 universe.on("player:dismiss:message", function(event) {
		var id = event.message.data.id,
			notify = {};
		notify[event.player.id] = true;
		universe.emit("send", {
			"type": "dismiss-message",
			"mid": id,
			"recipients": notify
		});
	});
};