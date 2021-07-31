
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	this.path = "/version";
	
	this.initialize = (api) => {
		return new Promise((done) => {
		
			this.router.get("/recent", (req, res, next) => {


				res.result = {
					"details": []
				};
				next();
			});
		
			this.router.get("/current", (req, res, next) => {


				res.result = {
					"details": []
				};
				next();
			});
		
			this.router.get("/previous", (req, res, next) => {


				res.result = {
					"details": []
				};
				next();
			});
		
			this.router.get("/on/:version", (req, res, next) => {


				res.result = {
					"details": []
				};
				next();
			});

			done();
		});
	};
});
