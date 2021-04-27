var RSDBConnection = require("../../../app/storage/database"),
	RSObject = require("../../../app/storage/rsobject"),
	RSField = require("../../../app/storage/rsfield"),
	fs = require("fs");

describe("Core Storage", function() {

	afterAll(function() {
		// Clean Up Files
		fs.unlinkSync(global.test_data.connection.dba.file);
	});

	describe("Database connections", function() {
		var fields = [],
			connection,
			manager,
			load;
			
		beforeAll(function() {
			connection = new RSDBConnection(global.test_data.connection.dba);
			
			load = new RSField(global.test_data.fields.test_a);
			// fields[load.name] = load;
			fields.push(load);
			load = new RSField(global.test_data.fields.test_b);
			fields.push(load);
			load = new RSField(global.test_data.fields.test_obj);
			fields.push(load);
			load = new RSField(global.test_data.fields.test_array);
			fields.push(load);
		});
		
		afterAll(function() {
			var keys = Object.keys(fields);
			for(var x=0; x<keys.length; x++) {
				RSField.removeField(fields[x]);
			}
		});

		it("can connect to a file", function(done) {
			manager = connection.getTypeManager("testtype");
			manager.initialize([fields[0], fields[1]])
			.then(function() {
				done();
			})
			.catch(function(err) {
				console.log("Init Error: ", err);
				done(err);
			});
		});
		
		
		it("can close its connection", function(done) {
			connection.close()
			.then(done)
			.catch(function(err) {
				console.log(err);
				done(err);
			});
		});
	});

	describe("RSField internal functionality", function() {

		it("exists", function() {
			expect(RSField).toBeDefined();
		});

		it("can be defined", function() {
			var field = new RSField(global.test_data.fields.test_a);
			expect(field).toBeDefined();
			expect(field.name).toBe(global.test_data.fields.test_a.name);
			expect(field.inheritance).toBe(0);
		});

		it("can be retrieved", function() {
			var field = RSField.getField(global.test_data.fields.test_a.name);
			expect(field).toBeDefined();
			expect(field.name).toBe(global.test_data.fields.test_a.name);
			expect(field.inheritance).toBe(0);
		});

		it("has event properties", function() {
			var field = RSField.getField(global.test_data.fields.test_a.name);
			RSField.removeField(field);
		});

		it("can be removed", function(done) {
			var field = new RSField(global.test_data.fields.test_b);
			field.on("removed", function(emitted) {
				expect(emitted.name).toBe(global.test_data.fields.test_b.name);
				done();
			});
			RSField.removeField(field);
		});
	});
});
