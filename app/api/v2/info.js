
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	this.initialize = (api) => {
		return new Promise((done) => {

			this.router.get("/version", (req, res, next) => {
				res.result = {
					"version": api.version
				};
				next();
			});
			
			done();
		});
	};
})();
