/**
 *
 *
 * @class dndDialogCraft
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {UIProfile} profile
 * @param {Object} details
 * @param {Object} details.source Entity object responsible for crafting the recipe
 * @param {Object} details.target Object to receive the result of the recipe.
 * @param {Object} details.ingredients Initial list of ingredients
 * @param {Object} details.recipes Recipes from which to select
 */
rsSystem.component("dndDialogCraft", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DialogController,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"page": function() {
			if(this.stage && this.stages) {
				return "page" + (this.stages[this.stage].offset || 0);
			}
			return "page" + 0;
		},
		"source": function() {
			if(typeof(this.details.source) === "string") {
				return this.universe.getObject(this.details.source);
			}
			if(typeof(this.details.entity) === "string") {
				return this.universe.getObject(this.details.entity);
			}
			return this.details.source || this.details.entity;
		},
		"target": function() {
			if(typeof(this.details.target) === "string") {
				return this.universe.getObject(this.details.target);
			}
			if(typeof(this.details.entity) === "string") {
				return this.universe.getObject(this.details.entity);
			}
			return this.details.target || this.details.entity;
		},
		"meeting": function() {
			var meeting;
			if(this.universe.index.setting["setting:meeting"] && (meeting = this.universe.index.meeting[this.universe.index.setting["setting:meeting"].value])) {
				return meeting;
			}
			return null;
		},
		"targets": function() {
			var targets = [],
				target,
				i;

			if(this.recipe) {
				// TODO
			}

			return targets;
		},
		/**
		 * Maps object classes to arrays of that class that are available to the crafting
		 * entity based on location and meeting.
		 * 
		 * Checks entities at the location that the player owns or that are loyal to their
		 * played character.
		 * 
		 * Must track where the items are available from to pass to the craft process.
		 * @property available
		 * @type Object
		 */
		"available": function() {
			var available = {},
				search,
				knowns,
				known,
				types,
				place,
				part,
				bins,
				bin,
				id,
				i,
				j;

			if(this.recipe && this.bins.length) {
				bins = this.bins.map((bin) => bin.id);
				search = {};
				for(i=0; i<bins.length; i++) {
					available[bins[i]] = true;
				}
				
				place = (part) => {
					console.log("Place Check: ", part);
					var parents,
						id,
						j;

					if(part && rsSystem.utility.isValid(part)) {
						parents = rsSystem.utility.expandParentalKeys(part);
						for(j=0; j<parents.length; j++) {
							id = parents[j];
							if(available[id]) {
								available[id].push(part);
								return;
							}
						}
						for(j=0; j<part.types.length; j++) {
							id = part.types[j];
							if(available[id]) {
								available[id].push(part);
								return;
							}
						}
					}
				};

				for(j=0; j<bins.length; j++) {
					available[bins[j]] = [];
				}

				// Scan Inventory
				if(this.source && this.source.inventory) {
					for(i=0; i<this.source.inventory.length; i++) {
						place(this.universe.get(this.source.inventory[i]));
					}
				}

				// Scan Active Entities
				if(this.meeting && this.meeting.entities) {
					for(i=0; i<this.meeting.entities.length; i++) {
						place(this.universe.get(this.meeting.entities[i]));
					}
				}

				// Yields
				available._yields = [];
				if(this.recipe.yields) {
					search = {};
					types = [];
					for(i=0; i<this.recipe.yields.length; i++) {
						part = this.universe.get(this.recipe.yields[i]);
						if(part) {
							if(part._class === "type") {
								// Search Source Knowledge for the Type
								types.push(part.id);
							} else {
								// Raw Input
								available._yields.push(part);
							}
						}
					}
					if(types.length && this.source) {
						knowns = Object.keys(this.source.knowledge_matrix);
						for(i=0; i<knowns.length; i++) {
							known = this.universe.get(knowns[i]);
							if(known && (!this.recipe.yield_class || known._class === this.recipe.yield_class) && (types.hasCommon(known.types) || types.indexOf(known.type) !== -1)) {
								available._yields.push(known);
							}
						}
					}
				}
			}

			return available;
		}
	},
	"data": function () {
		var data = {};
		
		data.selecting = null;
		data.loaded = false;
		data.recipe = null;
		data.count = 1;

		if(!data.recipe) {
			data.stage = "recipe";
		} else {
			data.stage = "inputs";
		}

		data.stages = {
			"recipe": {
				"name": "Select Recipe",
				"offset": 0
			},
			"inputs": {
				"name": "Crafting Inputs",
				"offset": 1
			},
			"selection": {
				"name": "Select Materials",
				"offset": 2
			}
		};

		data.headings = ["icon", "name", "info"];

		data.formatter = {};
		data.controls = [];
		data.actions = {};

		data.crafting = {};
		data.inputs = {};
		data.counts = {};
		data.yields = [];
		data.match = {}; // Used for calculating `availabile` and populated in bin creation
		data.table = {};
		data.bins = [];
		data.cost = 0;

		data.controls.push({
			"title": "Finished Selecting",
			"icon": "fa-duotone fa-list-check rs-light-green rs-secondary-white",
			"process": this.passInput
		});

		data.formatter.icon = (value, record) => {
			var classes = "";
			if(record) {
				if(this.source.inventory_hidden && this.source.inventory_hidden[record.id]) {
					classes += "hidden_item ";
				}
				if(this.source.equipped && this.source.equipped.indexOf(record.id) !== -1) {
					classes += "equipped_item ";
				}
				if(record.attuned === this.source.id) {
					classes += "attuned_item ";
				}
			}
			return "<span class=\"" + classes + (value || "") + "\"></span>";
		};
		data.formatter.info = () => {
			return "<span class=\"fas fa-info-circle rs-light-blue\"></span>";
		};

		data.actions.info = (record) => {
			this.info(record);
		};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		if(this.universe.index.recipe[this.details.initial_recipe]) {
			this.selectRecipe(this.universe.index.recipe[this.details.initial_recipe]);
		}
	},
	"methods": {
		/**
		 * Triggered to switch to a table view to select the inputs based on a core ID that is used
		 * to find direct and parental matches for items available to the entity to use.
		 * @method selectInput
		 * @param {Object} id 
		 */
		"selectInput": function(key) {
			var id,
				i;

			if(!this.table.selected) {
				Vue.set(this.table, "selected", {});
			} else {
				rsSystem.utility.clearObject(this.table.selected);
			}
			for(i=0; i<this.inputs[key.id].length; i++) {
				id = this.inputs[key.id][i];
				if(id && (id = id.id)) {
					if(this.table.selected[id]) {
						this.table.selected[id]++;
					} else {
						this.table.selected[id] = 1;
					}
				}
			}

			Vue.set(this.table, "fitler", "");
			Vue.set(this.table, "page", 0);
			Vue.set(this, "stage", "selection");
			Vue.set(this, "selecting", key.id);
		},
		"selectYields": function() {
			var id,
				i;

			if(!this.table.selected) {
				Vue.set(this.table, "selected", {});
			} else {
				rsSystem.utility.clearObject(this.table.selected);
			}
			for(i=0; i<this.yields.length; i++) {
				id = this.yields[i];
				if(id && (id = id.id)) {
					if(this.table.selected[id]) {
						this.table.selected[id]++;
					} else {
						this.table.selected[id] = 1;
					}
				}
			}

			Vue.set(this.table, "fitler", "");
			Vue.set(this.table, "page", 0);
			Vue.set(this, "stage", "selection");
			Vue.set(this, "selecting", "_yields");
		},

		"passInput": function() {
			var selection = Object.keys(this.table.selected),
				key = this.selecting,
				part,
				id,
				i,
				j;

			console.log("Table Storage: ", this.table.selected);

			if(this.selecting === "_yields") {
				this.yields.splice(0);
				for(i=0; i<selection.length; i++) {
					id = selection[i];
					part = this.universe.get(id);
					if(part) {
						for(j=0; j<this.table.selected[id]; j++) {
							this.yields.push(part);
						}
					} else {
						console.warn("Invalid part in craft availability selection: " + id);
					}
				}
			} else {
				this.inputs[key].splice(0);
				for(i=0; i<selection.length; i++) {
					id = selection[i];
					part = this.universe.get(id);
					if(part) {
						for(j=0; j<this.table.selected[id]; j++) {
							if(part._class === "entity") {
								this.inputs[key].push(part); // Potentially shuffling to active meeting ID for source however source is not currently tracked here
							} else {
								this.inputs[key].push(part);
							}
						}
					} else {
						console.warn("Invalid part in craft availability selection: " + id);
					}
				}
			}

			Vue.set(this, "stage", "inputs");
			Vue.set(this, "selecting", null);
			this.recalculate();
		},

		"recalculate": function() {
			var cost = 0,
				missing,
				part,
				bin,
				id,
				i;

			for(i=0; i<this.bins.length; i++) {
				bin = this.bins[i];
				if(bin.cost) {
					missing = this.counts[bin.id] - this.inputs[bin.id].length;
					if(0 < missing) {
						cost += missing * bin.cost;
					}
				}
			}

			if(this.recipe && this.recipe.cost) {
				cost += this.recipe.cost;
			}

			Vue.set(this, "cost", parseFloat(cost.toFixed(2)));
		},

		"reselectRecipe": function() {
			Vue.set(this, "stage", "recipe");
		},

		"selectRecipe": function(recipe) {
			var counts = {},
				bins = {},
				queuePart,
				parents,
				key,
				id,
				i;

			Vue.set(this, "stage", "inputs");
			Vue.set(this, "recipe", recipe);
			this.bins.splice(0);

			queuePart = (part) => {
				var j;
				if(part && !this.loaded) {
					parents = rsSystem.utility.expandParentalKeys(part);
					for(j=0; j<parents.length; j++) {
						if(bins[parents[j]] && this.inputs[parents[j]]) {
							this.inputs[parents[j]].push(part);
							return;
						}
					}
					for(j=0; j<part.types.length; j++) {
						if(bins[part.types[j]] && this.inputs[part.types[j]]) {
							this.inputs[part.types[j]].push(part);
							return;
						}
					}
				}
			};

			if(recipe.input_components) {
				for(i=0; i<recipe.input_components.length; i++) {
					id = recipe.input_components[i];
					if(!bins[id] && (key = this.universe.get(id))) {
						this.bins.push(key);
						bins[id] = true;
						counts[id] = 1;
						if(!this.inputs[id]) {
							Vue.set(this.match, id, rsSystem.utility.expandParentalKeys(id));
							Vue.set(this.inputs, id, []);
						}
					} else {
						counts[id]++;
					}
				}
			}
			
			for(i=0; i<this.bins.length; i++) {
				counts[this.bins[i].id] *= this.count;
			}

			for(i=0; i<this.bins.length; i++) {
				id = this.bins[i].id;
				Vue.set(this.counts, id, counts[id]);
			}

			if(this.details.ingredients) {
				for(i=0; i<this.details.ingredients.length; i++) {
					queuePart(this.universe.get(this.details.ingredients[i]));
				}
			}

			if(recipe.yields) {
				this.yields.splice(0);
				if(!recipe.yield_limit || recipe.yields.length <= recipe.yield_limit) {
					this.yields.push.apply(this.yields, this.available._yields);
				} else {
					for(i=0; i<recipe.yield_limit; i++) {
						this.yields.push(this.available._yields[i]);
					}
				}
			}

			this.recalculate();
			this.loaded = true;
		},

		"beginCrafting": function() {
			var craft = {},
				keys,
				bin,
				i;

			if(this.recipe && !rsSystem.utility.isEmpty(this.inputs) && this.yields.length && this.source && this.target) {
				// Validate
				// TODO

				// Built Request
				craft.meeting = this.meeting?this.meeting.id:undefined;
				craft.recipe = this.recipe.id;
				craft.source = this.source.id;
				craft.target = this.target.id || this.source.id;
				craft.payment = this.cost;
				craft.count = this.count;
				craft.inputs = {}; // Maps source to field to array of input from that source's field
				craft.inputs[craft.source] = {};
				craft.yields = this.yields.map((yield) => yield.id);
				for(i=0; i<this.bins.length; i++) {
					bin = this.bins[i].id;
					craft.inputs[craft.source][bin] = this.inputs[bin].map((input) => input.id);
				}
				this.universe.send("entity:craft:recipe", craft);
				console.log("Craft: ", craft);
				this.closeDialog();
			}
		},
		"update": function() {
			Vue.set(this, "lastAction", Date.now());
		}
	},
	"beforeDestroy": function () {
		
	},
	"template": Vue.templified("components/dnd/dialogs/craft.html")
});