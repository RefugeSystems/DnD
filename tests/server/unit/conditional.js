var RSObject = require("../../../app/storage/rsobject");

xdescribe("RSObject conditional calculations", function() {
	var objectA,
		objectB,
		objectC;

	beforeEach(function() {
		var configuration = {},
			database,
			universe,
			manager,
			details;

		configuration.database = {};
		configuration.universe = {};

		database = new global.mock.RSDatabase(configuration.database);
		universe = new global.mock.Universe(configuration.universe);
		manager = new global.mock.ClassManager("testtype", database);

		details = {};
		details.id = "testa";
		details.name = "Test A";
		details.field = "data";
		objectA = new RSObject(details, universe, manager);

		details = {};
		details.id = "testb";
		details.name = "Test B";
		details.field = "data";
		objectB = new RSObject(details, universe, manager);

		details = {};
		details.id = "testc";
		details.name = "Test C";
		details.field = "data";
		objectC = new RSObject(details, universe, manager);
	});

	it("Handles numeric comparisons", function() {

	});

	it("Handles string comparisons", function() {

	});

	it("Token determination within the object", function() {

	});

	it("Handles tokenized string comparisons", function() {

	});
});
