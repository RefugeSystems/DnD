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
	"computed": {
		"leveling": function() {
			return this.entity && this.entity.point_pool && this.entity.point_pool.level || false;
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
			if(this.widget.cell_width && this.$el.classList) {
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
		"showCharges": function(object) {
			return typeof(object.charges_max) === "number" || typeof(object.charges_max) === "string";
		},
		"formatNumber": function(number) {
			if(number && typeof(number.toFixed) === "function") {
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
				// "component": "dndDialogRoll",
				"component": "dndDialogCheck",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"skill": skill,
				"hideFormula": true,
				"hideHistory": true,
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

			// console.log("Action: ", this.entity, action, using, perform);
			if(this.entity && action) {
				perform.action = action.id;
				perform.source = this.entity.id;
				perform.channel = using;
				this.universe.send("action:perform", perform);
				// console.log(" > Sent: ", perform);
				
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
			var rolling = Object.assign.apply(Object.assign, rolls),
				details = {};
			if(typeof(action) === "string") {
				action = this.universe.index.action[action];
			}

			// TODO: Distinguish between different items for attack or say scroll/potion/recipe
			/*
			 * Damage Process UI
			 */
			details.title = this.entity.name + " Attack";
			details.component = "dndDialogDamage";
			details.entity = this.entity;
			details.channel = using;
			details.action = action;
			rsSystem.EventBus.$emit("dialog-open", details);

			/*
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
			*/
		},
		"useAction": function(action, delta = -1, entity) {
			entity = entity || this.entity;
			if(entity) {
				this.universe.send("action:count", {
					"entity": entity.id,
					"action": action,
					"delta": delta
				});
			}
		},
		/**
		 * 
		 * Cantrips ignore the passed level
		 * @method castSpell
		 * @param {Integer} level 
		 * @param {Object} spell 
		 * @param {String | Object} [action] 
		 */
		"castSpell": function(level, spell, action) {
			var targets = null,
				details = {},
				damage = {},
				cost = {},
				cast,
				keys,
				i,
				j;


			/*
			 * Legacy
			 */
			if(typeof(spell) === "string") {
				spell = this.universe.index.spell[spell];
			}
			if(spell && spell.targets && spell.targets.length) {
				targets = spell.targets;
			}

			// Upcast if needed, stored to cast to avoid mutation of spell
			cast = Object.assign({}, spell);
			if(spell.level && spell.level !== "0" /* Cantrip Bug/Bad-State handling */ && level > spell.level) {
				cast.level = level;
			}
			console.log("Cast at " + level + ": ", _p(spell), action, cast);

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
			action = undefined;

			if(spell.damage) {
				keys = Object.keys(spell.damage);
				for(i=0; i<keys.length; i++) {
					damage[keys[i]] = this.computeRoll(spell.damage[keys[i]], cast);
				}
			}

			/*
			 * Damage Process UI
			 */
			details.title = this.entity.name + " Actions";
			details.component = "dndDialogDamage";
			details.entity = this.entity;
			details.channel = cast;
			details.action = action;
			rsSystem.EventBus.$emit("dialog-open", details);

			/*
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"spellLevel": cast.level,
				"targeted": targets,
				"rolling": damage,
				"action": action,
				"spell": cast,
				"closeAfterAction": true
			});
			*/
		},
		"computeRoll": function(formula, source) {
			return rsSystem.dnd.reducedDiceRoll(formula, source);
		},
		"hasActions": function(count, entity) {
			entity = entity || this.entity;
			var keys,
				i;
			if(typeof(count) === "object" && typeof(entity.action_count)) {
				keys = Object.keys(count);
				for(i=0; i<keys.length; i++) {
					if(!entity.action_count[keys[i]] || entity.action_count[keys[i]] < count[keys[i]]) {
						return false;
					}
				}
			}
			return true;
		},
		/**
		 * 
		 * @method distanceTo
		 * @param {RSObject} from 
		 * @param {RSObject} to 
		 * @returns {Integer} Studs between the 2 objects if they share a location and have position, null otherwise. If the location has
		 * 		no dimensions defined, this returns undefined instead as a subtle error message but this is treated as allowable and
		 * 		dismissed.
		 */
		"distanceTo": function(from, to) {
			var location,
				distance;

			if(from && to && from.location === to.location && from.x && from.y && to.x && to.y) {
				location = this.universe.index.location[from.location];
				if(location) {
					if(location.width && location.height) {
						distance = rsSystem.math.distance.points2D(from.x/100 * location.width, from.y/100 * location.height, to.x/100 * location.width, to.y/100 * location.height);
						return Math.floor(distance + .5);
					} else {
						// No distance defined on location
						return undefined;
					}
				} else {
					console.warn("Distance calculation with undefined location: ", {
						"location": from.location,
						"from": from,
						"to": to
					});
				}
			}
			return null;
		},
		/**
		 * V1 Roll Dialog, currently meant as a more complex general dice-bin for formulas.
		 * @method startRoll
		 * @param {String} [rolling]
		 * @param {String} [targeted]
		 */
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
		 * @method levelUp
		 */
		"levelUp": function() {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndCharacterLevelDialog",
				"level": this.entity.level + 1,
				"entity": this.entity.id
			});
		},
		/**
		 * 
		 * @method openActiveEvent
		 * @param {Object} event That is active from an `active-event` field.
		 */
		"openActiveEvent": function(event) {
			switch(event.type) {
				case "dialog-open":
					rsSystem.EventBus.$emit("dialog-open", event);
					break;
			}
		},
		/**
		 * Use the DialogList to list actions and highlight usable vs. not usable
		 * with a way to then use those actions.
		 * @method listActions
		 */
		"listActions": function() {
			var details = {},
				action,
				types,
				i,
				j;

			details.title = this.entity.name + " Actions";
			details.component = "dndDialogList";
			details.sections = ["movement", "main", "bonus", "reaction", "multiple", "free"];
			details.clear = true;
			details.related = {};
			details.cards = {};
			details.data = {
				"movement": [],
				"multiple": [],
				"reaction": [],
				"bonus": [],
				"main": [],
				"free": []
			};

			details.activate = (section, action) => {
				this.info(action);
			};

			details.classing = (section, action) => {
				if(!this.entity.action_count) {
					return "no-points";
				}
				if(!action.action_cost) {
					return "none-used";
				}

				var keys = Object.keys(action.action_cost),
					i;

				for(i=0; i<keys.length; i++) {
					if(!this.entity.action_count[keys[i]] || this.entity.action_count[keys[i]] < action.action_cost[keys[i]]) {
						return "no-points";
					}
				}

				return "has-points";
			};

			details.note = (section, action) => {
				if(!this.entity.action_count) {
					return "<div class=\"note\">You have no points</div>";
				}
				if(action.action_cost) {
					var keys = Object.keys(action.action_cost),
						i;

					for(i=0; i<keys.length; i++) {
						if(!this.entity.action_count[keys[i]] || this.entity.action_count[keys[i]] < action.action_cost[keys[i]]) {
							return "<div class=\"note\">You are short on " + section + " action points</div>";
						}
					}
				}
				return "<span></span>";
			};

			details.cards.free = {
				"name": "Free",
				"icon": "fas fa-sword",
				"description": "You can perform these once on your turn without using any types of actions"
			};
			details.cards.movement = {
				"name": "Movement",
				"icon": "fas fa-runner",
				"description": "Used to move around the area"
			};
			details.cards.main = {
				"name": "Main",
				"icon": "fas fa-sword",
				"description": "Used for performing a task like attacking or using an item"
			};
			details.cards.bonus = {
				"name": "Bonus",
				"icon": "game-icon game-icon-icicles-aura",
				"description": "A special type of action that is small enough to perform with a ${Main Action}$"
			};
			details.cards.reaction = {
				"name": "Reaction",
				"icon": "game-icon game-icon-pendulum-swing",
				"description": "Tasks you can do in response to something happening outside of your turn"
			};
			details.cards.multiple = {
				"name": "Multiples",
				"icon": "game-icon game-icon-boomerang-cross",
				"description": "Requiring more than 1 type of action to perform"
			};
			
			for(i=0; i<this.entity.actions.length; i++) {
				action = this.universe.index.action[this.entity.actions[i]];
				if(action && !action.disabled) {
					types = Object.keys(action.action_cost);
					if(types.length === 0) {
						details.data.free.push(action);
					} else if(types.length === 1) {
						if(!details.data[types[0]]) {
							details.data[types[0]] = [];
							details.card[types[0]] = {
								"name": types[0]
							};
						}
						details.data[types[0]].push(action);
					} else {
						details.data.multiple.push(action);
					}
					if(this.entity.response && this.entity.response[action.id]) {
						details.related[action.id] = [];
						for(j=0; j<this.entity.response[action.id].length; j++) {
							if(this.entity.response[action.id][j].name && !this.entity.response[action.id][j].hidden) {
								details.related[action.id].push(this.entity.response[action.id][j].name);
							}
						}
					}
				}
			}

			rsSystem.EventBus.$emit("dialog-open", details);
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
		/**
		 * 
		 * @method sortByTime
		 * @param {Object} a 
		 * @param {Object} b 
		 * @returns {Integer}
		 */
		"sortByTime": function(a, b) {
			if(a.time < b.time) {
				return -1;
			} else if(a.time > b.time) {
				return 1;
			} else if(a.date < b.date) {
				return -1;
			} else if(a.date > b.date) {
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
