
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
	},
	"methods": {
		"receiveEvent": function(event) {
			console.log("Received Chronice: ", event);
			if(event) {
				switch(event.type) {
					case "entity:saved":
						console.log("Entity Save: ", event);
						this.witnessEvent("roll", "dndChronicleReadoutRoll", {
							"entity": event.target,
							"source": event.source,
							"skill": event.skill,
							"result": event.save,
							"difficulty": event.difficulty,
							"channel": event.channel,
							"gametime": this.universe.calendar.toDisplay(event.gametime, true, false),
							"level": event.level,
							"critical": event.critical,
							"failure": event.failure,
							"succeeded": event.succeeded,
							"dice": {
								"d20": []
							}
						});
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
		"witnessEvent": function(type, component, data) {
			this.storage.witnessed.unshift({
				"type": type,
				"component": component,
				"data": data,
				"received": Date.now(),
				"date": (new Date()).toLocaleTimeString(),
				"search": this.makeSearchKey(data)
			});
			if(this.storage.witnessed.length > this.storage.witnessed_limit) {
				this.storage.witnessed.pop();
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
