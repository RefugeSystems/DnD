/**
 * 
 * @class APIUIreqController
 * @constructor
 * @static
 */
 
var express = require("express"),
	path = require("path"),
	fs = require("fs"),
	
	divides = new RegExp("[\\/\\\\]", "g"),
	urlStart = new RegExp("^/ui/");

module.exports = new (function() {
	this.router = express.Router();
	this.id = "api:ui:controller";
	var rootCompare,
		comparison;
	
	rootCompare = function(to) {
		to = to.split(divides);
		console.log("Compare: ", comparison, to);
		if(comparison) {
			for(var x=0; x<comparison.length; x++) {
				if(comparison[x] && comparison[x] !== to[x]) {
					return false;
				}
			}
			
			return true;
		} else {
			return false;
		}
	};
	
	
	
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
			
			// OS Abstraction
			if(api.specification.web_root) {
				comparison = api.specification.web_root.split(divides);
			} else {
				comparison = null;
			}
			
			// This section doesn't leverage Express but path normalization to ensure requests stay in this application
			this.router.get(/.*/i, function(req, res, next) {
				if(api.specification.redirect) {
					res.setHeader("Location", api.specification.redirect);
					res.statusMessage = "See UI Site";
					res.statusCode = 301;
					res.end();
				} else if(req.method.toLowerCase() === "get" && api.specification.web_root && req.path.indexOf("..") === -1) {
					var pathing,
						compare,
						type;
						
					if(req.path === "/") {
						pathing = path.normalize(api.specification.web_root + req.path + "index.html");
					} else {
						pathing = path.normalize(api.specification.web_root + req.path);
					}
					pathing = pathing.replace(urlStart, "");

					// TODO: Fold into standard logging at debug level
					if(rootCompare(pathing)) {
						fs.readFile(pathing, function(err, data) {
							if(err) {
								pathing = pathing + ".html";
								fs.readFile(pathing, function(err, data) {
									if(err) {
										res.statusMessage = "Requested File Not Found";
										res.statusCode = 404;
										res.end();
									} else {
										res.setHeader("Content-Type", "text/html");
										res.statusCode = 200;
										res.end(data);
									}
								});
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
				} else if(!api.specification.web_root) {
					res.statusMessage = "No UI Directory";
					res.statusCode = 404;
					res.end();
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
