
/**
 *
 *
 * @class RSSystem
 * @constructor
 * @module Pages
 */
(function() {
	var getAddress = new RegExp("/([a-zA-Z0-9.:_-]+)/");

	rsSystem.component("RSSystem", {
		"inherit": true,
		"mixins": [
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

			data.player = this.universe.indexes.player.index[this.user.id];
			data.navigator = rsSystem.getBrowserName();
			data.system = rsSystem;
			data.knownErrors = {};

			data.importOverwrites = false;
			data.importSelection = false;
			data.importMessageType = "";
			data.importMessage = null;
			data.importIcon = null;
			data.importing = false;
			data.toImport = 0;
			data.imported = 0;
			data.skipped = 0;
			data.failed = 0;

			data.connectedPlayers = [];
			data.importedIDs = [];
			data.skippedIDs = [];
			data.failedIDs = [];

			return data;
		},
		"mounted": function() {
			rsSystem.register(this);
			this.universe.$on("universe:modified", this.update);
			this.universe.$on("model:modified", this.update);
			this.universe.$on("connected", this.update);
			this.universe.$on("error", this.update);
			this.update();
		},
		"methods": {
			"showInfo": function(record) {
				rsSystem.EventBus.$emit("display-info", record);
			},
			"toggleLocalDebug": function() {
				Vue.set(this.universe, "debugConnection", !this.universe.debugConnection);
			},
			"uncachedRefresh": function() {
				// TODO: Align ServiceWorker versioning for cache tracking
				caches.delete("rsswx_0.0.1")
				.then(function() {
					location.reload(true);
				});
			},
			"showFailures": function() {
				console.log("Failures: ", this.universe.importing.failed);
			},
			"checkImportSelection": function() {
				var input = $(this.$el).find("#importFileSelection");
				Vue.set(this, "importSelection", input && input.length && input[0].files.length);
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
			"importOverwriteToggle": function() {
				Vue.set(this, "importOverwrites", !this.importOverwrites);
			},
			"importUniverse": function() {
				var input = $(this.$el).find("#importFileSelection");

				if(!this.universe.importing.active && input && input.length && input[0].files.length) {
					this.readFile(input[0].files[0])
					.then((result) => {
						this.universe.importData(JSON.parse(result.data), this.importOverwrites);
					})
					.catch((err) => {
						// Malformated JSON caught here
						console.error("Import to Universe Error: ", err);
					});
				}
			},
			"stopUniverse": function() {
				this.universe.send("stop");
			},
			"makeIssue": function() {
				var buffer = {};
				buffer.id = navigator.userAgent.sha256();
				buffer.name = "Problems: " + this.navigator.name + " " + this.navigator.version;
				buffer.icon = "rs-dark-red fas fa-exclamation-triangle";
				buffer.description = "There are known issues with this browser version";
				buffer._type = "note";
				this.universe.send("modify:note", buffer);
			},
			"getServerAddress": function() {
				return getAddress.exec(this.universe.connection.address)[1];
			},
			"getDate": function(time) {
				var date = new Date(time);
				return date.toLocaleDateString() + " " + date.toLocaleTimeString();
			},
			"update": function() {
				var buffer,
					x;

				Vue.set(this.knownErrors, "navigator", this.universe.indexes.note.index[navigator.userAgent.sha256()] || this.universe.indexes.note.index[navigator.userAgent.toLowerCase().sha256()]);

				this.connectedPlayers.splice(0);
				for(x=0; x<this.universe.indexes.player.listing.length; x++) {
				    if(this.universe.indexes.player.listing[x] && this.universe.indexes.player.listing[x].connections > 0) {
				        this.connectedPlayers.push(this.universe.indexes.player.listing[x]);
				    }
				}

				this.$forceUpdate();
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("universe:modified", this.update);
			this.universe.$off("model:modified", this.update);
			this.universe.$off("connected", this.update);
			this.universe.$off("error", this.update);
		},
		"template": Vue.templified("pages/system.html")
	});
})();
