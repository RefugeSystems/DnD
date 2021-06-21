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
		this.id = details.id;
		/**
		 * The result of the roll
		 * @property computed
		 * @type integer
		 */
		this.computed = details.computed || "";
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
	}
}
