
var express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	this.initialize = (api) => {
		return new Promise((done) => {
			var manager = api.universe.manager.image;
			
			var imageToFile = function(image) {
				
			};
			
			this.router.get("/:id", (req, res, next) => {
				// Handles sending an Image entry as the appropriate file type
				var image;
				if(manager && (image = manager.object[req.params.id])) {
					res.setHeader("Content-Type", image.type);
					res.end(imageToFile(image));
				} else {
					// No manager or no image, use normal 404 protocol
					next();
				}
			});
			
			done();
		});
	};
})();
