module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:entity:assume
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
	 */
	 universe.on("player:entity:assume", function(event) {
		var attributes = Object.assign({}, event.player.attribute),
			entity = event.message.data.entity;
		
		if(typeof(entity) === "string") {
			entity = universe.get(entity);
		}

		if(entity && (event.player.gm || (entity.owned && entity.owned[event.player.id])) && attributes.playing_as !== entity.id) {
			attributes.playing_as = entity.id;
			event.player.setValues({
				"attribute": attributes
			});
		}
	});
};
