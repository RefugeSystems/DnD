/**
 *
 *
 * @class dndCard
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("dndDefenses", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController,
		rsSystem.components.RSShowdown
	],
	"props": {
		"details": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object
		},
		"player": {
			"type": Object
		}
	},
	"computed": {
		"max_carry": function() {
			return this.entity.encumberance_max?this.entity.encumberance_max.toFixed(2):0;
		}
	},
	"data": function () {
		var data = {},
			items,
			i;

		data.action_field = this.universe.index.fields.action_count;
		data.entity = this.details.entity;
		data.actions = [];
		data.bag_weight = 0;

		items = data.entity.action_count?Object.keys(data.entity.action_count):[];
		for(i=0; i<items.length; i++) {
			if(data.entity.action_max[items[i]]) {
				data.actions.push(items[i]);
			}
		}

		items = this.universe.transcribeInto(this.details.entity.inventory);
		for(i=0; i<items.length; i++) {
			data.bag_weight += items[i].weight;
		}

		data.resistances = data.entity.resistance?Object.keys(data.entity.resistance):[];
		data.resistances = this.universe.transcribeInto(data.resistances);

		data.bag_weight = data.bag_weight.toFixed(2);
		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.get(follow.value))) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		"nameAction": function(action) {
			if(this.action_field && this.action_field.display_as) {
				return this.action_field.display_as[action] || action.capitalize();
			}
			return action.capitalize();
		},
		"useAction": function(action) {
			console.log("Use: ", action);
			this.universe.send("action:count", {
				"entity": this.entity.id,
				"action": action,
				"delta": -1
			});
		},
		"refundAction": function(action) {
			console.log("Refund: ", action);
			this.universe.send("action:count", {
				"entity": this.entity.id,
				"action": action,
				"delta": 1
			});
		}
	},
	"beforeDestroy": function () {

	},
	"template": Vue.templified("components/dnd/dialogs/defenses.html")
});