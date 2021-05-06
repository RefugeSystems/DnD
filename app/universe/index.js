/**
 *
 *
 * @class Universe
 * @extends EventEmitter
 * @constructor
 * @type {[type]}
 */

var EventEmitter = require("events").EventEmitter,
	ObjectHandler = require("./objects");

var classes = [
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
	"action", // Triggered by some game event to start user input like items that have an on long rest reset
	"effect",
	"race",
	"classification",
	"journal",
	"item",
	"knowledge",
	"quest",
	"location"];

class Universe extends EventEmitter {
	constructor(configuration) {
		super();
		/**
		 * The Class Constructor for anomalies to allow using classes to construct the
		 * object for notifications.
		 * @property Anomaly
		 * @type Class
		 */
		this.Anomaly = require("../management/anomaly");
		this.calculator = require("./calculator/dnd");
		this.configuration = configuration;
		this.classes = classes;
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
			startup.universe = this;
			// Initialize Database
			
			this.objectHandler = new ObjectHandler(this);
			this.objectHandler.initialize(startup)
			// Receive the managers
			.then((managers) => {
				var types = Object.keys(managers),
					x;
				
				for(x=0; x<types.length; x++) {
					this.managers[types[x]] = managers[types[x]];
				}
			})
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
	
	/**
	 * 
	 * @method requestObject
	 * @param  {[type]}   id       [description]
	 * @param  {Function} callback [description]
	 * @return {[type]}            [description]
	 */
	requestObject(id, callback) {
		
	}
	
	/**
	 * 
	 * @method getClassFromID
	 * @param {String} id
	 * @return {String} Class ID
	 */
	getClassFromID(id) {
		var index = id.indexOf(":");
		if(index === -1) {
			return null;
		}
		return id.substring(0, index);
	}
}

module.exports = Universe;
