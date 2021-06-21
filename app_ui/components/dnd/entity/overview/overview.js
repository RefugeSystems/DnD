
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
			if(this.location && this.location.background) {
				return this.universe.index.image[this.location.background];
			} else if(this.entity.picture) {
				return this.universe.index.image[this.entity.picture];
			}
		},

		"widgets": function() {
			var widgets = [],
				dashboard,
				widget,
				i;

			if(this.entity.dashboard && (dashboard = this.universe.index.dashboard[this.entity.dashboard])) {
				
			} else if(this.profile.default_dashboard && (dashboard = this.universe.index.dashboard[this.profile.default_dashboard])) {

			} else {
				for(i=0; i<this.universe.listing.dashboard.length; i++) {
					if(this.universe.listing.dashboard[i].default_value && !this.universe.listing.dashboard[i].is_preview && !this.universe.listing.dashboard[i].disabled) {
						dashboard = this.universe.listing.dashboard[i];
						break;
					}
				}
			}

			if(dashboard) {
				if(!this.dashboard) {
					Vue.set(this, "dashboard", dashboard);
				}
				if(dashboard.attribute && dashboard.attribute.classing && this.$el) {
					this.$el.classList.add(dashboard.attribute.classing);
				}

				for(i=0; i<dashboard.widgets.length; i++) {
					widget = this.universe.index.widget[dashboard.widgets[i]];
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

		data.dashboard = this.forcedDashboard || null;

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
