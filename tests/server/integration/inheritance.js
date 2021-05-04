var RSDBConnection = require("../../../app/storage/database"),
	RSObject = require("../../../app/storage/rsobject"),
	RSField = require("../../../app/storage/rsfield"),
	fs = require("fs");

xdescribe("RSObject", function() {
	var database,
		universe,
		manager,
		object;

	beforeAll(function(done) {
		database = new RSDBConnection(global.test_data.connection.dbb);
		database.initialize()
		.then(function() {
			return Promise.all([
				database.createField(global.test_data.fields.name),
				database.createField(global.test_data.fields.description),
				database.createField(global.test_data.fields.count),
				database.createField(global.test_data.fields.slots)
			]);
		})
		.then(function(field) {
			expect(field).toBeDefined();
			return database.createClassManager(global.test_data.classes.data);
		})
		.then(function(classManager) {
			expect(classManager).toBeDefined();
			manager = classManager;
		})
		.then(done)
		.catch(done);
	});
	
	beforeEach(function() {
		universe = new global.mock.Universe();
	});

	afterAll(function() {
		// Clean Up Files
		database.close()
		.then(function() {
			fs.unlinkSync(global.test_data.connection.dbb.file);
		});
	});

	describe("basic operations", function() {
		it("passes basic inspection", function() {
			expect(manager).toBeDefined();
		});
		
		it("manages basic declaration", function() {
			var object = new RSObject(universe, manager, {
				"id": "data:test:one",
				"name": "Test Name",
				"description": "A string",
				"count": 4,
				"slots": [1, 2, 3]
			});
			expect(object).toBeDefined();
			expect(object.name).toBeDefined();
			expect(object.description).toBeDefined();
			expect(object.count).toBeDefined();
			expect(object.slots).toBeDefined();
		});
		
		it("can retrieve data", function(done) {
			var object = new RSObject(universe, manager, {
				"id": "data:test:one",
				"name": "Test Name",
				"description": "A string",
				"count": 4,
				"slots": [1, 2, 3]
			});
			object.getValue("count", function(value) {
				expect(value).toBe(4);
				done();
			});
		});
	});

	describe("Object property summation", function() {
		
	});
});
