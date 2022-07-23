
/**
 *
 *
 * @class dndEntityNotes
 * @constructor
 * @module Components
 */
rsSystem.component("dndEntityNotes", {
	"inherit": true,
	"mixins": [
		rsSystem.components.DNDWidgetCore
	],
	"props": {
		"entity": {
			"requried": true,
			"type": Object
		},
		"profile": {
			"type": Object,
			"default": function() {
				return {};
			}
		}
	},
	"computed": {
		"page": function() {
			return this.universe.index.page[this.entity[this.widget.page_field || "page"]];
		},
		"session": function() {
			if(this.universe.index.setting["setting:meeting"]) {
				return this.universe.index.meeting[this.universe.index.setting["setting:meeting"].value];
			}
			return null;
		}
	},
	"watch": {
		"notes": function(notes, old) {
			if(this.page) {
				this.universe.send("page:update", {
					"page": this.page.id,
					"text": notes
				});
			}
		}
	},
	"data": function() {
		var data = {};

		data.notes = "";

		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		// this.universe.$off("entity:roll", this.processRoll);
		if(this.page) {
			Vue.set(this, "notes", this.page.description);
		}
		if(this.storage.is_open === undefined) {
			Vue.set(this.storage, "is_open", true);
		}
		if(this.widget.height && this.$refs.notepage) {
			this.$refs.notepage.style["min-height"] = this.widget.height;
			this.$refs.notepage.style.height = this.widget.height;
		}
	},
	"methods": {
		"toggle": function() {
			Vue.set(this.storage, "is_open", !this.storage.is_open);
		},
		"processDrop": function() {
			var data = rsSystem.dragndrop.general.drop();
			if(data && (data = this.universe.getObject(data))) {
				Vue.set(this, "notes", this.notes + " {{" + data.name + ", " + data.id + "}} ");
			}
			this.$refs.notepage.focus();
		},
		"toKnowledge": function(clear) {
			var associations = [];
			// TODO: Scan for {{...}} markings to add associations
			rsSystem.EventBus.$emit("dialog-open", {
				"component": "dndDialogKnowing",
				"entity": this.entity.id,
				"associations": associations,
				"can_share": this.info._class === "entity",
				"initial_name": this.session?this.session.name + " Notes":"Session Notes",
				"initial_text": this.notes,
				"initial_category": "category:ideas:travel",
				"choice": "create",
				"finish": (target) => {
					if(clear) {
						Vue.set(this, "notes", "");
					}
				}
			});
		}
	},
	"beforeDestroy": function() {
		// this.universe.$off("entity:roll", this.processRoll);
	},
	"template": Vue.templified("components/dnd/entity/notes.html")
});
