/**
 * 
 * @class APIUIreqController
 * @constructor
 * @static
 */
 
var express = require("express"),
	path = require("path"),
	fs = require("fs");

module.exports = new (function() {
	this.router = express.Router();
	this.id = "api:ui:controller";
	
	/**
	 * 
	 * @method initialize
	 * @param {APIController} api 
	 * @return {Promise} 
	 */
	this.initialize = (api) => {
		return new Promise((done, fail) => {
			// Create Base Server
			var options = {},
				handler;
			
			this.router.get("/", function(req, res, next) {
				if(api.specification.redirect) {
					res.setHeader("Location", api.specification.redirect);
					res.statusMessage = "See UI Site";
					res.statusCode = 301;
					res.end();
				} else if(req.method.toLowerCase() === "get" && api.specification.web_root && req.path.indexOf("..") === -1) {
					var pathing,
						type;
						
					if(req.path === "/") {
						pathing = path.normalize(api.specification.web_root + req.path + "index.html");
					} else {
						pathing = path.normalize(api.specification.web_root + req.path);
					}

					// TODO: Fold into standard logging at debug level
					// console.log("GET[" + req.url + "]: " + pathing);
					if(pathing.startsWith(api.specification.web_root)) {
						fs.readFile(pathing, function(err, data) {
							if(err) {
								res.statusMessage = "Requested File Not Found";
								res.statusCode = 404;
								res.end();
							} else {
								type = path.extname(pathing);
								if(type) {
									type = type.substring(1);
								}
								switch(type) {
									case "js":
										res.setHeader("Content-Type", "text/javascript");
										break;
									case "json":
										res.setHeader("Content-Type", "application/json");
										break;
									case "htm":
										type = "html";
									case "css":
									case "html":
										res.setHeader("Content-Type", "text/" + type);
										break;
									case "jpg":
										type = "jpeg";
									case "jpeg":
									case "png":
									case "gif":
										res.setHeader("Content-Type", "image/" + type);
										break;
									case "svg":
										res.setHeader("Content-Type", "image/svg+xml");
										break;
									default:
										res.setHeader("Content-Type", "text/plain");
										break;
								}
								res.statusCode = 200;
								res.end(data);
							}
						});
					} else {
						res.statusMessage = "Malformed URL";
						res.statusCode = 400;
						res.end();
					}
				} else {
					res.statusMessage = "Invalid Request Received";
					res.statusCode = 400;
					res.end();
				}
			});
			
			done();
		});
	};
})();
