/**
 *
 *
 * @class Universe
 * @extends EventEmitter
 * @constructor
 * @type {[type]}
 */

var EventEmitter = require("events").EventEmitter,
	objectHandler = requrie("./objects");

var types = [
		"session", // HTTP or WebSocket Session
		"player",
		
		"setting", // Universe Settings and Values
		"incident",
		"meeting", // Game Session
		
		"dataset",
		"image",
		"playlist",
		"streamurl",
		"profile",
		"widget",
		
		"entity",
		"ability",
		"skill",
		"archetype",
		"action",
		"effect",
		"race",
		"classification",
		"journal",
		"item",
		"knowledge",
		"location"];

class Universe extends EventEmitter {
	constructor(configuration) {
		super();
		this.configuration = configuration;
		this.managers = {};
	}

	/**
	 *
	 * @method initialize
	 * @param {Object} startup
	 * @return {Promise}
	 */
	initialize(startup) {
		return new Promise((done, fail) => {
			// Initialize Database
			objectHandler.initialize(startup.configuration, types)
			// Receive the managers
			.then((managers) => {
				var types = Object.keys(managers),
					x;
				
				for(x=0; x<types.length; x++) {
					this.managers[types[x]] = managers[types[x]];
				}
			})
			// Load Grid:NULL
			
			// Load
			.then(done)
			.catch(fail);
		});
	}
	
	/**
	 * 
	 * @method getUserInformation
	 * @param {String} id [description]
	 * @return {RSObject}    [description]
	 */
	getUserInformation(id) {
		
	}
	
	/**
	 * 
	 * @method getSessionInformation
	 * @param {String} id [description]
	 * @return {RSObject}
	 */
	getSessionInformation(id) {
		
	}

	/**
	 *
	 * @method connectPlayer
	 * @param {PlayerConnection} connection
	 */
	connectPlayer(connection) {

	}
	
	
	getObject(id) {
		
	}
}

module.exports = Universe;
