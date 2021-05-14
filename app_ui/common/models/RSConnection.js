/**
 *
 * @class RSConnection
 * @extends RSObject
 * @constructor
 * @module Common
 * @param {Object} details Source information to initialize the object
 * 		received from the Universe.
 */
class RSConnection extends RSObject {
	constructor(details, universe) {
		super(details, universe);
	}

	get target() {
		return this.end;
	}
	get source() {
		return this.start;
	}

	recalculateHook() {

	}
}
