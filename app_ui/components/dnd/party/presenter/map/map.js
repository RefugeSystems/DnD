
/**
 *
 *
 * @class dndPresenterMap
 * @constructor
 * @module Components
 */
rsSystem.component("dndPresenterMap", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDCore
	],
	"props": {
		"presenting": {
			"required": true,
			"type": Object
		}
	},
	"data": function() {
		var data = {};

		data.updateStep = 1000;

		data.activeMeeting = this.universe.index.setting["setting:meeting"]?this.universe.index.meeting[this.universe.index.setting["setting:meeting"].value]:null;
		data.hourClassing = "time-hour-" + this.universe.calendar.hour;

		data.hourOfDay = this.universe.calendar.hour;
		data.viewingEntity = null;
		data.search_criteria = [];

		data.initializing = true;
		data.baseFontSize = 13;
		data.scaledSize = 0;

		data.lengths = rsSystem.math.distance.lengths;
		data.distancing = [];
		data.total_length = 0;
		data.totalLength = 0;
		data.totalTime = 0;
		data.distance = 0;
		
		data.original = {};
		data.parchment = null;
		data.element = null;
		data.ready = false;

		data.stylePosition = {};
		data.styleTL = {};
		data.styleBR = {};


		data.renderedLocation = null;
		data.canvasElement = null;
		data.resetViewportFlag = true;
		data.focusedLocation = null;
		data.availableLocaleTypes = [];
		data.availableCanvases = {};
		data.availableLocales = {};
		data.pointsOfInterest = [];
		data.availablePOIs = [];
		// data.coordinates = [];
		data.parties = [];
		data.locales = [];
		data.image = {};
		data.pins = true;
		data.alter = "";
		data.delayed = null;
		data.applyTiming = 0;
		data.last = 0;

		data.localeInfo = {
			"event": "info-key",
			"icon": "fas fa-location-circle",
			"shown": false
		};

		data.canvas = null;

		return data;
	},
	"watch": {
		"presenting": {
			"deep": true,
			"handler": function() {
				this.redrawPaths();
				this.update();
				if(this.presenting.map_center) {
					this.centerView(this.presenting.map_center, this.presenting.map_center.zoom);
					Vue.delete(this.presenting, "map_center");
				}
			}
		}
	},
	"mounted": function() {
		this.canvasElement = $("canvas.map-paths");
		Vue.set(this, "element", $(this.$el));

		rsSystem.register(this);

		/**
		 * 
		 * @event presenter:request:map
		 * @param {Object} event
		 * @param {String} event.type Control for what to perform
		 * @param {Object} event.data To pass to the control
		 * @param {Number} event.date For when the co
		 */
		this.universe.$on("presenter:request:map", this.processEvent);
		this.universe.$on("updated", this.update);

		this.update();
	},
	"methods": {
		"processEvent": function(event) {
			console.log("Presenter Map Event: ", event);
		},
		"getMarkerSize": function() {
			return Math.min(this.baseFontSize + this.presenting.map_parameters.zoom, this.presenting.location.max_font_size || 50);
		},
		"searchMap": function() {
			var set = false,
				buffer,
				entity,
				x;

			Vue.set(this, "focusedLocation", null);
			if(this.search_criteria[0] === "self" || this.search_criteria[0] === "me") {
				if(this.player.attribute && (entity = this.universe.index.entity[this.player.attribute.playing_as]) && (buffer = this.universe.index.location[entity.location])) {
					if(entity.x && entity.y && entity.location === this.presenting.location.id) {
						this.centerView(entity);
						set = true;
					} else {
						while(buffer && buffer.location !== this.presenting.location.id) {
							buffer = this.universe.index.location[buffer.location];
						}
						if(buffer) {
							Vue.set(this, "focusedLocation", buffer.id);
							this.centerView(buffer);
							set = true;
						}
					}
				}
			} else {
				for(x=0; !set && x<this.availablePOIs.length; x++) {
					buffer = this.availablePOIs[x];
					// console.warn("Searching[" + buffer.id + "]: ", buffer);
					if(buffer.x && buffer.y && this.testSearchCriteria(buffer._search, this.search_criteria)) {
						Vue.set(this, "focusedLocation", buffer.id);
						this.centerView(buffer);
						set = true;
					}
				}
				this.determinePOIs();
			}

			if(!set) {
				Vue.set(this, "searchError", "Not Found");
			} else {
				Vue.set(this, "searchError", "");
			}
		},
		"determinePOIs": function() {
			var buffer,
				x;

			this.pointsOfInterest.splice(0);
			for(x=0; x<this.availablePOIs.length; x++) {
				if(this.poiNamed(this.availablePOIs[x])) {
					this.pointsOfInterest.push(this.availablePOIs[x]);
				}
			}
		},
		"poiClass": function(link) {
			return link.class || link.icon;
		},
		/**
		 * 
		 * @method receiveViewPort
		 * @param {Number} x
		 * @param {Number} y
		 * @param {Integer} [zoom]
		 */
		"receiveViewPort": function(x, y, zoom) {
			var view = this.getViewport(),
				offX,
				offY;

			offX = x - view.width/2;
			offY = y - view.height/2;
			this.apply({
				"zoom": zoom,
				"left": offX,
				"top": offY
			});
		},
		/**
		 * 
		 * @method centerView
		 * @param {Object} location
		 * @param {Number} location.x
		 * @param {Number} location.y
		 * @param {Integer} [zoom]
		 */
		"centerView": function(location, zoom) {
			var locX,
				locY,
				view;

			if(location) {
				if(zoom) {
					this.zoom(zoom);
				}

				setTimeout(() => {
					locY = location.y/100 * this.presenting.map_parameters.height;
					locX = location.x/100 * this.presenting.map_parameters.width;
					view = this.getViewport();
					locY -= view.height/2;
					locX -= view.width/2;

					this.apply({
						"left": -1* locX,
						"top": -1* locY
					});
				});
			}
		},
		"filterPOIs": function(text) {
			// console.log("Filter: " + text);
			var buffer;

			if(text !== this.searchPrevious) {
				Vue.set(this, "focusedLocation", null);
				Vue.set(this, "searchPrevious", text);
				this.search_criteria.splice(0);
				if(text) {
					text = text.toLowerCase().split(" ");

					if(this.searchError) {
						Vue.set(this, "searchError", "");
					}
					while(text.length) {
						buffer = text.pop().trim();
						if(buffer) {
							this.search_criteria.push(buffer);
						}
					}
				}
			}

			this.determinePOIs();
		},
		/*
		 * Move these calculations into the update step to rebuild when the coordinates change rather than with every redraw
		 */
		"getCoordinateTLStyle": function(coordinate) {
			var object;
			if(coordinate.object && (object = this.universe.getObject(coordinate.object))) {
				return "width: " + (object.x || coordinate.x) + "%; height: " + (object.y || coordinate.y) + "%;" + (coordinate.color?"border-color: " + coordinate.color + ";":"");
			} else {
				return "width: " + coordinate.x + "%; height: " + coordinate.y + "%;" + (coordinate.color?"border-color: " + coordinate.color + ";":"");
			}
		},
		"getCoordinateBRStyle": function(coordinate) {
			var object;
			if(coordinate.object && (object = this.universe.getObject(coordinate.object))) {
				return "left: " + (object.x || coordinate.x) + "%; width: " + (100-(object.x || coordinate.x)) + "%; top: " + (object.y || coordinate.y) + "%; height: " + (100-(object.y || coordinate.y)) + "%;" + (coordinate.color?"border-color: " + coordinate.color + ";":"");
			} else {
				return "left: " + coordinate.x + "%; width: " + (100-coordinate.x) + "%; top: " + coordinate.y + "%; height: " + (100-coordinate.y) + "%;" + (coordinate.color?"border-color: " + coordinate.color + ";":"");
			}
		},
		"getCoordinatePosition": function(coordinate) {
			var object;
			if(coordinate.object && (object = this.universe.getObject(coordinate.object))) {
				return "left: " + (object.x || coordinate.x) + "%; top: " + (object.y || coordinate.y) + "%;" + (coordinate.color?"background-color: " + coordinate.color + ";":"");
			} else {
				return "left: " + coordinate.x + "%; top: " + coordinate.y + "%;" + (coordinate.color?"background-color: " + coordinate.color + ";":"");
			}
		},
		"dismissCoordinate": function(coordinate) {
			this.universe.send("map:unmark", {
				"location": this.presenting.location.id,
				"id": coordinate.id
			});
		},
		"resetViewport": function() {
			// Object.assign(this.presenting.map_parameters, this.original);
			// var view = this.getViewport();

			// this.presenting.map_parameters.zoom = 0;
			// this.presenting.map_parameters.left = view.width/2 - this.presenting.map_parameters.width/2;
			// this.presenting.map_parameters.top = view.height/2 - this.presenting.map_parameters.height/2;
			// this.apply(this.presenting.map_parameters);
		},
		"getViewport": function() {
			return {
				"height": this.element.outerHeight(),
				"width": this.element.outerWidth()
			};
		},
		"waitDimensions": function(path, callback) {
//				console.log("Get Dimensions: " + path);
			var img = new Image;

			img.onload = () => {
				this.presenting.map_parameters.height = img.height;
				this.presenting.map_parameters.width = img.width;
				this.presenting.map_parameters.ratio = img.width / img.height;
				Object.assign(this.original, this.presenting.map_parameters);

				Vue.set(this, "ready", true);
				Vue.set(this, "parchment", this.element.find(".parchment"));
				this.apply(this.presenting.map_parameters);
				callback();
			};

			img.src = path;
		},
		"getDimensions": function(path) {
//				console.log("Get Dimensions: " + path);
			var img = new Image;

			img.onload = () => {
				this.presenting.map_parameters.height = img.height;
				this.presenting.map_parameters.width = img.width;
				this.presenting.map_parameters.ratio = img.width / img.height;
				Object.assign(this.original, this.presenting.map_parameters);

				Vue.set(this, "ready", true);
				Vue.set(this, "parchment", this.element.find(".parchment"));
				this.apply(this.presenting.map_parameters);
			};

			img.src = path;
		},
		"getCenter": function() {
			var view = this.getViewport(),
				vh = view.height/2,
				vw = view.width/2,
				left,
				top,
				x;

			left = this.presenting.map_parameters.left - vw;
			top = this.presenting.map_parameters.top - vh;

			return {
				"zoom": this.presenting.map_parameters.zoom,
				"x": -1* ((left/this.presenting.map_parameters.width) * 100).toFixed(3),
				"y": -1* ((top/this.presenting.map_parameters.height) * 100).toFixed(3),
				"left": left,
				"top": top
			};
		},
		"zoom": function(level) {
			var targetHeight = this.original.height * (1 + .1 * level),
				targetWidth = this.original.width * (1 + .1 * level),
				view = this.getViewport(),
				vh = view.height/2,
				vw = view.width/2,
				cenX,
				cenY;

			cenY = (this.presenting.map_parameters.top - vh) / this.presenting.map_parameters.height;
			cenX = (this.presenting.map_parameters.left - vw) / this.presenting.map_parameters.width;
			cenY *= targetHeight;
			cenX *= targetWidth;
			cenY += vh;
			cenX += vw;

			if(targetWidth !== 0 && targetHeight !== 0) {
				this.apply({
					"height": targetHeight,
					"width": targetWidth,
					"zoom": level,
					"left": cenX,
					"top": cenY
				});
			}
		},
		"apply": function(applying) {
			// console.log("Start Apply: ", _p(this.presenting.map_parameters), _p(applying));
			if(this.parchment && this.parchment.length) {
				if(applying.height === undefined) {
					applying.height = this.presenting.map_parameters.height;
				}
				if(applying.width === undefined) {
					applying.width = this.presenting.map_parameters.width;
				}
				if(applying.left === undefined) {
					applying.left = this.presenting.map_parameters.left;
				}
				if(applying.top === undefined) {
					applying.top = this.presenting.map_parameters.top;
				}

				if(applying.zoom === undefined && this.presenting.map_parameters.zoom === undefined) {
					applying.zoom = 0;
				}
				this.presenting.map_parameters.height = this.original.height * (1 + .1 * applying.zoom);
				this.presenting.map_parameters.width = this.original.width * (1 + .1 * applying.zoom);
				Vue.set(this, "scaledSize", this.baseFontSize + applying.zoom);

				// console.log(" > Apply Redraw");
				this.presenting.map_parameters._lastlocation = this.presenting.location.id;
				this.presenting.map_parameters._lastzoom = applying.zoom;
				for(var x=0; x<this.locales.length; x++) {
					if(this.availableCanvases[this.locales[x].id]) {
						this.availableCanvases[this.locales[x].id].height = applying.height;
						this.availableCanvases[this.locales[x].id].width = applying.width;
					}
				}

				Object.assign(this.presenting.map_parameters, applying);
				this.redrawPaths();

				// console.log(" > Apply: ", _p(this.presenting.map_parameters), _p(applying));
				this.parchment.css({
					"height": applying.height + "px",
					"width": applying.width + "px",
					"left": applying.left + "px",
					"top": applying.top + "px"
				});
				
				this.renderMeasurements();
			}
		},
		"redrawPaths": function() {
			var buffer,
				path,
				x;


			// Paint Grid
//				if(this.options && this.options.paintGrid) {
//					this.paintGrid();
//				}

			//console.log("Redraw");

			for(x=0; x<this.locales.length; x++) {
				path = this.locales[x];
				if(path.location === this.presenting.location.id && path.rendering_has_path) {
					if(!this.availableLocales[path.id] || !this.availableLocales[path.id].parentNode) {
						buffer = $("[data-id='locale:" + path.id + "']");
						if(buffer.length) {
							this.availableLocales[path.id] = buffer[0].getContext("2d");
							this.availableCanvases[path.id] = buffer[0];

							this.availableCanvases[path.id].height = this.presenting.map_parameters.height;
							this.availableCanvases[path.id].width = this.presenting.map_parameters.width;
						}
					}

					if(this.availableLocales[path.id]) {
						this.availableLocales[path.id].clearRect(0, 0, this.availableCanvases[path.id].width, this.availableCanvases[path.id].height);
						this.drawPath(this.availableLocales[path.id], path);
					}
				}
			}
			
			// this.renderMeasurements();
		},
		"drawPath": function(canvas, path) {
			// console.log("Draewing Path: ", canvas, path);
			if(path && path.rendering_has_path && path.is_presenting) {
				var points = [],
					buffer,
					point,
					x;

				if(path.rendering_path) {
					for(x=0; x<path.rendering_path.length; x++) {
						buffer = path.rendering_path[x];
						if(buffer instanceof Array) {
							buffer = {
								"x": buffer[0],
								"y": buffer[1]
							};
						} else if(typeof(buffer) === "string") {
							buffer = this.universe.getObject(buffer);
						}
						if(buffer && typeof(buffer.x) === "number" && typeof(buffer.y) === "number") {
							point = [buffer.x/100 * this.presenting.map_parameters.width, buffer.y/100 * this.presenting.map_parameters.height];
							points.push(point);
						}
					}
				}

				if(points.length) {
					this.renderPath(canvas, path, points);
					return canvas;
				}
			}

			return null;
		},
		"renderPath": function(canvas, path, points) {
			// console.log("Render Path[" + path.id + "]: ", points, path);
			var canvas,
				xc,
				yc,
				x;

			canvas.locationID = path.id;
			canvas.strokeStyle = path.rendering_path_color || "#FFFFFF";
			canvas.lineWidth = path.rendering_path_thickness;
			if(path.rendering_fill_opacity !== undefined) {
				canvas.globalAlpha = path.rendering_fill_opacity;
			}


			if(path.rendering_path_closed) {
				canvas.fillStyle = path.rendering_fill_color || "#FFFFFF";
				canvas.beginPath();
				canvas.moveTo(points[0][0], points[0][1]);
				for(x=1; x<points.length; x++) {
					if(path.rendering_curved) {
						//canvas.bezierCurveTo(path.values[x][0] * this.presenting.map_parameters.width, path.values[x][1] * this.presenting.map_parameters.height);
						xc = (points[x-1][0] + points[x][0]) / 2;
						yc = (points[x-1][1] + points[x][1]) / 2;
						canvas.quadraticCurveTo(xc, yc, points[x][0], points[x][1]);
//							canvas.quadraticCurveTo(
//								path.values[x-1][0] * this.presenting.map_parameters.width,
//								path.values[x-1][1] * this.presenting.map_parameters.height,
//								path.values[x][0] * this.presenting.map_parameters.width,
//								path.values[x][1] * this.presenting.map_parameters.height);
					} else {
						canvas.lineTo(points[x][0], points[x][1]);
					}
				}
				canvas.closePath();
				canvas.fill();

				if(typeof(path.x) === "number" && typeof(path.y) === "number") {
					canvas.fillStyle = path.label_color || path.rendering_path_color || "#FFFFFF";
					canvas.font = "bold " + Math.min(12 + this.presenting.map_parameters.zoom, location.max_font_size || 50) + "px Arial";
					canvas.shadowColor = path.label_shadow_color || "rgba(0, 0, 0, .4)";
					canvas.shadowBlur = path.label_shadow_blur || 3;
					canvas.globalAlpha = path.rendering_label_opacity || 1;
					canvas.shadowOffsetX = 0;
					canvas.shadowOffsetY = 0;
					canvas.fillText(path.label || path.name, path.x * this.presenting.map_parameters.width, path.y * this.presenting.map_parameters.height);
				}
			}

			if(path.rendering_path_opacity !== undefined) {
				canvas.globalAlpha = path.rendering_path_opacity;
			} else {
				canvas.globalAlpha = undefined;
			}

			canvas.beginPath();
			canvas.moveTo(points[0][0], points[0][1]);
			for(x=1; x<points.length; x++) {
				if(path.rendering_curved) {
					//canvas.bezierCurveTo(path.values[x][0] * this.presenting.map_parameters.width, path.values[x][1] * this.presenting.map_parameters.height);
					xc = (points[x-1][0] + points[x][0]) / 2;
					yc = (points[x-1][1] + points[x][1]) / 2;
					canvas.quadraticCurveTo(xc, yc, points[x][0], points[x][1]);
//						canvas.quadraticCurveTo(
//							path.values[x-1][0] * this.presenting.map_parameters.width,
//							path.values[x-1][1] * this.presenting.map_parameters.height,
//							path.values[x][0] * this.presenting.map_parameters.width,
//							path.values[x][1] * this.presenting.map_parameters.height);
				} else {
					canvas.lineTo(points[x][0], points[x][1]);
				}
			}
			if(path.rendering_path_closed) {
				canvas.closePath();
				canvas.stroke();
			} else {
				canvas.stroke();
			}

			return canvas;
		},
		"renderRadials": function() {
			var object,
				point,
				field,
				i;
			
			for(i=0; i<this.presenting.location.coordinates.length; i++) {
				point = this.presenting.location.coordinates[i];
				// console.log(" --- :", _p(point));
				if(point.radial) {
					if(point.object) {
						object = this.universe.getObject(point.object);
					} else {
						object = null;
					}
					this.renderRadial(object, point.radial, point.x, point.y, point.color);
				}
			}

			if(this.characterRangeBand && this.characterRangeBand.range_normal && this.entity && this.presenting.location.map_distance && typeof(this.entity.x) === "number" && typeof(this.entity.y) === "number" && this.entity.location === this.presenting.location.id) {
				this.renderRadial(this.entity, this.characterRangeBand.range_normal, null, null, "");
			}
		},
		"renderRadial": function(object, r, x, y, color) {
			var zoom = 1 + .1 * this.presenting.map_parameters.zoom,
				canvas = $("#measuring"),
				context;
			if(canvas && (canvas = canvas[0]) && this.presenting.map_parameters) {
				// console.log(" --- 1 --- ");
				context = canvas.getContext("2d");

				if(object) {
					x = object.x;
					y = object.y;
				}

				r = (r * zoom)/this.presenting.location.map_distance;
				y = y/100 * this.presenting.map_parameters.height;
				x = x/100 * this.presenting.map_parameters.width;
				context.beginPath();
				context.arc(x, y, r, 0, 2 * Math.PI);
				switch(color) {
					case "red":
						context.strokeStyle = "#FF0000E0";
						context.fillStyle = "#FF000030";
						break;
					case "orange":
						context.strokeStyle = "#FFA500E0";
						context.fillStyle = "#FFA50030";
						break;
					case "yellow":
						context.strokeStyle = "#FFFF00E0";
						context.fillStyle = "#FFFF0030";
						break;
					case "green":
						context.strokeStyle = "#00FF00E0";
						context.fillStyle = "#00FF0030";
						break;
					case "blue":
						context.strokeStyle = "#0000FFE0";
						context.fillStyle = "#0000FF30";
						break;
					case "cyan":
						context.strokeStyle = "#00FFFFE0";
						context.fillStyle = "#00FFFF30";
						break;
					case "purple":
						context.strokeStyle = "#FF00FFE0";
						context.fillStyle = "#FF00FF30";
						break;
					case "white":
						context.strokeStyle = "#FFFFFFE0";
						context.fillStyle = "#FFFFFF30";
						break;
					case "rangeband":
					case "gray":
					case "grey":
						context.strokeStyle = "#22222270";
						context.fillStyle = "#22222230";
						break;
					default: // Black
						context.strokeStyle = "#000000E0";
						context.fillStyle = "#00000030";
				}
				context.stroke();
				context.fill();
			}
		},
		"renderMeasurements": function() {
			// console.warn("Measurements[" + this.image.zoom + "]...");
			var canvas,
				format,
				path,
				zoom,

				points,
				i,
				j;

			canvas = $("#measuring");
			if(canvas && (canvas = canvas[0])) {
				canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
				canvas.height = this.presenting.map_parameters.height;
				canvas.width = this.presenting.map_parameters.width;
				canvas = canvas.getContext("2d");
				canvas.clearRect(0, 0, canvas.width, canvas.height);
				canvas.font = Math.min(14 + this.presenting.map_parameters.zoom, location.max_font_size || 50) + "px serif";
				canvas.strokeStyle = "#FFFFFF";
				canvas.fillStyle = "#FFFFFF";
				canvas.globalAlpha = .7;
				canvas.lineWidth = 2;

				// Pathed Points use the same Canvas for now in an attempt to save resources
				if(this.presenting.location.coordinates && this.presenting.location.coordinates.length) {
					// console.warn(" > Coordinates...");
					points = {};

					for(i=0; i<this.presenting.location.coordinates.length; i++) {
						if(this.presenting.location.coordinates[i].pathed) {
							if(!points[this.presenting.location.coordinates[i].color]) {
								points[this.presenting.location.coordinates[i].color] = [];
							}
							points[this.presenting.location.coordinates[i].color].push({
								"x": (this.presenting.location.coordinates[i].x/100) * this.presenting.map_parameters.width,
								"y": (this.presenting.location.coordinates[i].y/100) * this.presenting.map_parameters.height
							});
						}
					}

					path = Object.keys(points);
					for(i=0; i<path.length; i++) {
						// canvas.strokeStyle = "#FFFFFF";
						canvas.strokeStyle = "#000000";
						canvas.strokeStyle = path[i];
						canvas.lineWidth = 2;
						canvas.beginPath();
						canvas.moveTo(points[path[i]][0].x, points[path[i]][0].y);
						for(j=1; j<points[path[i]].length; j++) {
							canvas.lineTo(points[path[i]][j].x, points[path[i]][j].y);
						}
						canvas.stroke();
					}
				}

				this.renderRadials();
			}
		},
		"elementVisible": function(element, entity) {
			entity = entity || this.entity;
			if(entity && entity.gm) {
				return true;
			}

			return !(element.template || element.is_template || element.preview || element.is_preview || element.hidden || element.is_hidden || element.concealed || element.is_concealed || element.obscured);
		},
		"localeVisible": function(locale) {
			if(!this.elementVisible(locale)) {
				return false;
			}
		},
		"getPOIToken": function(link) {
			var reference;

			if(link.token_image) {
				return link.token_image;
			}
			
			if(link.token_map) {
				if(link.interior) {
					reference = this.universe.getObject(link.interior);
					if(reference) {
						return reference.map;
					}
				}
				if(link.map) {
					return link.map;
				}
			}
			
			return null;
		},
		"poiStylingString": function(link) {
			var token = this.getPOIToken(link),
				string,
				height,
				width;

			if(token) {
				height = this.distanceToPixels(link.token_height || 4);
				width =  this.distanceToPixels(link.token_width || 4);
				string = "left: calc(" + link.x + "% - " + (width/2) + "px);";
				string += "top: calc(" + link.y + "% - " + (height/2) + "px);";
				string += "background-image: url(\"" + this.universe.getImagePath(token) + "\");";
				string += "height: " + height + "px;";
				string += "width: " + width + "px;";
				string += "min-width: 0px; margin: 0px;";
				if(link.token_z || link.z) {
					string += "z-index: " + (link.token_z || link.z) + ";";
				}
				if(link.label_color) {
					string += "color: " + link.label_color + ";";
				}
				if(link.color_flag) {
					if(link.color_flag === "transparent") {
						string += "border-color: transparent;";
					} else if(link.color_flag.startsWith("bordered-")) {
						string += "border-color: " + link.color_flag.substring(9) + ";";
						string += "background-color: transparent;";
					}
				}
				if(link.token_rotation) {
					string += "; transform: rotate(" + link.token_rotation + "deg);";
				}
				if(link.token_square) {
					string += "; border-radius: 0px";
				} else {
					string += "; border-radius: " + (height) + "px;";
				}
			} else {
				string = "left: ";
				string += link.x;
				string += "%; top: ";
				string += link.y;
				string += "%;";
			}
			return string;
		},
		"poiLinkStylingString": function(link) {
			var classing = "";

			if(link.label_shadow_blur) {
				classing += "text-shadow: 0 0 " + link.label_shadow_blur + "px " + (link.label_shadow_color || "black") + ";";
			}

			return classing;
		},
		"poiStyling": function(link) {
			if(!link) {
				return "";
			}

			var classStyle = "",
				buffer,
				x;

			if(this.search_criteria.length) {
				if(!link._search) {
					classStyle += " search-hidden";
				} else {
					buffer = true;
					for(x=0; x<this.search_criteria.length; x++) {
						if(link._search.indexOf(this.search_criteria[x]) === -1) {
							classStyle += " search-hidden";
							buffer = false;
							break;
						}
					}
					if(buffer) {
						classStyle += " search-found";
					}
				}
			}

			if(this.focusedLocation === link.id) {
				classStyle += " search-found poi-focused";
			}

			if(link.no_border) {
				classStyle += " no-border";
			} else {
				classStyle += " map-border";
			}

			if(link.color_flag) {
				classStyle += " color-flag-" + link.color_flag + " rsbg-" + link.color_flag;
			}

			return classStyle;
		},
		"poiNamed": function(link) {
			if(link.rendering_has_path && !link.show_name) {
				return false;
			}

			return this.poiVisible(link);
		},
		"poiVisible": function(link) {
			return link.is_presenting && link.location === this.presenting.location.id;
		},
		"minorUpdate": function() {
			this.$forceUpdate();
		},
		"updateTimeOfDay": function() {
			Vue.set(this, "hourOfDay", this.universe.calendar.hour);
			// if((!this.activeMeeting || this.activeMeeting.is_sky_visible === undefined || this.activeMeeting.is_sky_visible === null || this.activeMeeting.is_sky_visible === true) && (this.presenting.location.is_sky_visible === undefined || this.presenting.location.is_sky_visible === null || this.presenting.location.is_sky_visible === true) && this.viewingEntity && this.presenting.location && this.viewingEntity.location === this.presenting.location.id) {
			if((!this.activeMeeting || this.activeMeeting.is_sky_visible === undefined || this.activeMeeting.is_sky_visible === null || this.activeMeeting.is_sky_visible === true) && (this.presenting.location.is_sky_visible === undefined || this.presenting.location.is_sky_visible === null || this.presenting.location.is_sky_visible === true)) {
				Vue.set(this, "hourClassing", "time-hour-" + this.universe.calendar.hour);
			} else {
				Vue.set(this, "hourClassing", "");
			}
		},
		"isVisibleTo": function(entity, object) {
			return rsSystem.utility.isVisibleTo(this.universe, entity, object);
		},
		"isRendered": function(entity, object) {
			return rsSystem.utility.isValid(object) && object.is_presenting;
		},
		"update": function(source) {
			var now = Date.now(),
				localeTypes = {},
				redirect,
				buffer,
				type,
				i,
				x,
				y;

			if(source) {
				if(source.id === "setting:meeting") {
					Vue.set(this, "activeMeeting", this.universe.index.meeting[source.value]);
				} else if(source && source.id === "setting:time") {
					setTimeout(() => {
						this.updateTimeOfDay();
					});
				}
				console.log("Presenting Source Update: ", source);
			}
			if(this.presenting.location && (!source || source.location === this.presenting.location.id || source.id === this.presenting.location.id || (this.viewingEntity && (source.id === this.viewingEntity.id || source.entity === this.viewingEntity.id)))) {
				if(this.presenting.location.links_to) {
					redirect = this.universe.get(this.presenting.location.links_to);
					Vue.set(this.presenting, "location", redirect);
					return null;
				}

				if(!this.presenting.location.map) {
					// Search Parent Chain for redirect
					redirect = this.presenting.location;
					while(redirect = this.universe.get(redirect.location)) {
						if(redirect.map) {
							Vue.set(this.presenting, "location", redirect);
							return null;
						}
					}

					// Fallback to default
					if(this.presenting.location.world) {
						redirect = this.universe.get(this.presenting.location.world);
						Vue.set(this.presenting, "location", redirect);
						return null;
					}
					if(this.activeMeeting && this.activeMeeting.world) {
						redirect = this.universe.get(this.activeMeeting.world);
						Vue.set(this.presenting, "location", redirect);
						return null;
					}
				}

				if(true || (now - this.last) > this.updateStep) {
					// console.log("Start Update: " + now);
					this.last = now;

					this.availableLocaleTypes.splice(0);
					this.availablePOIs.splice(0);
					this.locales.splice(0);
					Vue.set(this, "baseFontSize", this.presenting.location.base_font_size || 10);

					for(x=0; x<this.universe.listing.location.length; x++) {
						buffer = this.universe.listing.location[x];
						if(this.isRendered(this.viewingEntity, buffer)) {
							this.availablePOIs.push(buffer);
							if(buffer.rendering_has_path && this.locales) {
								this.locales.push(buffer);
							}
						}
					}
					for(x=0; x<this.locales.length; x++) {
						if(this.locales[x].types) {
							for(i=0; i<this.locales[x].types.length; i++) {
								if(!localeTypes[this.locales[x].types[i]] && (type = this.universe.index.type[this.locales[x].types[i]])) {
									this.availableLocaleTypes.push(type);
									localeTypes[type.id] = true;
								}
							}
						}
					}

					for(x=0; x<this.universe.listing.entity.length; x++) {
						buffer = this.universe.listing.entity[x];
						if(this.isRendered(this.viewingEntity, buffer)) {
							this.availablePOIs.push(buffer);
						}
					}

					for(x=0; x<this.universe.listing.item.length; x++) {
						buffer = this.universe.listing.item[x];
						if(this.isRendered(this.viewingEntity, buffer)) {
							this.availablePOIs.push(buffer);
						}
					}

					for(x=0; x<this.universe.listing.party.length; x++) {
						buffer = this.universe.listing.party[x];
						if(this.isRendered(this.viewingEntity, buffer)) {
							this.availablePOIs.push(buffer);
						}
					}

					for(x=0; x<this.universe.listing.storm.length; x++) {
						buffer = this.universe.listing.storm[x];
						if(this.isRendered(this.viewingEntity, buffer)) {
							this.availablePOIs.push(buffer);
						}
					}

					if(this.presenting.location && this.presenting.location.id !== this.renderedLocation) {
						Vue.set(this, "renderedLocation", this.presenting.location.id);
						Vue.set(this, "ready", false);
						this.waitDimensions(this.universe.getImagePath(this.presenting.location.map), this.finishUpdate);
					} else {
						this.finishUpdate();
						setTimeout(() => {
							this.renderMeasurements();
							this.redrawPaths();
						}, 0);
					}

					for(x=0; x<this.presenting.location.coordinates.length; x++) {
						buffer = this.presenting.location.coordinates[x];
						// TODO: Review this for possible memory leak issues.
						//		In general, the style objects should be abandoned and garbage collected
						//		before the lack of cleaning begins to become an issue, but intense map
						//		usage on a single location may push this. However, that would mean a lot
						//		of transient ro temporary objects had been placed on the map where the
						//		cached values were no longer needed. Where as most usage should only
						//		involve objects that are there the entire time with maybe a dozen that
						//		could be cleaned up. Thus, this TODO is more of a note for memory issues
						//		should any need checked, but should not be an issue.
						this.stylePosition[buffer.id] = this.getCoordinatePosition(buffer);
						this.styleTL[buffer.id] = this.getCoordinateTLStyle(buffer);
						this.styleBR[buffer.id] = this.getCoordinateBRStyle(buffer);
					}

					this.updateTimeOfDay();
				} else {
					if(!this.delayed) {
						this.delayed = setTimeout(() => {
							this.delayed = null;
							this.update();
						}, this.updateStep);
					}
				}
			}
		},
		"finishUpdate": function() {
			this.determinePOIs();
			this.redrawPaths();
			if(this.resetViewportFlag) {
				Vue.set(this, "resetViewportFlag", false);
				this.resetViewport();
			}
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("presenter:request:map", this.processEvent);
		this.universe.$off("updated", this.update);
	},
	"template": Vue.templified("components/dnd/party/presenter/map.html")
});
