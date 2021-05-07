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
	WebSocket = require("ws"),
	HTTPS = require("https"),
	HTTP = require("http"),
	wscontroller = require("./connection"),
	APIv1 = require("./v1"),
	express = require("express"),
	path = require("path"),
	fs = require("fs");

class APIController extends EventEmitter {
	constructor(universe, authentication) {
		super();
		this.universe = universe;
		this.authentication = authentication;
		this.routing = express();
		
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
				
			APIv1.initialize(this)
			.then(() => {
				this.routing.use("/api/sys", APIv1.router);
				this.routing.use("/api/v1", APIv1.router);
				
				return wscontroller.initialize(this);
			}).then(() => {
				// Create Base Server
				if(this.specification.key) {
					options.ca = fs.readFileSync(this.specification.interm || this.specification.certificate_authority || this.specification.certificateAuthority || this.specification.ca, "utf-8");
					options.cert = fs.readFileSync(this.specification.certificate || this.specification.crt || this.specification.public, "utf-8");
					options.key = fs.readFileSync(this.specification.privateKey || this.specification.key || this.specification.private, "utf-8");
					this.server = HTTPS.createServer(options, this.routing);
				} else {
					this.server = HTTP.createServer(options, this.routing);
				}
				
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
			
		});
	}
	
	
	close() {
		if(this.server) {
			this.server.close();
		}
	}
}

module.exports = APIController;
