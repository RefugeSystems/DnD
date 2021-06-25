
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
 * @class rsViewer
 * @constructor
 * @module Components
 */
(function() {
	var storageKey = "_rs_viewerComponentKey";

	var issuing = 0;

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
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-green",
			"event": "set-crosshair",
			"text": "Mark: Green",
			"color": "green"
		}, {
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-yellow",
			"event": "set-crosshair",
			"text": "Mark: Yellow",
			"color": "yellow"
		}, {
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-solid rs-secondary-blue",
			"event": "set-crosshair",
			"text": "Mark: Blue",
			"color": "blue"
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
			"icon": "fad fa-map-marker-alt rs-white rs-secondary-red rs-secondary-solid",
			"event": "clear-crosshair",
			"text": "Mark: Red",
			"color": "red"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-orange",
			"event": "clear-crosshair",
			"text": "Mark: Orange",
			"color": "orange"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-green",
			"event": "clear-crosshair",
			"text": "Mark: Green",
			"color": "green"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-yellow",
			"event": "clear-crosshair",
			"text": "Mark: Yellow",
			"color": "yellow"
		}, {
			"icon": "fad fa-map-marker-alt-slash rs-white rs-secondary-solid rs-secondary-blue",
			"event": "clear-crosshair",
			"text": "Mark: Blue",
			"color": "blue"
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

	rsSystem.component("rsViewer", {
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

			data.focusedLocation = null;
			data.availableCanvases = {};
			data.availableLocales = {};
			data.pointsOfInterest = [];
			data.availablePOIs = [];
			data.coordinates = [];
			data.parties = [];
			data.locales = [];
			data.pins = true;
			data.alter = "";

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
				"icon": "fas fa-info-circle",
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
		"computed": {
			"sourceImage": function() {
				// console.log("Source Image:");
				if(this.location.map) {
					// console.log(" > Found: " + "/api/v1/image/" + this.location.map);
					return this.location.map;
				}
				// console.log("Not Found? ", this.location);
				return null;
			},
			"backgroundImage": function() {
				if(this.location.mapbg) {
					return this.location.mapbg;
				}
				return null;
			}
		},
		"watch": {
			"storage": {
				"deep": true,
				"handler": function() {
					if(this.storage.search !== this.storage.search.toLowerCase()) {
						Vue.set(this.state, "search", this.storage.search.toLowerCase());
					}
					this.saveStorage(this.storageKeyID, this.state);
				}
			},
			"location": {
				"handler": function(newValue, oldValue) {
					this.update();
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

			if(this.storage.search) {
				Vue.set(this, "search_criteria", this.storage.search.toLowerCase().split(" "));
			} else {
				Vue.set(this, "search_criteria", []);
			}

			if(this.storage.master_view !== "master") {
				if(this.storage.master_view) {
					Vue.set(this, "viewingEntity", this.universe.index.entity[this.storage.master_view]);
				}
				if(!this.viewingEntity) {
					Vue.set(this, "viewingEntity", this.universe.index.entity[this.player.attribute.playing_as]);
				}
			}

			rsSystem.register(this);
			rsSystem.EventBus.$on("measure-point", this.receiveMeasurementPoint);
			rsSystem.EventBus.$on("info:closed", this.clearSearch);
			rsSystem.EventBus.$on("copied-id", this.setMenuID);
			// this.universe.$on("universe:modified", this.update);
			// this.universe.$on("model:modified", this.update);
			// this.location.$on("modified", this.update);
			this.update();
		},
		"methods": {
			"clearSearch": function(record) {
				if(record && this.focusedLocation === record.id) {
					Vue.set(this, "focusedLocation", null);
				}
			},
			"setMenuID": function(id) {
				Vue.set(this.state, "alter", id);
			},
			"searchMap": function() {
				var set = false,
					buffer,
					x;

				Vue.set(this, "focusedLocation", null);
				if(this.search_criteria[0] === "self") {
					if((buffer = this.universe.index.entity[this.player.entity]) && (buffer = this.universe.index.location[buffer.location])) {
						while(buffer && buffer.location !== this.location.id) {
							buffer = this.universe.index.location[buffer.location];
						}
						if(buffer) {
							Vue.set(this, "focusedLocation", buffer.id);
							this.centerView(buffer);
							set = true;
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
			"centerView": function(location) {
				var locX,
					locY,
					view,
					x;

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
				Vue.set(this.state, "search", "");
				Vue.set(this, "searchError", "");
				this.search_criteria.splice(0);
			},
			"togglePOIFiltering": function() {
				Vue.set(this.state, "poiFiltering", !this.storage.poiFiltering);
				this.filterPOIs();
			},
			"filterPOIs": function(text) {
//				console.log("Filter: " + text);
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
						Vue.set(this.state, "markers", !this.storage.markers);
						break;
					case "labels":
						Vue.set(this.state, "labels", !this.storage.labels);
						this.redrawPaths();
						break;
					case "follow":
						Vue.set(this.state, "follow", !this.storage.follow);
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
						Vue.set(this.state, "fullscreen", !this.storage.fullscreen);
						break;
				}
			},
			"openActions": function(event) {
				var xc = event.offsetX,
					yc = event.offsetY,
					buffer,
					locale,
					x;

				buffer = event.target.getAttribute("data-id") || event.target.parentNode.getAttribute("data-id");
				if(buffer && (buffer = this.universe.index.index[buffer]) && buffer.x && buffer.y) {
					// console.log("Buffer: ", buffer);
					xc = this.image.width * buffer.x/100;
					yc = this.image.height * buffer.y/100;
				}
				// console.log("Open Actions[" + xc + ", " + yc + "]: ", event);

				if(event.ctrlKey) {
					this.appendPath(xc/this.image.width*100, yc/this.image.height*100);
				} else if(event.shiftKey) {
					this.setNamePoint(xc/this.image.width*100, yc/this.image.height*100);
				} else {
					this.localeInfo.id = undefined;
					for(x=0; x<this.locales.length; x++) {
						locale = this.locales[x];
						if(locale.contained) {
							buffer = this.availableLocales[locale.id];
//							if(buffer) {
//								console.log("Point Check[" + locale.id + " - " + xc + ", " + yc + " @ " + buffer.isPointInPath(xc, yc) + "]: ", buffer);
//							}
							if(buffer && buffer.isPointInPath(xc, yc)) {
								Vue.set(this.actions, "header", locale.name);
								this.localeInfo.location = locale;
								this.localeInfo.text = locale.name;
								this.localeInfo.id = locale.id;
							}
						}
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
					Vue.set(this.actions, "open", true);
					Vue.set(this, "action", null);

					setTimeout(() => {
						$(this.$el).find("#viewgen").focus();
					});
				}
			},
			"closeActions": function() {
				Vue.set(this.actions, "open", false);
				Vue.set(this, "action", null);
			},
			"getActionMenuStyle": function() {
				return "left: " + this.actions.x + "px; top: " + this.actions.y + "px;";
			},
			"fire": function(option, event) {
				var action = null,
					buffer,
					path,
					i;

				switch(option.event) {
					case "set-crosshair":
						this.coordinates.push({
							"id": "cross:" + (issuing++) + ":" + Date.now(),
							"x": (this.actions.x/this.image.width*100),
							"y": (this.actions.y/this.image.height*100),
							"standalone": this.storage.crosshairing.state,
							"pathed": this.storage.pathing.state,
							"color": option.color
						});
						this.location.commit({
							"coordinates": this.coordinates
						});
						break;
					case "clear-crosshair":
						buffer = [];
						for(i=0; i<this.coordinates.length; i++) {
							if(this.coordinates[i].color === option.color) {
								buffer.push(this.coordinates[i]);
							}
						}
						if(buffer.length) {
							this.location.commitSubtractions({
								"coordinates": buffer
							});
						}
						break;
					case "clear-all-crosshair":
						if(this.coordinates.length) {
							this.location.commitSubtractions({
								"coordinates": this.coordinates
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
						this.location.commit({
							"shown_at": Date.now(),
							"showing": this.image
						});
						break;
					case "set-location":
						buffer = this.universe.index.index[this.storage.alter];
						if(buffer && this.player.gm) {
							buffer.commit({
								"location": this.location.id,
								"y": this.actions.y/this.image.height*100,
								"x": this.actions.x/this.image.width*100
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
							this.universe.send("control", {
								"control": "page",
								"url": "/map/" + this.location.id,
								"condition": {
									"hash": "^#/map"
								}
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
							this.location.commit({
								"map_distance": length
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
//						console.log("Show Info: ", option);
						this.showInfo(option.location);
						break;
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
			"dismissCoordinate": function(coordinate) {
				if(this.player.gm) {
					var index = this.coordinates.indexOf(coordinate);
					if(index !== -1) {
						this.coordinates.splice(index, 1);
						this.location.commit({
							"coordinates": this.coordinates
						});
					}
				}
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
//				console.log("down:" + event.button, event);
				switch(event.button) {
					case 0:
						this.isDragging = true;
						this.dragX = event.pageX;
						this.dragY = event.pageY;
						break;
				}
			},
			"up": function(event) {
//				console.log("up");
				this.isDragging = false;
			},
			"out": function(event) {
//				console.log("out");
				if(event.fromElement.attributes.onexit && event.fromElement.attributes.onexit.value === "true") {
					this.isDragging = false;
				}
			},
			"panning": function($event) {

			},
			"dragging": function(event) {
				if(this.isDragging) {
					var left = this.parchment.css("left") || "0px",
						top = this.parchment.css("top") || "0px",
						dX = this.dragX - event.pageX,
						dY = this.dragY - event.pageY;

					left = parseInt(left.replace("px", ""));
					top = parseInt(top.replace("px", ""));

					//console.log("drag: " + left + " x " + top + " - [" + this.dragX + ", " + this.dragY + "] d[" + dX + ", " + dY + "] @[" + event.pageX + ", " + event.pageY + "]");

					left -= dX;
					top -= dY;

					this.apply({
						"left": left,
						"top": top
					});

					this.dragX = event.pageX;
					this.dragY = event.pageY;
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
				if(10 > level && level > -10) {
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
				var left = this.parchment.css("left") || "0px",
					top = this.parchment.css("top") || "0px",
					dX,
					dY;

//				console.log("Panning[]: ", panned.velocityX, panned.velocityY);
				left = parseInt(left.replace("px", ""));
				top = parseInt(top.replace("px", ""));

//				console.log("Panning: ", panned);
				if(this.isDragging) {
					dX = this.dragX - panned.deltaX;
					dY = this.dragY - panned.deltaY;
				} else {
					this.isDragging = true;
					dX = panned.deltaX;
					dY = panned.deltaY;
				}

//				console.warn("Pan[" + dX + ", " + dY + "]: " + left + ", " + top + " --> " + (left-dX) + ", " + (top-dY));
				left -= dX;
				top -= dY;

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
//				console.log("Zoom -1");
				this.zoom(this.image.zoom - 1);
			},
			"zoomInOne": function() {
//				console.log("Zoom +1");
				this.zoom(this.image.zoom + 1);
			},
			"apply": function(applying) {
//				console.log("apply: ", applying, this.parchment);
//				console.log("apply");
				if(this.parchment && this.parchment.length) {
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
					if(10 > applying.zoom && applying.zoom > -10) {
						this.image.height = this.original.height * (1 + .1 * applying.zoom);
						this.image.width = this.original.width * (1 + .1 * applying.zoom);
						Vue.set(this, "scaledSize", this.baseFontSize + applying.zoom);
					}

					if(applying.zoom !== undefined && this.locales && this.locales.length && (this.image._lastzoom !== applying.zoom || this.image._lastlocation !== this.location.id)) {
//						console.log("Apply Redraw: ", JSON.stringify(this.image, null, 4), JSON.stringify(applying, null, 4));
//						console.log("Apply Redraw");
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
					} else {
						if(this.image._lastlocation !== this.location.id) {
							this.image._lastlocation = this.location.id;
						}
						if(this.image._lastzoom !== applying.zoom) {
							this.image._lastzoom = applying.zoom;
						}
						Object.assign(this.image, applying);
					}

					this.parchment.css({
						"height": applying.height + "px",
						"width": applying.width + "px",
						"left": applying.left + "px",
						"top": applying.top + "px"
				    });

					this.saveStorage(this.storageKeyID, this.state);
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

				this.renderMeasurements();
			},
			"drawPath": function(canvas, path) {
				if(path && path.rendering_has_path && !this.storage.hidden_legend[path.id]) {
					var points = [],
						buffer,
						point,
						x;

					if(path.pathed) {
						for(x=0; x<path.pathing.length; x++) {
							buffer = this.universe.index.location[path.pathing[x]];
							if(buffer && buffer.location === this.location.id) {
								point = [buffer.x/100 * this.image.width, buffer.y/100 * this.image.height];
								points.push(point);
							}
						}
					} else if(path.values && path.values.length) {
						for(x=0; x<path.values.length; x++) {
							point = [path.values[x][0] * this.image.width, path.values[x][1] * this.image.height];
							points.push(point);
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
				var xc,
					yc,
					x;

				canvas.locationID = path.id;
				canvas.strokeStyle = path.color || "#FFFFFF";
				canvas.lineWidth = path.thickness;
				if(path.opacity !== undefined) {
					canvas.globalAlpha = path.opacity;
				}
				canvas.beginPath();
				canvas.moveTo(points[0][0], points[0][1]);
				for(x=1; x<points.length; x++) {
					if(path.curved) {
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
				if(path.contained) {
					canvas.closePath();
					canvas.stroke();
					canvas.fillStyle = path.fill_color || path.color || "#FFFFFF";
					if(path.fill_opacity !== undefined) {
						canvas.globalAlpha = path.fill_opacity;
					}
					canvas.beginPath();
					canvas.moveTo(points[0][0], points[0][1]);
					for(x=1; x<points.length; x++) {
						if(path.curved) {
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

					if(/*this.storage.labels &&*/ path.render_name && path._x !== undefined && path._y !== undefined) {
						canvas.fillStyle = path.label_color || path.color || "#FFFFFF";
						canvas.font = "bold " + (12 + this.storage.image.zoom) + "px Arial";
						canvas.shadowColor = path.label_shadow_color || "rgba(0, 0, 0, .4)";
						canvas.shadowBlur = path.label_shadow_blur || 3;
						canvas.globalAlpha = path.label_opacity || 1;
						canvas.shadowOffsetX = 0;
						canvas.shadowOffsetY = 0;
						canvas.fillText(path.label, path._x * this.image.width, path._y * this.image.height);
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
					i,
					j;

				if(!this.measurementCanvas) {
					canvas = $("#measuring");
					if(canvas && canvas[0]) {
						Vue.set(this, "measurementCanvas", canvas[0]);
					}
				}

				if(this.storage.view_party) {
					party = this.universe.index.party[this.storage.view_party];
				}

				canvas = this.measurementCanvas;
				if(canvas) {
					canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
					canvas.height = this.image.height;
					canvas.width = this.image.width;
					canvas = canvas.getContext("2d");
					Vue.set(this, "initializing", false);
					if(this.storage.measuring[this.location.id] && this.storage.measuring[this.location.id].length) {
						points = [];
						canvas.clearRect(0, 0, canvas.width, canvas.height);
						canvas.font = (14 + this.storage.image.zoom) + "px serif";
						canvas.strokeStyle = "#FFFFFF";
						canvas.lineWidth = 2;
						canvas.globalAlpha = .7;
						canvas.fillStyle = "#FFFFFF";

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
								path = Math.floor(path + .5);
								path = this.location.map_distance * path;
								len = rsSystem.math.distance.display(rsSystem.math.distance.reduceMeters(path), "", ["pc", "ly", "km"]);
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
								canvas.fillText(len, mx, my);
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
							Vue.set(this, "totalLength", rsSystem.math.distance.display(rsSystem.math.distance.reduceMeters(total_length), "", ["pc", "ly", "km"]));
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
					if(this.coordinates && this.coordinates.length) {
						points = {};

						for(i=0; i<this.coordinates.length; i++) {
							if(this.coordinates[i].pathed) {
								if(!points[this.coordinates[i].color]) {
									points[this.coordinates[i].color] = [];
								}
								points[this.coordinates[i].color].push({
									"x": (this.coordinates[i].x/100) * this.image.width,
									"y": (this.coordinates[i].y/100) * this.image.height
								});
							}
						}

						path = Object.keys(points);
						for(i=0; i<path.length; i++) {
							// canvas.strokeStyle = "#FFFFFF";
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

				if(link.template || link.x === undefined || link.y === undefined || link.x === null || link.y === null) {
					return false;
				}

				//console.log("Link[" + link.id + " | " + link.must_know + "]: " + ( (!this.player.gm || this.storage.master_view !== "master") && (!this.viewingEntity || !this.viewingEntity.knowsOf(link)) ), " | ", this.viewingEntity.knowsOf(link), "\n > ", this.viewingEntity);
				if(link.must_know && ( (!this.player.gm || this.storage.master_view !== "master") && (!this.viewingEntity || !this.viewingEntity.knowsOf(link)) )) {
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

				if(this.player.gm && this.storage.master_view === "master") {
					return true;
				}

				if(link.hidden || (link.obscured && !this.player.gm)) {
					return false;
				}

				if(!link.required_knowledge) {
					return true;
				}

				entity = this.universe.nouns.entity[this.player.entity];
				if(entity && (entity = this.universe.nouns.knowledge[entity.knowledge])) {
					return !!entity[link.knowledge];
				}

				return false;
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
			"poiMenu": function(link) {
//				console.log("Trigger View");
				Vue.set(this, "focusedLocation", link.id);
				rsSystem.EventBus.$emit("display-info", link);
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
				if(this.player.gm) {
					if(this.localeInfo.shown) {
						this.actions.options.push(this.localeInfo);
					}

					this.actions.options.push({
						"icon": "fas fa-map",
						"event": "set-map",
						"text": "Set Location View"
					});
					this.actions.options.push({
						"icon": "fas fa-map-marked",
						"event": "set-current",
						"text": "Show Map"
					});

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

					this.actions.options.push(this.takeMeasurements);
					/*
					if(this.location.map_distance) {
						this.actions.options.push(this.takeMeasurements);
					} else {
						this.actions.options.push(this.setMeasurements);
					}
					*/

					if(this.storage.measuring[this.location.id] && this.storage.measuring[this.location.id].length) {
						this.actions.options.push({
							"icon": "far fa-compass-slash",
							"event": "clear-measuring",
							"text": "Clear Measuring"
						});
					}

					this.actions.options.push({
						"icon": "fas fa-chevron-double-right",
						"event": "set-location",
						"text": "Set Location"
					});
				}
			},
			"update": function(source) {
				// console.log("Update: ", source);
				var background,
					image,
					buffer,
					hold,
					x;
				
				if(this.player.gm) {
					this.buildMenu();
				}

				this.coordinates.splice(0);
				if(this.location.coordinates && this.location.coordinates.length) {
					for(x=0; x<this.location.coordinates.length; x++) {
						if(this.location.coordinates[x]) {
							this.coordinates.push(this.location.coordinates[x]);
						}
					}
				}

				this.availablePOIs.splice(0);
				// while(this.pointsOfInterest.length !== 0) {
				// 	buffer = this.pointsOfInterest.pop();
				// 	if(buffer.$off) {
				// 		buffer.$off("modified", this.minorUpdate);
				// 	}
				// }
				this.locales.splice(0);
				for(x=0; x<this.universe.listing.location.length; x++) {
					buffer = this.universe.listing.location[x];
					if(buffer && !buffer.disabled && buffer.location === this.location.id || ((hold = this.universe.index.location[buffer.location]) && hold.location === this.location.id && hold.rendering_has_path)) {
						this.availablePOIs.push(buffer);
						// buffer.$on("modified", this.minorUpdate);
						if(buffer.rendering_has_path) {
							this.locales.push(buffer);
						}
					}
				}
				for(x=0; x<this.universe.listing.entity.length; x++) {
					buffer = this.universe.listing.entity[x];
					if(buffer.location === this.location.id) {
						this.availablePOIs.push(buffer);
						// buffer.$on("modified", this.minorUpdate);
					}
				}
				this.parties.splice(0);
				for(x=0; x<this.universe.listing.party.length; x++) {
					buffer = this.universe.listing.party[x];
					if(buffer.active) {
						this.parties.push(buffer);
						if(buffer.location === this.location.id) {
							this.availablePOIs.push(buffer);
							// buffer.$on("modified", this.minorUpdate);
						}
					}
				}
//				this.locales.splice(0);
//				for(x=0; x<this.universe.listing.locale.length; x++) {
//					buffer = this.universe.listing.locale[x];
//					if(buffer.residence === this.location.id) {
//						this.locales.push(buffer);
//					}
//				}

				if(this.sourceImage) {
					Vue.set(this, "ready", false);
					this.getDimensions(this.universe.getImagePath(this.sourceImage));
				}

				if(this.storage.follow && this.location.showing && this.location.shown_at && this.storage.viewed_at < this.location.shown_at) {
//					console.log("View State Sync: ", this.location, this.state);
					Vue.set(this.state, "viewed_at", this.location.shown_at);
					Object.assign(this.image, this.location.showing);
					this.apply(this.image);
				}

				this.determinePOIs();
				this.$forceUpdate();
				this.redrawPaths();
				this.renderMeasurements();

				Vue.set(clearAll, "text", "All " + this.coordinates.length + " Marks");
			}
		},
		"beforeDestroy": function() {
			rsSystem.EventBus.$off("measure-point", this.receiveMeasurementPoint);
			rsSystem.EventBus.$off("info:closed", this.clearSearch);
			rsSystem.EventBus.$off("copied-id", this.setMenuID);
			// this.universe.$off("universe:modified", this.update);
			// this.universe.$off("model:modified", this.update);
		},
		"template": Vue.templified("components/viewer.html")
	});
})();
