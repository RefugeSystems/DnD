
// Add custom methods to select classes
require("./extensions/string.js");
require("./extensions/array.js");

// Get Initial Values
var configuration = require("a-configuration"),
	api = require("./api"),
	authentication = require("./authentication"),
	logging = require("./authentication"),

	startup = {},
	universe,

	Universe = require("./universe"),
	Anomaly = require("./management/anomaly"),
	RSDatabase = require("./storage/database"),
	RSObject = require("./storage/rsobject"),
	RSField = require("./storage/rsfield"),

	EventEmitter = require("events").EventEmitter,
	WebSocket = require("ws"),

	URL = require("url").URL,
	HTTPS = require("https"),
	HTTP = require("http"),
	componentID = "app:system",
	start = Date.now();

// Setup basic defaults
EventEmitter.defaultMaxListeners = 50;

universe = new Universe(configuration);
startup.configuration = configuration;
startup.RSDatabase = RSDatabase;
startup.RSObject = RSObject;
startup.RSField = RSField;
startup.Anomaly = Anomaly;

logging.initialize(startup)
.then(universe.initialize)
.then(authentication.initialize)
.then(api.initialize)
.then(function() {
	console.log("System Online: " + configuration.server.port);
	configuration.server.startup_time = Date.now() - start;
	logging.entry(new Anomaly("app:startup:online","System Online", 30, configuration.server, null, componentID));
})
.catch(function(error) {
	console.log(startup, "System Start Error: ", error);
	var details = {};
	details.startup_time = Date.now() - start;
	details.server_configuration = configuration.server;
	error = new Anomaly("app:startup:failure", "System startup failure", 60, details, error, componentID);
	logging.entry(error);
	process.exit();
});
