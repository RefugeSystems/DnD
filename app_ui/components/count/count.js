
/**
 *
 *
 * @class rsCount
 * @constructor
 * @module Components
 * @zindex 5
 */
rsSystem.component("rsCount", {
	"inherit": true,
	"mixins": [
	],
	"props": {
		"entity": {
			"type": Object
		},
		"accuracy": {
			"default": 2,
			"type": Number
		},
		"editable": {
			"default": false,
			"type": Boolean
		},
		"initial": {
			"default": "add",
			"type": String
		},
		"value": {

		}
	},
	"data": function() {
		var data = {};

		data.expression = "";
		data.open = false;
		data.operation = this.initial;
		data.operations = {
			"add": {
				"icon": "far fa-plus-square rs-orange"
			},
			"sub": {
				"icon": "far fa-minus-square rs-orange"
			},
			"sum": {
				"icon": "far fa-sigma rs-orange"
			}
		};
		data.ops = ["add", "sub", "sum"];
		//data.ops = Object.keys(data.operations);

		data.shadow = this.toNumber(this.value || 0);
		data.toggleElement = null;
		data.focusOn = null;

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		Vue.set(this, "toggleElement", this.$el.getElementsByClassName("op-toggle")[0]);
		Vue.set(this, "focusOn", this.$el.getElementsByClassName("op-expression")[0]);
	},
	"methods": {
		"toNumber": function(value, accuracy) {
			return parseFloat(parseFloat(value).toFixed(this.accuracy));
		},
		"cancel": function() {
			Vue.set(this, "operation", this.initial);
			Vue.set(this, "expression", "");
			Vue.set(this, "open", false);
		},
		"complete": function() {
			var expression = this.expression,
				value;

			if(expression.length) {
				switch(expression[0]) {
					case "=":
						expression = expression.substring(1);
						Vue.set(this, "operation", "sum");
						break;
					case "-":
						expression = expression.substring(1);
						Vue.set(this, "operation", "sub");
						break;
					case "+":
						expression = expression.substring(1);
						Vue.set(this, "operation", "add");
						break;
				}
			}

			value = Dice.calculateDiceRoll(expression, this.entity).sum;
			value = this.toNumber(value);

			if(value) {
				switch(this.operation) {
					case "sub":
						value = this.toNumber(this.value - value);
						break;
					case "add":
						value = this.toNumber(this.value + value);
						break;
					case "sum":
						// Set to input value
						break;
					default:
						console.warn("Unknown Operation: " + this.operation);
						value = NaN;
				}

//				console.log("Process '" + this.operation + "' Expression[" + this.expression + "]: " + this.value + ", " + value);
				if(!isNaN(value)) {
					this.$emit("change", value);
					this.$emit("input", value);
				}
			}

			Vue.set(this, "open", false);
			if(document.activeElement == this.focusOn) {
				this.focusOn.blur();
			}
			if(this.toggleElement) {
				setTimeout(() => {
					this.toggleElement.focus();
				}, 0);
			}
		},
		"toggle": function() {
			if(this.open && document.activeElement != this.focusOn) {
				this.complete();
			} else {
				Vue.set(this, "operation", this.initial);
				if(this.focusOn) {
					this.focusOn.focus();
				}
				Vue.set(this, "open", true);
			}
		},
		"nextOp": function() {
			if(this.open) {
				Vue.set(this, "operation", this.ops[(this.ops.indexOf(this.operation) + 1)%this.ops.length]);
			} else {
				Vue.set(this, "operation", this.initial);
				if(this.focusOn) {
					this.focusOn.focus();
				}
				Vue.set(this, "open", true);
			}
		}
	},
	"template": Vue.templified("components/count.html")
});
