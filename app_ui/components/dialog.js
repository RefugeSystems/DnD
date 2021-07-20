/**
 *
 *
 * @class DialogController
 * @constructor
 * @module Components
 */
rsSystem.component("DialogController", {
	"inherit": true,
	"mixins": [
		rsSystem.components.RSCore
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);

	},
	"methods": {
		"performAction": function(action, using) {
			// TODO: Check for action rolls and open roll dialog if needed
			var action = this.universe.index.action[action],
				perform = {},
				response,
				i;

			console.log("Action: ", this.entity, action, using, perform);
			if(this.entity && action) {
				perform.action = action.id;
				perform.source = this.entity.id;
				perform.channel = using;
				this.universe.send("action:perform", perform);
				console.log(" > Sent: ", perform);
				
				if(this.entity.response && this.entity.response[action.id]) {
					for(i=0; i<this.entity.response[action.id].length; i++) {
						response = this.entity.response[action.id][i];
						console.log("UI Response: ", response);
						if(response && response.ui) {
						}
					}
				}
			} else {
				// Should only happen during development
				console.warn("Action or Entity not found: ", this);
			}
		},
		"computeRoll": function(formula, source) {
			return rsSystem.dnd.reducedDiceRoll(formula, source);
		},
		/**
		 * 
		 * @method sortByLevel
		 * @param {Object} a 
		 * @param {Object} b 
		 * @returns {Integer}
		 */
		"sortByLevel": function(a, b) {
			if(a.level < b.level) {
				return -1;
			} else if(a.level > b.level) {
				return 1;
			} else if(a.name < b.name) {
				return -1;
			} else if(a.name > b.name) {
				return 1;
			}
			return 0;
		},
		"sortData": rsSystem.utility.sortData,
		"noOp": function() {}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	}
});
