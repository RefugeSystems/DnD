module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:entity:craft:recipe
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
	 * @param {String} event.message.data.source
	 * @param {String} event.message.data.target
	 * @param {String} event.message.data.recipe
	 * @param {Array} event.message.data.entities
	 * @param {Object} event.message.data.inputs Maps Object IDs to Class IDs to arrays of IDs to consume from them
	 */
	universe.on("player:entity:craft:recipe", function(event) {
		var source = universe.get(event.message.data.source),
			target = universe.get(event.message.data.target),
			recipe = universe.get(event.message.data.recipe),
			entities = event.message.data.entities,
			inputs = event.message.data.inputs,
			outputs,
			inputs,
			item,
			i;
		
		if(source && target && inputs && (event.player.gm || source.owned[event.player.id])) {
			// TODO: Process Recipe
		}
	});
};
