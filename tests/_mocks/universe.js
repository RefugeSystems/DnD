global.mock = global.mock || {};
global.mock.Universe = function(configuration) {
	var mock = jasmine.createSpyObj("Universe", ["initialize", "requestObject", "emit", "on", "off", "once"]),
		requestReturn = null;
	
	mock.setObjectReturn = function(toReturn) {
		requestReturn = toReturn;
	};
	
	mock.initialize.and.callFake(function(database) {
		return new Promise(function(done) {
			expect(database).toBeDefined();
			done();
		});
	});
	
	mock.requestObject.and.callFake(function(id, callback) {
		callback(null, requestReturn);
	});
	
	return mock;
};
