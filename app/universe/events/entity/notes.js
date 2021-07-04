
module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:entity:notes
	 */
	universe.on("player:entity:notes", function(event) {
		console.log("Incoming: ", event.message.data);

	});
};
