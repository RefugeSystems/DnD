

var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	this.path = "/object";
	
	this.initialize = (api) => {
		return new Promise((done) => {
			
			this.router.get("/:classification/:id", (req, res, next) => {
				console.log("Get[" + req.params.classification + "]@" + req.params.id);
				if(api.universe.manager[req.params.classification]) {
					api.universe.manager[req.params.classification].retrieveObjectData(req.params.id, function(err, data) {
						if(err) {
							next(err);
						} else {
							console.log("Data: ", data);
							res.result = {
								"object": {}
							};
							res.result.object[req.params.id] = data;
							next();
						}
					}, true);
				} else {
					next();
				}
			});
			
			done();
		});
	};
})();
