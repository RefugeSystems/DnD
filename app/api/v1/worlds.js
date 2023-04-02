
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	this.path = "/worlds";
	
	this.initialize = (api) => {
		return new Promise((done) => {
		
			this.router.get("/list", (req, res, next) => {
				var manager = api.universe.manager.world,
					worlds = [],
					world,
					i;

				for(i=0; i<manager.objectIDs.length; i++) {
					world = manager.object[manager.objectIDs[i]];
					if(world && !world.is_preview && !world.review) {
						worlds.push(world);
					}
				}

				res.result = worlds;
				next();
			});
			
			done();
		});
	};
})();
