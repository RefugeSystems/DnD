
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	this.initialize = (api) => {
		return new Promise((done) => {
			var database = api.universe.objectHandler.getDatabase();
			
			this.router.get("/class", (req, res, next) => {
				res.result = {
					"classes": Object.keys(api.universe.manager)
				};
				next();
			});
			
			this.router.get("/class/:classification", (req, res, next) => {
				var manager = api.universe.manager[req.params.classification],
					field,
					x;
					
				if(manager) {
					res.result = {
						"class": {
							"name": manager.name,
							"id": manager.id,
							"description": manager.description
						},
						"fields": {}
					};
					
					for(var x=0; x<manager.fieldIDs.length; x++) {
						field = manager.fieldUsed[manager.fieldIDs[x]];
						res.result.fields[field.id] = {};
						res.result.fields[field.id].name = field.name;
						res.result.fields[field.id].description = field.description;
					}
					
					next();
				} else {
					next();
				}
			});
			
			done();
		});
	};
})();
