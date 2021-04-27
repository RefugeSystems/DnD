var RSDBConnection = require("../../../app/storage/database"),
	RSObject = require("../../../app/storage/rsobject"),
	RSField = require("../../../app/storage/rsfield"),
	fs = require("fs");

describe("RSObject Data Inheritance", function() {
	var connection,
		fields = {};

	beforeAll(function() {
		connection = new RSDBConnection(global.test_data.connection.dbb);
		fields.name = new RSField({
			"id": "name",
			"name": "name",
			"title": "Name"
		});
	});

	afterAll(function() {
		// Clean Up Files
		fs.unlinkSync(global.test_data.connection.dbb.file);
	});

	describe("Object property summation", function() {
		
	});

	describe("Object property summation", function() {
		
	});
});
