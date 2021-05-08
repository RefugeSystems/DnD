/**
 * 
 * @class AuthModuleLocal
 * @constructor
 * @static
 */
module.exports = new (function() {
	this.id = "facebook";
	
	this.initialize = (authentication) => {
		authentication.router.use("/" + this.id, function(req, res, next) {
			// TODO: Process
		});
		
		// TODO: Register Relevent Callbacks
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
})();
