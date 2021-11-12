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

		data.tick_time = [];
		data.ticks = [];
		data.start = this.universe.time;
		data.end = this.universe.time;
		data.max_offset = 0;
		/**
		 * The total time spaned by the timeline
		 * @property timeline_span
		 * @type number
		 */
		data.timeline_span = 0;
		/**
		 * The width of the HTML element for the timeline render
		 * @property timeline_length
		 * @type number
		 */
		data.timeline_length = 0;
		data.client_width = 0;
		/**
		 * The number of seconds to include in a single tick in the timeline render.
		 * @property time_scale
		 * @type number
		 */
		data.time_scale = 1;
		/**
		 * The width a single time_scale in pixels for rendering
		 * @property time_width
		 * @type number
		 */
		data.time_width = 100;
		/**
		 * When not null, it tells the rendered to draw a bar at that coordinate for the mouse
		 * @property render_mouse
		 * @type Number
		 */
		data.render_mouse = null;
		data.render_decelleration_timing = 25;
		data.render_decelleration_step = 0;
		data.render_decelleration = 0;
		data.render_velocity = 0;
		data.client_ticks = 0;
		data.render_next = null;
		data.start_tick = 0;
		data.end_tick = 0;
		data.nearest_distance = 0;
		data.nearest = null;
		data.bounds = null;
		data.distTop = -30;
		data.distBot = 30;
		data.lastTop = [];
		data.lastBot = [];
		data.track_x = 0;
		data.track_y = 0;
		data.swap = true;
		data.jump = 0;
		data.age = 0;

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		// this.universe.$on("update", this.update);
		this.container = this.$el.getElementsByClassName("timeline-container")[0];
		this.rendering = this.$el.getElementsByClassName("timeline-render")[0];
		this.pouch = this.$el.getElementsByClassName("rendering-pouch")[0];
		this.context = this.rendering.getContext("2d");
		this.rendering.height = 300;
		if(!this.storage.render_offset) {
			/**
			 * Time value to offset for the viewport.
			 * @property storage.render_offset
			 * @type Number
			 */
			Vue.set(this.storage, "render_offset", 0);
		} else {
			Vue.set(this, "jump", this.render_offset);
		}

		this.bounds = this.rendering.getBoundingClientRect();
		this.container.addEventListener("mouseenter", this.followMouse);
		this.container.addEventListener("mouseleave", this.ignoreMouse);
		this.container.addEventListener("mousemove", this.mouseMoved);
		window.addEventListener("resize", this.resized);

		this.buildEventData();
	},
	"methods": {
		"render": function(context, force_velocity) {
			context = context || this.context;
			context.canvas.width = this.client_width;
			var startTick,
				startTime,
				endTick,
				endTime,
				i;

			if(0 < this.max_offset && this.max_offset < this.storage.render_offset) {
				Vue.set(this.storage, "render_offset", this.max_offset);
				this.render_velocity = 0;
			}
			if(this.storage.render_offset < 0) {
				Vue.set(this.storage, "render_offset", 0);
				this.render_velocity = 0;
			} 

			startTime = this.start + this.storage.render_offset - this.time_scale;
			startTick = Math.floor(this.storage.render_offset/this.time_scale);
			this.start_tick = Math.floor(this.storage.render_offset/this.time_scale);
			endTime = this.start + this.storage.render_offset + this.time_scale * (1 + Math.floor(this.client_width/this.time_width));
			endTick = Math.ceil((this.storage.render_offset + this.time_scale * (1 + Math.floor(this.client_width/this.time_width)))/this.time_scale);
			this.end_tick = Math.ceil((this.storage.render_offset + this.time_scale * (1 + Math.floor(this.client_width/this.time_width)))/this.time_scale);

			// console.log("Rendering: " + this.start + "[" + startTime + "|" + this.start_tick + "] --> " + this.end + "[" + endTime + "|" + this.end_tick + "]");
			// Level Set
			if(this.start_tick < 1) {
				this.start_tick = 1;
			}
			if(this.ticks.length < this.end_tick) {
				this.end_tick = this.ticks.length;
			}

			// Render Basics
			context.clearRect(0, 0, context.canvas.width, context.canvas.height);
			this.renderMainBranch(context);
			context.strokeStyle = "#3355aa";
			context.fillStyle = "#3355aa";	
			this.renderTicks(context, this.start_tick, this.end_tick);

			// Render Cursor Bar for Time (Over Axis, Under Events)
			this.swap = true;
			this.renderEventTags(context, this.start_tick, this.end_tick);
			this.renderMouseBar(context, this.start_tick, this.end_tick);
			this.renderEventIcons(context, this.start_tick, this.end_tick);

			// Decellerate
			if(this.render_velocity) {
				if(force_velocity || this.render_next === null) {
					if(this.render_next) {
						clearTimeout(this.render_next);
					}
					this.render_next = setTimeout(() => {
						// console.log("Next[" + this.storage.render_offset + "]: " + this.render_velocity + " @" + this.render_decelleration);
						this.render_decelleration_step--;
						this.render_next = null;
						this.setOffset(this.storage.render_offset + this.render_velocity);
						this.render_velocity += this.render_decelleration;
						this.render_decelleration /= 2;
						if(this.render_decelleration_step <= 0 || this.render_velocity < this.render_terminal) {
							this.render_velocity = 0;
						} else {
							this.render(context);
						}
					}, this.render_decelleration_timing);
				}
			}

		},
		"renderMainBranch": function(context) {
			context.strokeStyle = "#3355aa";
			context.fillStyle = "#3355aa";
			context.lineWidth = "2";

			context.beginPath();
			// Start Bubble
			context.arc(this.timeToPoint(this.start), 150, this.bulbSize, 0, this.fullArc);
			// context.arc(this.padding, 150, this.bulbSize, 0, this.fullArc);
			// End Bubble
			context.arc(this.timeToPoint(this.end), 150, this.bulbSize, 0, this.fullArc);
			// context.arc(this.timeline_length + this.padding, 150, this.bulbSize, 0, this.fullArc);
			// Render
			context.fill();
			context.stroke();
		},
		"renderTicks": function(context, start, end) {
			var time,
				i;

			context.strokeStyle = "#3355aa";
			context.fillStyle = "#3355aa";
			context.lineWidth = "1";
			for(i=start; i<=end && i<this.ticks.length; i++) {
				time = this.timeToPoint(this.tick_time[i]);
				context.beginPath();
				context.moveTo(time, 140);
				context.lineTo(time, 160);
				context.stroke();
			}
		},
		"renderMouseBar": function(context) {
			if(this.render_mouse !== null && this.render_velocity === 0) {
				var time = this.pointToTime(this.render_mouse);

				context.strokeStyle = "#cc5533";
				context.fillStyle = "#cc5533";
				context.lineWidth = "1";
				context.beginPath();
				context.moveTo(this.render_mouse, 0);
				context.lineTo(this.render_mouse, 300);
				context.stroke();

				context.strokeStyle = "#ffffff";
				context.fillStyle = "#ffffff";
				context.lineWidth = "1";
				context.roundRect(this.render_mouse-5, 137, 220, 26, 5);
				// this.drawRoundedRectangle(context, this.render_mouse-5, 137, 220, 26, 5);
				context.fill();

				context.strokeStyle = "#000000";
				context.fillStyle = "#000000";
				context.font = "20px \"Times New Roman\", serif";
				context.textBaseline = "middle";

				context.fillText(this.universe.calendar.toDisplay(time, false), this.render_mouse, 150, 200);
				Vue.set(this, "age", Math.floor((this.universe.time - time)/this.universe.calendar.CONSTANTS.day));
			}
		},
		"renderEventTags": function(context, start, end) {
			// console.log("Render Event Tags: ", start, end);
			var time,
				i,
				j;

			context.strokeStyle = "#3355aa";
			context.fillStyle = "#3355aa";
			context.lineWidth = "1";
			for(i=start; i<=end && i<this.ticks.length; i++) {
				// console.log(" - Render Event Tag[" + i + "]: " + this.tick_time[i], this.ticks[i]);
				for(j=0; j<this.ticks[i].length; j++) {
					this.renderEventTag(context, this.ticks[i][j]);
				}
			}
		},
		"renderEventTag": function(context, event) {
			var x = this.timeToPoint(event.time);
			context.lineWidth = "1";
			// console.log(" ! Rendering: " + event.time, event);
			
			context.beginPath();
			context.moveTo(x, 150);
			event._renderTop = this.swap;
			if(this.swap) {
				event._renderTag = 150 + this.distTop;
				event._y = event._renderTag - 15;
				this.lastTop.unshift(x);
				event._renderSide = 1;
				if(this.lastTop.length > 3) {
					this.lastTop.pop();
				}
			} else {
				event._renderTag = 150 + this.distBot;
				event._y = event._renderTag + 15;
				this.lastBot.unshift(x);
				if(this.lastBot.length > 3) {
					this.lastBot.pop();
				}
			}
			this.swap = !this.swap;
			event._x = x;
			context.lineTo(x, event._renderTag);
			context.stroke();
		},
		"renderEventIcons": function(context, start, end) {
			// console.log("Render Event Icons: ", start, end);
			var time,
				i,
				j;

			context.strokeStyle = "#3355aa";
			context.fillStyle = "#3355aa";
			context.lineWidth = "1";
			for(i=start; i<=end && i<this.ticks.length; i++) {
				// console.log(" - Render Event Icon[" + i + "]: " + this.tick_time[i], this.ticks[i]);
				for(j=0; j<this.ticks[i].length; j++) {
					this.renderEventIcon(context, this.ticks[i][j]);
				}
			}
		},
		"renderEventIcon": function(context, event) {
			// console.log(" ! Rendering Event Icon: " + event.time);
			var x = this.timeToPoint(event.time);
			context.strokeStyle = "#ffffff";
			if(this.nearest && this.nearest.id === event.id) {
				context.fillStyle = "#3355aa";
			} else {
				context.fillStyle = "#000000";
			}
			context.lineWidth = "1";
			
			context.beginPath();
			context.arc(x, event._y, 15, 0, this.fullArc);
			context.fill();
			context.stroke();

			context.strokeStyle = "#000000";
			context.fillStyle = "#ffffff";
			context.lineWidth = "1";
			this.drawEventIcon(context, event, x, event._y);
		},



		"setIconography": function(event) {
			const i = document.createElement("i");
			i.setAttribute("class", event.icon);
			this.pouch.appendChild(i);
	
			// get the styles for the icon you just made
			const iStyles = window.getComputedStyle(i),
				iBeforeStyles = window.getComputedStyle(i, ":before"),
	
				fontFamily = iStyles.getPropertyValue("font-family"),
				fontWeight = iStyles.getPropertyValue("font-weight"),
				fontSize = "16px", // just to make things a little bigger...
	
				canvasFont = `${fontWeight} ${fontSize} ${fontFamily}`, // should be something like: '900 40px "Font Awesome 5 Pro"'
				icon = String.fromCodePoint(iBeforeStyles.getPropertyValue("content").codePointAt(1)); // codePointAt(1) because the first character is a double quote
	
			event._icon_font = canvasFont;
			event._icon_text = icon;
			this.pouch.removeChild(i);
		},
		"drawEventIcon": function(context, event, x, y) {
			context.font = event._icon_font;
			context.textBaseline = "middle";
			context.textAlign = "center";
			context.fillText(event._icon_text, x, y);
		},
		"drawRoundedRectangle": function(context, x, y, w, h, r) {
			if (w < 2 * r) {
				r = w / 2;
			}
			if (h < 2 * r) {
				r = h / 2;
			}
			context.beginPath();
			context.moveTo(x+r, y);
			context.arcTo(x+w, y,   x+w, y+h, r);
			context.arcTo(x+w, y+h, x,   y+h, r);
			context.arcTo(x,   y+h, x,   y,   r);
			context.arcTo(x,   y,   x+w, y,   r);
			context.closePath();
		},


		"setOffset": function(offset) {
			offset = parseInt(offset);
			Vue.set(this.storage, "render_offset", offset);
			Vue.set(this, "jump", this.start + offset);
		},
		"jumpToStart": function() {
			this.render_velocity = 0;
			var time = this.start;
			Vue.set(this, "jump", time);
			this.jumpTimeline(time);
		},
		"jumpToEnd": function() {
			this.render_velocity = 0;
			var time = this.end;
			Vue.set(this, "jump", time);
			this.jumpTimeline(time);
		},
		"jumpTimeline": function(time) {
			this.render_velocity = 0;
			if(time < this.start) {
				time = this.start;
			} else if(this.end < time) {
				time = this.end - this.time_scale;
			}
			Vue.set(this.storage, "render_offset", time - this.start);
			this.update();
		},


		/**
		 * Get the point for rendering in the window. This essentially handles relative translation
		 * of the x axis for the viewport to the timeline.
		 * @method pointToFrame
		 * @param {Number} x 
		 */
		"pointToFrame": function(x) {

		},
		"pointInEvent": function(event, x, y) {

		},
		"pointToTime": function(x) {
			return this.start + this.storage.render_offset + this.widthToTimespan(this.client_width * x/this.client_width);
		},
		"widthToTimespan": function(width) {
			return width/this.time_width*this.time_scale;
		},
		"timespanToWidth": function(span) {
			return span/this.time_scale*this.time_width;
		},
		"timeToPoint": function(time) {
			var x = 0;
			time -= this.storage.render_offset;
			time -= this.start;
			x += this.timeline_length * time/this.timeline_span;
			return x;
		},
		"distanceBetweenPoints": function(x1, y1, x2, y2) {
			x1 = x2 - x1;
			y1 = y2 - y1;
			return Math.sqrt((x1*x1) + (y1*y1));
		},
		"findNearest": function(x, y) {
			if(this.start_tick && this.end_tick) {
				var nearest = null,
					distance,
					event,
					last,
					i,
					j;
	
				for(i=this.start_tick; i<=this.end_tick && i<this.ticks.length; i++) {
					for(j=0; j<this.ticks[i].length; j++) {
						event = this.ticks[i][j];
						if(nearest) {
							distance = this.distanceBetweenPoints(x,y,event._x,event._y);
							if(distance < last) {
								nearest = event;
								last = distance;
							}
						} else {
							last = this.distanceBetweenPoints(x,y,event._x,event._y);
							nearest = event;
						}
					}
				}

				if(last < 40) {
					return nearest;
				}

				return null;
			}
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
				span = this.start,
				events = [],
				tick = 0,
				i = 0;

			events.push.apply(events, this.events);
			events.sort(rsSystem.utility.sortByTime);
			this.ticks.splice(0);
			while(events[i] && current < this.end) {
				this.tick_time[tick] = span;
				this.ticks[tick] = [];
				while(events[i] && events[i].time < current) {
					this.ticks[tick].push(events[i]);
					this.setIconography(events[i]);
					events[i]._tick = tick;
					events[i]._debug = this.universe.calendar.toDisplay(events[i].time);
					events[i]._scale = this.time_scale;
					events[i]._current = current;
					events[i]._i = i;
					i++;
				}
				current += this.time_scale;
				span += this.time_scale;
				tick += 1;
			}

			this.timeline_length = this.time_width * tick;
			if(this.jump === 0 || isNaN(this.jump)) {
				Vue.set(this, "jump", this.max);
			}
			
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

			this.start = this.start - (this.start%this.time_scale);
			this.end = this.end + (this.end%this.time_scale);
			this.timeline_span = this.end - this.start;
			this.start -= this.half_scale;
			this.end += this.half_scale;
			if(this.jump < this.start) {
				Vue.set(this, "jump", this.start);
			} else if(this.end < this.jump) {
				Vue.set(this, "jump", this.end);
			}
		},
		"setAvailableWidth": function() {
			this.bounds = this.rendering.getBoundingClientRect();
			this.client_width = this.container.clientWidth;
			this.client_ticks = this.client_width/this.time_width;
			this.max = this.end - this.widthToTimespan(this.client_width);
			this.max_offset = this.max - this.start;
		},
		"setControlConstants": function() {
			this.time_scale = 25 * this.universe.calendar.CONSTANTS.day;
			this.half_scale = this.time_scale/2;
		},



		"panTimeline": function(event) {
			// console.log("Pan: " + event.deltaX + " @" + event.velocityX, event);
			var pan = -1 * event.deltaX;
			Vue.set(this.storage, "render_offset", this.storage.render_offset + this.widthToTimespan(pan));
			Vue.set(this, "jump", this.storage.render_offset + this.start);
			this.render_velocity = this.widthToTimespan(event.velocityX * -200);
			this.render_decelleration = this.render_velocity/-2;
			this.render_terminal = this.render_velocity * .01;
			this.render_decelleration_step = 100;
			// console.log("Velocity: " + this.render_velocity + " @" + this.render_decelleration);
			// this.render_velocity = 0;
			this.render();
		},
		"tracked": function(event) {
			this.track_x = event.x;
			this.track_y = event.y;
		},
		"clicked": function(event) {
			var x = event.x - this.bounds.x;
			console.log("Clicked[" + event.x + "]: " + this.pointToTime(event.x) + " -> " + this.universe.calendar.toDisplay(this.pointToTime(x)), event);
			if(this.distanceBetweenPoints(event.x, event.y, this.track_x, this.track_y) < 5 && this.nearest) {
				this.info(this.nearest.point);
			}
		},
		"followMouse": function(event) {
			// console.log("Mouse Entered: ", event);
			this.render_mouse = event.x - this.bounds.x;
			this.render();
		},
		"ignoreMouse": function(event) {
			// console.log("Mouse Exited: ", event);
			Vue.set(this, "age", 0);
			this.render_mouse = null;
			this.render();
		},
		"mouseMoved": function(event) {
			var x = event.x - this.bounds.x,
				y = event.y - this.bounds.y,
				nearest;
			this.render_mouse = x;
			this.nearest = this.findNearest(x, y);
			// if(nearest) {
			// 	this.nearest = nearest;
			// } else {
			// 	this.nearest = null;
			// }
			this.render();
		},

		"resized": function() {
			this.setAvailableWidth();
			this.update();
		},

		"update": function(event) {
			this.buildEventData();
		}
	},
	"beforeDestroy": function() {
		this.container.removeEventListener("mouseenter", this.followMouse);
		this.container.removeEventListener("mouseleave", this.ignoreMouse);
		this.container.removeEventListener("mousemove", this.mouseMoved);
		window.removeEventListener("resize", this.resized);
		// this.universe.$off("update", this.update);
	},
	"template": Vue.templified("components/data/timeline.html")
});
