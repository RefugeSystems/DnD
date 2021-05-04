global.mock = global.mock || {};
global.mock.RSDatabase = function(configuration) {
	var mock = jasmine.createSpyObj("RSDatabase", ["getClassManager", "close"]);
	expect(configuration).toBeDefined();
	return mock;
};
