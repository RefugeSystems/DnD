/**
 *
 *
 * @class ux_class.Session
 * @extends RSObject
 * @constructor
 */

var RSObject = require("../../../storage/rsobject"),
	pkg = require("../../../../package.json");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
		this.player = details.player;
		this.username = details.username;
		this.expiry = details.expiry;
		this.last = details.last;
		this.version = pkg.version;
	}
	
	toJSON() {
		var json = super.toJSON();
		json.version = this.version;
		return json;
	}
}

module.exports = Constructor;
