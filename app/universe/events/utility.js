/**
 * 
 * @class EventUtility
 * @constructor
 * @static
 */

/**
 * Check if an ID of an object is represented in an array either directly or
 * as a parent of an element.
 * @method addUniquely
 * @param {Universe} universe 
 * @param {String | Object} id 
 * @param {Array} inside Add ID
 * @return {Boolean} Indicating if it was added.
 */
module.exports.hasID = function(universe, id, inside) {
	var buffer,
		i;

	if(!(inside instanceof Array)) {
		return false;
	}

	if(id) {
		for(i=0; i<inside.length; i++) {
			buffer = inside[i];
			if(typeof(buffer) === "string") {
				buffer = universe.get(buffer);
			}
			if(buffer && (buffer.id === id || buffer.parent === id)) {
				return true;
			}
		}
		
		return false;
	}

	return false;
};

/**
 * Add the ID of an object to an array ensuring that the parent of that
 * object is not already represented.
 * @method addUniquely
 * @param {Universe} universe 
 * @param {String | Object} adding This object or ID
 * @param {Array} to Add ID
 * @return {Boolean} Indicating if it was added.
 */
module.exports.addUniquely = function(universe, adding, to) {
	var parent,
		buffer,
		i;

	if(!(to instanceof Array)) {
		return false;
	}

	if(typeof(adding) === "string") {
		buffer = universe.get(adding);
		if(!buffer) {
			return false;
		}
		parent = buffer.parent;
	} else {
		parent = adding.parent;
		adding = adding.id;
	}

	if(adding) {
		if(parent) {
			for(i=0; i<to.length; i++) {
				buffer = to[i];
				if(typeof(buffer) === "string") {
					buffer = universe.get(buffer);
				}
				if(buffer && (buffer.id === parent || buffer.parent === parent)) {
					return false;
				}
			}
		}

		to.push(adding);
		return true;
	}

	return false;
};
