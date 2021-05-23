

var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	this.id = "api:object:controller";
	
	this.initialize = (api) => {
		return new Promise((done) => {
			
			this.router.get("/:classification/:id", (req, res, next) => {
				if(api.universe.manager[req.params.classification]) {
					api.universe.manager[req.params.classification].retrieveObjectData(req.params.id, function(err, data) {
						if(err) {
							next(err);
						} else {
							// console.log("Data: ", data);
							res.result = {
								"object": {}
							};
							res.result.object[req.params.id] = data;
							next();
						}
					}, true);
				} else {
					if(req.params.classification) {
						next(new api.universe.Anomaly("api:object:get", "Unknown Class", 40, {"params": req.params, "id": req.id}, null, this));
					} else {
						next();
					}
				}
			});
			
			this.router.post("/:classification", (req, res, next) => {
				if(api.universe.manager[req.params.classification]) {
					// console.log("Create: ", req.body);
					
					var keys = Object.keys(req.body),
						x;
						
					for(x=0; x<keys.length; x++) {
						if(keys[x][0] === "_") {
							delete(req.body[keys[x]]);
						}
					}
					
					if(req.body.id && api.universe.manager[req.params.classification] && api.universe.manager[req.params.classification].object[req.body.id] === undefined) {
						// console.log("manager");
						api.universe.manager[req.params.classification].create(api.universe, req.body, function(err, created) {
							if(err) {
								// console.log("error: ", err);
								next(err);
							} else {
								// console.log("return");
								// console.log("Created: ", created);
								res.result = {
									"object": {}
								};
								res.result.object[created.id] = created;
								created.linkFieldValues()
								.then(function() {
									created.calculateFieldValues();
									created.updateFieldValues();
									next();
								})
								.catch(next);
							}
						});
					} else {
						next();
					}
				} else {
					if(req.params.classification) {
						next(new api.universe.Anomaly("api:object:get", "Unknown Class", 40, {"params": req.params, "id": req.id, "available": Object.keys(api.universe.manager)}, null, this));
					} else {
						next();
					}
				}
			});
			
			this.router.delete("/:classification/:id", (req, res, next) => {
				if(api.universe.manager[req.params.classification]) {
					// console.log("Create: ", req.body);
					
					var keys = Object.keys(req.body),
						x;
						
					for(x=0; x<keys.length; x++) {
						if(keys[x][0] === "_") {
							delete(req.body[keys[x]]);
						}
					}
					
					if(req.body.id && api.universe.manager[req.params.classification] && api.universe.manager[req.params.classification].object[req.body.id] === undefined) {
						// console.log("manager");
						api.universe.manager[req.params.classification].create(api.universe, req.body, function(err, created) {
							if(err) {
								// console.log("error: ", err);
								next(err);
							} else {
								// console.log("return");
								// console.log("Created: ", created);
								res.result = {
									"object": {}
								};
								res.result.object[created.id] = created;
								created.linkFieldValues()
								.then(function() {
									created.calculateFieldValues();
									created.updateFieldValues();
									next();
								})
								.catch(next);
							}
						});
					} else {
						next();
					}
				} else {
					if(req.params.classification) {
						next(new api.universe.Anomaly("api:object:get", "Unknown Class", 40, {"params": req.params, "id": req.id, "available": Object.keys(api.universe.manager)}, null, this));
					} else {
						next();
					}
				}
			});
			
			done();
		});
	};
})();
