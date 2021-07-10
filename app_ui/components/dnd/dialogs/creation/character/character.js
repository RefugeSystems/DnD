/**
 *
 *
 * @class dndCreateCharacterDialog
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
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
		"corpus": function() {
			var corpus = {},
				selectable,
				source,
				feat,
				x;

			selectable = [];
			for(x = 0; x < this.universe.listing.race.length; x++) {
				if(this.universe.listing.race[x].playable && !this.universe.listing.race[x].attribute.no_show && !this.universe.listing.race[x].is_preview) {
					selectable.push(this.universe.listing.race[x]);
				}
			}
			selectable.sort(rsSystem.utility.sortData);
			corpus.race = selectable;

			selectable = [];
			if(this.building.race) {
				for(x = 0; x < this.building.race.variants.length; x++) {
					feat = this.universe.getObject(this.building.race.variants[x]);
					if(feat && !feat.inactive && !feat.attribute.no_show && !feat.is_preview) {
						selectable.push(feat);
					} else {
						this.universe.log.error("Unknown racial variant: " + this.building.race.variants[x]);
					}
				}
				if(!selectable.length) {
					// selectable.push({
					// 	"id": null,
					// 	"name": "Normal",
					// 	"description": this.building.race.name + " has no racial variants",
					// 	"_search": "none"
					// });
				}
			}
			selectable.sort(rsSystem.utility.sortData);
			corpus.variant = selectable;

			selectable = [];
			for(x = 0; x < this.universe.listing.archetype.length; x++) {
				if(this.universe.listing.archetype[x].playable && this.universe.listing.archetype[x].root && !this.universe.listing.archetype[x].attribute.no_show && !this.universe.listing.archetype[x].is_preview) {
					selectable.push(this.universe.listing.archetype[x]);
				}
			}
			selectable.sort(rsSystem.utility.sortData);
			corpus.archetype = selectable;

			selectable = [];
			for(x = 0; x < this.universe.listing.feat.length; x++) {
				if(this.universe.listing.feat[x].featbg && !this.universe.listing.feat[x].attribute.no_show && !this.universe.listing.feat[x].is_preview) {
					selectable.push(this.universe.listing.feat[x]);
				}
			}
			selectable.sort(rsSystem.utility.sortData);
			corpus.background = selectable;

			selectable = [];
			for(x = 0; x < this.universe.listing.alignment.length; x++) {
				if(this.universe.listing.alignment[x].playable && !this.universe.listing.alignment[x].attribute.no_show && !this.universe.listing.alignment[x].is_preview) {
					selectable.push(this.universe.listing.alignment[x]);
				}
			}
			selectable.sort(rsSystem.utility.sortData);
			corpus.alignment = selectable;

			/*
			selectable = [];
			if(this.building) {
				if(this.building.variant && this.building.variant.selection.length) {
					
				}
				if(this.building.archetype && this.building.archetype.selection.length) {
					for(i=0; i<this.building.archetype.selection.length; i++) {
						for(j=0; j<this.building.archetype.selection[i].choices[])
						record = this.universe.getObject()
					}
				}
			}
			corpus.feats = selectable;
			*/

			return corpus;
		},
		"choiceBlocks": function() {
			var choiceBlocks = [],
				block,
				record,
				load,
				i,
				j;

			if(this.building.race && this.building.race.selection) {
				choiceBlocks = choiceBlocks.concat(this.building.race.selection);
			}
			if(this.building.variant && this.building.variant.selection) {
				choiceBlocks = choiceBlocks.concat(this.building.variant.selection);
			}
			if(this.building.archetype && this.building.archetype.selection) {
				choiceBlocks = choiceBlocks.concat(this.building.archetype.selection);
			}
			if(this.building.background && this.building.background.selection) {
				choiceBlocks = choiceBlocks.concat(this.building.background.selection);
			}

			return choiceBlocks;
		},
		"nameGenerators": function() {
			var datasets = [],
				record,
				x;

			if(this.building.race && this.building.race.datasets) {
				for(x = 0; x < this.building.race.datasets.length; x++) {
					record = this.universe.getObject(this.building.race.datasets[x]);
					if(record) {
						datasets.push(record);
					}
				}
			}

			return datasets;
		},
		"limit": function() {
			var limit = {},
				record,
				i;

			return limit;
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
			"additional",
			"stats",
			"details", // Name, Description
			"review"
		];

		data.stats = [
			"strength",
			"dexterity",
			"constitution",
			"intelligence",
			"wisdom",
			"charisma"
		];

		data.genders = [
			"Male",
			"Female",
			"Non-Binary",
			"Agender"
		];
		data.fieldPortrait = {
			"id": "portrait",
			"name": "Portrait",
			"type": "file",
			"condition": {},
			"attribute": {}
		};
		data.fieldPicture = {
			"id": "picture",
			"name": "Picture",
			"type": "file",
			"condition": {},
			"attribute": {}
		};

		data.building = {};
		data.building.details = {};
		data.building.feats = [];
		data.building.proficiencies = [];
		data.building.gender = data.genders[Random.integer(data.genders.length)];
		data.outcome = {};
		data.outcome.general = [];
		data.outcome.feat = [];
		data.outcome.proficiency = [];
		data.outcome.knowledge = [];
		data.flipFlop = true;
		data.selections = {};
		data.errors = {};
		data.errorCount = 0;
		data.muted = false;

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(this.profile.auto_roll) {
			Vue.set(this, "muted", true);
			for(var i = 0; i < this.stats.length; i++) {
				this.rollStat(this.stats[i]);
			}
		}
	},
	"methods": {
		"create": function() {
			if(this.errorCount === 0) {
				var details = {},
					buffer,
					i,
					j;

				details.name = this.building.name;
				details.nickname = this.building.nickname;
				details.description = this.building.description;
				details.gender = this.building.gender;
				details.race = this.building.race.id;
				details.alignment = this.building.alignment.id;
				details.archetypes = [this.building.archetype.id];
				details.feats = [this.building.background.id];
				details.skill_proficiency = {};
				details.proficiencies = [];
				details.knowledges = [];
				details.portrait = this.building.portrait;
				details.picture = this.building.picture;

				for(i = 0; i < this.stats.length; i++) {
					details["stat_" + this.stats[i]] = this.building[this.stats[i]];
				}

				if(this.building.variant) {
					details.feats.push(this.building.variant.id);
				}

				try {
					for(i = 0; i < this.choiceBlocks.length; i++) {
						buffer = details[this.choiceBlocks[i].field];
						if(buffer) {
							if(buffer instanceof Array) {
								for(j = 0; j < this.choiceBlocks[i]._selected.length; j++) {
									buffer.push(this.choiceBlocks[i]._selected[j]);
								}
							} else if(typeof(buffer) === "object") {
								for(j = 0; j < this.choiceBlocks[i]._selected.length; j++) {
									buffer[this.choiceBlocks[i]._selected[j]] = 1;
								}
							} else {
								// TODO: Error 
								console.error("TODO: Unknown selection addition point type: " + this.choiceBlocks[i].field, this.choiceBlocks[i], buffer);
							}
						} else {
							// TODO: Error - Unknown entity field
							console.error("TODO: Unknown entity field for selection push: " + this.choiceBlocks[i].field, this.choiceBlocks[i]);
						}
					}

					this.universe.send("create:character", details);
				} catch (exception) {
					// TODO: Improve choiceBlock isolation to be resistant against the below or update display before
					//		the client submits for "smoothness" (tm)
					// This occurs when the universe updates and essentially nukes the underlying block for the client
					//		For now, just adding an error
					Vue.set(this, "errorCount", this.errorCount + 1);
					Vue.set(this.errors, 5, "Unselected Choices");
				}
			} else {
				this.goToError();
			}
		},
		"validate": function(stage) {
			var buffer,
				x;

			if(stage == undefined) {
				stage = this.stage;
			}

			console.log("Validate[" + stage + "]: " + this.stages[this.stage]);
			switch (this.stages[stage]) {
				case "race":
				case "variant":
				case "archetype":
				case "background":
				case "alignment":
					if(this.corpus[this.stages[this.stage]].length && !this.building[this.stages[stage]]) {
						this.errors[stage] = "Please make a selection";
						this.errorCount++;
					} else if(this.errors[stage]) {
						delete(this.errors[stage]);
						this.errorCount--;
					}
					break;
				case "additional":
					buffer = false;
					for(x = 0; x < this.choiceBlocks.length; x++) {
						if(!this.choiceBlocks[x]._selected || this.choiceBlocks[x].limit !== this.choiceBlocks[x]._selected.length) {
							buffer = true;
						}
					}
					if(buffer && !this.errors[stage]) {
						this.errors[stage] = "Unselected Choices";
						this.errorCount++;
					} else if(!buffer && this.errors[stage]) {
						delete(this.errors[stage]);
						this.errorCount--;
					}
					break;
				case "stats":
					if(!this.statsDone()) {
						this.errors[stage] = "Please enter stats";
						this.errorCount++;
					} else if(this.errors[stage]) {
						delete(this.errors[stage]);
						this.errorCount--;
					}
					break;
				case "details":
					if(!this.building.name) {
						this.errors[stage] = "Please select a name";
						this.errorCount++;
					} else if(this.errors[stage]) {
						delete(this.errors[stage]);
						this.errorCount--;
					}
					break;
			}

			return null;
		},
		"errorStages": function() {
			var stages = Object.keys(this.errors),
				x;
			for(x = 0; x < stages.length; x++) {
				stages[x] = parseInt(stages[x]) + 1;
			}
			return stages.join(", ");
		},
		"goToError": function() {
			for(var x = 0; x < this.stages.length; x++) {
				if(this.errors[x]) {
					Vue.set(this, "stage", x);
					return null;
				}
			}
		},
		"randomName": function(dataset) {
			console.log("Random Name: " + dataset.name, dataset);
			var limit = dataset.limit || 10,
				spacing = dataset.spacing || " ",
				name = "",
				c = 0,
				gen,
				x;

			if(this.flipFlop) {
				Vue.set(this, "flipFlop", false);
				while(dataset && c < limit) {
					gen = new NameGenerator(dataset.value);
					if(name) {
						name += spacing + gen.create().capitalize();
					} else {
						name = gen.create().capitalize();
					}
					if(dataset.next) {
						dataset = this.universe.getObject(dataset.next[Random.integer(dataset.next.length)]);
					} else {
						dataset = null;
					}
				}
			} else {
				Vue.set(this, "flipFlop", true);
				while(dataset && c < limit) {
					gen = dataset.value.split(" ");
					if(name) {
						name += spacing + gen[Random.integer(gen.length)].capitalize();
					} else {
						name = gen[Random.integer(gen.length)].capitalize();
					}
					if(dataset.next) {
						dataset = this.universe.getObject(dataset.next[Random.integer(dataset.next.length)]);
					} else {
						dataset = null;
					}
				}
			}

			Vue.set(this.building, "name", name);
		},
		"choiceBlockSelected": function(skip) {
			for(var x = 0; x < this.choiceBlocks.length; x++) {
				if(!this.choiceBlocks[x]._selected || this.choiceBlocks[x]._selected.length !== this.choiceBlocks[x].limit) {
					return false;
				}
			}

			if(!skip) {
				this.forward();
			}
			return true;
		},
		"statsDone": function() {
			for(var x = 0; x < this.stats.length; x++) {
				if(!this.building[this.stats[x]]) {
					return false;
				}
			}
			return true;
		},
		"rollStat": function(stat) {
			var roll = [],
				dropped;

			roll.push(Random.integer(6) + 1);
			roll.push(Random.integer(6) + 1);
			roll.push(Random.integer(6) + 1);
			roll.push(Random.integer(6) + 1);
			roll.sort();
			roll.reverse();

			Vue.set(this.building, stat, roll[0] + roll[1] + roll[2]);
			dropped = roll.pop();

			if(!this.muted) {
				this.universe.$emit("notification", {
					"message": "Rolled " + stat + ": " + roll.join(", ") + " (" + dropped + ")",
					"icon": "fas fa-dice fa-pulse",
					"timeout": 6000
				});
			}
		},
		"statRecommended": function(base, stat) {
			if(base && base.attribute) {
				return (base.attribute.recommended && base.attribute.recommended[stat]) || (typeof(base.attribute.recommended) === "string" && base.attribute.recommended.indexOf(stat) !== -1);
			}
		},
		"statUp": function(stat) {
			var index = this.stats.indexOf(stat),
				to = (index - 1 + this.stats.length) % this.stats.length,
				swap = this.stats[to],
				hold = this.building[swap];
			Vue.set(this.building, swap, this.building[stat]);
			Vue.set(this.building, stat, hold);
		},
		"statDown": function(stat) {
			var index = this.stats.indexOf(stat),
				to = (index + 1 + this.stats.length) % this.stats.length,
				swap = this.stats[to],
				hold = this.building[swap];
			Vue.set(this.building, swap, this.building[stat]);
			Vue.set(this.building, stat, hold);
		},
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
				// switch(this.stage) {
				// 	case 0: this.chooseRace(record);
				// 		break;
				// 	default:
				// 		rsSystem.log.error("Unknown Character Building Stage: " + this.stage);
				// }
			}
		},
		"choose": function(record) {
			console.log("Chosen[" + this.stages[this.stage] + "]: ", record);
			if(this.building[this.stages[this.stage]] instanceof Array) {
				if(this.building[this.stages[this.stage]].indexOf(record) === -1) {
					this.building[this.stages[this.stage]].push(record);
				} else {
					this.building[this.stages[this.stage]].purge(record);
				}
				if(this.limit[this.stages[this.stage]] === this.building[this.stages[this.stage]].length || (!this.limit[this.stages[this.stage]] && this.building[this.stages[this.stage]].length === 1)) {
					this.forward();
				}
			} else {
				Vue.set(this.building, this.stages[this.stage], record);
				this.forward();
			}
		},
		"getName": function(record, prefixed) {
			if(!record) {
				return "";
			}
			if(typeof(record) !== "object") {
				var buffer = this.universe.getObject(record);
				if(buffer) {
					return buffer.name || buffer.id || record;
				}
			}
			if(prefixed) {
				return (record.name || record) + " ";
			}
			return record.name || record;
		},
		"syncPortrait": function() {

		},
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		},
		"getProgressInidcatorStyle": function() {
			return "width:" + (100 * (this.stage / (this.stages.length - 1))).toFixed(2) + "%;";
		},
		"forward": function() {
			if(this.stage < this.stages.length - 1) {
				this.validate();
				Vue.set(this, "stage", this.stage + 1);
				if(this.stages[this.stage] === "additional" && this.choiceBlocks.length === 0) {
					this.forward();
				} else if(this.stages[this.stage] === "variant" && this.corpus.variant.length === 0) {
					this.forward();
				}
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