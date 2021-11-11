/**
 * 
 * 
 * @class rsTimeline
 * @constructor
 * @module Components
 * @zindex 5
 * @param {Universe} universe
 * @param {Array} events
 * @param {Integer} events.time Time at which the event occured or started.
 * @param {Integer} [events.end] For events that span a length of time, this marks the end of that event.
 * @param {Object} events.point Underlying data point for the object.
 * @param {Object} events.tags
 * @param {Object} activeTags
 */
rsSystem.component("rsTimeline", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"events": {
			"required": true,
			"type": Array
		},
		"activeTags": {
			"required": false,
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"watch": {
		"events": {
			"deep": false,
			"handler": function() {
				this.update();	
			}
		},
		"activeTags": {
			"deep": true,
			"handler": function() {
				this.update();
			}
		}
	},
	"data": function() {
		var data = {};

		data.fullArc = Math.PI * 2;
		data.halfArc = Math.PI;
		
		data.rendering = null;
		data.container = null;
		data.width = 100;
		
		data.bubbleSize = 4;
		data.bulbSize = 7;
		data.padding = 20;
		data.minScale = .1;
		data.maxScale = 10;

		data.tickData = [];
		data.ticks = [];
		data.start = this.universe.time;
		data.end = this.universe.time;
		data.timeline_length = 0;
		data.clientWidth = 0;
		data.time_scale = 1;
		data.time_width = 100;
		data.render_accelleration = 0;
		data.render_velocity = 0;
		data.render_offset = 0;

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		// this.universe.$on("update", this.update);
		this.container = this.$el.getElementsByClassName("timeline-container")[0];
		this.rendering = this.$el.getElementsByClassName("timeline-render")[0];
		this.context = this.rendering.getContext("2d");
		this.rendering.height = 300;
		this.buildEventData();
	},
	"methods": {
		"render": function(context) {
			context = context || this.context;
			context.canvas.width = this.clientWidth;
			var startTick,
				startTime,
				endTick,
				endTime,
				i;

			startTime = this.start + this.render_offset - this.time_scale;
			startTick = Math.floor((this.render_offset - this.time_scale)/this.time_scale);
			endTime = this.start + this.render_offset + this.time_scale * (1 + Math.floor(this.clientWidth/this.time_width));
			endTick = Math.ceil(this.render_offset + this.time_scale * (1 + Math.floor(this.clientWidth/this.time_width))/this.time_scale);
			console.log("Rendering: " + this.start + "[" + startTime + "|" + startTick + "] --> " + this.end + "[" + endTime + "|" + endTick + "]");

			// Render Basics
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			this.renderMainBranch(context);
			this.renderTicks(context, startTick, endTick);

			// Render Events

			// Render Cursor Bar for Time

		},
		"renderMainBranch": function(context) {
			context.strokeStyle = "#3355aa";
			context.fillStyle = "#3355aa";
			context.lineWidth = "2";

			context.beginPath();
			// Start Bubble
			context.arc(this.padding, 150, this.bulbSize, 0, this.fullArc);
			// End Bubble
			context.arc(this.timeline_length + this.padding, 150, this.bulbSize, 0, this.fullArc);
			// Render
			context.fill();
			context.stroke();
		},
		"renderTicks": function(context, start, end) {
			console.log("Render Ticks: ", start, end);
			var i, j;

			if(start < 1) {
				start = 1;
			}
			if(this.ticks.length < end) {
				end = this.ticks.length;
			}
			context.lineWidth = "1";
			for(i=start; i<=end; i++) {
				context.beginPath();
				context.moveTo(i * this.time_width, 140);
				context.lineTo(i * this.time_width, 160);
				context.stroke();
				// Render Events in tick
				console.log(" - Render Tick[" + i + "]: ", this.ticks[i]);
				// for(j=0; j<this.ticks[i].length; j++) {

				// }
			}
		},
		"renderEvent": function(context, event) {
			context.lineWidth = "1";

		},


		"clicked": function(event) {
			console.log("Clicked[" + event.x + "]: " + this.pointToTime(event.x) + " -> " + this.universe.calendar.toDisplay(this.pointToTime(event.x)));
			// Scan events in X-50 -> X+50 range opening the closest by distance calculation
		},
		"pointInEvent": function(event, x, y) {

		},
		"pointToTime": function(x) {
			var time = this.start;
			x = this.render_offset + x - this.padding;
			time += this.timeline_span * x/this.timeline_length;
			return time;
		},
		"distanceBetweenPoints": function(x1, y1, x2, y2) {
			x1 = x2 - x1;
			y1 = y2 - y1;
			return Math.sqrt((x1*x1) + (y1*y1));
		},


		/**
		 * Builds out the tick array and set
		 * @method buildEventData
		 */
		"buildEventData": function() {
			this.setControlConstants();
			this.setAvailableWidth();
			this.setSpan();

			var current = this.start + this.time_scale,
				events = [],
				tick = 0,
				i = 0;

			events.push.apply(events, this.events);
			events.sort(rsSystem.utility.sortByTime);
			this.ticks.splice(0);
			while(events[i] && current < this.end) {
				this.ticks[tick] = [];
				while(events[i] && events[i].time < current) {
					this.ticks[tick].push(events[i]);
					events[i]._tick = tick;
					events[i]._debug = this.universe.calendar.toDisplay(events[i].time);
					events[i]._scale = this.time_scale;
					events[i]._current = current;
					events[i]._i = i;
					i++;
				}
				current += this.time_scale;
				tick += 1;
			}

			this.timeline_length = this.time_width * tick;
			
			this.render(this.context);
		},
		/**
		 * Sets the start and end variables
		 * @method setSpan
		 */
		"setSpan": function() {
			var debug = [],
				event,
				i;

			this.start = this.universe.time;
			this.end = this.universe.time;
			for(i=0; i<this.events.length; i++) {
				event = this.events[i];
				debug.push(event.time + ": " + event.name);
				if(event.time < this.start) {
					this.start = event.time;
				}
				if(event.end && this.end < event.end) {
					this.end = event.end;
				} else if(this.end < event.time) {
					this.end = event.time;
				}
			}

			console.log("MidSet:1:[" + this.events.length + "]: " + this.start + " -> " + this.end);
			this.start = this.start - (this.start%this.time_scale);
			this.end = this.end + (this.end%this.time_scale);
			this.timeline_span = this.end - this.start;
			console.log("MidSet:2:[" + this.events.length + "]: " + this.start + " -> " + this.end);
			this.start -= this.half_scale;
			this.end += this.half_scale;
			console.log("MidSet:3:[" + this.events.length + "]: " + this.start + " -> " + this.end);
			console.log("Set[" + this.events.length + "]: ", debug);
		},
		"setAvailableWidth": function() {
			return this.clientWidth = this.container.clientWidth;
		},
		"setControlConstants": function() {
			this.time_scale = 25 * this.universe.calendar.CONSTANTS.day;
			this.half_scale = this.time_scale/2;
		},


		"update": function(event) {
			console.log("Timeline Update: ", event);
			this.buildEventData();
		}
	},
	"beforeDestroy": function() {
		// this.universe.$off("update", this.update);
	},
	"template": Vue.templified("components/data/timeline.html")
});
