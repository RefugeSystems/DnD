/**
 *
 *
 * @class dndTransferGold
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndTransferGold", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSCore
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		/**
		 * Computed array of entities
		 * @property locale
		 * @type Array | Object
		 */
		"locale": function() {
			var locale = [],
				location,
				entity,
				party,
				i,
				j;

			if(this.source) {
				location = this.universe.index.location[this.source.location];

				// TODO: Type filter on target type
				if(location && location.populace) {
					for(i=0; i<location.populace.length; i++) {
						entity = this.universe.index.entity[location.populace[i]];
						if(entity && entity.id !== this.source.id) {
							locale.uniquely(entity);
						}
					}
				}

				for(i=0; i<this.universe.listing.party.length; i++) {
					party = this.universe.listing.party[i];
					if(party && party.entities && party.entities.indexOf(this.source.id) !== -1) {
						for(j=0; j<party.entities.length; j++) {
							entity = this.universe.index.entity[party.entities[j]];
							if(entity && entity.id !== this.source.id) {
								locale.uniquely(entity);
							}
						}
					}
				}
			}

			return locale;
		}
	},
	"data": function () {
		var data = {};

		data.source = this.universe.getObject(this.details.entity);
		data.amount = {};

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"targetClass": function(target) {
			var amount = this.amount[target.id] || 0;
			if(amount > this.source.gold) {
				return "rsbg-light-red";
			}
			return "";
		},
		"sendGold": function (target) {
			var amount = this.amount[target.id] || 0;
			if(this.source.gold < amount) {
				this.universe.send("send:gold", {
					"entity": this.source.id,
					"target": target.id,
					"amount": amount
				});
				Vue.set(this.amount, target.id, 0);
			}
		}
	},
	"beforeDestroy": function () {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/dialogs/gold.html")
});