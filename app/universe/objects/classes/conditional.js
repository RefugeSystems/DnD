
var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
		this._fields_condition = [];
		this.postFieldCalculate();
	}
	
	postFieldCalculate() {
		this._fields_condition.splice(0);
		if(this.ifop) {
			this._fields_condition = Object.keys(this.ifop);
		} else {
			this._fields_condition = [];
		}
	}
}

module.exports = Constructor;
