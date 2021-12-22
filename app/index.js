console.log(">>> Startup: " + (new Date).toString());

// Add custom methods to select classes
require("./extensions/string.js");
require("./extensions/array.js");

// Get Initial Values
var configuration = require("a-configuration"),
	verify = require("./management/verify"),
	logging = require("./logging"),
	
	startup = {},
	authentication,
	universe,
	api,

	Universe = require("./universe"),
	Authentication = require("./authentication"),
	Anomaly = require("./management/anomaly"),
	RSDatabase = require("./storage/database"),
	RSObject = require("./storage/rsobject"),
	RSField = require("./storage/rsfield"),
	APIController = require("./api"),

	EventEmitter = require("events").EventEmitter,
	WebSocket = require("ws"),

	URL = require("url").URL,
	HTTPS = require("https"),
	HTTP = require("http"),
	componentID = "app:system",
	start = Date.now();

// Setup basic defaults
EventEmitter.defaultMaxListeners = 50;

configuration.server.initialize_time = start;
startup.configuration = configuration;
startup.RSDatabase = RSDatabase;
startup.RSObject = RSObject;
startup.RSField = RSField;
startup.Anomaly = Anomaly;

console.log("System Starting...");
verify(configuration)
.then(function() {
	logging.initialize(startup);
}).then(function() {
	console.log("...Universe...");
	universe = new Universe(configuration);
	
	var logData = function(anomaly) {
		logging.entry(anomaly);
	};
	universe.on("error", logData);
	universe.on("info", logData);
	universe.on("warning", logData);
	universe.on("warn", logData);
	universe.on("log", logData);
	
	if(configuration.universe && configuration.universe.debug_cascades) {
		universe.on("cascaded", function(cascade) {
			logging.entry({
				"code": "universe:object:cascade",
				"message": "Object cascade completed",
				"level": 20,
				"details": cascade
			});
		});
	}
	return universe.initialize(startup);
}).then(function() {
	console.log("...Authentication...");
	authentication = new Authentication(universe);
	
	authentication.on("error", function(anomaly) {
		logging.entry(anomaly);
	});
	
	return authentication.initialize(startup);
}).then(function() {
	console.log("...API...");
	api = new APIController(universe, authentication);
	
	api.on("error", function(anomaly) {
		logging.entry(anomaly);
	});
	api.on("event", function(event) {
		logging.entry(event);
	});
	
	return api.initialize(startup);
}).then(function() {
	configuration.server.startup_time = Date.now() - start;
	console.log("...Load Complete: " + configuration.server.startup_time + "ms");
	logging.entry(new Anomaly("app:startup:online","System Online", 30, configuration.server, null, componentID));
}).catch(function(error) {
	// console.log(startup, "System Start Error: ", error, "\nConfiguration: ", configuration);
	// console.log("System Start Error: ", error);
	console.log("System Start Error: " + (error.message || error.msg), error.cause || error);
	var details = {};
	details.startup_time = Date.now() - start;
	details.server_configuration = configuration.server;
	error = new Anomaly("app:startup:failure", "System startup failure", 60, details, error, componentID);
	logging.entry(error);
	process.exit();
});
