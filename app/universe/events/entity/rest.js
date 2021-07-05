
module.exports.initialize = function(universe) {
	
	/**
	 * 
	 * @event action:rest:finish
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.entity The event name being fired, should match this event's name
	 */
	universe.on("action:rest:finish", function(event) {
		var entity
		if(typeof(event.entity) === "object") {
			entity = event.entity;
		} else {
			entity = universe.manager.entity.object[event.entity];
		}
		
		if(entity) {
			entity.setValues({
				"last_rest": universe.time
			});
		}
	});

	/**
	 * 
	 * @event player:rest:short
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message The payload from the UI
	 * @param {Object} event.message.entity 
	 * @param {Object} event.message.target 
	 * @param {Object} event.message.amount 
	 */
	universe.on("player:rest:long", function(event) {

	});
};
