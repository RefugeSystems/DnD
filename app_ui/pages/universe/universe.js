
/**
 *
 *
 * @class RSUniverse
 * @constructor
 * @module Pages
 */
(function() {
	var storageKey = "_rssw_universeComponentKey";

	var formatters = {
		"icon": function(icon) {
			return "<span class='" + icon + "'></span>";
		},
		"template": function(state) {
			if(state) {
				return "<span class='fas fa-check'></span>";
			}
			return "";
		},
		"__info": function(value, record) {
			return "<span class=\"fas fa-info-circle\"></span>";
		},
		"__edit": function(value, record) {
			return "<span class=\"fas fa-edit\"></span>";
		},
		"__copy": function(value, record) {
			return "<span class=\"fas fa-copy\"></span>";
		},
		"__view": function(value, record) {
			if(record.classification && record._type === "entity") {
				return "<span class=\"fas fa-external-link\"></span>";
			}
		}
	};

	var recordActions = {
		"__info": function(record) {
			rsSystem.EventBus.$emit("display-info", record);
		},
		"__edit": function(record) {
			this.$router.push("/nouns/" + record._type + "/" + record.id);
		},
		"__copy": function(record) {
			this.$router.push("/nouns/" + record._type + "/" + record.id + "?copy=true");
		},
		"__view": function(record) {
			if(record.classification && record._type === "entity") {
				this.$router.push("/universe/" + record.classification + "/" + record.id);
			}
		}
	};

	var actions = {
	};

	var sorters = {
		"__view": function(a, b) {
			if(a._type === "entity" && b._type !== "entity") {
				return 1;
			} else if(b._type === "entity" && a._type !== "entity") {
				return -1;
			}
			return 0;
		}
	};


	var templateValues = {
		"shown": undefined,
		"only": true,
		"out": false
	};


	var rollProperties = [{
		"icon": "ra ra-bomb-explosion",
		"property": "success",
		"label": "Success"
	}, {
		"icon": "fad fa-jedi",
		"property": "advantage",
		"label": "Advantage"
	}, {
		"icon": "xwm xwing-miniatures-font-epic",
		"property": "triumph",
		"label": "Triumph"
	}, {
		"icon": "fal fa-triangle rot180",
		"property": "failure",
		"label": "Failure"
	}, {
		"icon": "rsswx rsswx-threat",
		"property": "threat",
		"label": "Threat"
	}, {
		"icon": "rsswx rsswx-despair",
		"property": "despair",
		"label": "Despair"
	}, {
		"icon": "fad fa-circle rs-white rs-secondary-black",
		"property": "light",
		"label": "Light"
	}, {
		"icon": "fad fa-circle rs-black rs-secondary-white",
		"property": "dark",
		"label": "Dark"
	}];

	rsSystem.component("RSSWUniverse", {
		"inherit": true,
		"mixins": [
			rsSystem.components.StorageManager
		],
		"data": function() {
			var data = {},
				entities,
				entity,
				x;

			data.storageKeyID = storageKey;
			data.state = this.loadStorage(data.storageKeyID, {
				"search": ""
			});
			if(data.state.filter === undefined) {
				data.state.filter = {};
				data.state.filter.null = data.state.filter.null || "";
			}
			if(data.state.headers === undefined) {
				data.state.headers = [{
					"title":"",
					"field": "icon",
					"formatter": formatters.icon
				}, {
					"title":"Name",
					"field": "name"
				}, {
					"title":"ID",
					"field": "id"
				}, {
					"field": "__info",
					"formatter": formatters.__info,
					"recordAction": recordActions.__info.bind(this),
					"hideBlock": true,
					"nosort": true
				}, {
					"field": "__edit",
					"formatter": formatters.__edit,
					"recordAction": recordActions.__edit.bind(this),
					"hideBlock": true,
					"nosort": true
				}, {
					"field": "__copy",
					"formatter": formatters.__copy,
					"recordAction": recordActions.__copy.bind(this),
					"hideBlock": true,
					"nosort": true
				}, {
					"field": "__view",
					"formatter": formatters.__view,
					"recordAction": recordActions.__view.bind(this),
					"hideBlock": true,
					"nosort": true
				}];
			}
			if(data.state.paging === undefined) {
				data.state.paging = {};
				data.state.paging.per = 20;
				data.state.paging.current = 0;
				data.state.paging.pages = 0;
				data.state.paging.spread = 3;
			}
			if(data.state.filterTemplate === undefined) {
				data.state.filterTemplate = "shown";
			}
			if(data.state.activeIndex === undefined) {
				data.state.activeIndex = "";
			}

			data.availableIndexes = Object.keys(this.universe.indexes);
			data.availableIndexes.sort();

			data.listing = {};
			data.listing.entity = [];
			data.listing.player = [];
			data.listing.item = [];
			data.listing.room = [];
			data.listingKeys = Object.keys(data.listing);

			data.command = "";
			data.target = "";
			data.corpus = [];

			data.rollProperties = rollProperties;
			data.universeEntities = [];
			data.maxLength = 20;
			data.history = [];
			data.rolling = {};
			data.updated = "";

			data.difficulty = {};
			data.difficulty.Blank = {"difficulty":0};
			data.difficulty.Easy = {"difficulty":1};
			data.difficulty.Average = {"difficulty":2};
			data.difficulty.Hard = {"difficulty":3};
			data.difficulty.Daunting = {"difficulty":4};
			data.difficulty.Formidable = {"difficulty":5};
			data.difficulty.Challenge = {"challenge":1};
			data.difficulty.Setback = {"setback":1};

			data.difficulties = Object.keys(data.difficulty);
			data.count = {};
			for(x=0; x<data.difficulties.length; x++) {
				data.count[data.difficulties[x]] = 0;
			}

			for(x=0; x<data.state.headers.length; x++) {
				if(formatters[data.state.headers[x].field]) {
					data.state.headers[x].formatter = formatters[data.state.headers[x].field];
				}
				if(recordActions[data.state.headers[x].field]) {
					data.state.headers[x].recordAction = recordActions[data.state.headers[x].field].bind(this);
				}
				if(actions[data.state.headers[x].field]) {
					data.state.headers[x].action = actions[data.state.headers[x].field].bind(this);
				}
				if(sorters[data.state.headers[x].field]) {
					data.state.headers[x].sorter = sorters[data.state.headers[x].field].bind(this);
					if(data.state.sortKey === data.state.headers[x].field) {
						data.state.sorter = data.state.headers[x].sorter;
					}
				}
			}

			data.state.filter.template = false;
			if(!data.state.historyLength) {
				data.state.historyLength = 5;
			}

			return data;
		},
		"watch": {
			"state": {
				"deep": true,
				"handler": function(nV, oV) {
//					if(this.state.search !== this.state.search.toLowerCase()) {
//						Vue.set(this.state.filter, "null", this.state.search.toLowerCase());
//					}
					if(templateValues[this.state.filterTemplate] !== undefined) {
						Vue.set(this.state.filter, "template", templateValues[this.state.filterTemplate]);
					} else {
						Vue.delete(this.state.filter, "template");
					}
					this.saveStorage(this.storageKeyID, nV);
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);

			if(templateValues[this.state.filterTemplate] !== undefined) {
				Vue.set(this.state.filter, "template", templateValues[this.state.filterTemplate]);
			} else {
				Vue.delete(this.state.filter, "template");
			}

			this.universe.$on("universe:modified", this.updateListings);
			this.updateListings();
		},
		"methods": {
			"getActiveIndex": function() {
				return this.state.activeIndex?this.universe.indexes[this.state.activeIndex]:this.universe.index;
			},
			"exportUniverse": function(selected) {
				var appendTo = $(this.$el).find("#anchors")[0],
					anchor = document.createElement("a"),
					exporting,
					index,
					x;

				exporting = {};
				if(selected) {
					index = this.getActiveIndex();
					for(x=0; x<index.selection.length; x++) {
						if(!exporting[index.selected[index.selection[x]]._class]) {
							exporting[index.selected[index.selection[x]]._class] = [];
						}
						exporting[index.selected[index.selection[x]]._class].push(index.selected[index.selection[x]]);
					}
				} else {
					for(x=0; x<rsSystem.listingNouns.length; x++) {
						if(this.universe.indexes[rsSystem.listingNouns[x]] && this.universe.indexes[rsSystem.listingNouns[x]].listing.length) {
							exporting[rsSystem.listingNouns[x]] = this.universe.indexes[rsSystem.listingNouns[x]].listing;
						}
					}
				}

				appendTo.appendChild(anchor);
				anchor.href = URL.createObjectURL(new Blob([JSON.stringify(exporting, null, "\t")]));
				if(selected) {
					anchor.download = "universe_filtered." + Date.now() + ".json";
				} else {
					anchor.download = "universe_complete." + Date.now() + ".json";
				}

				anchor.click();
				URL.revokeObjectURL(anchor.href);
				appendTo.removeChild(anchor);
			},
			"clearRolling": function(object) {
				var keys = Object.keys(object),
					x;

				this.history.unshift(JSON.parse(JSON.stringify(object)));
				if(this.state.historyLength < this.history.length) {
					this.history.splice(this.state.historyLength);
				}
				for(x=0; x<keys.length; x++) {
					Vue.delete(object, keys[x]);
				}
			},
			"dismissRolled": function(object) {
				var index = this.history.indexOf(object);
				if(index !== -1) {
					this.history.splice(index, 1);
				}
			},
			"clearRolls": function(step) {
				if(step) {
					this.clearRolling();
				}
				this.history.splice(0);
			},
			"clearRolls": function() {
				this.history.splice(0);
			},
			"rollDifficulty": function(difficulty) {
				var expression = this.difficulty[difficulty],
					result,
					keys,
					x;

//				console.log("Roll[" + isNaN(expression.difficulty) + "]: ", expression.difficulty);
				if(!isNaN(expression.difficulty)) {
					this.clearRolling(this.rolling);
					for(x=0; x<this.difficulties.length; x++) {
						Vue.set(this.count, this.difficulties[x], 0);
					}
				}
				Vue.set(this.count, difficulty, this.count[difficulty] + 1);
				result = Dice.calculateDiceRoll(expression);
				keys = Object.keys(result);
				for(x=0; x<keys.length; x++) {
					if(result[keys[x]]) {
						if(this.rolling[keys[x]]) {
							Vue.set(this.rolling, keys[x], this.rolling[keys[x]] + result[keys[x]]);
						} else {
							Vue.set(this.rolling, keys[x], result[keys[x]]);
						}
					}
				}
			},
			"updateListings": function(event) {
				var mapped = {},
					buffer,
					x,
					y;

				this.universeEntities.splice(0);
				for(x=0; x<this.listingKeys.length; x++) {
					this.listing[this.listingKeys[x]].splice(0);
					for(y=0; y<this.universe.indexes[this.listingKeys[x]].listing.length; y++) {
						buffer = this.universe.indexes[this.listingKeys[x]].listing[y];
						if(buffer) {
							this.listing[this.listingKeys[x]].push(buffer);
							switch(this.listingKeys[x]) {
								case "entity":
									if(!mapped[buffer.id] && !buffer.hidden && !buffer.inactive) {
										mapped[buffer.id] = true;
										this.universeEntities.push(buffer);
									}
									break;
							}
						}
					}
					this.listing[this.listingKeys[x]].sort(this.sortData);
				}

				this.universeEntities.sort(this.sortData);
			},
			"showCommands": function() {
				return !!(this.state.activeIndex?this.universe.indexes[this.state.activeIndex]:this.universe.index).selection.length;
			},
			"resetHeaders": function() {
				Vue.set(this.state, "headers", [{
					"title":"",
					"field": "icon",
					"formatter": formatters.icon
				}, {
					"title":"Name",
					"field": "name",
					"tag": "id"
				}, {
					"title":"Location",
					"field": "location"
				}, {
					"title":"T",
					"field": "template",
					"formatter": formatters.template
				}, {
					"field": "__info",
					"formatter": formatters.__info,
					"recordAction": recordActions.__info.bind(this),
					"hideBlock": true,
					"nosort": true
				}, {
					"field": "__edit",
					"formatter": formatters.__edit,
					"recordAction": recordActions.__edit.bind(this),
					"hideBlock": true,
					"nosort": true
				}, {
					"field": "__copy",
					"formatter": formatters.__copy,
					"recordAction": recordActions.__copy.bind(this),
					"hideBlock": true,
					"nosort": true
				}, {
					"field": "__view",
					"formatter": formatters.__view,
					"recordAction": recordActions.__view.bind(this),
					"sorter": sorters.__view
				}]);
			},
			"getSpread": function() {
				var possibles = [],
					start = Math.max(this.state.paging.spread-5, 2),
					end = this.state.paging.spread+5,
					x;

				for(x=start; x<end; x++) {
					possibles.push(x);
				}


				if(start > 100) {
					possibles.unshift(100);
				}
				if(start > 50) {
					possibles.unshift(50);
				}
				if(start > 20) {
					possibles.unshift(20);
				}
				if(start > 10) {
					possibles.unshift(10);
				}
				if(start > 2) {
					possibles.unshift(2);
				}
				if(end < 10) {
					possibles.push(10);
				}
				if(end < 20) {
					possibles.push(20);
				}
				if(end < 50) {
					possibles.push(50);
				}
				if(end < 100) {
					possibles.push(100);
				}

				return possibles;
			},
			"processCommand": function(command) {
				var index = (this.state.activeIndex?this.universe.indexes[this.state.activeIndex]:this.universe.index),
					target = this.universe.index.lookup[this.target],
					loading,
					sending,
					buffer,
					item,
					keys,
					x;

//				command = command.split(",");
//				console.warn("Table Command: ", command, index);

				switch(command) {
					case "give":
//						console.warn("Giving Items");
						if(this.target) {
							for(x=0; x<index.selection.length; x++) {
//								console.warn("Sending " + index.selection[x] + "...");
								if(this.universe.nouns.item[index.selection[x]]) {
									sending = {};
									sending.item = index.selection[x];
									sending.target = this.target;
									this.universe.send("give:item", sending);
								} else if(this.universe.nouns.room[index.selection[x]]) {
									sending = {};
									sending.room = index.selection[x];
									sending.target = this.target;
									this.universe.send("give:room", sending);
								} else {
									console.warn("Can only give item & room objects");
								}
							}
						}
						break;
					case "take":
//						console.warn("Taking Items");
						if(this.target) {
							for(x=0; x<index.selection.length; x++) {
//								console.warn("Sending " + index.selection[x] + "...");
								if(this.universe.nouns.item[index.selection[x]]) {
									sending = {};
									sending.item = index.selection[x];
									sending.target = this.target;
									this.universe.send("take:item", sending);
								} else if(this.universe.nouns.room[index.selection[x]]) {
									sending = {};
									sending.room = index.selection[x];
									sending.target = this.target;
									this.universe.send("take:room", sending);
								} else {
									console.warn("Can only take item & room objects");
								}
							}
						}
						break;
					case "effect":
//						console.warn("Adding Effects");
						if(this.target && (buffer = this.universe.indexes.entity.index[this.target])) {
							loading = {
								"effect": []
							};
							for(x=0; x<index.selection.length; x++) {
								if(this.universe.nouns.effect[index.selection[x]]) {
									loading.effect.push(index.selection[x]);
								}
							}
//							console.warn(" > Commiting: ", loading);
							buffer.commitAdditions(loading);
						}
						break;
					case "uneffect":
						if(this.target && (buffer = this.universe.indexes.entity.index[this.target])) {
							loading = {
								"effect": []
							};
							for(x=0; x<index.selection.length; x++) {
								if(this.universe.nouns.effect[index.selection[x]]) {
									loading.effect.push(index.selection[x]);
								}
							}
							buffer.commitSubtractions(loading);
						}
						break;
					case "obscure":
//						console.warn("Taking Items");
						for(x=0; x<index.selection.length; x++) {
							if(this.universe.index.index[index.selection[x]]) {
								this.universe.index.index[index.selection[x]].commit({
									"obscured": true
								});
							}
						}
						break;
					case "unobscure":
//						console.warn("Taking Items");
						for(x=0; x<index.selection.length; x++) {
							if(this.universe.index.index[index.selection[x]]) {
								this.universe.index.index[index.selection[x]].commit({
									"obscured": false
								});
							}
						}
						break;
					case "drop":
						loading = index.selection.concat([]);
						for(x=0; x<loading.length; x++) {
							if(index.selected[loading[x]]._drop) {
								// Drop Item
								sending = {};
								sending._type = index.selected[loading[x]]._type;
								sending.id = index.selected[loading[x]].id;
								sending.time = Date.now();
								this.universe.send("delete:" + index.selected[loading[x]]._type, sending);
								index.unselect(index.selected[loading[x]]);
							} else {
								// Flag Item
								index.selected[loading[x]]._drop = true;
							}
						}
						break;
					case "spawn":
						for(x=0; x<index.selection.length; x++) {
							loading = index.selected[index.selection[x]];
							if(loading.template && loading._class === "entity") {
								keys = Object.keys(loading);
								sending = {};

//								for(x=0; x<keys.length; x++) {
//									if(keys[x] && keys[x][0] !== "_") {
//										sending[keys[x]] = loading[keys[x]];
//									}
//								}

								sending.parent = loading.id;
								sending.name = loading.name + " (New)";
//								sending.description = loading.description;
								sending.id += ":" + Date.now();
								sending.template = false;
								sending._type = "entity";
								if(this.target && this.universe.indexes.player.index[this.target]) {
									sending.owners = [this.target];
								}
								if(this.target && this.universe.indexes.entity.index[this.target]) {
									sending.inside = this.target;
								}

								this.universe.send("modify:entity", sending);
							} else {
								console.warn("Skipping Selection: ", loading);
							}
						}
						break;
					case "dashboard-ships":
						var primary = index.selection[0],
							ships = index.selection.slice(1);

						window.open(location.pathname + "#/dashboard/ship/" + primary + "?ships=" + ships.join(","), "dashboard");
						break;
					case "export":
						this.exportUniverse(true);
						break;
					case "grant-knowledge":
						if(target) {
							sending = [];
							buffer = [];
							for(x=0; x<index.selection.length; x++) {
								if(this.universe.indexes.knowledge.lookup[index.selection[x]]) {
									sending.push(index.selection[x]);
								} else {
									buffer.push(index.selection[x]);
								}
							}
							console.log("Granting: ", sending, buffer);
							if(sending.length) {
								target.learnKnowledge(sending);
							}
							if(buffer.length) {
								target.learnOfObjects(buffer);
							}
						}
						break;
					case "forget-knowledge":
						if(target) {
							sending = [];
							buffer = [];
							for(x=0; x<index.selection.length; x++) {
								if(this.universe.indexes.knowledge.lookup[index.selection[x]]) {
									sending.push(index.selection[x]);
								} else {
									buffer.push(index.selection[x]);
								}
							}
							if(sending.length) {
								target.forgetKnowledge(sending);
							}
							if(buffer.length) {
								target.unlearnOfObjects(buffer);
							}
						}
						break;
				}


				Vue.set(this, "command", "");
			},
			"processAction": function(action) {
				console.warn("Table Action: ", action);

			},
			"filtered": function(entity) {
				if(entity.template || entity.inactive) {
					return false;
				}

				return !this.state.search ||
					(entity._search && entity._search.indexOf(this.state.search) !== -1) ||
					entity.id.indexOf(this.state.search) !== -1 ||
					entity.name.indexOf(this.state.search) !== -1 ||
					(entity.description && entity.description.indexOf(this.state.search) !== -1);
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("universe:modified", this.updateEntities);
		},
		"template": Vue.templified("pages/universe.html")
	});
})();
