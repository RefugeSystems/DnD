var RSObject = require("../../../app/storage/rsobject");

describe("RSObject", function() {
	var universe,
		manager,
		details,
		testing;

	beforeEach(function(done) {
		universe = new global.mock.Universe();
		manager = new global.mock.TypeManager();

		details = {
			"id": "testid",
			"name": "hi"
		};

		manager.initialize(["name", "description", "a", "b", "c", "sub_a", "sub_b", "sub_c"])
		.then(done)
		.catch(done);
	});

	it("can be defined", function() {
		testing = new RSObject(details, universe, manager);
		expect(testing._data).toBeDefined();
		expect(testing._data.id).toBe(details.id);
	});

	it("can set a value", function() {

	});

	xit("can set multiple values", function() {

	});

	xit("can read multiple values", function() {

	});
});
