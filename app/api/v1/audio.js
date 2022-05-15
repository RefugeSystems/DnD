
var parseDataUrl = require("parse-data-url"),
	express = require("express");

module.exports = new (function() {
	this.router = express.Router();

	var cacheDuration = 60 * 60 * 24 * 31,
		typeShort = {},
		cacheString;

	cacheString = "public, max-age=" + cacheDuration;
	
	typeShort["mp3"] = "audio/mp3";
	typeShort["mid"] = "audio/midi";
	typeShort["midi"] = "audio/midi";
	typeShort["oga"] = "audio/ogg";
	typeShort["aac"] = "audio/aac";
	
	this.initialize = (api) => {
		return new Promise((done) => {
			var manager = api.universe.manager.audio;
			
			this.router.get("/:id", (req, res, next) => {
				// Handles sending an Image entry as the appropriate file type
				var parsed,
					audio;
					
				if(manager && (audio = manager.object[req.params.id])) {
					if(audio.data.startsWith("data:audio")) {
						parsed = parseDataUrl(audio.data);
						if(parsed) {
							res.setHeader("Content-Type", typeShort[audio.content_type] || audio.content_type || "audio/mp3");
							if(audio.is_preview) {
								res.set("Cache-Control", "no-store");
							} else {
								res.set("Cache-control", cacheString);
							}
							res.end(parsed.toBuffer());
						} else {
							console.log("Not Parsed");
							next();
						}
					} else {
						console.log("Not Audio");
						next();
					}
				} else {
					// No manager or no audio, use normal 404 process
					console.log("Not Found");
					next();
				}
			});
			
			done();
		});
	};
})();
