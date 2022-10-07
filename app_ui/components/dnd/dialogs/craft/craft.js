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
		"entity": function() {
			if(typeof(this.details.entity) === "string") {
				return this.universe.getObject(this.details.entity);
			}
			return this.details.entity;
		},
		"meeting": function() {

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
			// TODO
		}
	},
	"data": function () {
		var data = {};
		
		data.recipe = null;
		data.inputs = {};
		data.yields = [];
		data.table = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		/**
		 * Triggered to switch to a table view to select the inputs based on a core ID that is used
		 * to find direct and parental matches for items available to the entity to use.
		 * @method selectInput
		 * @param {String} id 
		 */
		"selectInput": function(id) {
			rsSystem.utility.clearObject(this.table.selected);
			// TODO
		},
		"craft": function() {
			var craft = {},
				keys,
				i;

			if(this.recipe && !rsSystem.utility.isEmpty(this.inputs) && this.yields) {
				// Validate
				// TODO

				// Built Request
				craft.target = this.target.id || this.source.id;
				craft.source = this.source.id;
				craft.inputs = this.inputs; // Maps source to field to array of input from that source's field
				this.universe.send("entity:craft:recipe", craft);
			}
		},
		"update": function() {
			Vue.set(this, "lastAction", Date.now());
		}
	},
	"beforeDestroy": function () {
		
	},
	"template": Vue.templified("components/dnd/dialogs/shop.html")
});