var EventUtility = require("../utility.js"),
	cleanID = new RegExp("[^a-z0-9_:]", "g"),
	Random = require("rs-random");

module.exports.initialize = function(universe) {
	/**
	 * 
	 * Requires GameMaster
	 * @event player:points:give
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
	 * @param {Array | String} event.message.data.entities IDs to receive the points
	 * @param {String} event.message.data.type Of point to give, naming the property
	 * @param {String} event.message.data.amount Of points to give. Defaults to `1`.
	 */
	universe.on("player:points:give", function(event) {
		var entities = event.message.data.entities,
			pts = event.message.data.amount || 1,
			type = event.message.data.type,
			entity,
			give,
			i;

		if(event.player.gm && event.message.data.type && entities) {
			give = {};
			give.point_pool = {};
			give.point_pool[type] = pts;
			for(i=0; i<entities.length; i++) {
				entity = universe.manager.entity.object[entities[i]];
				if(entity) {
					entity.addValues(give);
				}
			}
		}
	});
};
