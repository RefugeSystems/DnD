
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	this.initialize = (api) => {
		return new Promise((done) => {
			var database = api.universe.objectHandler.getDatabase();
			
			this.router.get("/", (req, res, next) => {
				res.result = {
					"fields": api.universe.objectHandler.listFields()
				};
				next();
			});
				
			this.router.get("/:id", (req, res, next) => {
				res.result = {
					"field": database.field[req.params.id]
				};
				next();
			});
				
			this.router.post("/", (req, res, next) => {
				res.result = {};
				api.universe.objectHandler.modifyField(req.body)
				.then(function(field) {
					res.result.field = field;
					next();
				})
				.catch(next);
			});
			
			done();
		});
	};
})();
