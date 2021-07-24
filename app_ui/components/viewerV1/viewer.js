/**
 * First pass version at a basic image wrapping component to support advanced mark-up
 * and stat tracking.
 *
 * Due to massive inefficiencies, this component will need re-written to leverage a single
 * canvas element and 2 image elements (record image & background) to reduce update processing
 * and use custom point detection for hover effects to improve general performance.
 *
 * Additionally, render logic and data tracking will need to be compacted and "less squirrely".
 *
 * Considerations:
 * + Abstracting the menu interface, reusability and cleans up the menu logic for readability
 * 		of both the menu and viewer. Though where else would this be used and how easy is it
 * 		to uncouple?
 *
 * @class rsViewerV1
 * @constructor
 * @module Components
 */
(function() {
	var storageKey = "_rs_viewerComponentKey";

	var issuing = 0;

	var ZOOMBOUNDS = {};
	ZOOMBOUNDS.min = -50;
	ZOOMBOUNDS.max = 50;

	var UPDATESTEP = 1000;

	var generateLocationClassingMap = {
		"star_system": "far fa-solar-system rotX60",
		"planet": "fad fa-globe-europe",
		"station": "ra ra-satellite",
		"moon": "fas fa-moon",
		"city": "fas fa-city",
		"marker": "fas fa-map-marker"
	};

	var markAction = {
		"options": [{
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-red rs-secondary-solid",
			"event": "set-crosshair",
			"text": "Mark: Red",
			"color": "red"
		}, {
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-orange",
			"event": "set-crosshair",
			"text": "Mark: Orange",
			"color": "orange"
		}, {
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-yellow",
			"event": "set-crosshair",
			"text": "Mark: Yellow",
			"color": "yellow"
		}, {
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-green",
			"event": "set-crosshair",
			"text": "Mark: Green",
			"color": "green"
		}, {
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-blue",
			"event": "set-crosshair",
			"text": "Mark: Blue",
			"color": "blue"
		}, {
			"icon": "fad fa-map-marker-alt rs-cyan rs-secondary-solid rs-secondary-cyan",
			"event": "set-crosshair",
			"text": "Mark: Cyan",
			"color": "cyan"
		}, {
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-purple",
			"event": "set-crosshair",
			"text": "Mark: Purple",
			"color": "purple"
		}, {
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-black",
			"event": "set-crosshair",
			"text": "Mark: Black",
			"color": "black"
		}, {
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-white",
			"event": "set-crosshair",
			"text": "Mark: White",
			"color": "white"
		}]
	};

	var clearAll = {
		"icon": "fas fa-times rs-white",
		"event": "clear-all-crosshair",
		"text": "All Marks"
	};

	var markClearAction = {
		"options": [{
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-red rs-secondary-solid",
			"event": "clear-crosshair",
			"text": "Mark: Red",
			"color": "red"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-orange",
			"event": "clear-crosshair",
			"text": "Mark: Orange",
			"color": "orange"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-yellow",
			"event": "clear-crosshair",
			"text": "Mark: Yellow",
			"color": "yellow"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-green",
			"event": "clear-crosshair",
			"text": "Mark: Green",
			"color": "green"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-blue",
			"event": "clear-crosshair",
			"text": "Mark: Blue",
			"color": "blue"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-cyan rs-secondary-solid rs-secondary-cyan",
			"event": "clear-crosshair",
			"text": "Mark: Cyan",
			"color": "cyan"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-purple",
			"event": "clear-crosshair",
			"text": "Mark: Purple",
			"color": "purple"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-black",
			"event": "clear-crosshair",
			"text": "Mark: Black",
			"color": "black"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-white",
			"event": "clear-crosshair",
			"text": "Mark: White",
			"color": "white"
		},
		clearAll]
	};

	var radialAction = {
		"options": [{
			"icon": "fad fa-scrubber rs-white rs-secondary-red rs-secondary-solid",
			"event": "set-radial",
			"text": "Radial: Red",
			"color": "red"
		}, {
			"icon": "fad fa-scrubber rs-white rs-secondary-orange rs-secondary-solid",
			"event": "set-radial",
			"text": "Radial: Orange",
			"color": "orange"
		}, {
			"icon": "fad fa-scrubber rs-white rs-secondary-yellow rs-secondary-solid",
			"event": "set-radial",
			"text": "Radial: Yellow",
			"color": "yellow"
		}, {
			"icon": "fad fa-scrubber rs-white rs-secondary-green rs-secondary-solid",
			"event": "set-radial",
			"text": "Radial: Green",
			"color": "green"
		}, {
			"icon": "fad fa-scrubber rs-white rs-secondary-blue rs-secondary-solid",
			"event": "set-radial",
			"text": "Radial: Blue",
			"color": "blue"
		}, {
			"icon": "fad fa-scrubber rs-white rs-secondary-cyan rs-secondary-solid",
			"event": "set-radial",
			"text": "Radial: Cyan",
			"color": "cyan"
		}, {
			"icon": "fad fa-scrubber rs-white rs-secondary-purple rs-secondary-solid",
			"event": "set-radial",
			"text": "Radial: Purple",
			"color": "purple"
		}, {
			"icon": "fad fa-scrubber rs-white rs-secondary-black rs-secondary-solid",
			"event": "set-radial",
			"text": "Radial: Black",
			"color": "black"
		}, {
			"icon": "fad fa-scrubber rs-black rs-secondary-white rs-secondary-solid",
			"event": "set-radial",
			"text": "Radial: White",
			"color": "white"
		}, {
			"icon": "fas fa-ruler rs-black",
			"storage": "radial_radius",
			"type": "number"
		}]
	};

	rsSystem.component("rsViewerV1", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageController,
			rsSystem.components.RSCore
		],
		"props": {
			"location": {
				"required": true,
				"type": Object
			},
			"entity": {
				"type": Object
			}
		},
		"computed": {
			// "coordinates": function() {
			// 	var coordinates = [];
			// 	if(this.location.coordinates && this.location.coordinates.length) {
			// 		for(x=0; x<this.location.coordinates.length; x++) {
			// 			if(this.location.coordinates[x]) {
			// 				coordinates.push(this.location.coordinates[x]);
			// 			}
			// 		}
			// 	}
			// 	return coordinates;
			// }
		},
		"data": function() {
			var data = {};

			data.generateLocationClassingMap = generateLocationClassingMap;
			data.viewingEntity = null;
			data.search_criteria = [];
			data.image = [];

			data.measurementCanvas = null;
			data.initializing = true;
			data.baseFontSize = 13;
			data.scaledSize = 0;

			data.lengths = rsSystem.math.distance.lengths;
			data.distancing = [];
			data.totalLength = 0;
			data.totalTime = 0;
			data.distance = 0;

			data.searchPrevious = null;;
			data.searchError = "";
			data.original = {};
			data.parchment = null;
			data.element = null;
			data.ready = false;
			data.action = null;

			data.isDragging = false;
			data.dragX = null;
			data.dragY = null;

			data.resetViewportFlag = true;
			data.focusedLocation = null;
			data.availableCanvases = {};
			data.availableLocales = {};
			data.pointsOfInterest = [];
			data.availablePOIs = [];
			// data.coordinates = [];
			data.parties = [];
			data.locales = [];
			data.pins = true;
			data.alter = "";
			data.delayed = null;
			data.applyTiming = 0;
			data.last = 0;

			data.renderedLocation = null;
			data.legendDisplayed = true;
			data.legendOpen = false;
			data.legendHidden = {};
			data.isMaster = null;

			data.setMeasurements = {
				"icon": "fas fa-ruler-combined",
				"event": "set-measurement",
				"text": "Set Distance"
			};

			data.takeMeasurements = {
				"icon": "fas fa-drafting-compass",
				"event": "measure-line",
				"text": "Measure Line"
			};

			data.localeInfo = {
				"event": "info-key",
				"icon": "fas fa-location-circle",
				"shown": false
			};

			data.menuOpen = false;
			data.menuItems = [[{
				"action": "zoomin",
				"text": "Zoom",
				"icon": "fas fa-plus-square"
			}, {
				"action": "zoomout",
				"text": "Zoom",
				"icon": "fas fa-minus-square"
			}], {
				"action": "up",
				"text": "Up",
				"conditional": () => {
					return !!this.location.location;
				},
				"icon": "far fa-arrow-alt-square-up"
			}, {
				"action": "reset",
				"text": "Reset",
				"icon": "far fa-expand-wide"
			}];

			data.menuItems.generateLocation = {
				"event": "generate-location"
			};
			data.menuItems.labelItem = {
				"action": "labels",
				"text": "Labels"
			};
			data.menuItems.followItem = {
				"action": "follow",
				"text": "Follow"
			};
			data.menuItems.markerItem = {
				"action": "markings",
				"text": "Markers"
			};
			data.menuItems.fullscreen = {
				"action": "fullscreen",
				"text": "Fill Page"
			};

			data.actions = {};
			data.actions.open = false;
			data.actions.header = "Location";
			data.actions.options = [];
			data.actions.menu = null;

			data.addPointOption = {
				"icon": "fas fa-code-commit",
				"event": "add-point",
				"text": "Add Point"
			};

			data.setNamePointOption = {
				"icon": "fal fa-code-commit",
				"event": "set-name-point",
				"text": "Set Name Point"
			};

			data.canvas = null;

			return data;
		},
		"watch": {
			"location": {
				"handler": function(newValue, oldValue) {
					Vue.set(this, "measurementCanvas", null);
					Vue.set(this, "resetViewportFlag", true);
					this.update();
				}
			},
			"location.coordinates": {
				"handler": function(newValue, oldValue) {
					this.redrawPaths();
				}
			}
		},
		"mounted": function() {
			this.canvasElement = $("canvas.map-paths");
			Vue.set(this, "element", $(this.$el));
			if(!this.storage.crosshairing) {
				Vue.set(this.storage, "crosshairing", {
					"icon": "fal fa-crosshairs",
					"event": "toggle-crosshair",
					"text": "Crosshairs On",
					"state": false
				});
			}
			if(!this.storage.pathing) {
				Vue.set(this.storage, "pathing", {
					"icon": "fad fa-chart-scatter rs-secondary-transparent",
					"event": "toggle-pathing",
					"text": "Point Path Off",
					"state": false
				});
			}

			Vue.set(this.storage, "generate_location", this.storage.generate_location || "");
			Vue.set(this.storage, "viewed_at", this.storage.viewed_at || 0);
			Vue.set(this.storage, "search", this.storage.search || "");
			Vue.set(this.storage, "alter", this.storage.alter || "");
			if(this.storage.search) {
				Vue.set(this, "searchPrevious", this.storage.search);
			}
			if(this.storage.labels === undefined) {
				Vue.set(this.storage, "labels", true);
			}
			if(this.storage.image) {
				Vue.set(this, "image", this.storage.image);
			} else {
				Vue.set(this, "image", {});
				Vue.set(this.storage, "image", this.image);
			}
			if(this.storage.markers === undefined) {
				Vue.set(this.storage, "markers", true);
			}
			if(this.storage.follow === undefined) {
				Vue.set(this.storage, "follow", true);
			}
			if(this.storage.master_view === undefined) {
				Vue.set(this.storage, "master_view", "");
			}
			if(this.storage.hidden_legend === undefined) {
				Vue.set(this.storage, "hidden_legend", {});
			}
			if(this.storage.path_fill === undefined) {
				Vue.set(this.storage, "path_fill", "");
			}
			if(this.storage.view_party === undefined) {
				Vue.set(this.storage, "view_party", "");
			}
			if(this.storage.distance_unit === undefined) {
				Vue.set(this.storage, "distance_unit", "m");
			}
			if(this.storage.distance === undefined) {
				Vue.set(this.storage, "distance", 0);
			}
			if(this.storage.measuring === undefined || this.storage.measuring instanceof Array) {
				Vue.set(this.storage, "measuring", {});
			}
			if(this.storage.hide === undefined) {
				Vue.set(this.storage, "hide", {});
			}

			if(this.storage.search) {
				Vue.set(this, "search_criteria", this.storage.search.toLowerCase().split(" "));
			} else {
				Vue.set(this, "search_criteria", []);
			}

			if(this.player.gm) {
				if(this.storage.master_view !== "master") {
					Vue.set(this, "viewingEntity", this.universe.index.entity[this.storage.master_view]);
				}
			} else {
				if(this.$route.params.entity) {
					Vue.set(this, "viewingEntity", this.universe.index.entity[this.$route.params.entity]);
					if(this.viewingEntity && (!this.viewingEntity.owned || !this.viewingEntity.owned[this.player.id])) {
						Vue.set(this, "viewingEntity", null);
					}
				}
			}
			if(!this.viewingEntity) {
				Vue.set(this, "viewingEntity", this.universe.index.entity[this.player.attribute.playing_as]);
			}

			rsSystem.register(this);
			rsSystem.EventBus.$on("measure-point", this.receiveMeasurementPoint);
			rsSystem.EventBus.$on("info:closed", this.clearSearch);
			rsSystem.EventBus.$on("copied-id", this.setMenuID);
			this.universe.$on("updated", this.update);
			// this.universe.$on("universe:modified", this.update);
			// this.universe.$on("model:modified", this.update);
			// this.location.$on("modified", this.update);

			// setTimeout(() => {
			// 	this.resetViewport();
			// 	this.redrawPaths();
			// }, 10);
			this.update();
		},
		"methods": {
			"getMarkerSize": function() {
				return Math.min(this.baseFontSize + this.image.zoom, this.location.max_font_size || 50);
			},
			"clearSearch": function(record) {
				if(record && this.focusedLocation === record.id) {
					Vue.set(this, "focusedLocation", null);
				}
			},
			"setMenuID": function(id) {
				Vue.set(this.storage, "alter", id);
			},
			"searchMap": function() {
				var set = false,
					buffer,
					entity,
					x;

				Vue.set(this, "focusedLocation", null);
				if(this.search_criteria[0] === "self" || this.search_criteria[0] === "me") {
					if(this.player.attribute && (entity = this.universe.index.entity[this.player.attribute.playing_as]) && (buffer = this.universe.index.location[entity.location])) {
						if(entity.x && entity.y && entity.location === this.location.id) {
							this.centerView(entity);
							set = true;
						} else {
							while(buffer && buffer.location !== this.location.id) {
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
			/**
			 * 
			 * @method centerView
			 * @param {Object} location
			 * @param {Number} location.x
			 * @param {Number} location.y
			 */
			"centerView": function(location) {
				var locX,
					locY,
					view;

				if(location) {
					locY = location.y/100 * this.image.height;
					locX = location.x/100 * this.image.width;
					view = this.getViewport();
					locY -= view.height/2;
					locX -= view.width/2;
					this.apply({
						"left": -1* locX,
						"top": -1* locY
					});
				}
			},
			"getGeneratedClass": function() {
				return generateLocationClassingMap[this.storage.generate_location];
			},
			"idFromName": function(name) {
				return "location:" + this.storage.generate_location + ":" + name.toLowerCase().replace(/[^0-9a-zA-Z_]+/g, "");
			},
			"generateLocationNoun": function(x, y) {
				var noun = {};
				noun._type = "location";
				noun.name = this.storage.generate_location_name;
				noun.label = this.storage.generate_location_name;
				noun.id = this.idFromName(noun.name);
				noun.icon = this.getGeneratedClass();
				noun.location = this.location.id;
				noun.type = [this.storage.generate_location];
				noun.x = x;
				noun.y = y;
				noun.master_note = "Generated @" + (new Date()).toString();
				if(!this.universe.index.location[noun.id]) {
					this.universe.send("modify:location", noun);
				} else {
					console.warn("Noun Already Exists: " + noun.id);
				}
			},
			"clearSearch": function() {
				Vue.set(this, "focusedLocation", null);
				Vue.set(this.storage, "search", "");
				Vue.set(this, "searchError", "");
				this.search_criteria.splice(0);
			},
			"togglePOIFiltering": function() {
				Vue.set(this.storage, "poiFiltering", !this.storage.poiFiltering);
				this.filterPOIs();
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
			"updateMasterView": function() {
				Vue.set(this, "viewingEntity", this.universe.index.entity[this.storage.master_view]);
				this.filterPOIs();
			},
			"testSearchCriteria": function(string, criteria) {
				var x;

				// console.log(" > " + string);
				if(criteria && criteria.length) {
					if(!string) {
						return false;
					}
					for(x=0; x<criteria.length; x++) {
						// console.log(" ?[" + (string.indexOf(criteria[x]) === -1) + "]: " + criteria[x]);
						if(string.indexOf(criteria[x]) === -1) {
							return false;
						}
					}
				}

//				console.log("Match");
				return true;
			},
			"toggleLegend": function() {
				Vue.set(this, "legendOpen", !this.legendOpen);
			},
			"toggleMenu": function() {
				Vue.set(this, "menuOpen", !this.menuOpen);
			},
			"toggleLocale": function(locale) {
				Vue.set(this.storage.hidden_legend, locale.id, !this.storage.hidden_legend[locale.id]);
				this.redrawPaths();
			},
			"processAction": function(item, event) {
//				console.log("Process Action: ", item);
				var buffer;
				switch(item.action) {
					case "zoomin":
						this.zoomInOne();
						break;
					case "zoomout":
						this.zoomOutOne();
						break;
					case "markings":
						Vue.set(this.storage, "markers", !this.storage.markers);
						break;
					case "labels":
						Vue.set(this.storage, "labels", !this.storage.labels);
						this.redrawPaths();
						break;
					case "follow":
						Vue.set(this.storage, "follow", !this.storage.follow);
						break;
					case "reset":
						this.resetViewport();
						break;
					case "up":
						if(this.location.location) {
							buffer = this.universe.index.location[this.location.location];
							if(buffer) {
								if(buffer.rendering_has_path) {
									// Skip over routes/paths to their parent where an image shoould be present
									if(buffer.location) {
										this.$router.push("/map/" + buffer.location);
									}
								} else {
									this.$router.push("/map/" + buffer.id);
								}
							}
						}
						break;
					case "fullscreen":
						Vue.set(this.storage, "fullscreen", !this.storage.fullscreen);
						break;
				}
			},
			"openActions": function(event) {
				var xc = event.offsetX,
					yc = event.offsetY,
					buffer,
					locale,
					point,
					x;

				point = event.target.getAttribute("data-id") || event.target.parentNode.getAttribute("data-id");
				if(point && (point = this.universe.index.location[point] || this.universe.index.entity[point] || this.universe.index.party[point] || this.universe.index.storm[point]) && point.x && point.y) {
					// console.log("Buffer: ", buffer);
					xc = this.image.width * point.x/100;
					yc = this.image.height * point.y/100;
				}

				this.localeInfo.id = undefined;
				if(event.ctrlKey) {
					this.appendPath(xc/this.image.width*100, yc/this.image.height*100);
				} else if(event.shiftKey) {
					this.setNamePoint(xc/this.image.width*100, yc/this.image.height*100);
				} else {
					for(x=0; x<this.locales.length; x++) {
						locale = this.locales[x];
						if(locale.rendering_path_closed) {
							buffer = this.availableLocales[locale.id];
							// if(buffer) {
							// 	console.log("Point Check[" + locale.id + " - " + xc + ", " + yc + " @ " + buffer.isPointInPath(xc, yc) + "]: ", buffer);
							// }
							if(buffer && buffer.isPointInPath(xc, yc)) {
								Vue.set(this.actions, "header", locale.name);
								this.localeInfo.location = locale;
								this.localeInfo.text = locale.name;
								this.localeInfo.id = locale.id;
							}
						}
					}
					if(point && !this.localeInfo.id) {
						this.localeInfo.id = point.id;
						this.localeInfo.text = point.name;
						this.localeInfo.location = point;
					}

//					console.log("Test: ", this.localeInfo.id);
					if(this.localeInfo.id && !this.localeInfo.shown) {
						this.actions.options.unshift(this.localeInfo);
						this.localeInfo.shown = true;
					} else if(!this.localeInfo.id && this.localeInfo.shown) {
						Vue.set(this.actions, "header", "Location");
						this.actions.options.shift();
						this.localeInfo.shown = false;
					}

					Vue.set(this.actions, "x", xc);
					Vue.set(this.actions, "y", yc);
					Vue.set(this.actions, "px", xc/this.image.width);
					Vue.set(this.actions, "py", yc/this.image.height);
					Vue.set(this.actions, "open", true);
					Vue.set(this, "action", null);
					this.buildMenu();

					setTimeout(() => {
						if((buffer = $(this.$el).find("#viewgen")) && buffer[0]) {
							buffer[0].focus();
						}
					});
				}
			},
			"closeActions": function() {
				Vue.set(this.actions, "open", false);
				Vue.set(this, "action", null);
			},
			"getActionMenuStyle": function() {
				return "left: " + (this.actions.px*100) + "%; top: " + (this.actions.py*100) + "%;";
			},
			"fire": function(option, event) {
				var action = null,
					buffer,
					path,
					i;

				switch(option.event) {
					case "set-crosshair":
						this.universe.send("map:mark", {
							"location": this.location.id,
							"id": "cross:" + (issuing++) + ":" + Date.now(),
							"x": (this.actions.x/this.image.width*100),
							"y": (this.actions.y/this.image.height*100),
							"standalone": this.storage.crosshairing.state,
							"pathed": this.storage.pathing.state,
							"color": option.color
						});
						if(issuing > 50000) {
							issuing = 0;
						}
						break;
					case "clear-crosshair":
						buffer = [];
						for(i=0; i<this.location.coordinates.length; i++) {
							if(this.location.coordinates[i].color === option.color) {
								buffer.push(this.location.coordinates[i]);
							}
						}
						if(buffer.length) {
							this.universe.send("map:unmark", {
								"location": this.location.id,
								"ids": buffer
							});
						}
						break;
					case "clear-all-crosshair":
						this.universe.send("map:unmark", {
							"location": this.location.id
						});
						break;
					case "set-hidden":
						// console.log("Hide: ", option);
						if(option.object) {
							Vue.set(this.storage.hide, option.object, !this.storage.hide[option.object]);
						}
						break;
					case "add-radial":
						if(this.action == radialAction) {
							Vue.set(this, "action", null);
						} else {
							Vue.set(this, "action", radialAction);
						}
						return null;
						break;
					case "set-radial":
						if(this.storage.radial_radius) {
							// console.log("Add Radial: ", {
							// 	"location": this.location.id,
							// 	"id": "cross:" + (issuing++) + ":" + Date.now(),
							// 	"x": this.actions.px,
							// 	"y": this.actions.py,
							// 	"object": this.localeInfo.shown?this.localeInfo.id:null,
							// 	"radial": this.storage.radial_radius,
							// 	"color": option.color,
							// 	"standalone": true,
							// 	"pathed": false
							// });
							// this.renderRadial(null, this.storage.radial_radius, this.actions.px * 100, this.actions.py * 100);
							this.universe.send("map:mark", {
								"location": this.location.id,
								"id": "cross:" + (issuing++) + ":" + Date.now(),
								"x": 100*this.actions.px,
								"y": 100*this.actions.py,
								"object": this.localeInfo.shown?this.localeInfo.id:null,
								"radial": this.storage.radial_radius,
								"color": option.color,
								"standalone": true,
								"pathed": false
							});
						}
						
						break;
					case "toggle-crosshair":
						if(this.storage.crosshairing.state) {
							Vue.set(this.storage.crosshairing, "icon", "fal fa-crosshairs");
							Vue.set(this.storage.crosshairing, "text", "Crosshairs On");
							Vue.set(this.storage.crosshairing, "state", false);
						} else {
							Vue.set(this.storage.crosshairing, "icon", "fal fa-location-slash");
							Vue.set(this.storage.crosshairing, "text", "Crosshairs Off");
							Vue.set(this.storage.crosshairing, "state", true);
						}
						break;
					case "toggle-pathing":
						if(this.storage.pathing.state) {
							Vue.set(this.storage.pathing, "icon", "fad fa-chart-scatter rs-secondary-transparent");
							Vue.set(this.storage.pathing, "text", "Point Path Off");
							Vue.set(this.storage.pathing, "state", false);
						} else {
							Vue.set(this.storage.pathing, "icon", "fad fa-chart-network rs-secondary-transparent");
							Vue.set(this.storage.pathing, "text", "Point Path On");
							Vue.set(this.storage.pathing, "state", true);
						}
						break;
					case "set-map":
						this.universe.send("map:view", {
							"location": this.location.id,
							"shown_at": Date.now(),
							"image": this.image
						});
						break;
					case "set-location":
						buffer = this.universe.getObject(this.storage.alter);
						if(buffer) {
							this.universe.send("map:location", {
								"location": this.location.id,
								"object": buffer.id,
								"x": (this.actions.x/this.image.width*100),
								"y": (this.actions.y/this.image.height*100)
							});
						}
						break;
					case "add-point":
						this.appendPath(this.actions.x/this.image.width*100, this.actions.y/this.image.height*100);
						break;
					case "set-name-point":
						this.setNamePoint(this.actions.x/this.image.width*100, this.actions.y/this.image.height*100);
						break;
					case "set-current":
						if(this.player.gm) {
							this.universe.send("control:map", {
								"url": "/map/" + this.location.id,
								"location": this.location.id,
								"image": this.storage.image
							});
						}
						break;
					case "generate-location":
						if(this.player.gm) {
							this.generateLocationNoun(this.actions.x/this.image.width*100, this.actions.y/this.image.height*100);
						}
						break;
					case "set-mark":
						if(this.action == markAction) {
							Vue.set(this, "action", null);
						} else {
							Vue.set(this, "action", markAction);
						}
						return null;
					case "clear-mark":
						if(this.action == markClearAction) {
							Vue.set(this, "action", null);
						} else {
							Vue.set(this, "action", markClearAction);
						}
						return null;
					case "set-measurement":
						var p1 = {},
							p2 = {},
							length;

						p1.x = this.storage.measuring[this.location.id][0].x * this.image.width;
						p1.y = this.storage.measuring[this.location.id][0].y * this.image.height;
						p2.x = this.storage.measuring[this.location.id][1].x * this.image.width;
						p2.y = this.storage.measuring[this.location.id][1].y * this.image.height;

						length = rsSystem.math.distance.points2D(p1, p2) / (1 + .1 * this.storage.image.zoom);
						length = Math.floor(length + .5);
						// console.log("Set Length: " + length);
						length = (this.storage.distance * (rsSystem.math.distance.convert[this.storage.distance_unit] || 1)) / length;
						if(!isNaN(length)) {
							this.universe.send("map:distance", {
								"location": this.location.id,
								"distance": length
							});
						}
						break;
					case "clear-measuring":
						if(this.storage.measuring[this.location.id]) {
							Vue.set(this, "totalLength", 0);
							Vue.set(this, "totalTime", 0);
							this.storage.measuring[this.location.id].splice(0);
							this.renderMeasurements();
							this.buildMenu();
						}
						break;
					case "measure-line":
						if(!this.storage.measuring[this.location.id]) {
							Vue.set(this.storage.measuring, this.location.id, []);
						}
						this.storage.measuring[this.location.id].push({
							"x": this.actions.x/this.image.width,
							"y": this.actions.y/this.image.height
						});
						// this.renderMeasurements();
						if(this.storage.measuring[this.location.id].length === 1) {
							this.buildMenu();
						}
						break;
					case "info-key":
						// console.log("Show Info: ", option);
						// this.info(option.location);
						if(option.location) {
							if(option.location.links_to || option.location.map) {
								this.$router.push("/map/" + (option.location.links_to || option.location.id));
							} else {
								this.info(option.location);
							}
						}
						break;
					case "copy-key":
						// this.info(option.location);
						if(this.localeInfo.location) {
							Vue.set(this.storage, "alter", this.localeInfo.location.id || this.location.id);
						} else {
							Vue.set(this.storage, "alter", this.location.id);
						}
						break;
					case "edit-key":
						// this.info(option.location);
						// var path;
						if(this.localeInfo.location && this.localeInfo.shown) {
							this.editNoun(this.localeInfo.location);
							// path = "/control/" + (this.localeInfo.location._class || "location") + "/" + this.localeInfo.location.id;
						} else {
							this.editNoun(this.location);
							// path = "/control/" + this.location._class + "/" + this.location.id;
						}
						// if(this.profile.edit_new_window) {

						// } else {
						// 	this.$router.push(path);
						// }
						// break;
				}

				Vue.set(this, "action", null);
				this.redrawPaths();
				this.closeActions();
			},
			"appendPath": function(x, y) {
				var buffer;
				if(this.storage.path_fill) {
					buffer = this.universe.index.location[this.storage.path_fill];
					if(buffer && this.player.gm) {
						// console.log("Update Path[" + buffer.id + "]: ", buffer);
						buffer.appendPath(x, y);
					}
				}
			},
			"setNamePoint": function(x, y) {
				var buffer;
				if(this.storage.path_fill) {
					buffer = this.universe.index.location[this.storage.path_fill];
					if(buffer && this.player.gm) {
						buffer.commit({
							"x": x,
							"y": y
						});
					}
				}
			},
			"getCoordinateStyle": function(coordinate) {
				var object;
				if(coordinate.object && (object = this.universe.getObject(coordinate.object))) {
					return "width: " + (object.x || coordinate.x) + "%; height: " + (object.y || coordinate.y) + "%;" + (coordinate.color?"border-color: " + coordinate.color + ";":"");
				} else {
					return "width: " + coordinate.x + "%; height: " + coordinate.y + "%;" + (coordinate.color?"border-color: " + coordinate.color + ";":"");
				}
			},
			"dismissCoordinate": function(coordinate) {
				this.universe.send("map:unmark", {
					"location": this.location.id,
					"id": coordinate.id
				});
			},
			"resetViewport": function() {
				Object.assign(this.image, this.original);
				var view = this.getViewport();

				this.image.zoom = 0;
				this.image.left = view.width/2 - this.image.width/2;
				this.image.top = view.height/2 - this.image.height/2;
				this.apply(this.image);
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
					this.image.height = img.height;
					this.image.width = img.width;
					this.image.ratio = img.width / img.height;
					Object.assign(this.original, this.image);

					Vue.set(this, "ready", true);
					Vue.set(this, "parchment", this.element.find(".parchment"));
					this.apply(this.image);
					callback();
				};

				img.src = path;
			},
			"getDimensions": function(path) {
//				console.log("Get Dimensions: " + path);
				var img = new Image;

				img.onload = () => {
					this.image.height = img.height;
					this.image.width = img.width;
					this.image.ratio = img.width / img.height;
					Object.assign(this.original, this.image);

					Vue.set(this, "ready", true);
					Vue.set(this, "parchment", this.element.find(".parchment"));
					this.apply(this.image);
				};

				img.src = path;
			},
			"clicking": function(event) {
//				console.log("click");

			},
			"down": function(event) {
				// console.log("down: (" + event.pageX + ", " + event.pageY + "); (" + this.image.left + ", " + this.image.top + ")");
				switch(event.button) {
					case 0:
						this.isDragging = true;
						this.dragX = 0;
						this.dragY = 0;
						break;
				}
			},
			"up": function(event) {
				// console.log("up");
				this.isDragging = false;
			},
			"out": function(event) {
//				console.log("out");
				if(event.fromElement.attributes.onexit && event.fromElement.attributes.onexit.value === "true") {
					this.isDragging = false;
				}
			},
			"getCenter": function() {
				var view = this.getViewport(),
					vh = view.height/2,
					vw = view.width/2,
					left,
					top,
					x;

				left = this.image.left - vw;
				top = this.image.top - vh;

				return {
					"x": -1* ((left/this.image.width) * 100).toFixed(3),
					"y": -1* ((top/this.image.height) * 100).toFixed(3),
					"left": left,
					"top": top
				};
			},
			"zoom": function(level) {
				if(ZOOMBOUNDS.min < level && level < ZOOMBOUNDS.max) {
					var targetHeight = this.original.height * (1 + .1 * level),
						targetWidth = this.original.width * (1 + .1 * level),
						view = this.getViewport(),
						vh = view.height/2,
						vw = view.width/2,
						cenX,
						cenY;

					cenY = (this.image.top - vh) / this.image.height;
					cenX = (this.image.left - vw) / this.image.width;
					cenY *= targetHeight;
					cenX *= targetWidth;
					cenY += vh;
					cenX += vw;

					this.apply({
						"height": targetHeight,
						"width": targetWidth,
						"zoom": level,
						"left": cenX,
						"top": cenY
					});
				}
			},
			"pan": function(panned) {
				var left,
					top,
					dX,
					dY;

				// console.log("Panning[]: ", panned.velocityX, panned.velocityY);
				// left = this.parchment.css("left") || "0px";
				// top = this.parchment.css("top") || "0px";
				// left = parseInt(left.replace("px", ""));
				// top = parseInt(top.replace("px", ""));

				// if(this.isDragging) {
				// 	console.log("Panning: (" + panned.center.x + ", " + panned.center.y + "), (" + panned.deltaX + ", " + panned.deltaY + "); (" + this.image.left + ", " + this.image.top + ")");
				// } else {
				// 	console.warn("Panning: (" + panned.center.x + ", " + panned.center.y + "), (" + panned.deltaX + ", " + panned.deltaY + "); (" + this.image.left + ", " + this.image.top + ")");
				// }
				if(this.isDragging) {
					dX = this.dragX - panned.deltaX;
					dY = this.dragY - panned.deltaY;
				} else {
					this.isDragging = true;
					dX = 0 - panned.deltaX;
					dY = 0 - panned.deltaY;
				}

//				console.warn("Pan[" + dX + ", " + dY + "]: " + left + ", " + top + " --> " + (left-dX) + ", " + (top-dY));
				left = this.image.left - dX;
				top = this.image.top - dY;

				if(panned.isFinal) {
					this.isDragging = false;
				} else {
					this.dragX = panned.deltaX;
					this.dragY = panned.deltaY;
				}

				this.apply({
					"left": left,
					"top": top
				});
			},
			"wheeling": function(event) {
//				console.log("wheel", event);
				if(event.deltaY < 0) {
					this.zoomInOne();
				} else if(event.deltaY > 0) {
					this.zoomOutOne();
				}
			},
			"zoomOutOne": function() {
				// console.log("Zoom -1");
				if(this.image.zoom > ZOOMBOUNDS.min) {
					this.zoom(this.image.zoom - 1);
				}
			},
			"zoomInOne": function() {
				// console.log("Zoom +1");
				if(this.image.zoom < ZOOMBOUNDS.max) {
					this.zoom(this.image.zoom + 1);
				}
			},
			"apply": function(applying) {
				// console.log("Start Apply: ", _p(this.image), _p(applying), this.parchment);
				if(this.parchment && this.parchment.length) {
					var applyTiming = Date.now(),
						zoomTiming,
						pathTiming,
						measureTiming;
					if(applying.height === undefined) {
						applying.height = this.image.height;
					}
					if(applying.width === undefined) {
						applying.width = this.image.width;
					}
					if(applying.left === undefined) {
						applying.left = this.image.left;
					}
					if(applying.top === undefined) {
						applying.top = this.image.top;
					}

//					applying.height = applying.height || this.image.height || 0;
//					applying.width = applying.width || this.image.width || 0;
//					applying.left = applying.left || this.image.left || 0;
//					applying.top = applying.top || this.image.left || 0;

					if(applying.zoom === undefined && this.image.zoom === undefined) {
						applying.zoom = 0;
					}
					if(ZOOMBOUNDS.min < applying.zoom && applying.zoom < ZOOMBOUNDS.max) {
						this.image.height = this.original.height * (1 + .1 * applying.zoom);
						this.image.width = this.original.width * (1 + .1 * applying.zoom);
						Vue.set(this, "scaledSize", this.baseFontSize + applying.zoom);
					}

					if(applying.zoom !== undefined && this.locales && this.locales.length && (this.image._lastzoom !== applying.zoom || this.image._lastlocation !== this.location.id)) {
//						console.log("Apply Redraw: ", JSON.stringify(this.image, null, 4), JSON.stringify(applying, null, 4));
//						console.log("Apply Redraw");
						zoomTiming = Date.now();
						this.image._lastlocation = this.location.id;
						this.image._lastzoom = applying.zoom;
						for(var x=0; x<this.locales.length; x++) {
							if(this.availableCanvases[this.locales[x].id]) {
								this.availableCanvases[this.locales[x].id].height = applying.height;
								this.availableCanvases[this.locales[x].id].width = applying.width;
							}
						}
						Object.assign(this.image, applying);
						this.redrawPaths();
						zoomTiming = Date.now() - zoomTiming;
					} else {
						if(this.image._lastlocation !== this.location.id) {
							this.image._lastlocation = this.location.id;
						}
						if(this.image._lastzoom !== applying.zoom) {
							this.image._lastzoom = applying.zoom;
						}
						Object.assign(this.image, applying);
					}

					// console.log(" > Apply: ", _p(this.image), _p(applying), this.parchment);
					this.parchment.css({
						"height": applying.height + "px",
						"width": applying.width + "px",
						"left": applying.left + "px",
						"top": applying.top + "px"
				    });
					
					measureTiming = Date.now();
					this.renderMeasurements();
					measureTiming = measureTiming - Date.now();
					// console.log("Applied: " + (Date.now() - applyTiming));
					// if(zoomTiming !== undefined) {
					// 	console.log(" - Zooming: " + zoomTiming);
					// }
					// console.log(" - Measuring: " + measureTiming);
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
					if(path.location === this.location.id && path.rendering_has_path) {
						if(!this.availableLocales[path.id] || !this.availableLocales[path.id].parentNode) {
							buffer = $("[data-id='locale:" + path.id + "']");
							if(buffer.length) {
								this.availableLocales[path.id] = buffer[0].getContext("2d");
								this.availableCanvases[path.id] = buffer[0];

								this.availableCanvases[path.id].height = this.image.height;
								this.availableCanvases[path.id].width = this.image.width;
							}
						}

						if(this.availableLocales[path.id]) {
							this.availableLocales[path.id].clearRect(0, 0, this.availableCanvases[path.id].width, this.availableCanvases[path.id].height);
							this.drawPath(this.availableLocales[path.id], path);
						}
					}
				}
				
				Vue.set(clearAll, "text", "All " + this.location.coordinates.length + " Marks");
				this.renderMeasurements();
			},
			"drawPath": function(canvas, path) {
				// console.log("Draewing Path: ", canvas, path);
				if(path && path.rendering_has_path && !this.storage.hidden_legend[path.id]) {
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
								point = [buffer.x/100 * this.image.width, buffer.y/100 * this.image.height];
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
				canvas.lineWidth = path.thickness;
				if(path.opacity !== undefined) {
					canvas.globalAlpha = path.opacity;
				}
				canvas.beginPath();
				canvas.moveTo(points[0][0], points[0][1]);
				for(x=1; x<points.length; x++) {
					if(path.rendering_curved) {
						//canvas.bezierCurveTo(path.values[x][0] * this.image.width, path.values[x][1] * this.image.height);
						xc = (points[x-1][0] + points[x][0]) / 2;
						yc = (points[x-1][1] + points[x][1]) / 2;
						canvas.quadraticCurveTo(xc, yc, points[x][0], points[x][1]);
//						canvas.quadraticCurveTo(
//							path.values[x-1][0] * this.image.width,
//							path.values[x-1][1] * this.image.height,
//							path.values[x][0] * this.image.width,
//							path.values[x][1] * this.image.height);
					} else {
						canvas.lineTo(points[x][0], points[x][1]);
					}
				}
				if(path.rendering_path_closed) {
					canvas.closePath();
					canvas.stroke();
					canvas.fillStyle = path.rendering_fill_color || "#FFFFFF";
					canvas.beginPath();
					canvas.moveTo(points[0][0], points[0][1]);
					for(x=1; x<points.length; x++) {
						if(path.rendering_curved) {
							//canvas.bezierCurveTo(path.values[x][0] * this.image.width, path.values[x][1] * this.image.height);
							xc = (points[x-1][0] + points[x][0]) / 2;
							yc = (points[x-1][1] + points[x][1]) / 2;
							canvas.quadraticCurveTo(xc, yc, points[x][0], points[x][1]);
//							canvas.quadraticCurveTo(
//								path.values[x-1][0] * this.image.width,
//								path.values[x-1][1] * this.image.height,
//								path.values[x][0] * this.image.width,
//								path.values[x][1] * this.image.height);
						} else {
							canvas.lineTo(points[x][0], points[x][1]);
						}
					}
					canvas.closePath();
					canvas.fill();

					if(/*this.storage.labels && path.rendering_name &&*/ typeof(path.x) === "number" && typeof(path.y) === "number") {
						canvas.fillStyle = path.label_color || path.rendering_path_color || "#FFFFFF";
						canvas.font = "bold " + Math.min(12 + this.storage.image.zoom, location.max_font_size || 50) + "px Arial";
						canvas.shadowColor = path.label_shadow_color || "rgba(0, 0, 0, .4)";
						canvas.shadowBlur = path.label_shadow_blur || 3;
						canvas.globalAlpha = path.label_opacity || 1;
						canvas.shadowOffsetX = 0;
						canvas.shadowOffsetY = 0;
						canvas.fillText(path.label || path.name, path.x * this.image.width, path.y * this.image.height);
					}
				} else {
					canvas.stroke();
				}

				return canvas;
			},
			"receiveMeasurementPoint": function(point) {
				if(point && point.x && point.y) {
					var zoom =  (1 + .1 * this.image.zoom);
					var x = point.x/100,
						y = point.y/100;

					if(!this.storage.measuring[this.location.id]) {
						Vue.set(this.storage.measuring, this.location.id, []);
					}
					// console.log("Receiving Point: " + point.x + ", " + point.y, zoom, x, y, _p(this.image));
					this.storage.measuring[this.location.id].push({
						"x": x,
						"y": y
					});
					this.renderMeasurements();
					if(this.storage.measuring[this.location.id].length === 1) {
						this.buildMenu();
					}
				}
			},
			"renderRadials": function() {
				var object,
					point,
					i;
				
				for(i=0; i<this.location.coordinates.length; i++) {
					point = this.location.coordinates[i];
					if(point.radial) {
						if(point.object) {
							object = this.universe.getObject(point.object);
						} else {
							object = null;
						}
						this.renderRadial(object, point.radial, point.x, point.y, point.color);
					}
				}
			},
			"renderRadial": function(object, r, x, y, color) {
				var zoom = 1 + .1 * this.storage.image.zoom,
					canvas = $("#measuring"),
					context;
				if(canvas && (canvas = canvas[0]) && this.image) {
					context = canvas.getContext("2d");

					if(object) {
						x = object.x;
						y = object.y;
					}

					r = (r * zoom)/this.location.map_distance;
					y = y/100 * this.image.height;
					x = x/100 * this.image.width;
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
						default: // Black
							context.strokeStyle = "#000000E0";
							context.fillStyle = "#00000030";
					}
					context.stroke();
					context.fill();
				}
			},
			"renderMeasurements": function() {
				// console.warn("Measurements[" + this.storage.image.zoom + "]...");
				var canvas,
					format,
					party,
					path,
					zoom,

					total_length = 0,
					total_time = 0,
					time,
					len,

					points,
					x1,
					y1,
					x2,
					y2,
					mx,
					my,
					uS, // unumStud
					kS, // kiloStud
					i,
					j;

				if(this.storage.view_party) {
					party = this.universe.index.party[this.storage.view_party];
				}

				canvas = $("#measuring");
				if(canvas && (canvas = canvas[0])) {
					canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
					canvas.height = this.image.height;
					canvas.width = this.image.width;
					canvas = canvas.getContext("2d");
					Vue.set(this, "initializing", false);
					if(this.storage.measuring[this.location.id] && this.storage.measuring[this.location.id].length) {
						points = [];
						canvas.clearRect(0, 0, canvas.width, canvas.height);
						canvas.font = Math.min(14 + this.storage.image.zoom, location.max_font_size || 50) + "px serif";
						canvas.strokeStyle = "#FFFFFF";
						canvas.fillStyle = "#FFFFFF";
						canvas.globalAlpha = .7;
						canvas.lineWidth = 2;

						zoom = 1 + .1 * this.storage.image.zoom;

						// console.log("Rendering[" + this.image.width + "x" + this.image.height + "@" + zoom + "]: ", JSON.stringify(this.storage.measuring[this.location.id], null, 4));
						canvas.beginPath();
						x1 = this.storage.measuring[this.location.id][0].x * this.image.width;
						y1 = this.storage.measuring[this.location.id][0].y * this.image.height;
						canvas.moveTo(x1, y1);
						points.push([x1, y1]);
						for(i=1; i<this.storage.measuring[this.location.id].length; i++) {
							x2 = this.storage.measuring[this.location.id][i].x * this.image.width;
							y2 = this.storage.measuring[this.location.id][i].y * this.image.height;
							mx = x1 + (x2 - x1)/2;
							my = y1 + (y2 - y1)/2;
							canvas.lineTo(x2, y2);
							points.push([x2, y2]);

							if(this.location.map_distance) {
								path = rsSystem.math.distance.points2D(x1, y1, x2, y2) / zoom;
								path = Math.ceil(path);
								path = this.location.map_distance * path;
								uS = Math.ceil(path%1000);
								kS = Math.floor(path/1000);
								if(kS) {
									len = kS + "kS " + uS + "uS";
								} else {
									len = uS + "uS";
								}
								// len = rsSystem.math.distance.display(rsSystem.math.distance.reduceMeters(path), "", ["pc", "ly", "km"]);
								total_length += path;
								if(party && party.speed) {
									time = path / party.speed;
									total_time += time;
									time = rsSystem.math.time.reduceSeconds(time);
									format = "";
									if(time.Y) {
										format += "$Yy ";
									}
									if(time.M) {
										format += "$Mm ";
									}
									if(time.w) {
										format += "$ww ";
									}
									if(time.d) {
										format += "$dd";
									}
									len += " @" + rsSystem.math.time.display(time, format.trim());
								}
								//canvas.fillRect(tx - 5, ty - 5, len.length * (20 + this.image.zoom), 30 + this.image.zoom);
								canvas.strokeStyle = "#FFFFFF";
								canvas.fillStyle = "#FFFFFF";
								canvas.globalAlpha = 1;
								canvas.lineWidth = 10;
								canvas.fillText(len, mx, my);
								canvas.strokeStyle = "#000000";
								canvas.fillStyle = "#000000";
								canvas.globalAlpha = 1;
								canvas.lineWidth = 3;
								canvas.fillText(len, mx, my);
								canvas.strokeStyle = "#FFFFFF";
								canvas.fillStyle = "#FFFFFF";
								canvas.globalAlpha = .7;
								canvas.lineWidth = 2;
							}

							x1 = x2;
							y1 = y2;
						}
						canvas.stroke();

						canvas.strokeStyle = "#FF2121";
						canvas.beginPath();
						canvas.arc(points[0][0], points[0][1], canvas.lineWidth, 0, rsSystem.math.distance.pi2);
						canvas.stroke();
						canvas.strokeStyle = "#FFFFFF";
						for(i=1; i<points.length; i++) {
							canvas.beginPath();
							canvas.arc(points[i][0], points[i][1], canvas.lineWidth, 0, rsSystem.math.distance.pi2);
							canvas.stroke();
						}

						if(total_length) {
							// console.log("Total Length: ", total_length);
							// Vue.set(this, "totalLength", rsSystem.math.distance.display(rsSystem.math.distance.reduceMeters(total_length), "", ["pc", "ly", "km"]));
							// Vue.set(this, "totalLength", rsSystem.math.distance.display(rsSystem.math.distance.reduceMeters(total_length), "", ["km", "m"]));
							uS = Math.ceil(total_length%1000);
							kS = Math.floor(total_length/1000);
							if(kS) {
								Vue.set(this, "totalLength", kS + "kS " + uS + "uS");
							} else {
								Vue.set(this, "totalLength", uS + "uS");
							}
						} else {
							Vue.set(this, "totalLength", null);
						}
						if(total_time) {
							time = rsSystem.math.time.reduceSeconds(total_time);
							format = "";
							if(time.Y) {
								format += "$Yy ";
							}
							if(time.M) {
								format += "$Mm ";
							}
							if(time.w) {
								format += "$ww ";
							}
							if(time.d) {
								format += "$dd";
							}
							Vue.set(this, "totalTime", rsSystem.math.time.display(time, format.trim()));
						} else {
							Vue.set(this, "totalTime", null);
						}
					}

					// Pathed Points use the same Canvas for now in an attempt to save resources
					if(this.location.coordinates && this.location.coordinates.length) {
						points = {};

						for(i=0; i<this.location.coordinates.length; i++) {
							if(this.location.coordinates[i].pathed) {
								if(!points[this.location.coordinates[i].color]) {
									points[this.location.coordinates[i].color] = [];
								}
								points[this.location.coordinates[i].color].push({
									"x": (this.location.coordinates[i].x/100) * this.image.width,
									"y": (this.location.coordinates[i].y/100) * this.image.height
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
				if(element.template || element.hidden || (element.obscured && !this.player.gm)) {
					return false;
				}

				if(element.must_know && !this.player.gm) {

				}
			},
			"localeVisible": function(locale) {
				if(!this.elementVisible(locale)) {
					return false;
				}
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
				var entity,
					x;

				if(link.template || link.is_template || link.x === undefined || link.y === undefined || link.x === null || link.y === null) {
					return false;
				}

				if(this.player.gm && this.storage.master_view === "master") {
					return true;
				}

				//console.log("Link[" + link.id + " | " + link.must_know + "]: " + ( (!this.player.gm || this.storage.master_view !== "master") && (!this.viewingEntity || !this.viewingEntity.knowsOf(link)) ), " | ", this.viewingEntity.knowsOf(link), "\n > ", this.viewingEntity);
				if(!this.viewingEntity || !this.entityKnowsOf(this.viewingEntity, link)) {
					return false;
				}

				if(this.storage.poiFiltering && this.search_criteria.length) {
					if(!link._search) {
						return false;
					}
					for(x=0; x<this.search_criteria.length; x++) {
						if(link._search.indexOf(this.search_criteria[x]) === -1) {
							return false;
						}
					}
				}

				if(link.hidden || this.storage.hide[link.id] || link.obscured) {
					return false;
				}

				return true;
			},
			"renderState": function() {
				var state = "";
				if(this.storage.fullscreen) {
					state += " fullscreen";
				}
				return state;
			},
			"poiClass": function(link) {
				return link.class || link.icon;
			},
			"openLink": function(link) {
				this.info(link.id);
				// this.$router.push("map/" + link.id);
			},
			"poiMenu": function(link) {
				Vue.set(this, "focusedLocation", link.id);
			},
			"minorUpdate": function() {
				this.$forceUpdate();
			},
			"submenuClasses": function() {
				if(this.action && this.action.options) {
					return "open";
				}
				return "close";
			},
			"buildMenu": function() {
				this.actions.options.splice(0);
				if(this.localeInfo.shown) {
					// console.log("Locale: ", _p(this.localeInfo));
					this.actions.options.push(this.localeInfo);
					if(this.player.gm) {
						if(this.storage.hide[this.localeInfo.id]) {
							this.actions.options.push({
								"icon": "fas fa-eye",
								"event": "set-hidden",
								"text": "Reveal Object",
								"object": this.localeInfo.id
							});
						} else {
							this.actions.options.push({
								"icon": "fas fa-eye-slash",
								"event": "set-hidden",
								"text": "Hide Object",
								"object": this.localeInfo.id
							});
						}
					}
				}

				this.actions.options.push({
					// TODO: Set Markings Action
					"icon": "fas fa-map-marker-alt",
					"event": "set-mark",
					"text": "Set Mark"
				});
				this.actions.options.push({
					// TODO: Set Markings Action
					"icon": "fas fa-map-marker-alt-slash",
					"event": "clear-mark",
					"text": "Clear Marks"
				});

				this.actions.options.push(this.storage.crosshairing);
				this.actions.options.push(this.storage.pathing);
				if(this.location.map_distance) {
					this.actions.options.push({
						"icon": "fad fa-scrubber",
						"event": "add-radial",
						"text": "Add Radial"
					});
				}
				this.actions.options.push(this.takeMeasurements);
				if(this.storage.measuring[this.location.id] && this.storage.measuring[this.location.id].length) {
					this.actions.options.push({
						"icon": "far fa-compass-slash",
						"event": "clear-measuring",
						"text": "Clear Measuring"
					});
				}
				
				if(this.player.gm) {
					this.actions.options.push({
						"icon": "fas fa-map-marked",
						"event": "set-current",
						"text": "Show Map"
					});

					this.actions.options.push({
						"icon": "fas fa-map",
						"event": "set-map",
						"text": "Set Location View"
					});
					this.actions.options.push({
						"icon": "fas fa-copy",
						"event": "copy-key",
						"text": "Copy ID"
					});
					this.actions.options.push({
						"icon": "fas fa-edit",
						"event": "edit-key",
						"text": "Edit ID"
					});
					this.actions.options.push({
						"icon": "fas fa-chevron-double-right",
						"event": "set-location",
						"text": "Set Location"
					});
				}
			},
			"update": function(source) {
				var now = Date.now();
				if(this.location && (!source || source.location === this.location.id || source.id === this.location.id || (this.viewingEntity && (source.id === this.viewingEntity.id || source.entity === this.viewingEntity.id)))) {
					if((now - this.last) > UPDATESTEP) {
						// console.log("Start Update: " + now);
						this.last = now;
						var buffer,
							x;

						this.availablePOIs.splice(0);
						this.locales.splice(0);
						Vue.set(this, "baseFontSize", this.location.base_font_size || 10);

						for(x=0; x<this.universe.listing.location.length; x++) {
							buffer = this.universe.listing.location[x];
							if(buffer && !buffer.disabled && !buffer.is_preview && (!buffer.obscured || this.player.gm) && buffer.location === this.location.id) {
								this.availablePOIs.push(buffer);
								if(buffer.rendering_has_path && this.locales) {
									this.locales.push(buffer);
								}
							}
						}

						for(x=0; x<this.universe.listing.entity.length; x++) {
							buffer = this.universe.listing.entity[x];
							if(buffer && !buffer.disabled && !buffer.is_preview && (!buffer.obscured || this.player.gm) && buffer.location === this.location.id) {
								this.availablePOIs.push(buffer);
							}
						}

						for(x=0; x<this.universe.listing.party.length; x++) {
							buffer = this.universe.listing.party[x];
							if(buffer && !buffer.disabled && !buffer.is_preview && (!buffer.obscured || this.player.gm) && buffer.location === this.location.id) {
								this.availablePOIs.push(buffer);
							}
						}

						for(x=0; x<this.universe.listing.storm.length; x++) {
							buffer = this.universe.listing.storm[x];
							if(buffer && !buffer.disabled && !buffer.is_preview && (!buffer.obscured || this.player.gm) && buffer.location === this.location.id) {
								this.availablePOIs.push(buffer);
							}
						}

						if(this.location && this.location.id !== this.renderedLocation) {
							Vue.set(this, "renderedLocation", this.location.id);
							Vue.set(this, "ready", false);
							this.waitDimensions(this.universe.getImagePath(this.location.map), this.finishUpdate);
						} else {
							this.finishUpdate();
						}

						// if(this.storage.follow && this.location.showing && this.location.shown_at && this.storage.viewed_at < this.location.shown_at) {
							// Vue.set(this.storage, "viewed_at", this.location.shown_at);
							// Object.assign(this.image, this.location.showing);
							// this.apply(this.image);
						// }

					} else {
						if(!this.delayed) {
							this.delayed = setTimeout(() => {
								this.delayed = null;
								this.update();
							}, UPDATESTEP);
						}
					}
				}
			},
			"finishUpdate": function() {
				this.buildMenu();
				this.determinePOIs();
				this.redrawPaths();
				// console.log(" - Fin: " + (Date.now() - this.last));
				// this.renderMeasurements();
				if(this.resetViewportFlag) {
					Vue.set(this, "resetViewportFlag", false);
					this.resetViewport();
				}
			}
		},
		"beforeDestroy": function() {
			rsSystem.EventBus.$off("measure-point", this.receiveMeasurementPoint);
			rsSystem.EventBus.$off("info:closed", this.clearSearch);
			rsSystem.EventBus.$off("copied-id", this.setMenuID);
			this.universe.$off("updated", this.update);
			// this.universe.$off("universe:modified", this.update);
			// this.universe.$off("model:modified", this.update);
		},
		"template": Vue.templified("components/viewerV1.html")
	});
})();
