/**
 * Basic core concepts that shouldn't be authenticated or shoould leverage special considerations
 * for doing so such as Image and Audio retrieval are routed through here.
 * @class APIPubRouter
 * @constructor
 * @static
 */
var express = require("express"),
	fs = require("fs");

module.exports = new (function() {
	this.router = express.Router();
	this.id = "api:pub:router";

	/**
	 * 
	 * @method initialize
	 * @param {APIController} api 
	 * @return {Promise} 
	 */
	this.initialize = (api) => {
		return new Promise((done, fail) => {
			fs.readdir("app/api/pub", (err, paths) => {
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
								api.universe.emit("error", new api.universe.Anomaly("api:pub:load", "Failed to load an API branch: no Initialize", 40, {"branch": paths[x]}, null, this));
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
		});
	};
})();
