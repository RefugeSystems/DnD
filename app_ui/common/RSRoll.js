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
		 * The result of the roll
		 * @property computed
		 * @type integer
		 */
		this.computed = details.computed || 0;
		/**
		 * Name to display for the roll
		 * @property name
		 * @type String
		 */
		this.name = details.name || "";
		/**
		 * Title to display for the roll
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
			this.formula = details.formula || "";
		}
		/**
		 * Maps a dice type (ie. d6 or d20) to an array of rolls related to computing this rolls value
		 * @property dice_rolls
		 * @type Object
		 */
		this.dice_rolls = Object.assign({}, details.dice_rolls);
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
	focused() {
		Vue.set(this, "is_focused", true);
	}
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
		formula = rsSystem.dnd.parseDiceRoll(rsSystem.dnd.reducedDiceRoll(this.formula, source));
		
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
					result += roll;
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
		return result;
	}
	/**
	 * 
	 * @method add
	 * @param {String} dice ie. d6 or d11
	 */
	add(dice) {
		var result = rsSystem.dnd.diceRoll(dice);
		if(!this.dice_rolls[dice]) {
			Vue.set(this.dice_rolls, dice, []);
		}
		this.dice_rolls[dice].push(result);
		Vue.set(this, "computed", this.computed + result);
	}
	/**
	 * 
	 * @method remove
	 * @param {String} dice Which die to remove
	 * @param {Integer} index From the dice_rolls list to remove
	 */
	 remove(dice, index) {
		if(this.dice_rolls[dice] && index < this.dice_rolls[dice].length) {
			var result = this.dice_rolls[dice][index];
			this.dice_rolls[dice].splice(index, 1);
			Vue.set(this, "computed", this.computed - result);
		}
	}
	/**
	 * 
	 * @method reroll
	 * @param {String} dice Which die to remove
	 * @param {Integer} index From the dice_rolls list to remove
	 */
	 reroll(dice, index) {
		if(this.dice_rolls[dice] && index < this.dice_rolls[dice].length) {
			var result = this.dice_rolls[dice][index];
			this.dice_rolls[dice][index] = rsSystem.dnd.diceRoll(dice);
			Vue.set(this, "computed", this.computed - result + this.dice_rolls[dice][index]);
		}
	}
}
