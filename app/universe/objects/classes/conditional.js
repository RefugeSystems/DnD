
var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
		this.postFieldCalculate();
	}
	
	postFieldCalculate() {
	}
}

module.exports = Constructor;
