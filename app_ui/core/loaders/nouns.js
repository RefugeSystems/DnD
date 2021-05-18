/**
 * Maps type or class names to the constructor for that named type of noun.
 * 
 * This is used by the Universe when loading and constructing objects. This should
 * only be accessed if the key is listed in the listingNouns property, otherwise
 * the noun likely isn't meant for direct use.
 * 
 * @property availableNouns
 * @type Object
 * @for rsSystem
 */
rsSystem.availableNouns = {};
/**
 * List of all nouns that are currently registered.
 * 
 * Used by system controls for easy reference.
 * @property listingNouns
 * @type Array
 * @for rsSystem
 */
rsSystem.listingNouns = [];

/**
 * Maps type or class names to the constructor for that named type of noun. 
 * @method registerNoun
 * @param {Function | Class} constructor The constructor to use for the named type.
 * @param {Boolean} [constructor.unavailable] When true, the noun is considered registered
 * 		but listed in the noun listing but _is_ still an availableNoun.
 * @param {String} [name] The name for the noun. Defaults to the name of the constructor.
 */
rsSystem.registerNoun = function(constructor, name) {
	console.trace("reg");
	name = name || constructor.name;
	constructor.prototype._class = name;
	constructor.prototype._type = name;
	rsSystem.availableNouns[name] = constructor;
	if(!constructor.unavailable) {
		rsSystem.listingNouns.push(name);
	}
};
