/**
 *
 *
 * @class dndDistributeGold
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDistributeGold", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DNDWidgetCore,
		rsSystem.components.RSCore
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
		"distributing": function () {
			if(!this.amount) {
				return 0;
			}
			if(this.entities.length === 0) {
				return 0;
			}
			if(this.split) {
				return parseFloat((this.amount/this.entities.length).toFixed(2));
			}
			return parseFloat(this.amount.toFixed(2));
		},
		"cannotDistribute": function() {
			return isNaN(this.amount);
		}
	},
	"data": function () {
		var data = {},
			i;

		data.amount = this.details.amount || null;
		data.split = !!this.details.split;

		data.entities = [];
		if(this.details.entity) {
			if(typeof(this.details.entity) === "string") {
				data.entities.push(this.universe.getObject(this.details.entity));
			} else {
				data.entities.push(this.details.entity);
			}
		}

		if(this.details.entities) {
			for(i=0; i<this.details.entities.length; i++) {
				if(typeof(this.details.entities[i]) === "string") {
					data.entities.push(this.universe.getObject(this.details.entities[i]));
				} else {
					data.entities.push(this.details.entities[i]);
				}
			}
		}

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		$(this.$el).find("#amount")[0].focus();
	},
	"methods": {
		"distributeGold": function () {
			var target,
				i;
			
			for(i=0; i<this.entities.length; i++) {
				target = this.entities[i];
				this.universe.send("send:gold", {
					"target": target.id,
					"amount": this.distributing
				});
			}

			Vue.set(this, "amount", 0);
			this.closeDialog();
		},
		"toggleSplit": function () {
			Vue.set(this, "split", !this.split);
		}
	},
	"beforeDestroy": function () {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/dialogs/gold/distribute.html")
});