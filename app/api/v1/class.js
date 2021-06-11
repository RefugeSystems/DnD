
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	this.initialize = (api) => {
		return new Promise((done) => {
			var database = api.universe.objectHandler.getDatabase();
			
			this.router.get("/:classification", (req, res, next) => {
				if(api.universe.manager[req.params.classification]) {
					res.result = {
						"class": Object.assign({}, api.universe.manager[req.params.classification]),
						"specification": api.universe.manager[req.params.classification].specification
					};
					delete(res.result.class.database);
					delete(res.result.class.specification);
					next();
				} else {
					next();
				}
			});
			
			this.router.get("/:classification/fields", (req, res, next) => {
				if(api.universe.manager[req.params.classification]) {
					res.result = {
						"fields": api.universe.manager[req.params.classification].fields
					};
					next();
				} else {
					next();
				}
			});
			
			this.router.post("/:classification/attribute", (req, res, next) => {
				if(api.universe.manager[req.params.classification]) {
					res.result = {};
					res.result.attributes = api.universe.setClassAttribute(req.params.classification, req.body);
					next();
				} else {
					next();
				}
			});
			
			
			this.router.post("/:classification/fields", (req, res, next) => {
				if(req.body.fields && req.body.fields.length && api.universe.manager[req.params.classification]) {
					res.result = {};
					res.result.prexisting = [];
					res.result.added = [];
					
					var promised = [],
						x;
					
					for(x=0; x<req.body.fields.length; x++) {
						if(!api.universe.manager[req.params.classification].fieldUsed[req.body.fields[x]]) {
							promised.push(api.universe.manager[req.params.classification].addField(req.body.fields[x]));
						} else {
							res.result.prexisting.push(req.body.fields[x]);
						}
					}
					
					Promise.all(promised)
					.then(function(results) {
						for(x=0; x<results.length; x++) {
							res.result.added.push(results[x].id);
						}
						next();
					})
					.catch(function(err) {
						console.log("fauly: " ,err);
						next(err);
					});
					
				} else {
					next();
				}
			});
			
			done();
		});
	};
})();
