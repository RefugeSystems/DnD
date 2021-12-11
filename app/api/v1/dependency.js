

var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	this.id = "api:dependency:controller";
	
	this.initialize = (api) => {
		return new Promise((done) => {

			this.router.get("/trigger/calculate/:id", (req, res, next) => {
				var object = api.universe.get(req.params.id);
				console.log("Calculate[" + req.params.id + "]: " + (!!object));
				if(object) {
					api.universe.objectHandler.pushCalculated(object.id, true);
					res.result = {
						"message": "calculate triggered",
						"id": object.id,
						"class": object._class,
						"data": object._data
					};
				} else {
					res.result = {
						"message": "unknown",
						"id": null,
						"class": null,
						"data": null
					};
				}
				next();
			});

			this.router.get("/trigger/update/:id", (req, res, next) => {
				var object = api.universe.get(req.params.id);
				console.log("Update[" + req.params.id + "]: " + (!!object));
				if(object) {
					api.universe.objectHandler.pushUpdated(object.id, undefined, true);
					res.result = {
						"message": "update triggered",
						"id": object.id,
						"class": object._class,
						"data": object._data
					};
				} else {
					res.result = {
						"message": "unknown",
						"id": null,
						"class": null,
						"data": null
					};
				}
				next();
			});
			
			this.router.get("/details/inheritances", (req, res, next) => {
				res.result = api.universe.objectHandler.getInheritance();
				next();
			});
			
			this.router.get("/details/references", (req, res, next) => {
				res.result = api.universe.objectHandler.getReference();
				next();
			});
			
			this.router.get("/details/mark", (req, res, next) => {
				res.result = api.universe.objectHandler.getTimeMark();
				next();
			});


			
			
			this.router.get("/inheritance/:id", (req, res, next) => {
				var inheritances = api.universe.objectHandler.getInheritance(),
					references = api.universe.objectHandler.getReference();
				res.result = {};



				next();
			});
			
			this.router.get("/references/:id", (req, res, next) => {
				res.result = 
				next();
			});

			
			done();
		});
	};
})();
