/**
 *
 *
 * @class LogController
 * @constructor
 */
var bunyan = require("bunyan");

/**
 *
 * @property defaults
 * @private
 * @type Object
 */
var defaults = {
	"name": "applog",
	"serializers": {}, // Object.assign({}, bunyan.stdSerializers),
	"streams": [{
		"path": "test.log",
		"level": "debug",
		"type": "rotating-file"
	}]
};



module.exports = function() {
	var output = null;
	
	/**
	 *
	 * @method initialize
	 * @param {Object} startup
	 * @return {Promise}
	 */
	this.initialize = (startup) => {
		return new Promise((done, fail) => {
			/**
			 *
			 * @property specification
			 * @type Object
			 */
 			this.specification = Object.assign({}, defaults, startup.configuration.logging);
			var defaulting = Object.keys(defaults.streams[0]),
				stream,
			 	s,
				v;

			for(s=0; s<this.specification.streams.length; s++) {
				stream = this.specification.streams[s];
				for(v=0; v<defaulting.length; v++) {
					if(!stream[defaulting[v]]) {
						stream[defaulting[v]] = defaults.streams[0][defaulting[v]];
					}
				}
			}

			this.specification.serializers.request = function(request) {
				var serialization = {};
				serialization.id = request.id;
				if(request.session) {
					serialization.session = request.session.id;
				}
				return serialization;
			};

			/*
			var errorStackRegex = new RegExp("([^\])\n\\s*", "g");
			this.specification.serializers.cause = function(error) {
				if(error) {
					return {
						"message": error.message,
						"stack": error.stack?error.stack.replace(errorStackRegex, "$1~~").split("~~"):null
					}
				} else {
					return null;
				}
			};
			*/

			/**
			 *
			 * @property output
			 * @type Bunyan
			 * @private
			 */
			console.log("Make logger...");
			output = bunyan.createLogger(this.specification);
			
			startup.logging = this;
			done(startup);
		});
	};

	/**
	 *
	 * @method entry
	 * @param {String | Anomaly} anomaly
	 */
	this.entry = (anomaly) => {
		if(typeof(anomaly) === "string") {
			anomaly = {
				"msg": anomaly
			};
			anomaly.date = (new Date()).toString();
			anomaly.time = Date.now();
		}
		output.info(anomaly, anomaly.msg);
	};
	
	/**
	 * 
	 * @method close
	 * @return {Promise}
	 */
	this.close = () => {
		return new Promise((done, fail) => {
			console.log("Streams: ", output.streams);
			var closing = [],
				s,
				x;
				
			output.streams.forEach(function(stream) {
				closing.push(new Promise(function(done, fail) {
					if(stream.stream) {
						if(stream.stream.stream) {
							stream.stream.stream.on("close", done);
							stream.stream.stream.end();
						} else {
							stream.stream.on("close", done);
							stream.stream.end();
						}
					} else {
						done();
					}
				}))
			});
			
			Promise.all(closing)
			.then(done)
			.catch(fail);
		});
	};
};
