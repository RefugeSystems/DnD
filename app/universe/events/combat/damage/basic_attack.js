
module.exports.initialize = function(universe) {
	return new Promise(function(done, fail) {
		universe.on("player:combat:attack", function(event) {
			console.log("Player Attacked: ", event);
		});
		
		done();
	});
};
