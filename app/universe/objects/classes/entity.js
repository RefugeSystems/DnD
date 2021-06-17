/**
 *
 *
 * @class ux_class.Entity
 * @extends RSObject
 * @constructor
 */

var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
	}
	
	postFieldUpdate() {
		
	}
}

module.exports = Constructor;
