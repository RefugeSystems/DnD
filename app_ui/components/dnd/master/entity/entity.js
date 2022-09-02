
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
		"classes": function() {
			var archetypes = this.entity.archetypes,
				classing = {},
				classes = [],
				result = [],
				archetype,
				i;

			if(archetypes && archetypes.length) {
				for(i=0; i<archetypes.length; i++) {
					archetype = this.universe.get(archetypes[i]);
					if(archetype && archetype.root) {
						if(!classing[archetype.id]) {
							classing[archetype.id] = {};
							classing[archetype.id].prefix = [];
						}
						if(archetype.subclassing) {
							if(!classing[archetype.subclassing]) {
								classing[archetype.subclassing] = {};
								classing[archetype.subclassing].prefix = [];
							}
							classing[archetype.subclassing].prefix.push(archetype.name);
						} else {
							classing[archetype.id].name = archetype.name;
							classes.push(archetype.id);
						}
					}
				}
				for(i=0; i<classes.length; i++) {
					archetype = classing[classes[i]];
					if(archetype.prefix.length) {
						result.push(archetype.prefix.join(" ") + " " + archetype.name);
					} else {
						result.push(archetype.name);
					}
				}
			}

			return result.join(", ");
		},
		"image": function() {
			return this.universe.index.image[this.entity.portrait];
		}
		/* Doesn't trigger on updates from heirarchecal "parents"
		 */
		// "rolls": function() {
		// 	var rolls = [],
		// 		roll,
		// 		i;

		// 	if(this.rolled[this.entity.id]) {
		// 		console.log(" > Exists");
		// 		for(i=0; i<this.rolled[this.entity.id].length; i++) {
		// 			console.log(" > Adding " + i);
		// 			roll = this.rolled[this.entity.id][i];
		// 			// TODO: Skill Check
		// 			if(roll) {
		// 				console.log(" > Added");
		// 				rolls.push(roll);
		// 			}
		// 		}
		// 	}

		// 	console.log(" = Returned");
		// 	return rolls;
		// }
	},
	"data": function() {
		var data = {};

		data.rolls = [];
		data.gender = this.universe.get(this.entity.gender) || {"name": "No Gender"};
		data.race = this.universe.get(this.entity.race) || {"name": "No Race"};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("entity:roll", this.entityRolled);
	},
	"methods": {
		"fireProperty": function(property) {
			// console.log("DFire: ", property);
			var search,
				i;

			if(this.player.gm) {
				switch(property.id) {
					case "initiative":
						for(i=0; i<this.universe.listing.skirmish.length; i++) {
							search = this.universe.listing.skirmish[i];
							if(search.is_active && !search.disabled && !search.is_preview) {
								this.universe.send("skimish:turn", {
									"skirmish": search.id,
									"entity": this.entity.id
								});
								break;
							}
						}
						break;
					case "played_by":
						if(this.$route.query.entity === this.entity.id) {
							rsSystem.manipulateQuery({
								"entity": null
							});
						} else {
							rsSystem.manipulateQuery({
								"entity": this.entity.id
							});
						}
						break;
					case "level":
						this.universe.send("entity:points", {
							"entity": this.entity.id,
							"point_pool": {
								"level": 1
							}
						});
						break;
				}
			}
		},
		"getRollClass": function(roll) {
			if(roll.failure) {
				return "crit-fail";
			} else if(roll.critical) {
				return "crit-pass";
			}
			/*
			if(roll && roll.dice && roll.dice.d20) {
				if(roll.dice.d20 && roll.dice.d20.length) {
					if(roll.dice.d20[0] === 1) {
						return "crit-fail";
					} else if(roll.dice.d20[0] === 20) {
						return "crit-pass";
					}
				}
			} else if(roll.skill && roll.skill.id) {
				if(roll.result - (this.entity.skill_check[roll.skill.id] || 0) === 1) {
					return "crit-fail";
				} else if(roll.result - (this.entity.skill_check[roll.skill.id] || 0) === 20) {
					return "crit-pass";
				}
			}
			*/

			return "";
		},
		"entityRolled": function(event) {
			if(event && event.entity === this.entity.id) {
				var roll = Object.assign({}, event);
				if(!this.rolled[roll.entity]) {
					this.rolled[roll.entity] = [];
				}
				if(typeof(roll.skill) === "string") {
					if(this.universe.index.skill[roll.skill]) {
						roll.skill = this.universe.index.skill[roll.skill];
					}
				}
				this.rolls.push(roll);
			}
			// setTimeout(() => {
			// 	this.updateRolls();
			// }, 0);
		},
		"updateRolls": function() {
			this.rolls.splice(0);
			var roll,
				i;

			if(this.rolled[this.entity.id]) {
				console.log(" > Exists");
				for(i=0; i<this.rolled[this.entity.id].length; i++) {
					console.log(" > Adding " + i);
					roll = this.rolled[this.entity.id][i];
					// TODO: Skill Check
					if(roll) {
						console.log(" > Added");
						this.rolls.push(roll);
					}
				}
			}
		},
		"giveGold": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDistributeGold",
				"entity": this.entity.id
			});
		},
		"givePoints": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndGivePoints",
				"entity": this.entity.id
			});
		},
		"giveEffects": function() {
			var details = {},
				object,
				i;

			details.title = this.entity.name;
			details.component = "dndDialogList";
			details.sections = ["effects", "knowledges", "feats"];
			details.cards = {};
			details.limit = 20,
			details.data = {
				"effects": [],
				"knowledges": [],
				"feats": []
			};

			details.activate = (section, object) => {
				console.log("Give[" + section + "]: ", object);
				this.universe.send("give:copy", {
					"target": this.entity.id,
					"object": object.id,
					"field": section
				});
			};

			details.cards.effects = {
				"name": "Effects",
				"icon": "game-icon game-icon-beams-aura"
			};
			details.cards.knowledges = {
				"name": "Knowledge",
				"icon": "fas fa-brain"
			};
			details.cards.feats = {
				"name": "Feats",
				"icon": "fas fa-fist-raised"
			};
			
			for(i=0; i<this.universe.listing.effect.length; i++) {
				object = this.universe.listing.effect[i];
				if(object && !object.disabled && !object.is_copy) {
					details.data.effects.push(object);
				}
			}
			
			for(i=0; i<this.universe.listing.knowledge.length; i++) {
				object = this.universe.listing.knowledge[i];
				if(object && !object.disabled && !object.is_copy) {
					details.data.knowledges.push(object);
				}
			}
			
			for(i=0; i<this.universe.listing.feat.length; i++) {
				object = this.universe.listing.feat[i];
				if(object && !object.disabled && !object.is_copy) {
					details.data.feats.push(object);
				}
			}

			rsSystem.EventBus.$emit("dialog-open", details);
		},
		"removeFromMeeting": function() {
			this.$emit("removeentity", this.entity.id);
		},
		"openRoll": function(roll) {

		},
		"dismissRoll": function(index) {
			if(this.rolled[this.entity.id]) {
				this.rolled[this.entity.id].splice(index, 1);
				this.updateRolls();
			}
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("entity:roll", this.entityRolled);
	},
	"template": Vue.templified("components/dnd/master/entity.html")
});
