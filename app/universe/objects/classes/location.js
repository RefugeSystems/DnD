/**
 *
 *
 * @class ux_class.Location
 * @extends RSObject
 * @constructor
 */

var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
	}
	
	postFieldUpdate() {
		if(!this.label) {
			this.label = this.name;
		}
	}
}

module.exports = Constructor;
