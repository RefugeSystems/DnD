var RSField = require("../../../app/storage/rsfield");

describe("RSField", function() {
	it("can be defined", function() {
		var field = new RSField(global.test_data.fields.test_a);
		expect(field).toBeDefined();
		expect(field.name).toBe(global.test_data.fields.test_a.name);
		expect(field.inheritance instanceof Object).toBe(true);
		expect(field.inheritable instanceof Array).toBe(true);
	});

	it("can be retrieved", function() {
		var field = RSField.getField(global.test_data.fields.test_a.name);
		expect(field).toBeDefined();
		expect(field.name).toBe(global.test_data.fields.test_a.name);
		expect(field.inheritance instanceof Object).toBe(true);
		expect(field.inheritable instanceof Array).toBe(true);
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
