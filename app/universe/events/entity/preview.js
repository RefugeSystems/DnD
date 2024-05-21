var Random = require("rs-random");

module.exports.initialize = function(universe) {
	
	/**
	 * Create a preview entity for the source entity and reply to fulfill the request with the fulfillment ID.
	 * @event player:entity:preview:create
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.entity The event name being fired, should match this event's name
	 * @param {String} [event.item] To attune
	 */
	/**
	 * 
	 * @event player:entity:preview:create
	 * @for Universe
	 * @param {Object} event With data from the system
	 * @param {String} event.type The event name being fired, should match this event's name
	 * @param {Integer} event.received Timestamp of when the server received the event
	 * @param {Integer} event.sent Timestamp of when the UI sent the event (By the User's time)
	 * @param {RSObject} event.player That triggered the event
	 * @param {Object} event.message 
	 * @param {Object} event.message.type 
	 * @param {Object} event.message.sent 
	 * @param {Object} event.message.data 
	 * @param {String} event.message.data.entity Entity ID of the source entity
	 */
	universe.on("player:entity:preview:create", function(event) {
		var entity = event.message.data.entity;
		universe.promiseObject({
			"id": entity + ":" + Random.lowercase(32),
			"parent": entity,
			"is_preview": true,
			"is_review": true,
			"review": true
		})
		.then(function(created) {
			universe.fulfill(event, {
				"entity": created.id
			});
		})
		.catch(function(error) {
			console.log("Error: ", error);
		});
	});
};
