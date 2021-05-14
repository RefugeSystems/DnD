
/*
 * Device | Character | Item - Level locking for display calculated vs display formula
 * Info display events support objects that specify record & entity to support calculated displays
 * 		Feed entity from source click
 * Fix null reference possibilities in the Information Panel
 */

/**
 *
 * @class RSCalculator
 * @constructor
 * @param {RSUniverse} universe
 */
class RSCalculator {
	constructor(universe) {
		this.variableExpression = new RegExp("([a-z_]+)\.?([a-z:_]+)?", "g");
		this.securityExpression = new RegExp("^[<>a-zA-Z0-9\\(\\)+-\\/\\* ]*$");
		this.reductionExpression = new RegExp("[ \\(\\)\\[\\]:-]+", "g");
		this.trimLeadExpression = new RegExp("^_+");
		this.trimEndExpression = new RegExp("_+$");

		this.universe = universe;

		/**
		 * Serves to map short names for properties to their proper keys.
		 *
		 * For instance "melee" should map to "skill:melee" in the case of that skill existing and
		 * being named that way.
		 *
		 * All skills are loaded from the universe and mapped using a lower case name with "_" between
		 * spaces and parenthesis. Additionally "Ranged (Light)" would become "ranged_light" with the
		 * trailing "_" trimmed and the " (" combination becoming one "_".
		 * @property skillMapping
		 * @type Object
		 */
		this.skillMapping = {};

		this.universe.$on("universe:modified", this.updateSkillMappings);
		this.universe.$on("initialized", this.updateSkillMappings);
	}

	/**
	 *
	 * @
	 */
	updateSkillMappings() {
		var skill,
			name,
			x;

		if(this.universe && this.universe.indexes && this.universe.indexes.skill) {
			for(x=0; x<this.universe.indexes.skill.listing.length; x++) {
				skill = this.universe.indexes.skill.listing[x];
				name = skill.name.replace(this.reductionExpression, "_").replace(this.trimLeadExpression, "").replace(this.trimEndExpression,"").toLowerCase();
				this.skillMapping[name] = skill.propertyKey;
			}
		}
	}

	/**
	 *
	 * @method display
	 * @param {String} expression
	 * @param {RSObject} [source]
	 * @param {Object} [base]
	 * @param {Object} [target]
	 * @return {Number}
	 */
	display(expression, source, base, target) {

	}

	/**
	 *
	 * @method process
	 * @param {String} expression
	 * @param {RSObject} source
	 * @param {Object} [base]
	 * @param {Object} [target]
	 * @return {Number}
	 */
	process(expression, source, base, target) {
		var variableExpression = new RegExp("([a-z_]+)\.?([a-z:_]+)?", "g");

//		console.log("Received Expression: ", expression, source, base, target);
		if(!source) {
			return expression;
		} else if(!expression || typeof(expression) === "number") {
//			console.trace("Expressionless Calculation? ", expression, source, base, target);
			return expression;
		}

		var processed = expression,
			variables,
			buffer;

		if(this.universe.debug) {
			console.log("Calculation: ", this);
		}
		while(variables = variableExpression.exec(expression)) {
			if(this.universe.debug) {
				console.log("Var Calculation: ", expression, source, base, target, variables);
			}
			if(variables.length === 3 && variables[2] !== undefined && variables[2] !== null) {
				switch(variables[1]) {
					case "source":
						if(source) {
							processed = processed.replace(variables[0], parseInt(source[this.skillMapping[variables[2]] || variables[2]]) || 0);
						} else {
//							console.warn("Unable to calculate with 'source' as it was omitted: " + expression, source, base, target);
							return expression;
						}
						break;
					case "target":
						if(target) {
							processed = processed.replace(variables[0], parseInt(target[variables[2]]) || 0);
						} else {
//							console.warn("Unable to calculate with 'target' as it was omitted: " + expression, source, base, target);
							return expression;
						}
						break;
					case "character":
					case "entity":
					case "ship":
					case "base":
						if(base) {
							processed = processed.replace(variables[0], parseInt(base[variables[2]]) || 0);
						} else {
//							console.warn("Unable to calculate with 'base' as it was omitted: " + expression, source, base, target);
							return expression;
						}
						break;
					case "starting":
						// These are intentionally ignored as not used by the calculator
						// TODO: Address startup stat calculation [#172779816]
						processed = processed.replace(variables[0], 0);
						break;
					default:
						console.warn("Calculator - Unknown variable root", expression, variables);
						return expression;
				}
			} else {
				if(typeof(processed) === "string") {
					buffer = this.skillMapping[variables[1]] || variables[1];
					if(this.universe.debug) {
						console.log("Check: ", this, buffer, source, base, variables);
					}
					if(source && source[buffer]) {
						processed = processed.replace(variables[0], parseInt(source[buffer]) || 0);
					} else if(base && base[buffer]) {
						processed = processed.replace(variables[0], parseInt(base[buffer]) || 0);
					} else {
						return expression;
					}
				}
			}
		}

		expression = processed;

		if(expression && typeof(expression) === "string" && expression.length < 150 && this.securityExpression.test(expression)) {
			try {
				return eval(expression);
			} catch(ignored) {
				console.error("Exception[" + source.id + "]: " + expression + "\n", ignored);
				return expression;
			}
		} else {
			return expression;
		}
	}
}
