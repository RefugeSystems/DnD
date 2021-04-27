global.mock = global.mock || {};
global.mock.RSWorld = function() {
	var mock = jasmine.createSpy("RSWorld");
	mock.and.callFake(function(details, settingsManager) {
		expect(details).toBeDefined();
		expect(settingsManager).toBeDefined();
		return {
			"name": details.name,
			"id": details.id,
			"description": details.description
		};
	});
	return mock;
};
