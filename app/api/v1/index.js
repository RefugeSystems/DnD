/**
 * 
 * @class APIControllerRouter
 * @constructor
 * @static
 */
var cookieParser = require("cookie-parser"),
	bodyParser = require("body-parser"),
	express = require("express"),
	fs = require("fs"),
	
	APIUniverse = require("./universe"),
	APIObjects = require("./objects"),
	APIFields = require("./fields");

module.exports = new (function() {
	this.router = express.Router();
	this.id = "api:controller";
	
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
							loading.push(load);
						}
					}
					
					Promise.all(promised)
					.then(() => {
						this.router.use(function(req, res, next) {
							console.log("Request: ", req.path);
							next();
						});
						
						for(x=0; x<loading.length; x++) {
							this.router.use(loading[x].path, loading[x].router);
						}
						
						this.router.use(bodyParser.json());
						this.router.use(bodyParser.urlencoded({ extended: false }));
						this.router.use(cookieParser());
						
						this.router.options(".*", function(req, res) {
							res.send();
						});
						
						this.router.get("/", (req, res, next) => {
							res.result = {
								"rest": "hello world"
							};
							next();
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
							var details = {},
								anomaly;
							
							details.path = req.path;
							details.session = req.session;
							details.redid = req.reqid;
							
							anomaly = new api.universe.Anomaly("api:request:fault", err.message, 40, details, err.stack, this);
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
