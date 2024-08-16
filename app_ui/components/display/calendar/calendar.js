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
		// console.log("Data: Calendar");
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
		data.festivalReference = {};

		data.copied = null;
		data.copy_error = null;
		data.view = 2;
		data.reference = {
			"1": ["getDate", "setDate"],
			"2": ["getMonth", "setMonth"],
			"3": ["getYear", "setYear"]
		};

		this.build(this.details, this.universe, this.player, data.entity, data.eventReference, data.festivalReference);
		// console.log("Calendar Data: ", _p(data.eventReference), _p(data.festivalReference));

		return data;
	},
	"mounted": function () {
		// console.log("Mounted: Calendar");
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
		// this.build();
	},
	"methods": {
		"build": function(details, universe, player, entity, eventReference, festivalReference) {
			if(!details) {
				details = this.details;
			}
			if(!universe) {
				universe = this.universe;
			}
			if(!entity) {
				entity = this.entity;
			}
			if(!player) {
				player = this.player;
			}
			if(!eventReference) {
				eventReference = this.eventReference;
			}
			if(!festivalReference) {
				festivalReference = this.festivalReference;
			}
			// console.log("Build Calendar: ", details, universe, player, entity, _p(eventReference), _p(festivalReference));
			var years = Object.keys(eventReference),
				time = new universe.calendar.RSDate(),
				skirmish,
				event,
				day,
				i;

			for(i=0; i<years.length; i++) {
				Vue.delete(eventReference[years[i]]);
			}

			if(details.specialEvents) {
				for(i=0; i<details.specialEvents.length; i++) {
					event = details.specialEvents[i];
					time.setTime(event.time);
					day = this.indexEvent(time, event, eventReference);
				}
			}

			if(details.specialFestivals) {
				for(i=0; i<details.specialFestivals.length; i++) {
					event = details.specialFestivals[i];
					time.setTime(event.time);
					day = this.indexFestival(time, event, festivalReference);
				}
			}

			if(entity) {
				for(i=0; i<universe.listing.skirmish.length; i++) {
					skirmish = universe.listing.skirmish[i];
					if(rsSystem.utility.isValid(skirmish) && (skirmish.entities.indexOf(entity.id) !== -1 || player.gm)) {
						time.setTime(skirmish.time);
						day = this.indexEvent(time, skirmish, eventReference);
						day.skirmish = true;
					}
				}

				for(i=0; i<universe.listing.event.length; i++) {
					event = universe.listing.event[i];
					if(rsSystem.utility.isValid(event) && (event.associations.indexOf(entity.id) !== -1 || player.gm)) {
						time.setTime(event.time);
						day = this.indexEvent(time, event, eventReference);
					}
				}
			}
			// console.log("Calendar Built: ", _p(eventReference), _p(festivalReference));
		},
		"indexEvent": function(time, event, eventReference) {
			if(!eventReference) {
				eventReference = this.eventReference;
			}
			var year = time.getFullYear(),
				mon = time.getMonth(),
				day = time.getDate();
			if(!eventReference[year]) {
				eventReference[year] = {};
			}
			if(!eventReference[year][mon]) {
				eventReference[year][mon] = {};
			}
			if(!eventReference[year][mon][day]) {
				eventReference[year][mon][day] = {
					"skirmish": false,
					"travel": false,
					"events": []
				};
			}
			eventReference[year][mon][day].events.push(event);
			return eventReference[year][mon][day];
		},
		"indexFestival": function(time, event, festivalReference) {
			if(!festivalReference) {
				festivalReference = this.festivalReference;
			}
			var mon = time.getMonth(),
				day = time.getDate();
			if(!festivalReference[mon]) {
				festivalReference[mon] = {};
			}
			if(!festivalReference[mon][day]) {
				festivalReference[mon][day] = {
					"skirmish": false,
					"travel": false,
					"events": []
				};
			}
			festivalReference[mon][day].events.push(event);
			return festivalReference[mon][day];
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
		"getTimeStamp": function() {
			return this.rendering.getTime();
		},
		"copyTimeStamp": function() {
			try {
				if(!this.copied) {
					Vue.set(this, "copied", setTimeout(() => {
						Vue.set(this, "copied", null);
					}, 2000));
					navigator.clipboard.writeText(this.rendering.getTime());
				}
			} catch(err) {
				Vue.set(this, "copy_error", err.message);
			}
		},
		"viewYear": function() {
			if(this.view < 3) {
				Vue.set(this, "view", this.view + 1);
			}
		},

		"openYear": function(year) {
			// console.log("Open Year: ", year);
		},
		"openMonth": function(year, month) {
			// console.log("Open Month: ", year, month);
			Vue.set(this, "view", 2);
		},
		"openDay": function(year, month, day) {
			// console.log("Open Day: ", year, month, day);
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
			// console.log("Update Calendar");
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