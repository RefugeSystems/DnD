//- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//name_generator.js
//written and released to the public domain by drow <drow@bin.sh>
//http://creativecommons.org/publicdomain/zero/1.0/
//Modified for class based handling by aetherwalker (aetherwalker@refugesystems.net)

/**
 * 
 * @class NameGenerator
 * @constructor
 * @see http://creativecommons.org/publicdomain/zero/1.0/
 * @param {Array | String} corpus Array of string data to generate the underlying information.
 */
class NameGenerator {
	constructor(corpus) {
		if(typeof(corpus) === "string") {
			corpus = corpus.split(/[\s,]/);
		}
		this.consumeCorpus(corpus);
	}
	
	/**
	 * 
	 * @method consumeCorpus
	 * @param {Array | String} corpus An array of string data to generate the base of information.
	 */
	consumeCorpus(corpus) {
		this.corpus = corpus;
		this.compendium = {};
		
		var c, x, y, z,
			string,
			lastC,
			names,
			name;

		for(x=0; x<corpus.length; x++) {
			corpus[x] = corpus[x].toLowerCase();
			names = corpus[x].split(/\s+/);
			this.nextChain("parts", names.length);
			for(y=0; y<names.length; y++) {
				name = names[y];
				this.nextChain("nameLen", name.length);

				c = name[0];
				this.nextChain("initial", c);

				string = name.substr(1);
				lastC = c;

				while(string.length > 0) {
					c = string[0];
					this.nextChain(lastC, c);
					string = string.substr(1);
					lastC = c;
				}
			}
		}
		
		this.scaleChain();
	}
	
	nextChain(key, token) {
		if(this.compendium[key]) {
			if(this.compendium[key][token]) {
				this.compendium[key][token]++;
			} else {
				this.compendium[key][token] = 1;
			}
		} else {
			this.compendium[key] = {};
			this.compendium[key][token] = 1;
		}
	}

	scaleChain() {
		var key,
			token,
			count,
			weighted,
			tableLen = {};

		for(key in this.compendium) {
			tableLen[key] = 0;

			for(token in this.compendium[key]) {
				count = this.compendium[key][token];
				weighted = Math.floor(Math.pow(count,1.3));

				this.compendium[key][token] = weighted;
				tableLen[key] += weighted;
			}
		}
		this.compendium["tableLen"] = tableLen;
	}
	
	/**
	 * 
	 * @method create
	 * @return {String} A name generated from the underlying data.
	 */
	create() {
		var parts = this.selectLink("parts"),
			names = [],
			nameLen,
			lastC,
			name,
			x,
			c;

		for(x=0; x<parts; x++) {
			nameLen = this.selectLink("nameLen");
			c = this.selectLink("initial");
			name = c;
			lastC = c;

			while(name.length < nameLen) {
				c = this.selectLink(lastC);
				name += c;
				lastC = c;
			}
			names.push(name);
		}
		return names.join(" ");
	}
	
	/**
	 * 
	 * @method fill
	 * @param {Array} array Fills the passed array with generated names.
	 */
	fill(array) {
		for(var x=0; x<array.length; x++) {
			array[0] = this.create();
		}
	}
	
	selectLink(key) {
		var len = this.compendium["tableLen"][key],
			idx = Math.floor(Math.random() * len),
			token,
			x;

		x = 0;
		for(token in this.compendium[key]) {
			x += this.compendium[key][token];
			if(idx < x) {
				return token;
			}
		}
		return "-";
	}
}

module.exports = NameGenerator;
