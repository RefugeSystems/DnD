
/**
 *
 *
 * @class dndCreateCharacterDialog
 * @constructor
 * @module Components
 */
rsSystem.component("dndCreateCharacterDialog", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSCore
	],
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"computed": {
		"races": function() {
			var selectable = [],
				x;
			for(x=0; x<this.universe.listing.race.length; x++) {
				if(this.universe.listing.race[x].playable) {
					selectable.push(this.universe.listing.race[x]);
				}
			}
			return selectable;
		},
		"classes": function() {
			var selectable = [],
				x;
			for(x=0; x<this.universe.listing.archetype.length; x++) {
				if(this.universe.listing.archetype[x].playable) {
					selectable.push(this.universe.listing.archetype[x]);
				}
			}
			return selectable;
		}
	},
	"data": function() {
		var data = {};
		
		data.stage = 0;
		data.stages = [
			"race",
			"variant",
			"archetype",
			"background",
			"alignment",
			"feats",
			"proficiencies",
			"details", // Name, Description
			"review"
		];
		
		data.building = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
	},
	"methods": {
		"infoRecord": function(record) {
			console.log("Character Select");
			if(this.$route.query.info !== record.id) {
				rsSystem.manipulateQuery({
					"info": record.id
				});
			} else {
				rsSystem.manipulateQuery({
					"info": null
				});
				switch(this.stage) {
					case 0: this.chooseRace(record);
						break;
					default:
						rsSystem.log.error("Unknown Character Building Stage: " + this.stage);
				}
			}
		},
		"chooseRace": function(record) {
			console.log("Chosen Race: ", record);
			Vue.set(this.building, this.stages[this.stage], record.id);
			this.forward();
		},
		"chooseClass": function(record) {
			console.log("Chosen Class: ", record);
			Vue.set(this.building, this.stages[this.stage], record.id);
			this.forward();
		},
		"getProgressInidcatorStyle": function() {
			return "width:" + (100*(this.stage/(this.stages.length-1))).toFixed(2) + "%;";
		},
		"forward": function() {
			if(this.stage < this.stages.length - 1) {
				Vue.set(this, "stage", this.stage + 1);
			}
		},
		"backward": function() {
			if(this.stage > 0) {
				Vue.set(this, "stage", this.stage - 1);
			}
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/dialogs/creation/character.html")
});
