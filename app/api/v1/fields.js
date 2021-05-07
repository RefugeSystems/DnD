
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	this.path = "/fields";
	
	this.initialize = (api) => {
		return new Promise((done) => {
			
			this.router.get("/:classification", (req, res, next) => {
				if(api.universe.manager[req.params.classification]) {
					// console.log("ClassManager[" + req.params.classification + "]: ", api.universe.manager[req.params.classification]);
					res.result = {
						"fields": api.universe.manager[req.params.classification].fields
					};
					next();
					
				} else {
					next();
				}
			});
			
			done();
		});
	};
})();
