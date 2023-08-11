/**
 *
 * @class Libraries
 * @constructor
 * @param {Universe} universe
 */

module.exports = function(universe) {

	var libraries = {};

	this.update = function(name, instantiated) {
		delete(libraries[name]);
		if(instantiated) {
			libraries[name] = instantiated;
		}
	};
	
	this.fetch = function(name) {
		return libraries[name];
	};
};
