/**
 * 
 * @class APIAuthorization
 * @constructor
 * @static
 */

var WebSocket = require("ws"),
	fs = require("fs");

module.exports = new (function() {
	this.id = "api:auth:controller";
	
	var modules;
	
	/**
	 * 
	 * @method initialize
	 * @param {APIController} api 
	 * @return {Promise} 
	 */
	this.initialize = (api) => {
		modules = api.authentication;
		
		
	};
});
