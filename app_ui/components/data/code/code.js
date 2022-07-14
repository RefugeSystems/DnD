/**
 * Code editing area using CodeMirror library
 * 
 * Made with inspiration from https://thecodebarbarian.com/building-a-code-editor-with-codemirror.html
 * @class rsCode
 * @constructor
 * @module Components
 * @param {String} type
 * @param {Number} delay
 * @param {Object} [storage] To store and recover values
 * @param {String} [name] Required with storage for buffering
 */
rsSystem.component("rsCode", {
	"inherit": true,
	"mixins": [
	],
	"props": {
		"type": {
			"default": function() {
				return "";
			},
			"type": String
		},
		"placeholder": {
			"type": String,
			"default": ""
		},
		"value": {
		},
		"delay": {
			"type": Number,
			"default": 300
		},
		"storage": {
			"type": Object,
			"default": function() {
				return {
					"code": ""
				};
			}
		},
		"name": {
			"type": String
		}
	},
	"computed": {
		
	},
	"watch": {
		"value": function(nV, oV) {
			// console.log("Code Value Change: ", oV, " -> ", nV);
			// this.syncDown(nV);
		}
	},
	"data": function () {
		var data = {};

		data.editor = null;

		data.syncing = false;
		data.timeout = null;
		data.last = null;

		return data;
	},
	"mounted": function () {
		rsSystem.register(this);

		Vue.set(this.storage, "code", this.value || "// Key Vars: source, universe, event, utility");
		rsSystem.EventBus.$on("noun-sync",this.reloadData);
		this.editor = new CodeMirror(this.$refs.cm, {
			"mode": "javascript",
			"value": this.storage.code,
			// "theme": "monokai",

			"gutters": ["error", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
			"allowDropFileTypes": ["js", "txt", "md"],
			"indentWithTabs": true,
			"indentUnit": 4,
			"tabSize": 4,
			
			"keyMap": "sublime",
			"showCursorWhenSelecting": true,
			"autoCloseBrackets": true,
			"matchBrackets": true,
			"lineNumbers": true,
			"foldGutter": true,

			"extraKeys": {
				"Alt-F": "findPersistent",
				"Ctrl-Q": function(cm) {
					cm.foldCode(cm.getCursor());
				}
			}
		});

		this.editor.on("changes", this.handleChanges);
	},
	"methods": {
		"reloadData": function() {
			this.syncDown(this.value || "");
		},
		"syncDown": function(code) {
			if(this.editor) {
				// Vue.set(this.storage, "code", code);
				this.editor.setValue(code);
			} else {
				setTimeout(() => {
					this.syncDown(code);
				}, 100);
			}
		},
		"handleChanges": function(event) {
			this.storage.code = this.editor.getValue();
			this.trackChange();
		},
		"trackChange": function() {
			if(!this.last) {
				Vue.set(this, "syncing", true);
				this.last = Date.now();
				this.pushChange();
			}
		},
		"pushChange": function() {
			var error,
				i;

			if(this.last + this.delay < Date.now()) {
				this.editor.clearGutter("error");
				this.$emit("input", this.storage.code);
				Vue.set(this, "syncing", false);
				this.timeout = null;
				this.last = null;

				JSHINT(this.storage.code);
				if(JSHINT.errors && !isNaN(JSHINT.errors.length)) {
					for(i=0; i<JSHINT.errors.length; i++) {
						error = JSHINT.errors[i];
						this.editor.setGutterMarker(error.line - 1, "error", this.makeMarker(error.reason));
					}
				}
			} else {
				setTimeout(this.pushChange, this.delay);
			}
		},
		"makeMarker": function(msg) {
			var marker = document.createElement("div"),
				error = document.createElement("div"),
				icon = document.createElement("div");
			
			icon.classList.add("error-marker");
			icon.classList.add("fa-solid");
			icon.classList.add("fa-circle");

			error.classList.add("error-message");
			error.innerHTML = msg;

			// marker.classList.add("error-marker");
			marker.classList.add("error-block");
			marker.appendChild(icon);
			marker.appendChild(error);

			return marker;
		}
	},
	"beforeDestroy": function () {
		rsSystem.EventBus.$off("noun-sync",this.reloadData);
	},
	"template": Vue.templified("components/data/code.html")
});