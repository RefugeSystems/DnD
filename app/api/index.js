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
	path = require("path"),
	fs = require("fs");

class APIController extends EventEmitter {
	constructor(universe, authentication) {
		super();
		this.universe = universe;
		this.authentication = authentication;
		this.router = express();
		
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
			this.router.use(express.json());
			this.router.use((err, req, res, next) => {
				res.status(400).json({
					"message": "Malformed JSON"
				});
			});
			this.router.use(express.urlencoded({ extended: true }));
			this.router.use((req, res, next) => {
				console.log("Request: ", req.path);
				// console.log(" > Body: ", req.body);
				this.emit("request", req);
				
				req.id = Random.identifier("request", 12, 40);
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
				
				return APIws.initialize(this);
			}).then(() => {
				// Bind WebSocket Controller
				// TODO: bind
				
				
				this.server.on("listening", () => {
					console.log("Listening on " + this.specification.port);
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
	 * @param {Request} req [description]
	 * @return {Promise}
	 */
	authorizeRequest(req) {
		return new Promise((done, fail) => {
			// TODO: handle
			done();
		});
	}
	
	
	close() {
		if(this.server) {
			this.server.close();
		}
	}
}

module.exports = APIController;
