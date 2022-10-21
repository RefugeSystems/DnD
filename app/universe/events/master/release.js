module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:release:set
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
	 * @param {String} event.message.data.release ID to set as the system's tracked release or null to clear it.
	 */
	universe.on("player:release:set", function(event) {
		var release = event.message.data.release;
		if(event.player.gm) {
			if(release === null) {
				universe.setActiveRelease(null);
			} else if(release = universe.get(release)) {
				universe.setActiveRelease(release.id);
			} else {
				// No Set
			}
		} else {
			// Access Error
		}
	});


	universe.on("player:release:complete", function(event) {
		var release = event.message.data.release;
		if(event.player.gm) {
			if(release === null) {
				
			} else if(release = universe.get(release)) {
				
			} else {
				// No Set
			}
		} else {
			// Access Error
		}
	});
};
