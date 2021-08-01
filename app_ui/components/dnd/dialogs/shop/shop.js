/**
 *
 *
 * @class dndDialogShop
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {UIProfile} profile
 * @param {Object} details
 * @param {Object} details.shop
 * @param {Object} details.entity
 */
rsSystem.component("dndDialogShop", {
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
		"shop": function() {
			if(typeof(this.details.shop) === "string") {
				return this.universe.getObject(this.details.shop);
			}
			return this.details.shop;
		},
		"shopKeep": function() {
			if(this.shop && this.shop.loyal_to) {
				return this.universe.index.entity[this.shop.loyal_to[0]];
			}
			return null;
		},
		"entity": function() {
			if(typeof(this.details.entity) === "string") {
				return this.universe.getObject(this.details.entity);
			}
			return this.details.entity;
		},
		"displayedCost": function() {
			return this.price.toFixed(2);
		},
		"canAfford": function() {
			if(this.entity) {
				return this.price < this.entity.gold;
			}
			return false;
		},
		"price": function() {
			if(!this.table || !this.table.selected) {
				return 0;
			}

			if(!this.shop) {
				return 0;
			}

			var selected = Object.keys(this.table.selected),
				cost = 0,
				discount,
				item,
				i;
			
			for(i=0; i<selected.length; i++) {
				item = this.universe.index.item[selected[i]];
				if(item && typeof(item.cost) === "number") {
					cost += item.cost;
				}
			}

			if(this.shop.discount) {
				discount = this.shop.discount[this.entity.id] || this.shop.discount.all || this.shop.discount.everyone || 0;
				cost = (1 - discount) * cost;
			}

			return cost;
		},
		"inventory": function() {
			var listing = [],
				item,
				i;

			if(this.shop && this.shop.inventory) {
				for(i=0; i<this.shop.inventory.length; i++) {
					item = this.universe.index.item[this.shop.inventory[i]];
					if(item && (!item.obscured || (this.player && this.player.gm))) {
						listing.push(item);
					}
				}
			}
			
			return listing;
		}
	},
	"data": function () {
		var data = {};

		data.lastAction = Date.now();

		data.actions = {};
		data.actions.info = (record) => {
			console.log("Info: ", record);
			this.info(record.id);
		};

		data.formatter = {};
		data.formatter.icon = (value, record) => {
			var classes = "";
			if(record) {
				if(this.entity.inventory_hidden && this.entity.inventory_hidden[record.id]) {
					classes += "hidden_item ";
				}
				if(this.entity.equipped && this.entity.equipped.indexOf(record.id) !== -1) {
					classes += "equipped_item ";
				}
				if(record.attuned === this.entity.id) {
					classes += "attuned_item ";
				}
			}
			return "<span class=\"" + classes + (value || "") + "\"></span>";
		};
		data.formatter.info = (value, record) => {
			return "<span class=\"fas fa-info-circle\"></span>";
		};
		data.formatter.category = (value) => {
			var category;
			if(value && (category = this.universe.index.category[value])) {
				return category.name;
			}
			return value;
		};

		data.tableHeadings = ["icon", "name", "cost", "types", "attunes", "info"];
		data.table = {};
		data.table.label = "Shop Items";

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"checkout": function() {
			var selected = this.table && this.table.selected?Object.keys(this.table.selected):[],
				items = [],
				buffer,
				i,
				j;

			for(i=0; i<selected.length; i++) {
				buffer = this.universe.index.item[selected[i]];
				if(buffer && !buffer.disabled && !buffer.is_preview) {
					for(j=0; j<this.table.selected[buffer.id]; j++) {
						items.push(buffer.id);
					}
				}
				Vue.delete(this.table.selected, buffer.id);
			}

			console.log("Checkout: ", items);
			this.universe.send("shop:checkout", {
				"entity": this.entity.id,
				"shop": this.shop.id,
				"items": items
			});
		},
		"update": function() {
			Vue.set(this, "lastAction", Date.now());
		}
	},
	"beforeDestroy": function () {
		
	},
	"template": Vue.templified("components/dnd/dialogs/shop.html")
});