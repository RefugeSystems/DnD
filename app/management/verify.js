// Verify configuration file
module.exports = function(configuration) {
	return new Promise(function(done, fail) {
		if(!configuration.server) {
			fail(new Error("No 'server' property found within configuration"));
		} else if(!configuration.server.port) {
			fail(new Error("No 'server.port' property found within configuration"));
		} else {
			done();
		}
	});
};
