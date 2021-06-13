
/**
 *
 *
 * @class rsGraph
 * @constructor
 * @module Components
 */
(function() {
	/**
	 *
	 * @property storageKey
	 * @type String
	 * @private
	 * @static
	 */
	var storageKey = "_rs_graphComponentKey:";

	var layoutLookup = {};
	var cytoLookup = {};

	var layoutOptions = {
		"name": "cola",
		"linkDistance": 1000,
		"randomize": false,
		"infinite": true,
		"animate": true,
		"fit": false
	};

	rsSystem.component("rsGraph", {
		"inherit": true,
		"mixins": [
		],
		"props": {
			"filters": {
				"type": Object
			},
			"id": {
				"default": "graph_component",
				"type": String
			},
			"highlight": {
				"type": Object,
				"default": function() {
					return {};
				}
			},
			"selected": {
				"type": Array,
				"default": function() {
					return [];
				}
			},
			"nodes": {
				"required": true,
				"type": Array
			},
			"edges": {
				"type": Array,
				"default": function() {
					return [];
				}
			}
		},
		"data": function() {
			console.log("Graph Data");
			var data = {};

			data.activeLayouts = layoutLookup;
			data.activeScapes = cytoLookup;

			data.storageID = storageKey + this.id;
			data.cytoLayout = null;
			data.cyto = null;

			data.activeNodes = [];
			data.indexNodes = {};
			data.activeEdges = [];
			data.indexEdges = {};

			data.notFound = false;
			data.searchText = "";

			return data;
		},
		"watch": {
			"nodes": function(nV, oV) {
				console.log("DataSet: ", oV, "\n ->\n", nV);
				this.sync();
			}
		},
		"mounted": function() {
			rsSystem.register(this);

			if(layoutLookup[this.id]) {
				layoutLookup[this.id].stop();
			}
			if(cytoLookup[this.id]) {
				cytoLookup[this.id].stop();
			}
			cytoLookup[this.id] = cytoscape({
				"container": document.getElementById(this.id),
				"autounselectify": true,
				"boxSelectionEnabled": false,
				"panningEnabled": true,
				"userPanningEnabled": true,
				"zoomingEnabled": true,
				"userZoomingEnabled": true,
				"style": [{
					"selector": "core",
					"style": {
						"selection-box-border-color": "#8BB0D0",
						"selection-box-color": "#AAD8FF",
						"selection-box-opacity": "0.5"
					}
				}, {
					"selector": "node",
					"style": {
//						"__width": "mapData(score, 0, 0.006769776522008331, 20, 60)",
//						"__height": "mapData(score, 0, 0.006769776522008331, 20, 60)",
						"height": "30px",
						"width": "30px",
						"content": "data(name)",
						"font-size": "12px",
						"text-valign": "center",
						"text-halign": "center",
						"background-color": "#555",
						"text-outline-color": "#000",
						"text-outline-width": "2px",
						"text-max-width": "50px",
						"text-wrap": "wrap",
						"color": "#c3b601",
						"overlay-padding": "6px",
						"z-index": "10"
					}
				},{
					"selector": "edge",
					"style": {
						"content": "data(name)",
						"line-color": "#c3b601",
						"curve-style": "bezier",
						"target-arrow-color": "#c3b601",
						"target-arrow-shape": "triangle",
						"text-outline-color": "#000",
						"text-outline-width": "2px",
						"color": "white"
					}
				}]
			});

			layoutLookup[this.id] = cytoLookup[this.id].layout(layoutOptions);
			layoutLookup[this.id].run();

			cytoLookup[this.id].on("tap", "node", (event) => {
				var data;

				if(event && event.target && event.target.data && (data = event.target.data())) {
					this.$emit("node", data);
				}
			});
			cytoLookup[this.id].on("tap", "edge", (event) => {
				console.log("Tap[E]: ", event);
			});

			this.sync();
		},
		"methods": {
			"showInfo": function(record) {
				rsSystem.utility.showInfo(record);
			},
			"activity": function() {
				if(this.notFound) {
					Vue.set(this, "notFound", false);
				}
			},
			"centerOnSearch": function() {
				var search = this.searchText.toLowerCase(),
					scape = this.getScape(),
					found = false,
					searching,
					x;

				searching = function(el) {
					console.log("Searching: ", el);
					var data = el.data();
					if(search) {
						if(data._search && data._search.indexOf(search) != -1) {
							found = true;
							el.addClass("highlight");
							el.style("border-color", "#00ff00");
							el.style("border-width", "4px");
							el.updateStyle();
							return true;
						} else {
							el.removeClass("highlight");
							el.removeStyle("border-color");
							el.removeStyle("border-width");
							el.updateStyle();
							return false;
						}
					} else {
						found = true;
						return true;
					}
				};

				this.getScape().animate({
					"duration": 500,
					"center": {
						"eles": scape.filter(searching)
					}
				});


				if(!found) {
					Vue.set(this, "notFound", true);
				}
			},
			"addElement": function(element) {
				cytoLookup[this.id].add(element);
				this.runLayout();
			},
			"removeElement": function(id) {
				var el = cytoLookup[this.id].getElementById(id);
				if(el) {
					el.remove();
					this.runLayout();
				}
			},
			"getScape": function() {
				return cytoLookup[this.id];
			},
			"runLayout": function() {
				if(layoutLookup[this.id]) {
					layoutLookup[this.id].stop();
				}
				layoutLookup[this.id] = cytoLookup[this.id].elements().layout({
					"name": "cola",
					"infinite": true,
					"fit": false,
					"randomize": false,
					"animate": true,
					"linkDistance": 1000,
					"complete": function() {
						console.warn("Complete");
						cytoLookup[this.id].fit();
					}
				});
				layoutLookup[this.id].run();
			},
			"isVisible": function() {
				console.log("Graph Visible");
				return true;
			},
			"sync": function() {
				var rerun = false,
					buffer,
					style,
					el,
					x;

//				console.log("Syncing: ", this.nodes);

				buffer = Object.keys(this.indexNodes);
				for(x=0; x<this.nodes.length; x++) {
					if(this.indexNodes[this.nodes[x].id]) {
//						console.log("Kept: ", this.nodes[x].id);
						buffer.splice(buffer.indexOf(this.nodes[x].id), 1);
						cytoLookup[this.id].getElementById(this.nodes[x].id).updateStyle();
					} else {
//						console.log("Adding: ", this.nodes[x].id);
						el = {
							"group": "nodes",
							"data": this.nodes[x],
							"style": {}
						};
						if(this.filters && this.filters.node && typeof(this.filters.node) === "function") {
							style = this.filters.node(this.nodes[x]);
							if(style) {
								Object.assign(el.style, style);
							}
						}
						this.indexNodes[this.nodes[x].id] = true;
						cytoLookup[this.id].add(el);
						rerun = true;
					}
				}
				for(x=0; x<buffer.length; x++) {
					this.removeElement(buffer[x]);
					delete(this.indexNodes[buffer[x]]);
					rerun = true;
				}


				buffer = Object.keys(this.indexEdges);
				for(x=0; x<this.edges.length; x++) {
					if(this.indexEdges[this.edges[x].id]) {
//						console.log("Kept: ", this.edges[x].id);
						buffer.splice(buffer.indexOf(this.edges[x].id), 1);
					} else {
//						console.log("Adding: ", this.edges[x].id);
						el = {
							"group": "edges",
							"data": this.edges[x]
						};
						this.indexEdges[this.edges[x].id] = true;
						cytoLookup[this.id].add(el);
						rerun = true;
					}
				}
				for(x=0; x<buffer.length; x++) {
					this.removeElement(buffer[x]);
					delete(this.indexEdges[buffer[x]]);
					rerun = true;
				}

				if(rerun) {
					this.runLayout();
				}
			}
		},
		"beforeDestroy": function() {
			if(layoutLookup[this.id]) {
				layoutLookup[this.id].stop();
			}
			if(cytoLookup[this.id]) {
				cytoLookup[this.id].stop();
			}
		},
		"template": Vue.templified("components/graph.html")
	});
})();
