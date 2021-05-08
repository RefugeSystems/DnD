

var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	this.initialize = (api) => {
		return new Promise((done) => {
			var database = api.universe.objectHandler.getDatabase();
		
			this.router.post("/command/run", (req, res, next) => {
				var entry = {};
				entry.code = "database:raw:command";
				entry.message = "Raw database command";
				entry.details = {};
				entry.details.command = req.body.command;
				entry.details.execution = "run";
				
				api.emit("error", entry);
				database.connection.run(req.body.command, req.body.parameters || [], function(err) {
					if(err) {
						next(err);
					} else {
						res.result = {};
						res.result.message = "Command execution complete";
						res.result.command = req.body.command;
						next();
					}
				});
			});
			
			
			this.router.post("/command/all", (req, res, next) => {
				var entry = {};
				entry.code = "database:raw:command";
				entry.message = "Raw database command";
				entry.details = {};
				entry.details.command = req.body.command;
				entry.details.execution = "all";
				api.emit("error", entry);
				database.connection.all(req.body.command, req.body.parameters || [], function(err, rows) {
					if(err) {
						next(err);
					} else {
						res.result = {};
						res.result.message = "Command execution complete";
						res.result.command = req.body.command;
						res.result.rows = rows;
						next();
					}
				});
			});
			
			done();
		});
	};
})();
