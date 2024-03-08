/**
 * 
 * @class APIv1Router
 * @constructor
 * @static
 */
var express = require("express"),
	fs = require("fs");

module.exports = new (function() {
	this.router = express.Router();
	this.id = "api:v2:router";

	/**
	 * 
	 * @method initialize
	 * @param {APIController} api 
	 * @return {Promise} 
	 */
	this.initialize = (api) => {
		return new Promise((done, fail) => {
			if(api.universe.configuration.server.api.v2 === true) {
				fs.readdir("app/api/v2", (err, paths) => {
					if(err) {
						fail(err);
					} else {
						var promised = [],
							loading = [],
							load,
							x;
						
						for(x=0; x<paths.length; x++) {
							if(paths[x] !== "." && paths[x] !== ".." && paths[x] !== "index.js") {
								load = require("./" + paths[x]);
								if(load.initialize) {
									promised.push(load.initialize(api));
									load.path = load.path || "/" + paths[x].replace(".js", "");
									loading.push(load);
								} else {
									api.universe.emit("error", new api.universe.Anomaly("api:v2:load", "Failed to load an API branch: no Initialize", 40, {"branch": paths[x]}, null, this));
								}
							}
						}

						Promise.all(promised)
						.then(() => {
							for(x=0; x<loading.length; x++) {
								this.router.use(loading[x].path, loading[x].router);
							}
							
							done();
						})
						.catch(fail);
					}
				});
			} else {
				this.router.use((req, res) => {
					res.status(503).json({
						"message": "V2 API Disabled"
					});
				});
				done();
			}
		});
	};
})();
