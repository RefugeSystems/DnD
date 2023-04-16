/**
 *
 *
 * @class DNDPresentation
 * @constructor
 * @module Components
 */
rsSystem.component("DNDPresentation", {
	"inherit": true,
	"mixins": [
		rsSystem.components.StorageController
	],
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
	"watch": {

	},
	"data": function() {
		var data = {};

		data.presenting = {};
		data.presenting.meeting = this.universe.get(this.universe.get("setting:meeting").value);
		data.presenting.location = null;
		data.presenting.map_parameters = {};
		data.presenting.map_center = null;
		data.presenting.image = null;
		data.presenting.skirmish = null;
		data.presenting.dialog = null;
		data.presenting.puzzle = null;
		data.presenting.tabletop = null;
		data.presenting.vista = null;

		data.vistas = [];

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);

		if(!this.storage.presenting) {
			Vue.set(this.storage, "presenting", "map");
		}
		if(!this.storage.location_parameters) {
			Vue.set(this.storage, "location_parameters", {});
		}
		if(this.storage.skirmish) {
			Vue.set(this.presenting, "skirmish", this.universe.get(this.storage.skirmish));
		}

		if(!this.presenting.location && this.presenting.meeting) {
			Vue.set(this.presenting, "location", this.universe.get(this.presenting.meeting.location || this.presenting.meeting.world));
		}

		rsSystem.EventBus.$emit("home.hide", {"element": "menu"});
		rsSystem.EventBus.$emit("home.hide", {"element": "chat"});

		this.universe.$on("master:control:mapview", this.controlResponse);
		this.universe.$on("master:control", this.controlResponse);

		this.universe.$on("combat:start:skirmish", this.processEvent);
		this.universe.$on("master:presentation", this.processEvent);
		this.universe.$on("combat:end:skirmish", this.processEvent);

		this.universe.$on("updated", this.update);

		this.update();
	},
	"methods": {
		"update": function(event) {
			var active,
				types,
				vista,
				type,
				all,
				i;

			if(!event || (this.presenting.location && event.id === this.presenting.location.id) || (this.presenting.meeting && event.id === this.presenting.meeting.id)) {
				this.vistas.splice(0);
				if(this.presenting.location && this.presenting.location.vista && this.presenting.meeting.type !== "type:navigating") {
					types = Object.keys(this.presenting.location.vista);
					for(i=0; i<types.length; i++) {
						this.vistas.push(vista = {});
						type = types[i];

						vista.image = this.presenting.location.vista[type];
						vista.type = type;
						vista.id = this.presenting.location.vista[type];

						if(this.presenting.meeting && this.presenting.meeting.type === type) {
							active = vista;
							vista.classes = "viewed";
						} else {
							vista.classes = "hidden";
						}
						if(type === "*" || type === "type:*") {
							all = vista;
						}
					}
					if(!active && all) {
						all.classes = "viewed";
					}
				}
			}
		},
		"processEvent": function(event) {
			console.log("Presentation Event: ", event);
			switch(event.type) {
				case "combat:start:skirmish":
					Vue.set(this.storage, "skirmish", event.skirmish);
					Vue.set(this.presenting, "skirmish", this.universe.get(event.skirmish));
					break;
				case "combat:end:skirmish":
					if(this.storage.skirmish === event.skirmish) {
						Vue.delete(this.storage, "skirmish");
						Vue.set(this.presenting, "skirmish", null);
					}
					break;
			}
		},
		"controlResponse": function(control) {
			console.log("Control Event: ", control);
			switch(control.control) {
				case "mapview":
					Vue.set(this.presenting.map_parameters, "zoom", control.data.zoom);
					Vue.set(this.presenting, "map_center", {"x":control.data.x, "y":control.data.y, "zoom": control.data.zoom});
				case "map":
					Vue.set(this.presenting, "location", this.universe.get(control.data.location));
					break;
			}

		}
	},
	"beforeDestroy": function() {
		rsSystem.EventBus.$emit("home.show", {"element": "menu"});
		rsSystem.EventBus.$emit("home.show", {"element": "chat"});
		this.universe.$off("master:control", this.controlResponse);
		this.universe.$off("master:presentation", this.respond);
		this.universe.$off("updated", this.update);
		/*
		this.universe.$off("universe:modified", this.update);
		rsSystem.EventBus.$off("key:escape", this.closeInfo);
		*/
	},
	"template": Vue.templified("pages/dnd/presentation.html")
});
