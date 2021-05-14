
/**
 *
 *
 * @class RSAccount
 * @constructor
 * @module Pages
 */
(function() {
	var loginSKey = "_rs_connectComponentKey";

	rsSystem.component("RSAccount", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSShowdown
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
			"user": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {};

			data.linked_discord = null;
			data.mdDescription = null;
			data.description = null;
			data.username = null;
			data.entity = null;
			data.email = null;
			data.name = null;

			data.editting = {};
			data.labeling = {};
			data.modeling = {};
			data.labeling.linked_discord = "Discord";
			data.labeling.email = "E-mail";
			data.fields = [
				"name",
				"passcode",
				"email",
				"linked_discord"
			];
			data.toggles = [
				// "hide_contributed",
				"allow_scripting"
			];
			data.title = {
				"hide_contributed": "Hide Contribution Toggle in Record Information",
				"allow_scripting": "Allow Scripted HTML"
			};

			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
			this.player.$on("modified", this.update);
			this.update();
		},
		"methods": {
			"getFieldValue": function(field) {
				if(field === "passcode") {
					return "[ Edit to set new passcode ]";
				}

				return this.modeling[field];
			},
			"editField": function(field) {
				Vue.set(this.editting, field, true);

				if(this.modeling[field] === "...") {
					Vue.set(this.modeling, field, this.player[field]);
				}

				setTimeout(function() {
					field = document.getElementById("fieldinput-" + field);
					if(field) {
						field.focus();
					}
				}, 0);
			},
			"toggle": function(field) {
				Vue.set(this.modeling, field, null);
				var buffer = {};
				buffer[field] = !this.player[field];
				this.player.commit(buffer);
			},
			"sendField": function(field, value) {
				value = value || this.modeling[field];
				Vue.set(this.editting, field, false);
				Vue.set(this.modeling, field, null);
				if(this.player[field] != value) {
					var buffer;

					if(field === "passcode" && value) {
						Vue.set(this.modeling, field, "");
						value = value.sha256();
						buffer = localStorage.getItem(loginSKey);
						if(buffer) {
							buffer = JSON.parse(buffer);
							buffer.passcode = value;
							localStorage.setItem(loginSKey, JSON.stringify(buffer));
						}
					} else {
						Vue.set(this.modeling, field, "...");
					}

					buffer = {};
					buffer[field] = value;
					this.player.commit(buffer);
				}
			},
			"update": function() {
				if(this.player) {
					if(this.universe.indexes.entity) {
						Vue.set(this.modeling, "entity", this.universe.indexes.entity.index[this.player.entity]);
					}
					Vue.set(this.modeling, "mdDescription", this.rsshowdown(this.player.description, this.modeling.entity));
					Vue.set(this.modeling, "linked_discord", this.player.linked_discord);
					Vue.set(this.modeling, "description", this.player.description);
					Vue.set(this.modeling, "username", this.player.username);
					Vue.set(this.modeling, "email", this.player.email);
					Vue.set(this.modeling, "name", this.player.name);

					Vue.set(this.modeling, "allow_scripting", this.player.allow_scripting);
				}
			}
		},
		"beforeDestroy": function() {
			this.player.$off("modified", this.update);
		},
		"template": Vue.templified("pages/account.html")
	});
})();
