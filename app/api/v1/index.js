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
	this.id = "api:v1:router";
	
	/**
	 * 
	 * @method initialize
	 * @param {APIController} api 
	 * @return {Promise} 
	 */
	this.initialize = (api) => {
		return new Promise((done, fail) => {
			fs.readdir("app/api/v1", (err, paths) => {
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
							promised.push(load.initialize(api));
							load.path = load.path || "/" + paths[x].replace(".js", "");
							loading.push(load);
						}
					}

					Promise.all(promised)
					.then(() => {
						for(x=0; x<loading.length; x++) {
							console.log("Using: " + loading[x].path);
							this.router.use(loading[x].path, loading[x].router);
						}
						
						this.router.options(".*", function(req, res) {
							res.send();
						});
						
						this.router.use((req, res, next) => {
							if(res.result) {
								res.json(res.result);
							} else {
								var err = new Error("Not Found");
								err.status = 404;
								next(err);
							}
						});
						
						this.router.use((err, req, res, next) => {
							var details,
								anomaly;
								
							if(err instanceof api.universe.Anomaly) {
								anomaly = err;
							} else {
								details = {};
								details.path = req.path;
								details.session = req.session;
								details.request = req.id;
								details.size = req.body?JSON.stringify(req.body).length:0;
								details.params = Object.assign({}, req.params);
								details.query = Object.assign({}, req.query);
								if(details.query.token) {
									details.query.token = "[OBSCURED]";
								}
								if(details.query.password) {
									details.query.password = "[OBSCURED]";
								}
								
								anomaly = new api.universe.Anomaly("api:request:fault", err.message, 40, details, err.stack, this);
							}
							
							res.status(500).json(anomaly);
							api.emit("error", anomaly);
						});
						
						done();
					})
					.catch(fail);
				}
			});
		});
	};
})();
