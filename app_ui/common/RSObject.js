/**
 * 
 * @class RSObject
 * @constructor
 * @param {Universe} universe
 */
class RSObject {
	constructor(data, universe) {
		this._universe = universe;
		var keys = Object.keys(data),
			i;
		for(i=0; i<keys.length; i++) {
			this[keys[i]] = data[keys[i]];
		}
	}

	/**
	 * 
	 * @method calculatedValue
	 * @param {String}} name 
	 * @param {Integer} [index] 
	 * @param {Array} [referenced] 
	 * @returns {Integer}
	 */
	calculatedValue(name, index, referenced) {
		var follow;

		if(typeof(name) === "string") {
			name = name.split(".");
		}
		if(index instanceof Array) {
			referenced = index;
			index = 0;
		} else if(index === undefined || index === null) {
			index = 0;
		}
		
		if(name[index] === "this") {
			return this.calculatedValue(name, index + 1, referenced);
		} else if(index + 1 === name.length) {
			if(referenced) {
				referenced.push(this.id);
			}
			return this[name[index]];
		} else if(typeof(this[name[index]]) === "object" && index + 2 === name.length) {
			if(referenced) {
				referenced.push(this.id);
			}
			return this[name[index]][name[index + 1]];
		} else if(this[name[index]]) {
			// TODO: Refactor to be cleaner or move into a new class where universe is tracked
			follow = rsSystem.universe.getObject(this[name[index]]);
			if(follow) {
				return follow.calculatedValue(name, index + 1, referenced);
			} else {
				return 0;
			}
		} else {
			return 0;
		}
	}

	toJSON() {
		var json = Object.assign({}, this);
		delete(json._universe);
		return json;
	}
}
