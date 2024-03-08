/**
 *
 *
 * @class DNDReview
 * @constructor
 * @module Components
 */
rsSystem.component("DNDReview", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController,
		rsSystem.components.RSShowdown
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
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"meeting": function() {
			var meet,
				i;

			for(i=0; i<this.universe.listing.meeting.length; i++) {
				meet = this.universe.listing.meeting[i];
				if(meet && meet.is_active && !meet.disabled && !meet.is_preview) {
					return meet;
				}
			}

			return null;
		},
		"last": function() {
			return this.universe.get(this.meeting.meeting_previous);
		},
		"weather": function() {
			return this.universe.get(this.meeting.weather);
		},
		"location": function() {
			return this.universe.get(this.meeting.location);
		},
		"reminders": function() {
			var reminders = [],
				remember,
				i;
			if(this.meeting.important) {
				for(i=0; i<this.meeting.important.length; i++) {
					remember = this.universe.get(this.meeting.important[i]);
					if(rsSystem.utility.isValid(remember) && !remember.obscured && !remember.is_obscured && remember._class !== "dmtask" && remember._class !== "quest") {
						reminders.push(remember);
					}
				}
			}
			return reminders;
		},
		"updates": function() {
			// Pulls from Meeting important as a stop-gap until full release tracking across universes is better implemented
			var reminders = [],
				remember,
				i;
			if(this.meeting.important) {
				for(i=0; i<this.meeting.important.length; i++) {
					remember = this.universe.get(this.meeting.important[i]);
					if(rsSystem.utility.isValid(remember) && !remember.obscured && !remember.is_obscured && remember._class === "dmtask") {
						reminders.push(remember);
					}
				}
			}
			return reminders;
		},
		"quests": function() {
			// Pulls from Meeting important as a stop-gap until full release tracking across universes is better implemented
			var reminders = [],
				remember,
				i;
			if(this.meeting.important) {
				for(i=0; i<this.meeting.important.length; i++) {
					remember = this.universe.get(this.meeting.important[i]);
					if(rsSystem.utility.isValid(remember) && !remember.obscured && !remember.is_obscured && remember._class === "quest") {
						reminders.push(remember);
					}
				}
			}
			return reminders;
		},
		"entity": function() {
			return this.universe.index.entity[this.$route.params.entity || this.player.attribute.playing_as];
		},
		"today": function() {
			return this.universe.calendar.toDisplay(this.universe.time, false);
		}
	},
	"watch": {

	},
	"data": function() {
		var data = {};
		
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		this.universe.$on("updated", this.checkUpdate);
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.getObject(follow.value))) {
				rsSystem.EventBus.$emit("display-info", {
					"info": follow.id,
					"view": this.view
				});
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		/**
		 * 
		 * @method displayDate
		 * @param {Integer} time 
		 * @param {Object} [options]
		 * @returns {String}
		 */
		"displayDate": function(time, options) {
			return this.universe.calendar.toDisplay(time, false, true, false);
		},
		/**
		 * 
		 * @method openCalendar
		 * @param {Integer} time 
		 * @param {Array | Object} [specialEvents]
		 * @param {RSObject} [entity]
		 */
		"openCalendar": function(time, entity, specialEvents, specialFestivals) {
			var loading;
			specialEvents = specialEvents || [];
			specialFestivals = specialFestivals || [];
			entity = entity || this.entity;
			if(entity && entity.birthday) {
				loading = this.universe.calendar.breakdownGameTime(entity.birthday);
				loading.name = "Birthday";
				loading.time = entity.birthday;
				loading.repeat_span = this.universe.calendar.CONSTANTS.year;
				loading.repeats = "span";
				specialFestivals.push(loading);
				specialEvents.push(loading);
			}

			rsSystem.EventBus.$emit("dialog-open", {
				"component": "rsCalendarDialog",
				"calendar": this.universe.calendar,
				"specialFestivals": specialFestivals,
				"specialEvents": specialEvents,
				"entity": entity,
				"time": time
			});
		},
		"checkUpdate": function(event) {
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("updated", this.checkUpdate);
	},
	"template": Vue.templified("pages/dnd/review.html")
});
