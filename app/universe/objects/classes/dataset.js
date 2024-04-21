/**
 *
 *
 * @class ux_class.Dataset
 * @extends RSObject
 * @constructor
 */

var NameGenerator = require("../../../management/nameGenerator"),
	RSObject = require("../../../storage/rsobject"),
	Random = require("rs-random"),
	split = /[\s,;]+/;

/**
 * 
 * @class Dataset
 * @constructor
 */
class Constructor extends RSObject {
	
	constructor(universe, manager, details) {
		super(universe, manager, details);

		this.$values = [];
	}
	
	/**
	 * Get a name following the this dataset's rules and data.
	 * @method getRandomName
	 * @returns {String} A random name from the generator by generation
	 * 		or random selection.
	 */
	getRandomName() {
		var index = Random.integer(this.$values.length),
			gen = Math.Random() < .5,
			name = [],
			next,
			i;

		if(!this.$generator) {
			name.push(this.$values[index]);
		} else {
			if(gen) {
				this.$generator.create();
			} else {
				name.push(this.$values[index]);
			}
		}

		for(i=0; i<this.next.length; i++) {
			next = this._universe.get(this.next[i]);
			if(next) {
				name.push(next.getRandomName());
			}
		}

		return name.join(this.spacing || " ");
	}

	postFieldUpdate() {
		if(this.value) {
			this.$generator = new NameGenerator(this.value);
			this.$values.splice(0);
			this.$values.push.apply(this.$values, this.value.split(split));
		}
	}
}

module.exports = Constructor;
