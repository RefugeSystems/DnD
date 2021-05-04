var LogController = require("../../../app/logging"),
	Anomaly = require("../../../app/management/anomaly"),
	fs = require("fs");

xdescribe("Log file writing", function() {
	var controller;

	it("can be defined", function(done) {
		var startup = {};
		startup.configuration = {};
		startup.configuration.logging = {
			"name": "testlog",
			"serializers": {}, // Object.assign({}, bunyan.stdSerializers),
			"streams": [{
				"path": "unittest.log",
				"level": "debug",
				"type": "rotating-file"
			}]
		};
		
		controller = new LogController();
		controller.initialize(startup)
		.then(function() {
			expect(startup.logging).toBeDefined();
			done();
		})
		.catch(done);
	});

	it("can write a basic message", function() {
		controller.entry("Test Message");
	});

	it("can write an anomaly", function() {
		var anomaly = new Anomaly("tests:unit", "This is a unit test anomaly");
		controller.entry(anomaly);
	});

	it("can write an anomaly with detailed information", function() {
		var anomaly = new Anomaly("tests:unit", "This is a unit test anomaly", 60, {"a": 1, "b": 2}, new Error("Severe Fault"), this);
		controller.entry(anomaly);
	});
	
	it("can be closed", function(done) {
		setTimeout(function() {
			controller.close()
			.then(done)
			.catch(done);
		}, 4000);
	});
	
	it("can be deleted after removal", function(done) {
		fs.unlink("unittest.log", done);
	});
});
