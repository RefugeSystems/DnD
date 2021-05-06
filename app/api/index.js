/**
 *
 *
 * @class APIController
 * @extends EventEmitter
 * @constructor
 */

var EventEmitter = require("events").EventEmitter;

class APIController extends EventEmitter {
	constructor(universe, authentication) {
		super();
		this.universe = universe;
		this.authentication = authentication;
	}

	/**
	 *
	 * @method initialize
	 * @param {Object} startup
	 * @return {Promise}
	 */
	initialize(startup) {
		return new Promise((done, fail) => {
			done();
		});
	}
}

module.exports = APIController;
