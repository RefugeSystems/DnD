/**
 * 
 * @class EventUtility
 * @constructor
 * @static
 */

/**
 * Maps class names to the fields that should generally contain them.
 * @property STANDARD_MAP
 * @type Object
 * @static
 */
var STANDARD_MAP = module.exports.STANDARD_MAP = {
	"item": "inventory",
	"effect": "effects",
	"entity": "@meeting.entities", // TODO: Handle Requiring an Entity somewhere
	"enchantment": "enchantments",
	"feat": "feats",
	"weather": "weather"
};

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


/**
 * @method instillEffects
 * @param {Universe} universe 
 * @param {Array | String | RSObject} effects To instill. Mutated by universe transcription.
 * @param {RSObject} source 
 * @param {RSObject} target 
 * @param {RSObject} [channel] The is causing the effects to apply (Spell, Item, etc)
 * @param {Boolean} [hit] Was the target successfully hit by the source. Used for effect instill consideration.
 * @param {Boolean} [damaged] Was the target successfully damaged by the source. Used for effect instill consideration.
 * @param {Boolean} [saved] Did the target successful save on any checks involved.
 * @return {Array} Of encountered problems. Gaurenteed to exist. If empty, success.
 */
module.exports.instillEffects = function(universe, effects, source, target, channel, hit, damaged, saved) {
	var waiting = [],
		mask = {},
		effect,
		i;
	
	universe.transcribeArray(effects);
	mask.character = target.id;
	mask.caster = source.id;
	if(channel) {
		mask.cause_level = channel.level;
		mask.cause = channel.id;
	}

	for(i=0; i<effects.length; i++) {
		effect = effects[i];
		if(universe.isValid(effect) && (!effect.hit_required || hit) && (!effect.is_hit_required || hit) && (!effect.damage_required || damaged) && (!effect.is_damage_required || damaged) && (!effect.is_fail_required || !saved)) {
			mask.expiration = effect.duration?universe.time+effect.duration:undefined;
			waiting.push(universe.copyPromise(effect, mask));
		}
	}

	if(waiting.length) {
		Promise.all(waiting)
		.then(function(instilling) {
			var instill = [],
				i;
			for(i=0; i<instilling.length; i++) {
				universe.trackExpiration(instilling[i], target.id, "effects");
				instill.push(instilling[i].id);
			}
			target.addValues({
				"effects": instill
			});
		})
		.catch(function(err) {
			console.error("Error instilling effects: ", err);
			universe.generalError("effects:instill", err, "Error while instilling effects", {
				"channel": channel?channel.id:null,
				"source": source?source.id:null,
				"target": target?target.id:null,
				"error": err
			});
		});
	}
};

/**
 * If the object has a defined consume, that is used as a count.
 * 
 * If the object has charges, the charges are consumed first.
 * 
 * If the object has no charges left (with charges or not), consume_to is checked to remove
 * the object from the source and replace it.
 * 
 * If consume is set with no consume_to, the object is removed.
 * 
 * If consume_from is defined, that is consumed as well as part of this consumption and if they
 * have defined "consume_to"s, those are processed into the "yield" for this operation.
 * @method consumeObject
 * @param {Universe} universe 
 * @param {String | Object} source This object or ID Consuming the channel 
 * @param {String | Object} consuming This object or ID of what is being consumed (Feat, Item, Entity, Effect, etc.) Special case for
 * 		Recipes and Spells where they are not intended to be "consumed" but follow the samefield definitions for consume_from & yield.
 * @param {Array | String | Object} targets Of the consumed channel (Such as someone using a healing potion on someone else)
 * @param {Object} checks Mapping targets to skill checks or saves
 * @param {Boolean} [abort] When true, this process returns any preventative problems before processing. Defaults to false.
 * @param {String} [within] Where the consuming object should be on source. Defaults based on the `STANDARD_MAP`
 * @param {Object} [map] Indicating where yielded objects should be placed by class. Defaults to the utility's `STANDARD_MAP`
 * @return {Array} Of encountered problems. Gaurenteed to exist. If empty, success.
 */
