
var express = require("express");

var sortByName = function(a, b) {
	if(a.id < b.id) {
		return -1;
	} else if(a.id > b.id) {
		return 1;
	}
	return 0;
};

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
			
			this.router.get("/field", (req, res, next) => {
				res.result = {
					"fields": Object.keys(database.field)
				};
				next();
			});
			
			this.router.get("/field/:name", (req, res, next) => {
				var fields,
					load,
					i;
					
				res.result = {
					"fields": []
				};
					
				var loadField = function(field) {
					load = {
						"name": field.name,
						"id": field.id,
						"description": field.description,
						"type": field.type,
						"inheritance": field.inheritance,
						"inheritable": field.inheritable,
						"attribute": field.attribute
					};
					res.result.fields.push(load);
				};
					
				fields = Object.keys(database.field);
				for(i=0; i<fields.length; i++) {
					if(fields[i].indexOf(req.params.name) !== -1) {
						loadField(database.field[fields[i]]);
					}
				}
				res.result.fields.sort(sortByName);
				next();
			});
			
			this.router.get("/class/:classification", (req, res, next) => {
				var managers,
					manager,
					field,
					load,
					i,
					x;
					
				res.result = {
					"classes": []
				};
					
				var loadManager = function(manager) {
					load = {
						"class": {
							"name": manager.name,
							"id": manager.id,
							"description": manager.description
						},
						"fields": {}
					};
					for(x=0; x<manager.fieldIDs.length; x++) {
						field = manager.fieldUsed[manager.fieldIDs[x]];
						if(field) {
							load.fields[field.id] = {};
							load.fields[field.id].name = field.name;
							load.fields[field.id].description = field.description;
							load.fields[field.id].type = field.type;
						} else {
							console.log("Unknown Field? " + manager.fieldIDs[x]);
						}
					}
					load.ids = manager.fieldIDs;
					res.result.classes.push(load);
				};
					
				managers = Object.keys(api.universe.manager);
				for(i=0; i<managers.length; i++) {
					if(managers[i].indexOf(req.params.classification) !== -1) {
						loadManager(api.universe.manager[managers[i]]);
					}
				}
				res.result.classes.sort(sortByName);
				next();
			});
			
			done();
		});
	};
})();
