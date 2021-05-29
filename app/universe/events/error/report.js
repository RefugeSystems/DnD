/**
 * 
 * @event player:error:report
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
 */

module.exports.initialize = function(universe) {
	universe.on("player:error:report", function(event) {
		console.log("Player Event: ", event);
		var component;
		if(event.message && event.message.data && event.message.data.component) {
			component = event.message.data.component.id || event.message.data.component;
		}
		universe.chronicle.addEvent("error:player", event.message, Date.now(), component, event.player?event.player.id:null);
		universe.emit("send", {
			"type": "notice",
			"mid": "report:error:received",
			"recipient": event.player.id,
			"message": "Error Report Received",
			"timeout": 5000
		});
		
		// TODO: Notify Game Masters of Error Report
	});
};
