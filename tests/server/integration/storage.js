var RSDBConnection = require("../../../app/storage/database"),
	RSObject = require("../../../app/storage/rsobject"),
	RSField = require("../../../app/storage/rsfield"),
	fs = require("fs");

describe("Core Storage", function() {

	afterAll(function() {
		// Clean Up Files
		fs.unlinkSync(global.test_data.connection.dba.file);
	});

	describe("Type Object Data", function() {
		var fields = [],
			connection,
			testObject,
			testModification,
			testObjectTwo,
			testModificationTwo,
			manager,
			load;
			
		beforeAll(function() {
			connection = new RSDBConnection(global.test_data.connection.dba);
			
			testObject = {
				"id": "lol",
				"fa": "hi"
			};
			
			testModification = {
				"id": "lol",
				"fb": "boi"
			};
			
			testObjectTwo = {
				"id": "lol2",
				"fa": "hi22"
			};
			
			testModificationTwo = {
				"id": "lol2",
				"fb": "boi22"
			};
			
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
		
		it("can write an object", function(done) {
			manager.writeObjectData(testObject, function(err) {
				expect(!err).toBe(true);
				done();
			});
		});
		
		it("can read a written object", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(!err).toBe(true);
				expect(read.id).toBe(testObject.id);
				expect(read.fa).toBe(testObject.fa);
				done();
			}, 1);
		});
		
		it("can modify an object", function(done) {
			manager.writeObjectData(testModification, function(err) {
				expect(!err).toBe(true);
				done();
			});
		});
		
		it("can read the modifications of an object", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(!err).toBe(true);
				console.log(">>> ", read);
				expect(read.id).toBe(testObject.id);
				expect(read.fa).toBe(testObject.fa);
				expect(read.fb).toBe(testModification.fb);
				done();
			}, 1);
		});
		
		it("can track an object", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(!err).toBe(true);
				expect(read.id).toBe(testObject.id);
				expect(read.fa).toBe(testObject.fa);
				expect(read.fb).toBe(testModification.fb);
				done();
			});
		});
		
		it("can write an object another distinct object", function(done) {
			manager.writeObjectData(testObjectTwo, function(err) {
				expect(!err).toBe(true);
				done();
			});
		});
		
		it("can modify that other distinct object", function(done) {
			manager.writeObjectData(testModificationTwo, function(err) {
				expect(!err).toBe(true);
				done();
			});
		});
		
		it("can read the 2nd object", function(done) {
			manager.retrieveObjectData(testObjectTwo.id, function(err, read) {
				expect(!err).toBe(true);
				expect(read).toBeDefined();
				expect(read.id).toBe(testObjectTwo.id);
				expect(read.fa).toBe(testObjectTwo.fa);
				expect(read.fb).toBe(testModificationTwo.fb);
				done();
			}, 1);
		});
		
		it("can retrieve all null grid objects for a type", function(done) {
			manager.retrieveAllData(function(err, read) {
				var testing,
					x;
					
				expect(!err).toBe(true);
				expect(read).toBeDefined();
				expect(read.length > 0).toBe(true);
				
				for(x=0; x<read.length; x++) {
					expect(testing = manager.getObjectData(read[x].id)).toBeDefined();
					expect(read[x].fa === testing.fa).toBe(true);
					expect(read[x].fb === testing.fb).toBe(true);
				}
				done(err);
			});
		});
		
		it("can delete an object", function(done) {
			manager.deleteObject(testObject, function(err) {
				expect(!err).toBe(true);
				done();
			});
		});
		
		it("can delete an object after a single delete", function(done) {
			manager.deleteObject(testObjectTwo, function(err) {
				expect(!err).toBe(true);
				done();
			});
		});
		
		it("can exist as an empty set", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(read).not.toBeDefined();
				expect(!err).toBe(true);
				manager.retrieveObjectData(testObjectTwo.id, function(err, read) {
					expect(read).not.toBeDefined();
					expect(!err).toBe(true);
					done();
				});
			});
		});
		
		xit("can write an object to a field", function(done) {
			
		});
		
		xit("can read an object from a field", function(done) {
			
		});
		
		xit("can write an array to a field", function(done) {
			
		});
		
		xit("can read an array from a field", function(done) {
			
		});
		
		xit("can add a field to a TypeManager and use it", function(done) {
			
		});
		
		xit("can add a second field to a TypeManager and use it", function(done) {
			
		});
		
		xit("can remove a field from a TypeManager and continue to use the Type", function(done) {
			
		});
		
		xit("can remove a second field from a TypeManager", function(done) {
			
		});
		
		xit("throws errors when trying to use undefined fields", function(done) {
			
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
});
