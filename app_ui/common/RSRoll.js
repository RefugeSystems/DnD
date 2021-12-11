/**
 * 
 * @class Roll
 * @constructor
 * @param {Object} [details]
 * @param {String} [details.id]
 * @param {String} [details.name]
 * @param {String} [details.formula]
 * @param {String} [details.title]
 * @param {Object} [details.dice_rolls]
 * @param {Array} [details.dice_rolls.vantage] Specifically for d20 rolls and holds
 * 		the 2 rolls performed, the first was kept and the second was discarded.
 * @param {Object} [details.manual]
 */
class Roll {
	constructor(details = {}) {
		/**
		 * Identifier for interacting with the roll across clients and the server
		 * @property id
		 * @type String
		 */
		this.id = details.id || Random.identifier("roll");
		/**
		 * The result of the roll. This may be a string with a formula instead of a straight value.
		 * 
		 * For instance "15 + 50%" is a valid full outcome for a resistance roll.
		 * 
		 * Additionally, submission of "6d6 + 50%" to the server should be allowed.
		 * @property computed
		 * @type String | Integer
		 */
		this.computed = details.computed; // Left undefined for input placeholders to display when no initial data is present
		/**
		 * Name to display for the roll
		 * @property name
		 * @type String
		 */
		this.name = details.name || "";
		/**
		 * Title for the roll to drive HTML hover displays
		 * @property title
		 * @type String
		 */
		this.title = details.title || "";
		/**
		 * Formula for the this roll
		 * @property formula
		 * @type String
		 */
		if(typeof(details) === "string") {
			this.formula = details;
		} else {
			if(typeof(details.formula) === "string") {
				this.formula = details.formula;
			} else if(typeof(details.formula) === "number") {
				this.formula = details.formula.toString();
			} else {
				this.formula = (details.formula || "").toString();
			}
		}
		/**
		 * Maps a dice type (ie. d6 or d20) to an array of rolls related to computing this rolls value
		 * @property dice_rolls
		 * @type Object
		 */
		this.dice_rolls = Object.assign({}, details.dice_rolls);
		/**
		 * Multiply the dice values by this number for soe variability.
		 * 
		 * This was implemented to support "2x Dice Value" for critical strikes.
		 * @property dice_multiplier
		 * @type Object
		 */
		this.dice_multiplier = details.dice_multiplier || 1;
		/**
		 * Applies only to d20 rolls and lists all results
		 * @property dice_rolls.vantage
		 * @deprecated Use `this.rerolled.d20`
		 * @type Array
		 */
		/**
		 * Maps a dice type (ie. d6 or d20) to an array of rolls of that dice for this roll. This is to
		 * help track discarded rolls.
		 * @property rerolled
		 * @type Object
		 */
		this.rerolled = Object.assign({}, details.rerolled);
		/**
		 * Used for d20 critical/failure detection.
		 * @property entity
		 * @type RSObject
		 */
		this.entity = details.entity;
		/**
		 * Used for formula calculation and in the case of entity skill checks serves for d20 critical/failure detection.
		 * @property source
		 * @type RSObject
		 */
		this.source = details.source;
		/**
		 * Indicates if this roll is immediately considered a sucessful roll.
		 * @property is_critical
		 * @type Boolean
		 */
		this.is_critical = false;
		/**
		 * Indicates if this roll is immediately considered a failed roll.
		 * @property is_failure
		 * @type Boolean
		 */
		this.is_failure = false;
		/**
		 * When true, this roll should be highlighted in some fashion to indicate outside focus.
		 * @property is_focused
		 * @type Boolean
		 */
		this.is_focused = false;
	}
	/**
	 * Copy the parts of a roll that label (name, title, formula) it but not that roll's individual data, such as the
	 * is_critical, dice rolls, or source properties.
	 * @method copy
	 * @param {Roll} roll 
	 */
	copy(roll) {
		Vue.set(this, "name", roll.name);
		Vue.set(this, "title", roll.title);
		Vue.set(this, "formula", roll.formula);
	}
	/**
	 * 
	 * @method setDiceMultiplier
	 * @param {Number} multiplier
	 */
	setDiceMultiplier(multiplier) {
		Vue.set(this, "dice_multiplier", multiplier);
		this.recalculate();
	}
	/**
	 * 
	 * @method setEntity
	 * @deprecated Use `setSource`
	 * @param {RSObject} entity
	 */
	setEntity(entity) {
		Vue.set(this, "entity", entity);
		Vue.set(this, "source", entity);
	}
	/**
	 * 
	 * @method setSource
	 * @param {RSObject} source
	 */
	setSource(source) {
		Vue.set(this, "source", source);
	}
	/**
	 * 
	 * @method setFormula
	 * @param {String} formula
	 */
	setFormula(formula) {
		Vue.set(this, "formula", formula);
	}
	/**
	 * Clear out current roll data.
	 * @method clear
	 */
	clear() {
		var die,
			i;
		Vue.delete(this, "computed");
		for(i=0; i<rsSystem.dnd.dice.length; i++) {
			die = rsSystem.dnd.dice[i];
			Vue.delete(this.rerolled, die);
			Vue.delete(this.dice_rolls, die);
		}
		Vue.set(this, "is_critical", false);
		Vue.set(this, "is_failure", false);
	}
	/**
	 * 
	 * @method focused
	 */
	focused() {
		Vue.set(this, "is_focused", true);
	}
	/**
	 * 
	 * @method blurred
	 */
	blurred() {
		Vue.set(this, "is_focused", false);
	}
	/**
	 * 
	 * @method roll
	 * @param {RSObject} [source]
	 * @param {String} [formula]
	 * @returns {integer}
	 */
	roll(source, formula) {
		var result = 0,
			percent,
			rolls,
			dice,
			roll,
			i,
			j;
		
		// Parse Formula
		formula = rsSystem.dnd.parseDiceRoll(rsSystem.dnd.reducedDiceRoll(formula || this.formula, source || this.source || this.entity));
		console.log("Rolling: ", formula, source, this.source);

		// Clear any previous data
		dice = Object.keys(this.dice_rolls);
		for(i=0; i<dice.length; i++) {
			this.dice_rolls[dice[i]].splice(0);
		}

		// Roll
		dice = Object.keys(formula);
		for(i=0; i<dice.length; i++) {
			rolls = rsSystem.dnd.compute(formula[dice[i]]);
			if(dice[i][0] === "d") {
				if(!this.dice_rolls[dice[i]]) {
					Vue.set(this.dice_rolls, dice[i], []);
				}
				for(j=0; j<rolls; j++) {
					roll = rsSystem.dnd.diceRoll(dice[i]);
					this.dice_rolls[dice[i]].push(roll);
					result += Math.floor(this.dice_multiplier * roll);
				}
			}
		}

		// Factor in remainders
		if(formula.remainder) {
			result += rsSystem.dnd.compute(formula.remainder);
		}
		if(formula["%"]) {
			percent = rsSystem.dnd.compute(formula["%"]);
			result += Math.floor(result * (percent/100));
		}

		// Result
		Vue.set(this, "computed", result);
		this.checkState();
		return result;
	}
	/**
	 * Use existing dice values and dice multiplier values to recalculate the
	 * computed result for the roll.
	 * @method recalculate
	 */
	recalculate() {
		var result = 0,
			percent,
			formula,
			rolls,
			dice,
			roll,
			i,
			j;

		if(this.formula && this.dice_rolls) {
			formula = rsSystem.dnd.parseDiceRoll(rsSystem.dnd.reducedDiceRoll(this.formula, this.source || this.entity));
			console.log("Recalculating: ", formula, this.source);
			// Roll
			dice = Object.keys(formula);
			for(i=0; i<dice.length; i++) {
				rolls = rsSystem.dnd.compute(formula[dice[i]]);
				if(dice[i][0] === "d") {
					if(this.dice_rolls[dice[i]]) {
						for(j=0; j<rolls; j++) {
							roll = this.dice_rolls[dice[i]][j] || 0;
							result += Math.floor(this.dice_multiplier * roll);
						}
					}
				}
			}
			if(formula.remainder) {
				result += rsSystem.dnd.compute(formula.remainder);
			}
			if(formula["%"]) {
				percent = rsSystem.dnd.compute(formula["%"]);
				result += Math.floor(result * (percent/100));
			}
			Vue.set(this, "computed", result);
		}
	}
	/**
	 * 
	 * @method add
	 * @param {String} dice ie. d6 or d11
	 */
	add(dice) {
		var result = rsSystem.dnd.diceRoll(dice),
			parsed;

		if(!this.dice_rolls[dice]) {
			Vue.set(this.dice_rolls, dice, []);
		}
		this.dice_rolls[dice].push(result);

		if(typeof(this.computed) === "number") {
			Vue.set(this, "computed", (this.computed || 0) + result);
		} else if(typeof(this.computed) === "string") {
			parsed = rsSystem.dnd.parseDiceRoll(this.computed);
			parsed.remainder = parseInt(parsed.remainder || 0) + result;
			Vue.set(this, "computed", rsSystem.dnd.reducedDiceRoll(parsed));
		} else {
			console.warn("Failed to preserve previous Roll value - Computed roll value is currently non-sense: ", _p(this));
			Vue.set(this, "computed", result);
		}

		this.checkState();
	}
	/**
	 * 
	 * @method remove
	 * @param {String} dice Which die to remove
	 * @param {Integer} index From the dice_rolls list to remove
	 */
	 remove(dice, index) {
		if(this.dice_rolls[dice] && index < this.dice_rolls[dice].length) {
			var result = this.dice_rolls[dice][index],
				parsed;

			result = Math.floor(this.dice_multiplier * result);
			this.dice_rolls[dice].splice(index, 1);

			if(typeof(this.computed) === "number") {
				Vue.set(this, "computed", (this.computed || 0) - result);
			} else if(typeof(this.computed) === "string") {
				parsed = rsSystem.dnd.parseDiceRoll(this.computed);
				parsed.remainder = parseInt(parsed.remainder || 0) - result;
				Vue.set(this, "computed", rsSystem.dnd.reducedDiceRoll(parsed));
			} else {
				console.warn("Failed to preserve previous Roll value - Computed roll value is currently non-sense: ", _p(this));
				Vue.set(this, "computed", -1 * result);
			}

			this.checkState();
		}
	}
	/**
	 * 
	 * @method reroll
	 * @param {String} dice Which die to remove
	 * @param {Integer} index From the dice_rolls list to remove
	 * @param {Integer} [keep] Indicates if a the lower or greater value should be kept.
	 * 		Undefined or 0 simply rerolls, `keep > 0` means keep the higher of the 2 values,
	 * 		and `keep < 0` means to keep the lower of the 2 values.
	 */
	 reroll(dice, index, keep) {
		if(this.dice_rolls[dice] && index < this.dice_rolls[dice].length) {
			var current = this.dice_rolls[dice][index],
				result = rsSystem.dnd.diceRoll(dice),
				parsed;

			if(!this.rerolled[dice]) {
				Vue.set(this.rerolled, dice, []);
			}

			if(isNaN(keep) || keep === 0 || (keep < 0 && current > result) || (keep > 0 && current < result)) {
				current = Math.floor(this.dice_multiplier * current);
				result = Math.floor(this.dice_multiplier * result);
				this.rerolled[dice].unshift(current);
				this.dice_rolls[dice][index] = result;

				if(typeof(this.computed) === "number") {
					Vue.set(this, "computed", (this.computed || 0) - current + result);
				} else if(typeof(this.computed) === "string") {
					parsed = rsSystem.dnd.parseDiceRoll(this.computed);
					parsed.remainder = parseInt(parsed.remainder || 0) + result - current;
					Vue.set(this, "computed", rsSystem.dnd.reducedDiceRoll(parsed));
				} else {
					console.warn("Failed to preserve previous Roll value - Computed roll value is currently non-sense: ", _p(this));
					Vue.set(this, "computed", result - current);
				}
			} else {
				this.rerolled[dice].unshift(result);
			}
		}
		this.checkState();
	}
	/**
	 * 
	 * @method checkState
	 */
	checkState() {
		if(this.source && this.dice_rolls.d20 && this.dice_rolls.d20.length) {
			if(this.dice_rolls.d20[0] >= this.source.skill_critical) {
				Vue.set(this, "is_critical", true);
				Vue.set(this, "is_failure", false);
			} else if(this.dice_rolls.d20[0] <= this.source.skill_failure) {
				Vue.set(this, "is_critical", false);
				Vue.set(this, "is_failure", true);
			} else {
				Vue.set(this, "is_critical", false);
				Vue.set(this, "is_failure", false);
			}
		} else if(this.entity && this.dice_rolls.d20 && this.dice_rolls.d20.length) {
			if(this.dice_rolls.d20[0] >= this.entity.skill_critical) {
				Vue.set(this, "is_critical", true);
				Vue.set(this, "is_failure", false);
			} else if(this.dice_rolls.d20[0] <= this.entity.skill_failure) {
				Vue.set(this, "is_critical", false);
				Vue.set(this, "is_failure", true);
			} else {
				Vue.set(this, "is_critical", false);
				Vue.set(this, "is_failure", false);
			}
		}
	}

	toJSON() {
		return {
			"computed": this.computed,
			"result": this.computed, // Legacy
			"name": this.name,
			"formula": this.formula,
			"dice_rolls": this.dice_rolls,
			"rerolled": this.rerolled,
			"is_critical": this.is_critical,
			"is_failure": this.is_failure
		};
	}
}

/**
 * 
 * @class RSRoll
 * @extends Roll
 * @constructor
 * @param {Object} [details] 
 * @param {String} [details.id] 
 * @param {String} [details.name] 
 * @param {String} [details.formula] 
 * @param {String} [details.title] 
 * @param {Object} [details.dice_rolls] 
 * @param {Array} [details.dice_rolls.vantage] Specifically for d20 rolls and holds
 * 		the 2 rolls performed, the first was kept and the second was discarded.
 * @param {Object} [details.rerolled] 
 * @param {Object} [details.manual] 
 */
var RSRoll = Roll;
