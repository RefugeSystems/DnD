global.mock = global.mock || {};
global.mock.RSDatabase = function(configuration) {
	var mock = jasmine.createSpyObj("RSDatabase", ["getTypeManager", "close"]);
	expect(configuration).toBeDefined();
	return mock;
};
