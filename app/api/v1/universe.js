
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
			
			this.router.get("/players", (req, res, next) => {
				res.result = {};
				res.result.players = api.universe.getPlayerState();
				next();
			});
			
			this.router.get("/classes", (req, res, next) => {
				res.result = {};
				res.result.classes = Object.keys(api.universe.manager).sort();
				next();
			});
			
			this.router.post("/calculate/:id", (req, res, next) => {
				res.result = {};
				res.result.referenced = [];
				api.universe.calculator.debug(true);
				var source = api.universe.objectHandler.retrieve(req.params.id);
				res.result.value = api.universe.calculator.computedDiceRoll(req.body.formula, source, res.result.referenced);
				api.universe.calculator.debug(false);
				res.result.source = source; // Update object with source last to move this data to the bottom of the object naturally when encoded
				next();
			});
			
			this.router.get("/object/:id", (req, res, next) => {
				res.result = {};
				res.result = api.universe.objectHandler.retrieve(req.params.id);
				next();
			});
			
			this.router.get("/object/:id/full", (req, res, next) => {
				res.result = {};
				res.result = api.universe.objectHandler.retrieve(req.params.id).toJSON(true);
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
			
			this.router.get("/object/:id/calculate/:debug?", (req, res, next) => {
				res.result = {};
				res.result.object = api.universe.objectHandler.retrieve(req.params.id);
				res.result.object.recalculateFieldValues(req.params.debug || true);
				next();
			});
			
			this.router.get("/object/:id/update", (req, res, next) => {
				res.result = {};
				res.result.object = api.universe.objectHandler.retrieve(req.params.id);
				res.result.object.updateFieldValues(undefined, undefined, true);
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
			
			this.router.post("/object", (req, res, next) => {
				res.result = {};
				api.universe.createObject(req.body, function(err, object) {
					if(err) {
						next(err);
					} else {
						res.result.object = object.toJSON();
						next();
					}
				});
			});
			
			this.router.post("/import", (req, res, next) => {
				var importing = req.body.import || req.body.export;
				// console.log("Body: ", req.body);
				res.result = {
					"imported": [],
					"errors": []
				};

				if(importing instanceof Array && importing.length) {
					api.universe.emit("send", {
						"type": "notice",
						"mid": "import:objects",
						"recipients": api.universe.getMasters(),
						"message": "Importing data: 0/" + importing.length,
						"icon": "fas fa-sync fa-spin",
						"timeout": 10000
					});

					importing.forEach(function(details) {
						api.universe.createObject(details, function(err, object) {
							if(err) {
								console.log("Error[" + (details?details.id:details) + "]: ", err);
								res.result.errors.push({
									"source": details?details.id:details,
									"message": err.message,
									"error": err
								});
							} else {
								res.result.imported.push(object.toJSON());
							}
							api.universe.emit("send", {
								"type": "notice",
								"mid": "import:objects",
								"recipients": api.universe.getMasters(),
								"message": "Importing data: " + res.result.imported.length + "/" + importing.length + ":" + res.result.errors.length,
								"icon": "fas fa-sync fa-spin",
								"anchored": true
							});
							if((res.result.errors.length + res.result.imported.length) === importing.length) {
								api.universe.emit("send", {
									"type": "notice",
									"mid": "import:objects",
									"recipients": api.universe.getMasters(),
									"message": "Import Complete: " + res.result.imported.length + "/" + importing.length + ":" + res.result.errors.length,
									"icon": "fas " + (res.result.errors.length?"fa-exclamation-triangle rs-lightred":"fa-check rs-lightgreen"),
									"anchored": true
								});
								next();
							}
						});
					});
				} else {
					res.result = {
						"message": "No import information found"
					};
					next();
				}
			});
			
			this.router.delete("/object/:id", (req, res, next) => {
				res.result = {};
				api.universe.objectHandler.delete(req.params.id, function(err) {
					if(err) {
						next(err);
					} else {
						res.result.message = "Deleted " + req.params.id;
						next();
					}
				});
			});
			
			this.router.post("/configuration/dump", (req, res, next) => {
				res.result = {"emitted": Date.now()};
				api.universe.emit("dump-configuration");
				next();
			});

			this.router.get("/test/error", (req, res, next) => {
				res.result = {};
				api.universe.emit("error", new api.universe.Anomaly("test", "Test Error", 30));
				next();
			});

			this.router.get("/test/damage", (req, res, next) => {
				res.result = {};
				api.universe.emit("send", {
					"type": "notice",
					"mid": "incoming:damage:entity:yre5an4cpc1623022606149mamw3djfz:10",
					"recipient": "player:master",
					"message": "Sabrina taking damage from God",
					"icon": "game-icon game-icon-crossed-slashes rs-lightred",
					"anchored": true,
					"emission": {
						"type": "dialog-open",
						"component": "dndDialogRoll",
						"storageKey": "store:roll:entity:yre5an4cpc1623022606149mamw3djfz",
						"entity": "entity:yre5an4cpc1623022606149mamw3djfz",
						"action": "action:free:damage",
						"damage": {
							"damage_type:slashing": 16,
							"damage_type:fire": 4
						// },
						// "resist": {
						// 	"damage_type:slashing": "1d6",
						// 	"damage_type:necrotic": "1d6",
						// 	"damage_type:cold": "1d6"
						},
						"closeAfterAction": true
					}
				});
				next();
			});
			
			done();
		});
	};
})();
