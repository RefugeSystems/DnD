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

startup.configuration = configuration;
startup.RSDatabase = RSDatabase;
startup.RSObject = RSObject;
startup.RSField = RSField;
startup.Anomaly = Anomaly;

verify(configuration)
.then(function() {
	logging.initialize(startup);
}).then(function() {
	universe = new Universe(configuration);
	universe.on("error", function(anomaly) {
		logging.entry(anomaly);
	});
	return universe.initialize(startup);
}).then(function() {
	authentication = new Authentication(universe);
	authentication.on("error", function(anomaly) {
		logging.entry(anomaly);
	});
	return authentication.initialize(startup);
}).then(function() {
	api = new APIController(universe, authentication);
	api.on("error", function(anomaly) {
		logging.entry(anomaly);
	});
	return api.initialize(startup);
}).then(function() {
	console.log("System Online: " + configuration.server.port);
	configuration.server.startup_time = Date.now() - start;
	logging.entry(new Anomaly("app:startup:online","System Online", 30, configuration.server, null, componentID));
}).catch(function(error) {
	// console.log(startup, "System Start Error: ", error, "\nConfiguration: ", configuration);
	console.log("System Start Error: ", error);
	var details = {};
	details.startup_time = Date.now() - start;
	details.server_configuration = configuration.server;
	error = new Anomaly("app:startup:failure", "System startup failure", 60, details, error, componentID);
	logging.entry(error);
	process.exit();
});
