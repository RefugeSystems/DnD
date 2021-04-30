global.mock = global.mock || {};
global.mock.Universe = function(configuration) {
	var mock = jasmine.createSpyObj("Universe", ["initialize", "emit", "on", "off", "once"]);
	mock.initialize.and.callFake(function(database) {
		return new Promise(function(done) {
			expect(database).toBeDefined();
			done();
		});
	});
	return mock;
};
