/**
 *
 *
 * @class ux_class.Image
 * @extends RSObject
 * @constructor
 */

var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
	}
	
	toJSON() {
		var data = super.toJSON();
		delete(data._data);
		delete(data.data);
		return data;
	}
}

module.exports = Constructor;
