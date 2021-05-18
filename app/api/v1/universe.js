

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
			
			this.router.get("/reference", (req, res, next) => {
				res.result = {};
				res.result.reference = api.universe.objectHandler.getReference();
				next();
			});
			
			this.router.get("/timemark", (req, res, next) => {
				res.result = {};
				res.result.timemark = api.universe.objectHandler.getTimeMark();
				next();
			});
			
			this.router.post("/calculate/:id", (req, res, next) => {
				res.result = {};
				res.result.referenced = [];
				var source = api.universe.objectHandler.retrieve(req.params.id);
				res.result.value = api.universe.calculator.compute(req.body.formula, source, res.result.referenced);
				res.result.source = source; // Update object with source last to move this data to the bottom of the object naturally when encoded
				next();
			});
			
			this.router.get("/object/:id", (req, res, next) => {
				res.result = {};
				res.result = api.universe.objectHandler.retrieve(req.params.id);
				next();
			});
			
			this.router.get("/object/:id/link", (req, res, next) => {
				res.result = {};
				res.result.object = api.universe.objectHandler.retrieve(req.params.id);
				res.result.object.linkFieldValues(true)
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
			
			this.router.post("/object/:id", (req, res, next) => {
				res.result = {};
				res.result.object = api.universe.objectHandler.retrieve(req.params.id);
				res.result.object.setValues(req.body, function(err) {
					if(err) {
						next(err);
					} else {
						next();
					}
				});
			});
			
			this.router.post("/configuration/dump", (req, res, next) => {
				res.result = {"emitted": Date.now()};
				api.universe.emit("dump-configuration");
				next();
			});
			
			done();
		});
	};
})();
