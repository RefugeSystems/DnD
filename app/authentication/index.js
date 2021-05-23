/**
 *
 *
 * @class Authentication
 * @extends EventEmitter
 * @constructor
 */

var EventEmitter = require("events").EventEmitter,
	Router = require("express").Router,
	Random = require("rs-random"),
	
	defaultExpiry = 1000 * 60 * 60 * 24 *3;

class Authentication extends EventEmitter {
	constructor(universe) {
		super();
		this.id = "AuthenticationController";
		this.router = new Router();
		this.universe = universe;
		this.processor = {};
	}

	/**
	 *
	 * @method initialize
	 * @param {Object} startup
	 * @return {Promise}
	 */
	initialize(startup) {
		return new Promise((done, fail) => {
			this.specification = startup.configuration.authentication;
			var processes = Object.keys(this.specification),
				initializing = [],
				x;
				
			this.router.use((req, res, next) => {
				console.log("Auth[" + req.method + "]: " + req.id + ", ", req.connection.remoteAddress, req.socket.remoteAddress, req.info?req.info.remoteAddress:req.info);
				next();
			});
			
			for(x=0; x<processes.length; x++) {
				if(this.specification[processes[x]]) {
					this.processor[processes[x]] = require("./modules/" + processes[x]);
					if(this.processor[processes[x]].initialize) {
						initializing.push(this.processor[processes[x]].initialize(this, this.universe));
					} else {
						this.emit("error", new this.universe.Anomaly("authenticator:invalid:initialization", "Configuration specifies data for an invalid authentication process", 40, {
							"process": processes[x],
							"specification": this.specification[processes[x]]
						}, null, this.id));
					}
				}
			}
			
			Promise.all(initializing)
			.then(() => {
				for(x=0; x<processes.length; x++) {
					if(this.processor[processes[x]].router) {
						this.router.use("/" + processes[x], this.processor[processes[x]].router);
						console.log(" [√] Auth Bound: " + processes[x]);
					} else {
						console.log(" [!] Missing Auth Router: " + processes[x]);
					}
				}
				done();
			})
			.catch(fail);
		});
	}
	
	/**
	 * 
	 * @method authenticate
	 * @param {Request | Object} request
	 * @param {String} [module]  
	 * @return {Promise} 
	 */
	authenticate(request, module) {
		
	}

	/**
	 * 
	 * @method generateSession
	 * @param {RSObject} player 
	 * @param {Number} [ttl] 
	 * @return {Promise} 
	 */
	generateSession(player, ttl) {
		return new Promise((done, fail) => {
			var details = {};
			details.id = Random.identifier("session", 20, 72).toLowerCase();
			details.player = player.id;
			details.username = player.username;
			details.last = Date.now();
			details.expiry = ttl || defaultExpiry;
			this.universe.manager.session.create(this.universe, details, (err, object) => {
				if(err) {
					fail(err);
				} else {
					done(object);
				}
			});
		});
	}
	
	/**
	 * 
	 * @method getSession
	 * @param {Request} request 
	 * @return {RSObject} For the session or null if none found.
	 */
	getSession(request) {
		
	}
}

module.exports = Authentication;
