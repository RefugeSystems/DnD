
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	this.initialize = (api) => {
		return new Promise((done) => {
			var chronicle = api.universe.chronicle;
			
			this.router.get("/range", (req, res, next) => {
				var start = parseInt(req.query.start),
					end = parseInt(req.query.end),
					x;
				
				console.log("Range: " + start + " -> " + end, req.query);
				if(!isNaN(start) && !isNaN(end)) {
					chronicle.getEvents(start, end, req.query, (err, rows) => {
						if(err) {
							next(err);
						} else {
							res.result = {
								"events": rows
							};
							next();
						}
					});
				} else {
					next();
				}
			});
			
			this.router.post("/add", (req, res, next) => {
				next();
			});
			
			this.router.post("/update", (req, res, next) => {
				next();
			});
			
			this.router.get("/remake", (req, res, next) => {
				res.result = {"state": "reinitialized"};
				chronicle.reinitialize()
				.then(() => {
					next();
				})
				.catch(next);
			});
			
			done();
		});
	};
})();
