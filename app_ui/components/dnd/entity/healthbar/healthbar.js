/**
 *
 *
 * @class dndDisplayGeneral
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityHealthbar", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore
	],
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {};
		data.health = 0;
		data.temphp = 0;
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.updateBar();
		this.$watch("entity.hp", function() {
			this.updateBar();
		});
		this.$watch("entity.hp_max", function() {
			this.updateBar();
		});
		this.$watch("entity.hp_temp", function() {
			this.updateBar();
		});
	},
	"methods": {
		"updateBar": function() {
			Vue.set(this, "health", Math.floor(100*(this.entity.hp || 0)/(this.entity.hp_max || 1)));
			Vue.set(this, "temphp", Math.floor(100*(this.entity.hp_temp || 0)/(this.entity.hp_max || 1)));
			if(this.$el && this.$el.classList) {
				this.$el.classList.remove("okay");
				this.$el.classList.remove("warn");
				this.$el.classList.remove("bad");
				if(this.health > 30) {
					this.$el.classList.add("okay");
				} else if(this.health > 10) {
					this.$el.classList.add("warn");
				} else {
					this.$el.classList.add("bad");
				}
			}

			// Set width and mange that "bar" may not have instantiated yet
			var bar = $(this.$el).find(".hp.bar"),
				tmp = $(this.$el).find(".thp.bar");
			if(this.health) {
				if(bar.length) {
					bar.css({"width": this.health + "%"});
					tmp.css({"width": this.temphp + "%"});
				} else {
					setTimeout(() => {this.updateBar();}, 10);
				}
			}
		}
	},
	"beforeDestroy": function() {
	},
	"template": Vue.templified("components/dnd/entity/healthbar.html")
});
