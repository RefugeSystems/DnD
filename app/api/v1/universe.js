

var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	this.path = "/universe";
	
	this.initialize = (api) => {
		return new Promise((done) => {
		
			this.router.get("/restart", (req, res, next) => {
				api.universe.emit("shutdown");
				res.result = {
					"message": "System Shutting Down"
				};
				next();
			});
			
			done();
		});
	};
})();
