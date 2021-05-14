/**
 *
 *
 * @class rsNetwork
 * @constructor
 * @module Components
 */
(function() {
	var storageKey = "_networkview",
		instance = 0;

	rsSystem.component("rsNetwork", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageManager
		],
		"props": {
			"universe": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {};

			data.storageKeyID = storageKey;
			data.leveling = "";
			data.state = this.loadStorage(data.storageKeyID, {
				"hideNames": false,
				"search": ""
			});


			data.filters = {};
			data.filters.node = (node) => {
				var styling = {};

				// if(!node.requires_ability || node.requires_ability.length === 0) {
				// 	styling["text-outline-color"] = "#000";
				// 	styling["background-color"] = "#0e57ea";
				// }
				//
				// if(this.character.ability && node && this.character.ability.indexOf(node.id) !== -1) {
				// 	styling["text-outline-color"] = "#000";
				// 	styling["background-color"] = "white";
				// 	styling["color"] = "white";
				// }

				if(node.activation === "active") {
					styling["background-color"] = "#670505";
				}

				return styling;
			};

			data.instance = instance++;

			// Build Data Set to Pass
			data.active_nodes = [];
			data.dependencies = [];

			return data;
		},
		"watch": {
			"state": {
				"deep": true,
				"handler": function() {
					if(this.state.search !== this.state.search.toLowerCase()) {
						Vue.set(this.state, "search", this.state.search.toLowerCase());
					}
					this.saveStorage(this.storageKeyID, this.state);
				}
			}
		},
		"mounted": function() {
			this.universe.$on("modified", this.update);
			rsSystem.register(this);
			this.update();

			if(this.$route.params.construct) {
				this.receiveConstruct(this.$route.params.construct);
			}
		},
		"methods": {
			"showInfo": function(element) {
				rsSystem.utility.showInfo(element);
			},
			"receiveConstruct": function(construct, to, from) {
				var additions = [],
					tracked = {},
					source,
					target,
					lines,
					nodes,
					x,
					y;

				if(to === undefined) {
					to = true;
				}
				if(from === undefined) {
					from = true;
				}

				if(typeof(construct) === "string") {
					construct = this.universe.indexes.construct.lookup[construct];
				}

				console.log("Construct: ", construct);
				nodes = construct.node;
				if(nodes) {
					for(x=0; x<nodes.length; x++) {
						target = this.universe.indexes.node.lookup[nodes[x]];
						if(target) {
							tracked[target.id] = [];
							if(!this.active_nodes.contains(target)) {
								this.active_nodes.push(target);
							}
						}
					}

					console.log("Tracked: ", tracked);
					lines = this.universe.indexes.connection.listing;
					for(x=0; x<lines.length; x++) {
						console.log("-- TEST: ", lines[x].id, lines[x]);
						if(to && tracked[lines[x].end] && (source = this.universe.indexes.node.lookup[lines[x].start])) {
							console.log("-- INTO: (From) ", lines[x].start);
							if(!this.active_nodes.contains(source)) {
								this.active_nodes.push(source);
							}
							this.dependencies.uniquely(lines[x]);
						} else if(from && tracked[lines[x].start] && (target = this.universe.indexes.node.lookup[lines[x].end])) {
							console.log("-- OUTOF: (From) ", lines[x].end);
							if(!this.active_nodes.contains(target)) {
								this.active_nodes.push(target);
							}
							this.dependencies.uniquely(lines[x]);
						} else {
							console.log("-- NO CONNECT");
						}
					}
				}
			},
			"update": function() {
				if(this.$route.params.construct) {
					this.receiveConstruct(this.$route.params.construct);
				}
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("modified", this.update);
		},
		"template": Vue.templified("components/network.html")
	});
})();
