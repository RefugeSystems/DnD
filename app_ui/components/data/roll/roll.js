/**
 *
 *
 * @class rsRoll
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("rsRoll", {
	"inherit": true,
	"mixins": [],
	"props": {
		"value": {
			"required": false,
			"type": Object
		},
		"roll": {
			"required": false,
			"type": String
		},
		"universe": {
			"requried": true,
			"type": Object
		},
		"entity": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function () {
				return {};
			}
		}
	},
	"data": function () {
		var data = {};
		data.cb = null;
		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
	},
	"methods": {
		"receiveRoll": function(event) {
			var footnote;
			if(event.dice_rolls.vantage) {
				footnote = event.dice_rolls.vantage[0] + " (" + event.dice_rolls.vantage[1] + ")";
			}
			if(typeof(this.waiting[event.callback_id]) === "number") {
				event.delay = Date.now() - this.waiting[event.callback_id];
				delete(this.waiting[event.callback_id]);
				this.storage.rolls.unshift(event);
				if(this.storage.rolls.length > 20) {
					this.storage.rolls.splice(20);
				}
				Vue.set(this, "active", event);
				this.$forceUpdate();
			} else if(typeof(this.waiting[event.callback_id]) === "object") {
				Vue.set(this.waiting[event.callback_id], "computed", event.computed);
				Vue.set(this.waiting[event.callback_id], "dice_rolls", event.dice_rolls);
				this.storage.rolls.unshift(event);
				if(this.waiting[event.callback_id].skill) {
					event.name = this.waiting[event.callback_id].skill.name;
					if(footnote) {
						event.footnote = footnote;
					}
					if(this.storage.rolls.length > 20) {
						this.storage.rolls.splice(20);
					}
				}
				delete(this.waiting[event.callback_id]);
				this.$forceUpdate();
			}
		},
		"rollSkill": function(check, advantage) {
			if(!check.computed) {
				var cb = Random.identifier("roll", 10, 32);
				Vue.set(this, "cb", cb);
				this.universe.send("roll:object", {
					"id": this.entity.id,
					"formula": check.formula,
					"advantage": advantage,
					"id": cb
				});
			}
		}
	},
	"beforeDestroy": function () {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/dialogs/actions/damage.html")
});