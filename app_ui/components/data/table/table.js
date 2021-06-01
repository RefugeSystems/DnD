
/**
 * 
 * 
 * @class rsTable
 * @constructor
 * @module Components
 * @zindex 1
 */
(function() {
	var storageKey = "_rs_menuComponentKey";
	
	rsSystem.component("rsTable", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSCore
		],
		"props": {
			"index": {
				"required": true,
				"type": Object
			},
			"corpus": {
				"required": true,
				"type": Array
			},
			"headers": {
				"required": true,
				"type": Array
			},
			"controls": {
				"required": false,
				"type": Array
			},
			"state": {
				"required": true,
				"type": Object
			}
		},
		"data": function() {
			var data = {},
				x;

			data.start = 0;
			if(this.state && !this.state.filter) {
				Vue.set(this.state, "filter", {});
			}
			if(this.state && this.state.filter && (this.state.filter["null"] === null || this.state.filter["null"] === undefined)) {
				Vue.set(this.state.filter, "null", "");
			}
			
			return data;
		},
		"watch": {
			"index": function(newIndex, oldIndex) {
//				console.warn("Table Index Updated: ", oldIndex, "\n -> \n", newIndex);
				oldIndex.$off("selection", this.update);
				oldIndex.$off("indexed", this.update);
				newIndex.$on("selection", this.update);
				newIndex.$on("indexed", this.update);
				this.update();
			},
			"state.filter": {
				"deep": true,
				"handler": function() {
					this.update();
				}
			},
			"state.paging.current": {
				"deep": true,
				"handler": function(nV) {
					if(this.state.paging.tracked !== nV) {
						this.state.paging.tracked = nV;
						this.update();
					}
				}
			},
			"state.paging.per": {
				"handler": function() {
					this.update();
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			this.universe.$on("universe:modified", this.update);
			this.index.$on("selection", this.update);
			this.index.$on("indexed", this.update);
			this.$on("update-table", this.update);
			this.update();
		},
		"methods": {
			"headerAction": function(header) {
				console.log("Header Action: ", header);
				if(typeof header.action === "function") {
					header.action(header);
				} else if(header.action === null) {
					/* No Action */
				} else {
					if(this.state.sortKey === header.field) {
						Vue.set(this.state, "order", !this.state.order);
					} else {
						Vue.set(this.state, "sortKey", header.field);
					}
					if(header.sorter) {
						if(this.state.sorter !== header.sorter) {
							Vue.set(this.state, "sorter", header.sorter);
						}
					} else {
						Vue.delete(this.state, "sorter");
					}
				}
				this.update();
			},
			"isArray": function(item) {
				return (item instanceof Array) || (item && item.constructor && item.constructor.name.toLowerCase().indexOf("array") !== -1);
			},
			"formatObjectHeader": function(object) {
				var x, keys, html;
				keys = Object.keys(object);
				html = "<ul>";
				for(x=0; x<keys.length; x++) {
					html += "<li><span class='property'>" + keys[x] + "</span>: <span class='value'>" + object[keys[x]] + "</span></li>"; 
				}
				html += "<ul>";
			},
			"select": function(record, header) {
//				console.log("Table Selection: ", record, header);
				if(header.recordAction) {
					header.recordAction(record, header);
				} else if(!this.state.noSelect) {
					if(this.index.toggleSelect(record)) {
						if(!this.state.noEmit) {
							this.$emit("selected", record, header);
						}
					} else {
						if(!this.state.noEmit) {
							this.$emit("unselected", record, header);
						}
					}
					this.$forceUpdate();
				} else if(!this.state.noEmit) {
					this.$emit("selected", record, header);
				} else {
					// Selection is suppressed
				}
				this.update();
			},
			"update": function() {
				this.corpus.splice(0);
				this.index.list(this.state.filter, this.state, this.corpus);
//				this.$forceUpdate();
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("universe:modified", this.update);
			this.index.$off("selection", this.update);
			this.index.$off("indexed", this.update);
		},
		"template": Vue.templified("components/table.html")
	});
})();
