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

		});
	}
}

module.exports = APIController;
