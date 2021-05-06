/**
 *
 * ```
 * General Level Bounds (Defaults to 30):
 * + Trace: 10
 * + Debug: 20
 * + Info: 30
 * + Warn: 40
 * + Error: 50
 * + Fatal: 60
 * ```
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
 
var errorStackRegex = new RegExp("([^\])\n\\s*", "g");
 
// class Anomaly extends Error {
class Anomaly {
	constructor(code, message, level, details, cause, component) {
		// super(message);
		this.code = code;
		this.component = component?(component.id || component):"unknown";
		this.msg = message;
		this.level = level || (cause?40:30);
		if(details) {
			this.details = Object.assign({}, details);
		}
		if(cause) {
			this.cause = {};
			this.cause.message = cause.message;
			if(cause.stack) {
				// "stack": cause.stack ? (typeof(cause.stack.replace) === "function" ? cause.stack : cause.stack.toString()).replace(/([^\\])\\n\s*/g, "$1~~").split("~~"):null
				this.cause.stack = cause.stack.toString();
				this.cause.stack = this.cause.stack.replace(errorStackRegex, "$1~~").split("~~");
				this.cause.stack.shift();
			}
		}
		this.date = (new Date()).toString();
		this.time = Date.now();
	}
}

module.exports = Anomaly;
