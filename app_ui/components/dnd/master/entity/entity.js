
/**
 *
 *
 * @class DNDMasterEntity
 * @constructor
 * @module Components
 */
rsSystem.component("dndMasterEntity", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"entity": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"profile": {
			"required": true,
			"type": Object
		},
		"rolled": {
			"required": true,
			"type": Object
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"rolls": function() {
			var rolls = [],
				roll,
				i;

			if(this.rolled[this.entity.id]) {
				console.log(" > Exists");
				for(i=0; i<this.rolled[this.entity.id].length; i++) {
					console.log(" > Adding " + i);
					roll = this.rolled[this.entity.id][i];
					// TODO: Skill Check
					if(roll) {
						console.log(" > Added");
						rolls.push(roll);
					}
				}
			}

			console.log(" = Returned");
			return rolls;
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
		"giveGold": function() {

		},
		"givePoints": function() {

		},
		"giveEffects": function() {

		},
		"openRoll": function(roll) {

		},
		"dismissRoll": function(index) {
			if(this.rolled[this.entity.id]) {
				this.rolled[this.entity.id].splice(index, 1);
			}
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/master/entity.html")
});
