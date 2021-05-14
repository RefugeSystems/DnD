/**
 * 
 * @class AuthModuleLocal
 * @constructor
 * @static
 */

var Random = require("rs-random");

module.exports = new (function() {
	this.id = "local";
	
	var processing = {};
	
	/**
	 * 
	 * @method initialize
	 * @param {[type]} authentication [description]
	 */
	this.initialize = (authentication, universe) => {
		return new Promise((done, fail) => {
			authentication.router.get("/authenticate" + this.id, function(req, res, next) {
				if(req.header["rs-username"] && req.header["rs-password"]) {
					var password = req.header["rs-password"].sha256(),
						username = req.header["rs-username"],
						session,
						players,
						player,
						x;
						
					players = Object.keys(universe.objectHandler.manager.player.object);
					for(x=0; x<players.length; x++) {
						if(players[x] && players[x].username === username && players[x].password === password) {
							player = players[x];
						}
					}
					
					if(player) {
						authentication.generateSession(player)
						.then((session) => {
							res.result = session;
							next();
						})
						.catch(next);
					} else {
						authentication.emit("failed", req);
						next({
							"message": "Authentication failed",
							"code": 401,
							"fail": 2
						});
					}	
				} else {
					authentication.emit("failed", req);
					next({
						"message": "Authentication failed",
						"code": 401,
						"fail": 1
					});
				}
			});
			
			// TODO: Register Relevent Callbacks
			done();
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
			console.log("Hash: " + hash);
			
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
			console.log("Hash: " + hash);
			
		} else {
			 callback(null, request);
		}
	};
})();
