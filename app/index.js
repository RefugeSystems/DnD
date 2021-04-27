
/**
 *
 *
 * @class RSCoreServer
 * @constructor
 * @static
 */

// Add custom methods to select classes
require("./extensions/string.js");
require("./extensions/array.js");

/**
 *
 * @property configuration
 * @type Object
 * @private
 */
var configuration = require("a-configuration"),
	EventEmitter = require("events").EventEmitter,
	Bunyan = require("bunyan"),
	WebSocket = require("ws"),
	URL = require("url").URL,
	HTTPS = require("https"),
	HTTP = require("http");

// Setup basic defaults
EventEmitter.defaultMaxListeners = 50;
