/**
 *
 * 	General Level Bounds (Defaults to 30):  
 * 	+ Trace: 10  
 * 	+ Debug: 20  
 * 	+ Info: 30  
 * 	+ Warn: 40  
 * 	+ Error: 50  
 * 	+ Fatal: 60  
 *
 * @class Anomaly
 * @constructor
 * @param {String} code
 * @param {String} message
 * @param {Number} [level] The integer value for the importance of this Anomaly.
 * 		Defaults to 30.
 * @param {Object} [details]
 * @param {Error} [cause]
 * @param {Object | String} [component]
 */

class Anomaly extends Error {
	constructor(code, message, level, details, cause, component) {
		super(message);
		this.code = code;
		this.origin = component?component.id || component:"unknown";
		this.message = message;
		this.level = level || (cause?40:30);
		this.details = Object.assign({}, details);
		if(cause) {
			this.cause = {
				"message": cause.message,
				"stack": cause.stack?(cause.stack.replace?cause.stack:cause.stack.toString()).replace(/([^\\])\\n\s*/g, "$1~~").split("~~"):null
			};
		}
	
		this.time = Date.now();
	}
}

module.exports = Anomaly;
