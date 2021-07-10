
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	this.initialize = (api) => {
		return new Promise((done) => {
			var database = api.universe.objectHandler.getDatabase();
			
			this.router.get("/next/:group", (req, res, next) => {
				res.result = {
					"fields": api.universe.objectHandler.listFields()
				};
				next();
			});
			
			done();
		});
	};
})();
