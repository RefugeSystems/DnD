/**
 *
 *
 * @class ux_class.Player
 * @extends RSObject
 * @constructor
 */

var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
		if(!this._data.auth_token) {
			this._data.auth_token = {};
		}
		if(!this._data.auth_identity) {
			this._data.auth_identity = {};
		}
		
		this.leaves = 0;
		this.errors = 0;
		this.sent = 0;
		this.recv = 0;
		
		if(!this.attribute) {
			this.attribute = {};
		}
	}
	
	toJSON() {
		var json = super.toJSON();
		json.password = null;
		json.sessions = null;
		json.leaves = this.leaves;
		json.errors = this.errors;
		json.recv = this.recv;
		json.sent = this.sent;
		return json;
	}
}

module.exports = Constructor;
