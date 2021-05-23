
module.exports.initialize = function(universe) {
	return new Promise(function(done, fail) {
		universe.on("player:combat:enchant", function(event) {
			console.log("Player Enchanted: ", event);
		});
		
		done();
	});
};
