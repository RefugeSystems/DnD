/**
 * 
 * @class AuthenticationFacebook
 * @constructor
 * @static
 */
module.exports = new (function() {
	this.id = "facebook";
	
	this.initialize = (authentication) => {
		authentication.router.use("/login/" + this.id, function(req, res, next) {
			// TODO: Process
		});
		
		// TODO: Register Relevent Callbacks
	};
})();
