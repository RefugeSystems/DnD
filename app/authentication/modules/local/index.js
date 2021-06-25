/**
 * 
 * @class AuthModuleLocal
 * @extends SystemAuthModule
 * @constructor
 * @static
 */

var express = require("express"),
	Random = require("rs-random");

// console.log("Local Made");
module.exports = new (function() {
	this.router = express.Router();
	this.description = {};
	this.description.id = "local";
	this.description.icon = "ra ra-tower";
	this.description.name = "Local";
	
	this.router.use((req, res, next) => {
		// console.log("Local: " + req.id);
		next();
	});

	var processing = {};
	
	/**
	 * 
	 * @method initialize
	 * @param {Authentication} authentication
	 * @param {Router} authentication.router
	 * @param {Universe} universe
	 */
	this.initialize = (authentication, specification, universe) => {
		// console.log("Local Init");
		return new Promise((done, fail) => {
			this.router.get("/authenticate", function(req, res, next) {
				// console.log("Local 1");
				
				if(req.headers["rs-username"] && req.headers["rs-password"] !== undefined) {
					// console.log("Local 2");
					var password = req.headers["rs-password"],
						username = req.headers["rs-username"],
						session,
						players,
						player,
						check,
						x;
					
					console.log("Request: \"" + username + "\", \"" + password + "\"");	
					if(password) {
						password = password.sha256();
					}
					console.log(" > Compare: \"" + username + "\", \"" + password + "\"");
					players = Object.keys(universe.manager.player.object);
					for(x=0; x<players.length; x++) {
						check = universe.manager.player.object[players[x]];
						console.log(" > Check[" + check.id + " - " + check.disabled + " | " + check.is_preview + "]: \"" + check.username + "\" - \"" + check.password + "\"");
						if(check && !check.disabled && !check.is_preview && check.username === username && (check.password === password || !check.password)) {
							player = check;
						}
					}
					
					if(player) {
						// console.log("Local 3");
						authentication.generateSession(player)
						.then((session) => {
							// console.log("Local 4");
							res.result = session;
							next();
						})
						.catch(next);
					} else {
						// console.log("Local 5");
						authentication.emit("failed", req);
						next({
							"message": "Authentication failed",
							"status": 401,
							"fail": 2
						});
					}	
				} else {
					// console.log("Local 6");
					authentication.emit("failed", req);
					next({
						"message": "Authentication failed",
						"status": 401,
						"fail": 1
					});
				}
			});
			
			// TODO: Register Relevent Callbacks
			done();
			// console.log("Local Loaded");
		});
	};
	
	/**
	 * 
	 * @method authenticate
	 * @param {Request} request 
	 * @param {Function} callback
	 */
	this.authenticate = (request, callback) => {
		if(request.query.token) {
			
		} else if(request.query.username && request.query.password) {
			var hash = request.query.password.sha256();
			// console.log("Hash: " + hash);
			
		} else {
			 callback(null, request);
		}
	};
	
	/**
	 * 
	 * @method authorize
	 * @param {Request} request  [description]
	 * @param {Function} callback [description]
	 */
	this.authorize = (request, callback) => {
		if(request.query.token) {
			
		} else if(request.query.username && request.query.password) {
			var hash = request.query.password.sha256();
			// console.log("Hash: " + hash);
			
		} else {
			 callback(null, request);
		}
	};
})();
