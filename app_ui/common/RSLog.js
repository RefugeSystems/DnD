
/**
 * Logging object that handles send data back to the Universe for sorting/debugging
 * as well as local tracknig for follow-up.
 * @class RSLog
 * @extends EventEmitter
 * @constructor
 * @module Common
 * @param {RSUniverse} universe 
 */
class RSLog extends EventEmitter {
	constructor(universe, init) {
		super();
		this.universe = universe;
		this.tracked = 100;
		this.recent = [];
		
		this.levels = init || {
			"log": 30,
			"trace": 10,
			"debug": 20,
			"info": 30,
			"warn": 40,
			"error": 50,
			"fatal": 60
		};
	}
	
	/**
	 * 
	 * @method setLogging
	 * @param {Object} levels
	 */
	setLogging(levels) {
		Object.assign(this.levels, levels);
	}
	
	/**
	 * 
	 * @method toJSON
	 * @return {Object} Maps the known logging levels to their set value
	 */
	toJSON() {
		return this.levels;
	}
	
	/**
	 * Typically called by the support methods directly, but custom levels would need to have this method
	 * invoked directly.
	 * 
	 * @method createLogEntry
	 * @param {String} type The type of log entry, such as "info", "error", or "fatal". Should correspond to
	 * 		a known logging level in levels or it will be ignored as 'off'.
	 * @param {Array} details Contains information describing what occurred. Ideally a single object mapping
	 * 		key concepts (such as player, record, and id) to values to help track the cause of the error.
	 */
	createLogEntry(type, details) {
		if(this.levels[type]) {
			var entry = {
				"level": this.levels[type],
				"time": Date.now(),
				"details": details,
				"type": type
			};

			if(console[type]) {
				console[type].apply(console[type], details);
			}
			
			this.universe.send("log", entry);
			this.recent.unshift(entry);
			if(this.tracked && this.recent > this.tracked) {
				this.recent.pop();
			}
			
			this.$emit(type, entry);
		}
	}
	
	/**
	 * 
	 * @method log
	 * @param {Object | String | Number | Boolean} ...args 
	 */
	log(...args) {
		this.createLogEntry("log", args);
	}

	/**
	 * 
	 * @method trace
	 * @param {Object | String | Number | Boolean} ...args 
	 */
	trace(...args) {
		this.createLogEntry("trace", args);
	}

	/**
	 * 
	 * @method debug
	 * @param {Object | String | Number | Boolean} ...args 
	 */
	debug(...args) {
		this.createLogEntry("debug", args);
	}

	/**
	 * 
	 * @method info
	 * @param {Object | String | Number | Boolean} ...args 
	 */
	info(...args) {
		this.createLogEntry("info", args);
	}

	/**
	 * 
	 * @method warn
	 * @param {Object | String | Number | Boolean} ...args 
	 */
	warn(...args) {
		this.createLogEntry("warn", args);
	}

	/**
	 * 
	 * @method error
	 * @param {Object | String | Number | Boolean} ...args 
	 */
	error(...args) {
		this.createLogEntry("error", args);
	}

	/**
	 * 
	 * @method fatal
	 * @param {Object | String | Number | Boolean} ...args 
	 */
	fatal(...args) {
		this.createLogEntry("fatal", args);
	}
}

