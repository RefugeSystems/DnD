global.mock = global.mock || {};
global.mock.ClassManager = function(database, specification) {
	
	var mock = jasmine.createSpyObj("ClassManager", ["initialize",
		"isField",
		"addField",
		"removeField",

		"setTypeDefaults",
		"setTypeDefault",

		"writeObjectData",
		"retrieveObjectData",
		"retrieveAllData",
		"getObjectData",
		"deleteObjectData",

		"close"]);
		
	mock.id = specification.id;
	mock.name = specification.name;
	mock.database = database;

	mock.initialize.and.callFake(function(fields) {
		expect(fields).toBeDefined();
		return new Promise(function(done) {
			if(typeof(fields[0]) === "object") {
				mock.fieldNames = fields.map(function(x) {return x.id;});
				mock.fields = fields;
			} else {
				mock.fieldNames = fields;
				mock.fields = fields;
			}
			done();
		});
	});

	mock.isField.and.callFake(function(field) {
		expect(field).toBeDefined();
		expect(typeof(field) === "string" || typeof(field) === "object").toBe(true);
		return true;
	});

	mock.writeObjectData.and.callFake(function(object, callback) {
		expect(object).toBeDefined();
		callback();
	});

	mock.retrieveObjectData.and.callFake(function(object, callback) {
		expect(object).toBeDefined();
		callback();
	});

	mock.retrieveAllData.and.callFake(function(object, callback) {
		expect(object).toBeDefined();
		callback();
	});

	mock.getObjectData.and.callFake(function(id) {
		expect(id).toBeDefined();
		return {"id": "test"};
	});

	mock.deleteObjectData.and.callFake(function(object, callback) {
		expect(object).toBeDefined();
		callback();
	});

	return mock;
};
