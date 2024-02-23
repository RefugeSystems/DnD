
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
		this.universe.$on("chronicled", this.receiveEvent);
		this.universe.$on("entity:roll", this.receiveRoll);
		if(!this.storage.witnessed) {
			Vue.set(this.storage, "witnessed", []);
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
		"receiveEvent": function(event) {
			console.log("Received Chronice: ", event);
			var update;
			if(event) {
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
		this.universe.$off("chronicled", this.receiveEvent);
		this.universe.$off("entity:roll", this.receiveRoll);
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("components/dnd/master/chronicle.html")
});
