/**
 *
 *
 * @class rsCalendarDialog
 * @constructor
 * @module Components
 * @param {Object} universe
 * @param {Object} player
 * @param {Object} entity
 * @param {UIProfile} profile
 */
rsSystem.component("rsCalendarDialog", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DialogController,
		rsSystem.components.StorageController
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

	},
	"data": function () {
		var data = {};

		data.calendar = this.details.calendar;
		data.entity = this.details.entity;
		data.error = null;

		// Create initial rendering data
		data.rendering = new this.details.calendar.RSDate();
		// Create another instance of now for reference that won't be changed
		data.today = new this.details.calendar.RSDate();

		/**
		 * Maps single instance events like acquiring knowledge or fights to an object by descending
		 * temporal value; Year > Month > Day
		 * 
		 * For Instance:
		 *	{
		 * 		"394": {							// Year
		 * 			"3": {							// Month
		 * 				"13": {						// Day
		 * 					"skirmish": false,		//  - Flags
		 * 					"knowledge": false,
		 * 					"events": [{			//  - Event List
		 * 						"name": "Example Skirmish",
		 * 						"id": "skirmish:1",
		 * 						...
		 * 					}]
		 * 				},
		 * 				"24": {
		 * 				}
		 * 			}
		 * 		}
		 *	}
		 * @property eventReference
		 * @type Object
		 */
		data.eventReference = {};

		data.view = 2;
		data.reference = {
			"1": ["getDate", "setDate"],
			"2": ["getMonth", "setMonth"],
			"3": ["getYear", "setYear"]
		};


		return data;
	},
	"mounted": function () {
		rsSystem.register(this);
		rsSystem.EventBus.$on("calendar:update", this.update);
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.get(follow.value))) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
		this.build();
	},
	"methods": {
		"build": function() {
			var years = Object.keys(this.eventReference),
				time = new this.universe.calendar.RSDate(),
				skirmish,
				event,
				day,
				i;

			for(i=0; i<years.length; i++) {
				Vue.delete(this.eventReference[years[i]]);
			}

			if(this.entity) {
				for(i=0; i<this.universe.listing.skirmish.length; i++) {
					skirmish = this.universe.listing.skirmish[i];
					if(rsSystem.utility.isValid(skirmish) && skirmish.entities.indexOf(this.entity.id) !== -1) {
						time.setTime(skirmish.time);
						day = this.indexEvent(time, skirmish);
						day.skirmish = true;
					}
				}

				for(i=0; i<this.universe.listing.event.length; i++) {
					event = this.universe.listing.event[i];
					if(rsSystem.utility.isValid(event) && event.associations.indexOf(this.entity.id) !== -1) {
						time.setTime(event.time);
						day = this.indexEvent(time, event);
					}
				}
			}
		},
		"indexEvent": function(time, event) {
			var year = time.getFullYear(),
				mon = time.getMonth(),
				day = time.getDate();
			if(!this.eventReference[year]) {
				this.eventReference[year] = {};
			}
			if(!this.eventReference[year][mon]) {
				this.eventReference[year][mon] = {};
			}
			if(!this.eventReference[year][mon][day]) {
				this.eventReference[year][mon][day] = {
					"skirmish": false,
					"travel": false,
					"events": []
				};
			}
			this.eventReference[year][mon][day].events.push(event);
			return this.eventReference[year][mon][day];
		},
		"getRenderingTitle": function() {
			var display = [],
				era;
			if(this.view < 4) {
				if(2 >= this.view) {
					display.push(this.calendar.getMonth(this.rendering.getMonth()).name);
				}
				if(1 >= this.view) {
					display.push(this.rendering.getDate() + ",");
				}
				if(3 >= this.view) {
					display.push(this.rendering.getFullYear());
				}
			} else {
				era = this.universe.get(this.calendar.era);
				display.push("Era of \"");
				display.push(era?era.name:"The Unknown");
				display.push("\"");
			}
			return display.join(" ");
		},
		"getRenderingSubtitle": function() {
			var display = [],
				era;
			if(this.view < 4) {
				if(2 >= this.view) {
					display.push(this.rendering.getMonth() + 1);
				}
				if(1 >= this.view) {
					display.push(this.rendering.getDate());
				}
				if(3 >= this.view) {
					display.push(this.rendering.getFullYear());
				}
			} else {
				era = this.universe.get(this.calendar.era);
				display.push(era?era.name:"The Unknown");
			}

			return display.join(" / ");
		},


		"viewYear": function() {
			if(this.view < 3) {
				Vue.set(this, "view", this.view + 1);
			}
		},

		"openYear": function(year) {
			console.log("Open Year: ", year);
		},
		"openMonth": function(year, month) {
			console.log("Open Month: ", year, month);
			Vue.set(this, "view", 2);
		},
		"openDay": function(year, month, day) {
			console.log("Open Day: ", year, month, day);
			Vue.set(this, "view", 1);
		},

		"previous": function() {
			if(this.reference[this.view]) {
				this.rendering[this.reference[this.view][1]](this.rendering[this.reference[this.view][0]]() - 1);
			} else {
				console.warn("TODO: Previous Era");
			}
			rsSystem.EventBus.$emit("calendar:update", this.rendering);
		},
		"next": function() {
			if(this.reference[this.view]) {
				this.rendering[this.reference[this.view][1]](this.rendering[this.reference[this.view][0]]() + 1);
			} else {
				console.warn("TODO: Next Era");
			}
			rsSystem.EventBus.$emit("calendar:update", this.rendering);
		},

		"viewingDay": function() {
			return this.view === 1;
		},
		"viewingMonth": function() {
			return this.view === 2;
		},
		"viewingYear": function() {
			return this.view === 3;
		},
		"era": function() {
			return this.view === 4;
		},
		"update": function() {
			setTimeout(() => {
				this.$forceUpdate();
			});
		}
	},
	"beforeDestroy": function () {
		rsSystem.EventBus.$off("calendar:update", this.update);
	},
	"template": Vue.templified("components/display/calendar.html")
});