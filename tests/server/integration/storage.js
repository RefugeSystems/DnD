var RSDBConnection = require("../../../app/storage/database"),
	RSObject = require("../../../app/storage/rsobject"),
	RSField = require("../../../app/storage/rsfield"),
	fs = require("fs");

describe("Core Storage", function() {

	describe("Type Object Data", function() {
		var fields = [],
			database,
			testObject,
			testModification,
			testObjectTwo,
			testModificationTwo,
			writeObject,
			writeArray,
			universe,
			manager,
			load;

		beforeAll(function() {
			// originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        	// jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

			universe = new global.mock.Universe();

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

			writeObject = {
				"this": "is",
				"a": "Test"
			};

			writeArray = ["this", "is", "a", "test", 1, 2, 3, 4];

			/*
			load = new RSField(global.test_data.fields.test_a);
			// fields[load.name] = load;
			fields.push(load);
			load = new RSField(global.test_data.fields.test_b);
			fields.push(load);
			load = new RSField(global.test_data.fields.test_obj);
			fields.push(load);
			load = new RSField(global.test_data.fields.test_array);
			fields.push(load);
			*/
		});

		afterAll(function() {
			// var keys = Object.keys(fields);
			// for(var x=0; x<keys.length; x++) {
			// 	RSField.removeField(fields[x]);
			// }
		});

		it("can connect to a file", function(done) {
			database = new RSDBConnection(global.test_data.connection.dba);
			database.initialize()
			.then(done)
			.catch(function(err) {
				console.log("Init Error: ", err);
				done(err);
			});
		});
		
		it("has the field and classification tables", function(done) {
			database.connection.all("select * from rsfield", function(ferr, fields) {
				expect(fields.length).toBe(0);
				database.connection.all("select * from rsclass", function(cerr, classes) {
					expect(classes.length).toBe(0);
					done(ferr || cerr);
				});
			});
		});
		
		it("can define a Field", function(done) {
			database.createField(global.test_data.fields.test_a)
			.then(function(field) {
				expect(field).toBeDefined();
				expect(field.id).toBe(global.test_data.fields.test_a.id);
				expect(field.name).toBe(global.test_data.fields.test_a.name);
				expect(field.type).toBe(global.test_data.fields.test_a.type);
				expect(field.title).not.toBeDefined();
				database.connection.all("select * from rsfield;", function(err, rows) {
					if(err) {
						done(err);
					} else {
						expect(rows.length).toBe(1);
						expect(rows[0].id).toBe(global.test_data.fields.test_a.id);
						expect(rows[0].name).toBe(global.test_data.fields.test_a.name);
						expect(rows[0].type).toBe(global.test_data.fields.test_a.type);
						done();
					}
				});
			})
			.catch(done);
		});
		
		it("can define a Class", function(done) {
			database.createClassManager(global.test_data.classes.testclassone)
			.then(function(manager) {
				done();
			})
			.catch(done);
		});
		
		it("can add a field to a Class", function(done) {
			var manager = database.getClassManager(global.test_data.classes.testclassone.id);
			expect(manager).toBeDefined();
			manager.addField(global.test_data.fields.test_a.id)
			.then(function() {
				done();
			})
			.catch(function(anomaly) {
				console.error("Failed to add field: ", anomaly);
				done(new Error(anomaly.msg));
			});
		});
		
		it("can create a class object", function(done) {
			var manager = database.getClassManager(global.test_data.classes.testclassone.id);
			expect(manager).toBeDefined();
			manager.create(universe, global.test_data.objects.testclassone.basic, function(err, object) {
				if(err) {
					done(err);
				} else {
					// console.log("Object: ", object);
					object.updateFieldValues();
					expect(object).toBeDefined();
					expect(object._data.id).toBe(global.test_data.objects.testclassone.basic.id);
					expect(object._data.fa).toBe(global.test_data.objects.testclassone.basic.fa);
					expect(object.id).toBe(global.test_data.objects.testclassone.basic.id);
					expect(object.fa).toBe(global.test_data.objects.testclassone.basic.fa);
					expect(object.created).toBeDefined();
					expect(object.updated).toBeDefined();
					done();
				}
			});
		});
		
		it("can remove a field from a Class", function(done) {
			var manager = database.getClassManager(global.test_data.classes.testclassone.id);
			expect(manager).toBeDefined();
			manager.removeField(global.test_data.fields.test_a.id)
			.then(function() {
				return new Promise(function(done, fail) {
					manager.create(universe, global.test_data.objects.testclassone.repeating, function(err, object) {
						if(err) {
							fail(err);
						} else {
							expect(object).toBeDefined();
							expect(object._data.id).toBe(global.test_data.objects.testclassone.repeating.id);
							expect(object._data.fa).toBe(global.test_data.objects.testclassone.repeating.fa);
							expect(object.id).toBe(global.test_data.objects.testclassone.repeating.id);
							expect(object.fa).not.toBeDefined();
							expect(object.created).toBeDefined();
							expect(object.updated).toBeDefined();
							done();
						}
					});
				});
			})
			.then(function() {
				database.connection.all("select * from testclassone;", function(err, rows) {
					if(err) {
						done(err);
					} else {
						for(var x=0; x<rows.length; x++) {
							if(rows[x].id === global.test_data.objects.testclassone.repeating.id) {
								expect(rows[x].fa).toBe(null); // SQLLite columns always come back with a "value", null for empty
								done();
								return;
							}
						}
						done(new Error("Failed to find test object"));
					}
				});
			})
			.catch(function(anomaly) {
				// console.error("Failed to remove field: ", anomaly);
				done(new Error(anomaly.msg));
			});
		});

		xit("can write an object", function(done) {
			manager.writeObjectData(testObject, function(err) {
				expect(!err).toBe(true);
				done(err);
			});
		});

		xit("can read a written object", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(!err).toBe(true);
				expect(read.id).toBe(testObject.id);
				expect(read.fa).toBe(testObject.fa);
				done(err);
			}, 1);
		});

		xit("can modify an object", function(done) {
			manager.writeObjectData(testModification, function(err) {
				expect(!err).toBe(true);
				done(err);
			});
		});

		xit("can read the modifications of an object", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(!err).toBe(true);
				expect(read.id).toBe(testObject.id);
				expect(read.fa).toBe(testObject.fa);
				expect(read.fb).toBe(testModification.fb);
				done(err);
			}, 1);
		});

		xit("can track an object", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(!err).toBe(true);
				expect(read.id).toBe(testObject.id);
				expect(read.fa).toBe(testObject.fa);
				expect(read.fb).toBe(testModification.fb);
				done(err);
			});
		});

		xit("can write an object another distinct object", function(done) {
			manager.writeObjectData(testObjectTwo, function(err) {
				expect(!err).toBe(true);
				done(err);
			});
		});

		xit("can modify that other distinct object", function(done) {
			manager.writeObjectData(testModificationTwo, function(err) {
				expect(!err).toBe(true);
				done(err);
			});
		});

		xit("can read the 2nd object", function(done) {
			manager.retrieveObjectData(testObjectTwo.id, function(err, read) {
				expect(!err).toBe(true);
				expect(read).toBeDefined();
				expect(read.id).toBe(testObjectTwo.id);
				expect(read.fa).toBe(testObjectTwo.fa);
				expect(read.fb).toBe(testModificationTwo.fb);
				done(err);
			}, 1);
		});

		xit("can retrieve all null grid objects for a type", function(done) {
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

		xit("can delete an object", function(done) {
			manager.deleteObject(testObject, function(err) {
				expect(!err).toBe(true);
				done(err);
			});
		});

		xit("can delete an object after a single delete", function(done) {
			manager.deleteObject(testObjectTwo, function(err) {
				expect(!err).toBe(true);
				done(err);
			});
		});

		xit("can exist as an empty set", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(read).not.toBeDefined();
				expect(!err).toBe(true);
				manager.retrieveObjectData(testObjectTwo.id, function(err, read) {
					expect(read).not.toBeDefined();
					expect(!err).toBe(true);
					done(err);
				});
			});
		});

		xit("can write an object to a field", function(done) {
			var modification = {};
			modification.id = testObject.id;
			modification.fobj = writeObject;

			manager.writeObjectData(modification, function(err) {
				expect(!err).toBe(true);
				done(err);
			});
		});

		xit("can read an object from a field", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(!err).toBe(true);
				expect(typeof(read.fobj)).toBe("object");
				expect(read.fobj.this).toBe("is");
				expect(read.fobj.a).toBe("Test");
				done(err);
			}, 1);
		});

		xit("can write an array to a field", function(done) {
			var modification = {};
			modification.id = testObject.id;
			modification.farr = writeArray;

			manager.writeObjectData(modification, function(err) {
				expect(!err).toBe(true);
				done(err);
			});
		});

		xit("can read an array from a field", function(done) {
			manager.retrieveObjectData(testObject.id, function(err, read) {
				expect(!err).toBe(true);
				expect(typeof(read.fobj)).toBe("object");
				expect(read.farr.length).toBe(writeArray.length);
				for(var x=0; x<writeArray.length; x++) {
					expect(read.farr[x]).toBe(writeArray[x]);
				}
				done(err);
			}, 1);
		});

		xit("can add a field to a ClassManager and use it", function(done) {

		});

		xit("can add a second field to a ClassManager and use it", function(done) {

		});

		xit("can remove a field from a ClassManager and continue to use the Type", function(done) {

		});

		xit("can remove a second field from a ClassManager", function(done) {

		});

		xit("throws errors when trying to use undefined fields", function(done) {

		});

		it("can close its connection", function(done) {
			database.close()
			.then(done)
			.catch(function(err) {
				console.log(err);
				done(err);
			});
		});

		it("can reconnect to that file", function(done) {
			database = new RSDBConnection(global.test_data.connection.dba);
			database.initialize()
			.then(function() {
				expect(database.manager.testclassone).toBeDefined();
				expect(database.manager.testclassone.object).toBeDefined();
				expect(database.manager.testclassone.object["testclassone:basic"]).toBe(false);
				done();
			})
			.catch(function(err) {
				console.log("Init Error: ", err);
				done(err);
			});
		});
		
		it("retains the previous information", function(done) {
			database.connection.all("select * from rsfield;", function(err, rows) {
				if(err) {
					done(err);
				} else {
					expect(rows.length).toBe(1);
					expect(rows[0].id).toBe(global.test_data.fields.test_a.id);
					expect(rows[0].name).toBe(global.test_data.fields.test_a.name);
					expect(rows[0].type).toBe(global.test_data.fields.test_a.type);
					done();
				}
			});
		});

		it("can close its connection again", function(done) {
			database.close()
			.then(done)
			.catch(function(err) {
				console.log(err);
				done(err);
			});
		});
		
		it("can remove the database file after closing", function(done) {
			fs.unlink(global.test_data.connection.dba.file, done);
		});
	});
});
