

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
			
			this.router.get("/inheritance", (req, res, next) => {
				res.result = {};
				res.result.inheritance = api.universe.objectHandler.getInheritance();
				next();
			});
			
			this.router.get("/object/:id", (req, res, next) => {
				res.result = {};
				res.result.inheritance = api.universe.objectHandler.retrieve(req.params.id);
				next();
			});
			
			this.router.get("/object/:id/link", (req, res, next) => {
				res.result = {};
				res.result.object = api.universe.objectHandler.retrieve(req.params.id);
				res.result.object.linkFieldValues()
				.then(function() {
					next();
				})
				.catch(next);
			});
			
			this.router.get("/object/:id/calculate", (req, res, next) => {
				res.result = {};
				res.result.object = api.universe.objectHandler.retrieve(req.params.id);
				res.result.object.calculateFieldValues();
				next();
			});
			
			this.router.get("/object/:id/update", (req, res, next) => {
				res.result = {};
				res.result.object = api.universe.objectHandler.retrieve(req.params.id);
				res.result.object.updateFieldValues();
				next();
			});
			
			done();
		});
	};
})();
