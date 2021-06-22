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
			if(this.widget.cell_width) {
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
		"performSkillCheck": function(skill) {
			var action = this.universe.index.action[action];
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"skill": skill,
				"action": action,
				"closeAfterCheck": true
			});
		},
		"takeAction": function(action, using, rolls, targeted) {
			rolls.unshift({});
			var rolling = Object.assign.apply(Object.assign, rolls);
			if(typeof(action) === "string") {
				action = this.universe.index.action[action];
			}

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
		},
		"startRoll": function(rolling, targeted) {
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogRoll",
				"storageKey": "store:roll:" + this.entity.id,
				"entity": this.entity.id,
				"targeted": targeted,
				"rolling": rolling
			});
		},
		"sortData": rsSystem.utility.sortData,
		"noOp": function() {}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/space.html")
});
