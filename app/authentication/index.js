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
	passport = require("passport"),
	defaultExpiry = 1000 * 60 * 60 * 24 *3;

class Authentication extends EventEmitter {
	constructor(universe) {
		super();
		this.id = "AuthenticationController";
		this.router = new Router();
		this.universe = universe;
		this.processor = {};
		this.passport = passport;
		
		passport.serializeUser(function(req, user, done) {
			console.log("Serialize User: ", user);
			req._user = user;
			done(null, user);
		});
		
		passport.deserializeUser(function(user, done) {
			console.log("Deserialize User: ", user);
			done(null, user);
		});
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
				available = [],
				x;
				
			this.router.use((req, res, next) => {
				// console.log("Auth[" + req.method + "]: " + req.id + ", ", req.connection.remoteAddress);
				next();
			});
			
			for(x=0; x<processes.length; x++) {
				if(this.specification[processes[x]]) {
					this.processor[processes[x]] = require("./modules/" + processes[x]);
					if(this.processor[processes[x]].initialize && this.processor[processes[x]].description && this.processor[processes[x]].router) {
						this.processor[processes[x]].description.id = this.processor[processes[x]].id || processes[x];
						initializing.push(this.processor[processes[x]].initialize(this, this.specification[processes[x]], this.universe));
						available.push(this.processor[processes[x]].description);
					} else {
						this.emit("error", new this.universe.Anomaly("authenticator:invalid:initialization", "Configuration specifies data for an invalid authentication process", 40, {
							"process": processes[x],
							"specification": this.specification[processes[x]],
							"hasInitialize": !!this.processor[processes[x]].initialize,
							"hasDescription": !!this.processor[processes[x]].description,
							"hasRouter": !!this.processor[processes[x]].router
						}, null, this.id));
					}
				}
			}
			
			this.router.get("/available", (req, res, next) => {
				res.result = {};
				res.result.modules = available;
				next();
			});
			
			Promise.all(initializing)
			.then(() => {
				this.router.use(passport.initialize());
  				this.router.use(passport.session());
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
}

module.exports = Authentication;
