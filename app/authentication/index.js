/**
 *
 *
 * @class APIController
 * @extends EventEmitter
 * @constructor
 * @type {[type]}
 */

var EventEmitter = require("events").EventEmitter;

class APIController extends EventEmitter {
	constructor() {
		super();
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
		});
	}


}

module.exports = APIController;
