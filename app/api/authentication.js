/**
 * 
 * @class APIAuthController
 * @constructor
 * @static
 */
 
 var express = require("express"),
 	Router = express.Router,
    path = require("path"),
    fs = require("fs");

module.exports = new (function() {
	this.id = "api:auth:controller";
	this.router = new Router();
	
	var modules = {};
	
	/**
	 * 
	 * @method initialize
	 * @param {APIController} api 
	 * @return {Promise} 
	 */
	this.initialize = (api) => {
		return new Promise((done, fail) => {
			done();
		});
	};
	
	
});
