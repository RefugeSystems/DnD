
module.exports.initialize = function(universe) {

	/**
	 * 
	 * @event player:slot:increment
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
	 * @param {String} event.message.data.entity
	 * @param {String} event.message.data.slot
	 * @param {String} event.message.data.charges
	 */
	universe.on("player:slot:changes", function(event) {
		var changes = parseInt(event.message.data.changes),
			slot = event.message.data.slot,
			entity,
			delta;
		
		if(event.message.data.entity && (entity = universe.get(event.message.data.entity))) {
			delta = {};
			delta.spell_slots = {};
			delta.spell_slots[slot] = changes;
			entity.addValues(delta);
		}
	});
};
