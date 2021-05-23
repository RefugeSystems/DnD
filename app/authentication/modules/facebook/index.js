/**
 * 
 * @class AuthModuleFacebook
 * @constructor
 * @static
 */
module.exports = new (function() {
	this.id = "facebook";
	this.description = {};
	this.description.icon = "ra ra-tower";
	this.description.name = "Local";
	
	this.initialize = (authentication) => {
		authentication.router.use("/login/" + this.id, function(req, res, next) {
			// TODO: Process
		});
		
		// TODO: Register Relevent Callbacks
	};
})();