module.exports.consumeObject = function(universe, source, consuming, targets, checks, abort = false, within, map) {
	map = map || STANDARD_MAP;
	var problems = [],
		lossSubs = {}, // Source Loss (Sub)
		lossSets = {},
		yields = [], // Target(s) Gains - Placed by map
		saved = {}, // Maps target to boolean for successful save or not by the `checks` rolls and consuming.dc
		add = {}, // Modify Channel (ie. Charges for Items/Feats/etc.)
		set = {},
		sub = {},
		loading,
		buffer, // Buffer Variables
		i;

	if(typeof(source) === "string") {
		source = universe.get(source);
	}
	if(typeof(consuming) === "string") {
		consuming = universe.get(consuming);
	}
	if(targets && targets instanceof Array) {
		universe.transcribeArray(targets);
	} else {
		targets = [];
	}
	if(targets.length === 0) {
		targets.push(source);
	}
	if(source && consuming) {
		// Does Source have the object?
		within = universe.field(within || STANDARD_MAP[consuming._class]);
		if(within) {
			if(source[within.id]) {
				if(within.type.startsWith("array") && source[within.id].indexOf && source[within.id].indexOf(consuming.id) !== -1) {
					if(consuming.consume) {
						if(!lossSubs[within.id]) {
							lossSubs[within.id] = [];
						}
						lossSubs[within.id].push(consuming.id);
					}
				} else if(source[within.id].indexOf && source[within.id].indexOf(consuming.id) !== -1) {
					if(consuming.consume) {
						lossSets[within.id] = null;
					}
				} else {
					universe.warnMasters("Source " + source.name + "[" + source.id + "] does not properly contain the consumed object " + consuming.name + "[" + consuming.id + "]", {"consuming": consuming.id, "source": source.id, "class": source._class});
					problems.push("Source " + source.name + " does not properly contain " + consuming.name);
					within = null;
				}
			}
		} else {
			universe.warnMasters("Unable to determine container for consume operation for " + source.name + " [ " + source.id + " ] consuming " + consuming.name + " [ " + consuming.id + " ]", {"consuming": consuming.id, "source": source.id, "class": source._class});
			problems.push("Source " + source.name + " does not properly contain " + consuming.name);
			within = null;
		}

		if(consuming.charges_max) {
			if(consuming.charges) {
				if(!add) {
					add = {};
				}
				add.charges = -1 * consuming.consume;
				if(consuming.consume) {
					delete(lossSubs[within.id]);
					delete(lossSets[within.id]);
				}
			} else if(consuming.consume_to && consuming.consume_to.length) {
				yields.push.apply(yields, consuming.consume_to);
			}
		}

		// Do we have general "items" that aren't consumed (General check, skip if not aborting)
		// TODO: Generalize for consolidation with consume_from?
		if(!abort /* Not Worth Checking */ && consuming.items && consuming.items.length) {
			for(i=0; i<consuming.items.length; i++) {
				buffer = universe.get(consuming.items[i]);
				if(buffer) {
					loading = universe.field(map[buffer._class]); // TODO: Better leverage field data
					if(source[map[buffer._class]]) {
						if(source[map[buffer._class]] !== consuming.consume_from[i] && (!source[map[buffer._class]].indexOf || source[map[buffer._class]].indexOf(consuming.consume_from[i]) === -1)) {
							problems.push("Missing required non-consumed component " + buffer.name);
						}
					} else {
						problems.push("Nothing contained in or for " + (loading?loading.name:map[buffer._class]));
					}
				} else {
					// Warn but do not block for bad data
					universe.warnMasters("Unable to retrieve consume_from component (" + consuming.consume_from[i] + ") for channel " + consuming.name + "[" + consuming.id + "]", {"consuming": consuming.id, "source": source.id, "class": source._class});
				}
			}
		}

		// Do we have consume_from (Add to lossSubs && Append their "consume_to" to yield)
		if(consuming.consume_from && consuming.consume_from.length) {
			for(i=0; i<consuming.consume_from.length; i++) {
				buffer = universe.get(consuming.consume_from[i]);
				if(buffer) {
					loading = universe.field(map[buffer._class]); // TODO: Better leverage field data
					if(source[map[buffer._class]]) {
						if(source[map[buffer._class]] === consuming.consume_from[i]) {
							lossSets[map[buffer._class]] = null;
							if(buffer.consume_to && buffer.consume_to.length) {
								yields.push.apply(yields, buffer.consume_to);
							}
						} else if(source[map[buffer._class]].indexOf && source[map[buffer._class]].indexOf(consuming.consume_from[i]) !== -1) {
							if(!lossSubs[map[buffer._class]]) {
								lossSubs[map[buffer._class]] = [];
							}
							lossSubs[map[buffer._class]].push(consuming.consume_from[i]);
							if(buffer.consume_to && buffer.consume_to.length) {
								yields.push.apply(yields, buffer.consume_to);
							}
						} else {
							problems.push("Missing comsumed component " + buffer.name);
						}
					} else {
						problems.push("Nothing contained in or for " + (loading?loading.name:map[buffer._class]));
					}
				} else {
					// Warn but do not block for bad data
					universe.warnMasters("Unable to retrieve consume_from component (" + consuming.consume_from[i] + ") for channel " + consuming.name + "[" + consuming.id + "]", {"consuming": consuming.id, "source": source.id, "class": source._class});
				}
			}
		}

		// Do we abort?
		if(abort && problems.length) {
			return problems;
		}

		// Update the channel if needed
		consuming.addValues(add);
		consuming.setValues(set);
		consuming.subValues(sub);

		// Remove Losses
		source.subValues(lossSubs);
		source.setValues(lossSets);

		// Copy all yield objects for each target
		targets.forEach(function(target) {
			var meeting = universe.manager.meeting.object[universe.manager.setting.object["setting:meeting"]],
				loading = [],
				meet = {},
				mask = {},
				add = {},
				set = {},
				i;

			meet.entities = [];

			// Establish Mask
			mask.character = target.id;
			mask.cause = consuming.id;
			mask.cause_level = consuming.level;
			mask.caster = source.id;

			for(i=0; i<yields.length; i++) {
				loading.push(universe.copyPromise(yields[i], mask));
			}
			Promise.all(loading)
			.then(function(yielded) {
				var j;

				for(j=0; j<yielded.length; j++) {
					// TODO: Implement considerations for fields missing - They are currently gaurenteed for Objects & Arrays for things like this
					buffer = yielded[j];
					if(map[buffer._class]) {
						switch(map[buffer._class]) {
							case "@meeting.entities":
								meet.entities.push(buffer.id);
								break;
							default:
								if(target[map[buffer._class]] instanceof Array) {
									if(!add[map[buffer._class]]) {
										add[map[buffer._class]] = [];
									}
									add[map[buffer._class]].push(buffer.id);
								} else {
									set[map[buffer._class]] = buffer.id;
								}
						}
					} else {
						problems.push("No class mapping for " + buffer._class + " defined in the mapping for consume");
					}
				}

				target.addValues(add);
				target.setValues(set);
				if(meeting) {
					meeting.addValues(meet);
				}
			});
		});
	}

	return problems;
};
