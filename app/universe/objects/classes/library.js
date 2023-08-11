/**
 *
 *
 * @class ux_class.Playlist
 * @extends RSObject
 * @constructor
 */

var RSObject = require("../../../storage/rsobject");

class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);
	}
	
	postFieldUpdate() {
		try {
			this.universe.Libraries.update(this.name, new this.processor(this._universe));
		} catch(exception) {
			this.universe.emit("error", new this._universe.Anomaly("library:instantiation", "Post Field Update", 50, {"processor": this.processor.toString()}, exception, this));
		}
	}
}

module.exports = Constructor;
