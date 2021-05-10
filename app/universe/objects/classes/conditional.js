
var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
		this.condition = this._data.condition;
		this.ifop = this._data.ifop;
		this.add = this._data.add;
		this.sub = this._data.sub;
		this.set = this._data.set;
		this.postFieldCalculate();
	}
	
	postFieldCalculate() {
		this.fields_condition = Object.keys(this._data.condition); // Matches ifop
		this.fields_add = Object.keys(this._data.add);
		this.fields_sub = Object.keys(this._data.sub);
		this.fields_set = Object.keys(this._data.set);
	}
}

module.exports = Constructor;
