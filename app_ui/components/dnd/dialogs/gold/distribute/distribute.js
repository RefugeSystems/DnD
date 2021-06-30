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
		rsSystem.components.RSCore
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		}
	},
	"computed": {
	},
	"data": function () {
		var data = {};

		data.entity = this.universe.getObject(this.details.entity);
		data.amount = null;

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		$(this.$el).find("#amount")[0].focus();
	},
	"methods": {
		"distributeGold": function () {
			this.universe.send("send:gold", {
				"target": this.entity.id,
				"amount": this.amount
			});
			Vue.set(this, "amount", 0);
			this.closeDialog();
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