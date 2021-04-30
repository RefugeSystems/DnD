global.mock = global.mock || {};
global.mock.RSObject = function(details, universe, manager) {
	var mock = jasmine.createSpyObj("RSObject", ["getField", "setField", "checkConditional"]),
		keys = Object.keys(details),
		x;

	expect(details).toBeDefined();
	expect(universe).toBeDefined();
	expect(manager).toBeDefined();

	for(x=0; x<keys.length; x++) {
		mock[keys[x]] = details[keys[x]];
	}

	return mock;
};
