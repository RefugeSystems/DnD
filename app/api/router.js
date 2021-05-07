/**
 * 
 * @class APIControllerRouter
 * @constructor
 * @static
 */
var cookieParser = require("cookie-parser"),
	bodyParser = require("body-parser"),
	express = require("express");

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
			this.router.use(function(req, res, next) {
				console.log("Request: ", req.path);
				next();
			});
			this.router.use(bodyParser.json());
			this.router.use(bodyParser.urlencoded({ extended: false }));
			this.router.use(cookieParser());
			
			this.router.options(".*", function(req, res) {
				res.send();
			});
			
			this.router.get("/", (req, res, next) => {
				req.result = {
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
		});
	};
})();
