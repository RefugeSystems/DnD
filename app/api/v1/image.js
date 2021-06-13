
var parseDataUrl = require("parse-data-url"),
	express = require("express");

module.exports = new (function() {
	this.router = express.Router();
	
	var typeShort = {};
	typeShort["jpeg"] = "image/jpeg";
	typeShort["jpg"] = "image/jpeg";
	typeShort["jfif"] = "image/jpeg";
	typeShort["pjpeg"] = "image/jpeg";
	typeShort["pjp"] = "image/jpeg";
	typeShort["png"] = "image/png";
	typeShort["svg"] = "image/svg";
	
	this.initialize = (api) => {
		return new Promise((done) => {
			var manager = api.universe.manager.image;
			
			this.router.get("/:id", (req, res, next) => {
				// Handles sending an Image entry as the appropriate file type
				var parsed,
					image;
					
				if(manager && (image = manager.object[req.params.id])) {
					if(image.data.startsWith("data:image")) {
						parsed = parseDataUrl(image.data);
						if(parsed) {
							res.setHeader("Content-Type", typeShort[image.content_type] || image.content_type || "image/jpeg");
							res.end(parsed.toBuffer());
						} else {
							next();
						}
					} else {
						next();
					}
				} else {
					// No manager or no image, use normal 404 protocol
					next();
				}
			});
			
			done();
		});
	};
})();
