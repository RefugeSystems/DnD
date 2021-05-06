/**
 *
 *
 * @class Authentication
 * @extends EventEmitter
 * @constructor
 */

var EventEmitter = require("events").EventEmitter,
	Router = require("express").Router;

class Authentication extends EventEmitter {
	constructor(universe) {
		super();
		this.id = "AuthenticationController";
		this.router = new Router();
		this.universe = universe;
		this.processor = {};
	}

	/**
	 *
	 * @method initialize
	 * @param {Object} startup
	 * @return {Promise}
	 */
	initialize(startup) {
		return new Promise((done, fail) => {
			this.specification = startup.configuration.authentication;
			var processes = Object.keys(this.specification),
				initializing = [];
			
			for(var x=0; x<processes.length; x++) {
				if(this.specification[processes[x]]) {
					this.processor[processes[x]] = require("./modules/" + processes[x]);
					if(this.processor[processes[x]].initialize) {
						initializing.push(this.processor[processes[x]].initialize(this));
					} else {
						this.emit("error", new this.universe.Anomaly("authenticator:invalid:initialization", "Configuration specifies data for an invalid authentication process", 40, {
							"process": processes[x],
							"specification": this.specification[processes[x]]
						}, null, this.id));
					}
				}
			}
			
			Promise.all(initializing)
			.then(() => {
				done();
			})
			.catch(fail);
		});
	}


}

module.exports = Authentication;
