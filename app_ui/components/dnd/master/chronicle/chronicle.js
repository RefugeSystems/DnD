
/**
 *
 *
 * @class dndChronicleReadout
 * @constructor
 * @module Components
 */
rsSystem.component("dndChronicleReadout", {
	"inherit": true,
	"mixins": [],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"player": {
			"required": true,
			"type": Object
		},
		"profile": {
			"required": true,
			"type": Object
		},
		"storage": {
			"type": Object,
			"default": function() {
				return {};
			}
		},
		"configuration": {
			"required": true,
			"type": Object
		}
	},
	"computed": {

	},
	"data": function() {
		var data = {};

		data.activityLookup = {};

		data.searchables = {
			"entity": "name",
			"source": "name",
			"skill": "name",
			"channel": "name",
			"level": true,
			"critical": {
				true: "critsuccess"
			},
			"failure": {
				true: "critfail"
			},
			"succeeded": {
				false: "failed",
				true: "success"
			}
		};

		data.searchKeys = Object.keys(data.searchables);

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		rsSystem.EventBus.$on("master:collect", this.receiveCollection);
		this.universe.$on("chronicled", this.receiveEvent);
		this.universe.$on("entity:roll", this.receiveRoll);
		
		if(!this.storage.witnessed) {
			Vue.set(this.storage, "witnessed", []);
		}
		// TODO: Determine pathing and load from storage
		//   ? [Index] > [Entity] > [Skill] > [Collection]
		if(typeof(this.storage.collecting) !== "object") {
			Vue.set(this.storage, "collecting", {});
		}
		if(!this.storage.chronicle_filter) {
			Vue.set(this.storage, "chronicle_filter", "");
		}
		if(typeof(this.storage.activityLookup) !== "object") {
			Vue.set(this.storage, "activityLookup", {});
		}
	},
	"methods": {
		"clearHistory": function() {
			var event,
				i;
			for(i=0; i<this.storage.witnessed.length; i++) {
				event = this.storage.witnessed[i];
				if(event.activity) {
					Vue.delete(this.storage.activityLookup, event.activity);
				}
			}
			this.storage.witnessed.splice(0);
		},
		/**
		 * Receives an event from the EventBus that rolls for a specific skill from the identified entities
		 * should be put into a special container with more details.
		 * @method receiveCollection
		 * @param {Object} event 
		 * @param {String} event.skill Skill ID
		 * @param {Array} event.entities Entity IDs
		 */
		/**
		 * Event notification that the game master is collecting a skill roll from a group of entities
		 * @event master:collect
		 * @param {Object} event 
		 * @param {String} event.skill Skill ID
		 * @param {Array} event.entities Entity IDs
		 */
		"receiveCollection": function(event) {
			// console.log("Received Collection: ", _p(this.storage), event);
			var skill = this.universe.get(event.skill),
				collection = {},
				entity,
				i;
			
			if(skill) {
				collection.id = Random.lowercase(32);
				collection.component = "dndChronicleReadoutCollection";
				collection.type = "collection";
				collection.entities = [];
				collection.checks = {};
				collection.index = {};
				for(i=0; i<event.entities.length; i++) {
					entity = event.entities[i];
					collection.entities.push(entity);
					collection.index[entity] = null;
					// console.log(" - Test - ");
					// console.log("Indexing Collection: ", _p(this.storage), "\n - Collecting: ");//, _p(this.storage.collecting));
					if(!this.storage.collecting[entity]) {
						Vue.set(this.storage.collecting, entity, {});
					}
					Vue.set(this.storage.collecting[entity], skill.id, collection.id);
				}

				// TODO: Build collection occurrence
				collection.skill = skill.id;
				collection.average = 0;
				collection.total = 0;
				collection.count = 0;
				collection.range = {
					"min": 0,
					"avg": Math.floor(collection.entities.length * 10.5),
					"max": Math.floor(collection.entities.length * 20)
				};
				for(i=0; i<collection.entities.length; i++) {
					entity = this.universe.get(collection.entities[i]);
					collection.range.min += entity.skill_check[skill.id] || 0;
				}
				collection.range.avg += collection.range.min;
				collection.range.max += collection.range.min;
				collection.range.max += collection.entities.length; // Lowest roll is a 1
				collection.range.low = Math.floor(collection.range.max * .33);
				collection.range.med = Math.floor(collection.range.max * .66);

				// TODO: Store and index collection occurrence
				this.storage.witnessed.unshift(collection);
			}
		},
		/**
		 * Update the collection, if any, with the results of the roll for the entity and skill.
		 * @method updateCollection
		 * @param {Object} occurred 
		 * @return {Boolean} True if the collection was updated, false if not
		 */
		"updateCollection": function(event) {
			var entity = event.entity,
				skill = event.skill,
				roll = event.result,
				collection,
				scan,
				id,
				i;

			if(this.storage.collecting[entity] && (id = this.storage.collecting[entity][skill])) {
				for(i=0; !collection && i<this.storage.witnessed.length; i++) {
					scan = this.storage.witnessed[i];
					if(scan.type === "collection" && scan.id === id) {
						collection = scan;
					}
				}

				// Clean up regardless as the collection may have been dismissed
				Vue.delete(this.storage.collecting[entity], skill);

				if(collection) {
					Vue.set(collection, "total", collection.total + roll);
					Vue.set(collection, "count", collection.count + 1);
					Vue.set(collection, "average", Math.floor(collection.total / collection.count));
					Vue.set(collection, "_updated_date", (new Date()).toLocaleTimeString());
					Vue.set(collection, "_updated", Date.now());
					Vue.set(collection.index, entity, roll);
					return true;
				}
			}

			return false;
		},
		"receiveEvent": function(event) {
			console.log("Received Chronice: ", event);
			var collected,
				update;
			// if(event && !this.updateCollection(event)) {
			if(event) {
				collected = this.updateCollection(event);
				switch(event.type) {
					case "entity:saving":
						this.witnessEvent("roll", "dndChronicleReadoutRoll", {
							"activity": event.activity,
							"entity": event.target,
							"source": event.source,
							"skill": event.skill,
							"result": event.save,
							"original_damage": event.original_damage,
							"damage": event.damage,
							"collected": collected,
							"form": event.form,
							"difficulty": event.difficulty,
							"channel": event.channel,
							"gametime": this.universe.calendar.toDisplay(event.gametime, true, false),
							"timeline": event.timeline,
							"level": event.level,
							"dice": {
								"d20": []
							}
						});
						break;
					case "entity:saved":
						console.log("Entity Save: ", event);
						update = {
							"save": event.save,
							"critical": event.critical,
							"failure": event.failure,
							"succeeded": event.succeeded,
							"collected": collected,
							"form": event.form,
							"resist": event.resist,
							"resist_source": event.resist_source,
							"damage": event.damage || null
						};
						if(event.damage_source) {
							update.damage_source = event.damage_source;
							update.damage = event.damage;
						}
						this.updateEvent(event.activity, update);
						/*
						this.witnessEvent("roll", "dndChronicleReadoutRoll", {
							"activity": event.activity,
							"entity": event.target,
							"source": event.source,
							"skill": event.skill,
							"result": event.save,
							"difficulty": event.difficulty,
							"channel": event.channel,
							"gametime": this.universe.calendar.toDisplay(event.gametime, true, false),
							"timeline": event.timeline,
							"level": event.level,
							"critical": event.critical,
							"failure": event.failure,
							"succeeded": event.succeeded,
							"dice": {
								"d20": []
							}
						});
						*/
						break;
					case "entity:damaging":
						this.witnessEvent("roll", "dndChronicleReadoutDamage", {
							"phase": "initial",
							"activity": event.activity,
							"entity": event.target,
							"source": event.source,
							"attack": event.attack,
							"form": event.form,
							"skill": event.skill,
							"collected": collected,
							"gametime": this.universe.calendar.toDisplay(event.gametime, true, false),
							"timeline": event.timeline,
							"level": event.level,
							"channel": event.channel,
							"original_damage": event.original_damage,
							"damage": event.damage
						});
						break;
					case "entity:damaged":
						update = {
							"resist_source": event.resist_source,
							"resist": event.resist,
							"form": event.form,
							"collected": collected,
							"damage": event.damage || null
						};
						if(event.damage_source) {
							update.damage_source = event.damage_source;
							update.damage = event.damage;
						}
						this.updateEvent(event.activity, update);
						break;
				}
			}
		},
		"makeSearchKey": function(root) {
			var forming = [],
				search,
				load,
				i;

			for(i=0; i<this.searchKeys.length; i++) {
				if(root[this.searchKeys[i]] !== undefined && root[this.searchKeys[i]] !== null) {
					search = this.searchables[this.searchKeys[i]];
					switch(typeof(search)) {
						case "string":
							load = this.universe.getObject(root[this.searchKeys[i]]);
							if(load && load[search] !== null && load[search] !== undefined) {
								forming.push(load[search]);
							}
							break;
						case "number":
							break;
						case "boolean":
							if(search !== undefined && search !== null) {
								forming.push(search);
							}
							break;
						case "object":
							if(search[root[this.searchKeys[i]]] !== undefined) {
								forming.push(search[root[this.searchKeys[i]]]);
							}
							break;
						default:
							// Ignore
					}
				}
			}

			return forming.join(" ::: ").toLowerCase();
		},
		"receiveRoll": function(event) {
			this.witnessEvent("roll", "dndChronicleReadoutRoll", event);
		},
		"dismiss": function(index) {
			this.storage.witnessed.splice(index, 1);
		},
		"updateEvent": function(activity, data) {
			var activity = this.storage.activityLookup[activity],
				keys,
				i;
			if(activity) {
				keys = Object.keys(data);
				for(i=0; i<keys.length; i++) {
					if(data[keys[i]]) {
						Vue.set(activity.data, keys[i], data[keys[i]]);
					}
				}
				
				Vue.set(activity, "_updated_date", (new Date()).toLocaleTimeString());
				Vue.set(activity, "_updated", Date.now());
			}
		},
		"witnessEvent": function(type, component, data) {
			// TODO: If this is a roll, check for a collection against the entity
			data = {
				"activity": data.activity,
				"type": type,
				"component": component,
				"data": data,
				"received": Date.now(),
				"date": (new Date()).toLocaleTimeString(),
				"search": this.makeSearchKey(data)
			};
			this.storage.witnessed.unshift(data);
			if(data.activity) {
				Vue.set(this.storage.activityLookup, data.activity, data);
			}
			if(this.storage.witnessed.length > this.storage.witnessed_limit) {
				data = this.storage.witnessed.pop();
				if(data.activity) {
					Vue.delete(this.storage.activityLookup, data.activity);
				}
			}
		},
		"isVisible": function(occurred) {
			return !this.storage.chronicle_filter || (occurred.search && occurred.search.indexOf(this.storage.chronicle_filter) !== -1);
		}
	},
	"beforeDestroy": function() {
		rsSystem.EventBus.$off("master:collect", this.receiveCollection);
		this.universe.$off("chronicled", this.receiveEvent);
		this.universe.$off("entity:roll", this.receiveRoll);
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/master/chronicle.html")
});
