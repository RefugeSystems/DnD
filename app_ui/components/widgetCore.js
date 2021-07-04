/**
 *
 *
 * @class DNDWidgetCore
 * @constructor
 * @module Components
 */
rsSystem.component("DNDWidgetCore", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"widget": {
			"type": Object
		}
	},
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);

		if(this.$el) {
			this.$el.onclick = (event) => {
				var follow = event.srcElement.attributes.getNamedItem("data-id");
				if(follow) {
					rsSystem.EventBus.$emit("display-info", {
						"info": follow
					});
					event.stopPropagation();
					event.preventDefault();
				}
			};

			if(this.$el.classList) {
				this.$el.classList.add("dnd-widget");
				this.$el.classList.remove("cell1");
				this.$el.classList.remove("cell2");
				this.$el.classList.remove("cell3");
				this.$el.classList.remove("cell4");
				this.$el.classList.remove("widget_left");
				this.$el.classList.remove("widget_center");
				this.$el.classList.remove("widget_right");
			}
		}

		if(this.widget) {
			if(this.widget.cell_width) {
				this.$el.classList.add("cell" + this.widget.cell_width);
			}

			if(this.widget.attribute) {
				if(this.widget.attribute.height) {
					$(this.$el).css({"height": this.widget.attribute.height});
				}
				if(this.widget.attribute.left) {
					this.$el.classList.add("widget_left");
				} else if(this.widget.attribute.center) {
					this.$el.classList.add("widget_center");
				} else if(this.widget.attribute.right) {
					this.$el.classList.add("widget_right");
				}
				if(this.widget.attribute.min_height) {
					$(this.$el).css({"min-height": this.widget.attribute.min_height});
				}
				if(this.widget.attribute.classing) {
					this.$el.classList.add(this.widget.attribute.classing);
				}
			}
			if(this.widget.attribute && this.widget.attribute.height) {
				$(this.$el).css({"height": this.widget.attribute.height});
			}
		}
	},
	"methods": {
		"formatNumber": function(number) {
			if(typeof(number.toFixed) === "function") {
				return number.toFixed(2);
			}
			return number;
		},
		"getSkillAdvantage": function(skill, entity) {
			entity = entity || this.entity;
			if(entity) {
				return entity.skill_advantage[skill.id];
			}
			console.warn("No Entity Present: ", this);
			return null;
		},
		"performSkillCheck": function(skill) {
			// var action = this.universe.index.action[action];
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"skill": skill,
				// "action": action,
				"closeAfterCheck": true
			});
		},
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
		"takeAction": function(action, using, rolls, targeted) {
			rolls.unshift({});
			var rolling = Object.assign.apply(Object.assign, rolls);
			if(typeof(action) === "string") {
				action = this.universe.index.action[action];
			}

			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"targeted": using.targets || action.targets || targeted,
				"rolling": rolling,
				"action": action,
				"using": using,
				"closeAfterAction": true
			});
		},
		/**
		 * 
		 * @method castSpell
		 * @param {Integer} level 
		 * @param {Object} spell 
		 * @param {String | Object} [action] 
		 */
		"castSpell": function(level, spell, action) {
			console.log("Cast at " + level + ": ", spell, action);
			var targets = null,
				damage = {},
				cast,
				keys,
				i;


			if(typeof(spell) === "string") {
				spell = this.universe.index.spell[spell];
			}
			if(spell && spell.targets && spell.targets.length) {
				targets = spell.targets;
			}

			// Upcast if needed, stored to cast to avoid mutation of spell
			cast = Object.assign({}, spell);
			if(level > spell.level) {
				cast.level = level;
			}

			if(typeof(action) === "string") {
				action = this.universe.index.action[action];
			} else if(!action) {
				if(spell && spell.action_cost && spell.action_cost.main) {
					action = this.universe.index.action["action:main:cast"];
				} else if(spell && spell.action_cost && spell.action_cost.bonus) {
					action = this.universe.index.action["action:bonus:cast:spell"];
				} else if(spell && spell.action_cost && spell.action_cost.reaction) {
					action = this.universe.index.action["action:reaction:spell"];
				}
			}

			if(spell.damage) {
				keys = Object.keys(spell.damage);
				for(i=0; i<keys.length; i++) {
					damage[keys[i]] = this.computeRoll(spell.damage[keys[i]], cast);
				}
			}

			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"spellLevel": level,
				"targeted": targets,
				"rolling": damage,
				"action": action,
				"spell": cast,
				"closeAfterAction": true
			});
		},
		"computeRoll": function(formula, source) {
			return rsSystem.dnd.reducedDiceRoll(formula, source);
		},
		"startRoll": function(rolling, targeted) {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"targeted": targeted,
				"rolling": rolling
			});
		},
		/**
		 * 
		 * @method sortSpells
		 * @deprecated Use "sortByLevel"
		 * @param {Object} a 
		 * @param {Object} b 
		 * @returns {Integer}
		 */
		"sortSpells": function(a, b) {
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
	},
	"template": Vue.templified("components/dnd/entity/space.html")
});
