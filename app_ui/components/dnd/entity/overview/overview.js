
/**
 *
 *
 * @class dndEntityOverview
 * @constructor
 * @module Components
 * @param {Object} entity
 * @param {Object} profile
 * @param {Object} dashboard To override the entity's normal dashboard
 */
rsSystem.component("dndEntityOverview", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.DNDCore
	],
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		},
		"forcedDashboard": {
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function() {
				return this.universe.index.profile[this.entity.profile] || {};
			}
		}
	},
	"computed": {
		/**
		 * 
		 * @property location
		 * @type Object
		 */
		"location": function() {
			if(this.entity.location && this.universe.index.location[this.entity.location]) {
				return this.universe.index.location[this.entity.location];
			}
			return {};
		},
		/**
		 * 
		 * @property image
		 * @type Object
		 */
		"image": function() {
			if(this.dashboard && this.dashboard.attribute.picture_only) {
				return this.universe.index.image[this.entity.picture];
			} else if(this.dashboard && this.dashboard.attribute.portrait_only) {
				return this.universe.index.image[this.entity.portrait];
			} else if(this.location && this.location.background && (!this.dashboard || !this.dashboard.attribute.picture_only)) {
				return this.universe.index.image[this.location.background];
			} else if(this.entity.picture) {
				return this.universe.index.image[this.entity.picture];
			}
		},

		"dashboard": function() {
			var i;

			if(this.forcedDashboard) {
				return this.forcedDashboard;
			} else if(this.entity.dashboard && this.universe.index.dashboard[this.entity.dashboard]) {
				return this.universe.index.dashboard[this.entity.dashboard];
			} else if(this.profile.default_dashboard && this.universe.index.dashboard[this.profile.default_dashboard]) {
				return this.universe.index.dashboard[this.profile.default_dashboard];
			} else {
				for(i=0; i<this.universe.listing.dashboard.length; i++) {
					if(this.universe.listing.dashboard[i].default_value && !this.universe.listing.dashboard[i].is_preview && !this.universe.listing.dashboard[i].disabled) {
						return this.universe.listing.dashboard[i];
					}
				}
			}
			return null;
		},

		"widgets": function() {
			var widgets = [],
				widget,
				i;

			if(this.dashboard) {
				if(this.dashboard.attribute && this.dashboard.attribute.classing && this.$el) {
					this.$el.classList.add(this.dashboard.attribute.classing);
				}

				for(i=0; i<this.dashboard.widgets.length; i++) {
					widget = this.universe.index.widget[this.dashboard.widgets[i]];
					if(widget && !widget.disabled) {
						widgets.push(widget);
					}
				}
			}

			return widgets;
		}
	},
	"data": function() {
		var data = {};

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);

		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.index.index[follow.value]) && this.isOwner(follow)) {
				rsSystem.EventBus.$emit("display-info", {
					"record": follow,
					"base": this.viewing
				});
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		"hoveredObject": function(object) {
			this.$emit("hovered-object", object);
		},
		"toggleBoundry": function(object) {
			this.$emit("toggle-boundry", object);
		},
		"getImageURL": function() {
			if(this.location) {
				return location.protocol + "//" + rsSystem.configuration.address + "/api/v1/image/" + this.location.id;
			}
			return null;
		}
	},
	"beforeDestroy": function() {
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/entity/overview.html")
});
