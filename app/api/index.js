/**
 *
 *
 * @class APIController
 * @extends EventEmitter
 * @constructor
 */
 
require("../extensions/string.js");
require("../extensions/array.js");
var EventEmitter = require("events").EventEmitter,
	Random = require("rs-random"),
	WebSocket = require("ws"),
	HTTPS = require("https"),
	HTTP = require("http"),
	APIws = require("./connection"),
	APIv1 = require("./v1"),
	APIui = require("./ui"),
	express = require("express"),
	Router = express.Router,
	path = require("path"),
	fs = require("fs"),
	options = {};

options.expressJSON = {
	"limit": "50mb"
};

class APIController extends EventEmitter {
	constructor(universe, authentication) {
		super();
		this.id = "api:controller";
		this.universe = universe;
		this.authentication = authentication;
		this.router = express();
		this.router.disable("x-powered-by");
		
		universe.on("shutdown", () => {
			this.close();
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
			this.specification = startup.configuration.server;
			var options = {},
				handler;
				
			// Create Base Server
			if(this.specification.key) {
				options.ca = fs.readFileSync(this.specification.interm || this.specification.certificate_authority || this.specification.certificateAuthority || this.specification.ca, "utf-8");
				options.cert = fs.readFileSync(this.specification.certificate || this.specification.crt || this.specification.public, "utf-8");
				options.key = fs.readFileSync(this.specification.privateKey || this.specification.key || this.specification.private, "utf-8");
				this.server = HTTPS.createServer(options, this.router);
			} else {
				this.server = HTTP.createServer(options, this.router);
			}
			
			
			// Initialize Routing
			this.router.use(express.json({"limit":"50mb"}));
			this.router.use((err, req, res, next) => {
				console.log("JSON Body Error: ", err);
				res.status(400).json({
					"message": "Malformed JSON",
					"error": err
				});
			});
			this.router.use((req, res, next) => {
				req.id = Random.identifier("request", 12, 40);
				
				if(this.specification.api.log_all_requests || (req.method === "POST" && this.specification.api.log_post_body)) {
					var details = {};
					details.ip = req.ip || req.connection.remoteAddress;
					details.path = req.path;
					details.session = req.session;
					details.request = req.id;
					details.size = req.body?JSON.stringify(req.body).length:0;
					if(req.method === "POST" && this.specification.api.log_post_body) {
						details.body = req.body;
					}
					this.emit("event", new this.universe.Anomaly("api:request", "Request Received", 30, details, null, this.id));
				}
				
				if((req.method !== "POST" && req.method !== "DELETE") || !this.specification.api || this.specification.api.allow_modifications == true) {
					next();
				} else {
					next(new this.universe.Anomaly("api:modification:unallowed", "Modifciations Disallowed, See Configuration: server.api.allow_modifications", 40, null, null, this));
				}
			});
			this.router.use(express.urlencoded({ extended: true }));
			
			this.router.options(".*", function(req, res) {
				res.header("Access-Control-Allow-Headers", "*");
				res.send();
			});
			
			this.router.use((req, res, next) => {
				var origin = req.get("origin"),
					anomaly;
					
				console.log("Request[@" + origin + "]: ", req.path);
				if(!origin || this.specification.origins[origin] === 0 || Date.now() < this.specification.origins[origin])  {
					res.header("Access-Control-Allow-Origin", origin);
					res.header("Access-Control-Allow-Headers", "*");
					
					if(req.method === "OPTIONS") {
						res.send();
					} else {
						next();
					}
				} else {
					anomaly = new this.universe.Anomaly("api:request:origin", "Origin not allowed", 50, {"origin": origin?origin:"No Origin"}, null, this);
					next(anomaly);
				}
			});
			
			this.router.use((req, res, next) => {
				// console.log(" > Body: ", req.body);
				this.emit("request", req);
				
				req.conversation = req.query.conversation;
				if(req.query.token) {
					// Fill with Token based Session
					// TODO: Log if no match
				} else if(req.query.username && req.query.password) {
					// TODO: Fill with User based Session
					// TODO: Log if no match
				}
				
				next();
			});
			
			this.router.options(".*", (req, res) => {
				res.send();
			});
				
			// Bind Routes
			APIv1.initialize(this)
			.then(() => {
				this.router.use("/api/sys", APIv1.router);
				this.router.use("/api/v1", APIv1.router);
				
				return APIui.initialize(this);
			}).then(() => {
				this.router.use("/ui", APIui.router);
			// 
			// 	return APIauth.initialize(this);
			// }).then(() => {
				this.router.use("/login", this.authentication.router);
				
				return APIws.initialize(this);
			}).then(() => {
				// Bind WebSocket Controller
				// TODO: bind
				
				
				this.router.use((req, res, next) => {
					if(res.result) {
						res.json(res.result);
					} else {
						var err = new this.universe.Anomaly("api:request:404", "Not Found", 40);
						err.status = 404;
						next(err);
					}
				});
				
				this.router.use((err, req, res, next) => {
					var details,
						anomaly;
						
					if(err instanceof this.universe.Anomaly) {
						anomaly = err;
					} else {
						details = {};
						details.path = req.path;
						details.session = req.session;
						details.request = req.id;
						details.size = req.body?JSON.stringify(req.body).length:0;
						details.params = Object.assign({}, req.params);
						details.query = Object.assign({}, req.query);
						if(details.query.token) {
							details.query.token = "[OBSCURED]";
						}
						if(details.query.password) {
							details.query.password = "[OBSCURED]";
						}
						if(details.query["rs-password"]) {
							details.query["rs-password"] = "[OBSCURED]";
						}
						if(details.params.token) {
							details.params.token = "[OBSCURED]";
						}
						if(details.params.password) {
							details.params.password = "[OBSCURED]";
						}
						if(details.params["rs-password"]) {
							details.params["rs-password"] = "[OBSCURED]";
						}
						
						anomaly = new this.universe.Anomaly("api:request:fault", err.message, 40, details, err.stack, this.id);
					}
					
					res.status(err.status || 500).json(anomaly);
					this.emit("error", anomaly);
				});
				
				this.server.on("listening", () => {
					console.log("......Listening on " + this.specification.port + "...");
					done();
				});
				this.server.on("error", (err) => {
					console.log("Startup failed: ", err);
					switch (err.code) {
						case "EACCES":
							console.error(this.specification.port + " requires elevated privileges");
							// process.exit(1);
							break;
						case "EADDRINUSE":
							console.error(this.specification.port + " is already in use");
							// process.exit(1);
							break;
					}
					fail(err);
				});
				
				this.server.listen(this.specification.port);
			})
			.catch(fail);
		});
	}
	
	/**
	 * 
	 * @method authorizeRequest
	 * @deprecated
	 * @param {Request} req [description]
	 * @return {Promise}
	 */
	authorizeRequest(req) {
		return new Promise((done, fail) => {
			// TODO: handle
			done();
		});
	}
	
	/**
	 * 
	 * @method getSession
	 * @param {String} id [description]
	 * @return {Promise | Session}
	 */
	getSession(id) {
		return new Promise((done, fail) => {
			var session = this.universe.manager.session.object[id],
				now = Date.now();
			console.log("Get Session: " + id);
			if(session) {
				if(now < session.last + session.expiry) {
					console.log(" > Session Valid: " + id);
					now = {
						"last": now
					};
					session.setValues(now, (err) => {
						console.log(" > Session Updated: ", err);
						if(err) {
							fail(err);
						} else {
							done(session);
						}
					});
				} else {
					console.log(" > Session Expired: " + id);
					fail(new Error("Expired Session"));
				}
			} else {
				console.log(" > Session Not Found: " + id);
				fail(new Error("No Session"));
			}
		});
	}
	
	
	close() {
		if(this.server) {
			this.server.close();
		}
	}
}

module.exports = APIController;
