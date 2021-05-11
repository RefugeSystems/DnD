/**
 *
 *
 * @class Universe
 * @extends EventEmitter
 * @constructor
 * @type {[type]}
 */

var EventEmitter = require("events").EventEmitter,
	DNDCalculator = require("./calculator/dnd"),
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
	"conditional",
	
	"entity",
	"ability",
	"skill",
	"archetype",
	"action", // Triggered by some game event to start user input like items that have an on long rest reset
	"effect",
	"race",
	"type",
	"journal",
	"item",
	"knowledge",
	"quest",
	"location"];

class Universe extends EventEmitter {
	constructor(configuration) {
		super();
		this.id = "universe";
		/**
		 * The Class Constructor for anomalies to allow using classes to construct the
		 * object for notifications.
		 * @property Anomaly
		 * @type Class
		 */
		this.Anomaly = require("../management/anomaly");
		this.calculator = new DNDCalculator(this);
		this.configuration = configuration;
		this.classes = classes;
		this.manager = {};
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
			.then((manager) => {
				// Receive the managers
				var types = Object.keys(manager),
					loading = [],
					ids,
					i,
					x;
				
				// TODO: Loading Progress Bar?
				
				
				for(x=0; x<types.length; x++) {
					this.manager[types[x]] = manager[types[x]];	
					if(manager[types[x]]) {
						ids = Object.keys(manager[types[x]].object);
						for(i=0; i<ids.length; i++) {
							loading.push(manager[types[x]].object[ids[i]].linkFieldValues(true));
						}
					}
				}
				
				return Promise.all(loading);
			})
			.then((loading) => {
				// Calculate Loaded Objects
				for(var x=0; x<loading.length; x++) {
					if(loading[x]) {
						loading[x].calculateFieldValues();
					}
				}
				
				return loading;
			})
			.then((loading) => {
				// Update Loaded Objects
				for(var x=0; x<loading.length; x++) {
					if(loading[x]) {
						loading[x].updateFieldValues();
					}
				}
				for(var x=0; x<loading.length; x++) {
					if(loading[x]) {
						loading[x].calculateFieldValues();
					}
				}
				for(var x=0; x<loading.length; x++) {
					if(loading[x]) {
						loading[x].updateFieldValues();
					}
				}
				
				return loading;
			})
			.then(done)
			.catch(fail);
		});
	}
	
	/**
	 * 
	 * @method getUserInformation
	 * @param {String} id [description]
	 * @return {Promise | RSObject | Anomaly} Promise that on success passes the identified
	 * 		player information or null. Fails with an Anomaly.
	 */
	getUserInformation(id) {
		return new Promise((done, fail) => {
			this.manager.player.load(id)
			.then(done)
			.catch((err) => {
				var details = {},
					anomaly;
				
				anomaly = new Anomaly("user:info", "Failed to get user information", 40, details, err, this);
				this.emit("error", err);
			});
		});
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
		if(typeof(id) === "string") {
			var index = id.indexOf(":");
			if(index === -1) {
				return null;
			}
			return id.substring(0, index);
		} else {
			return null;
		}
	}
}

module.exports = Universe;
