
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

	rsSystem.component("rsTablePaging", {
		"inherit": true,
		"mixins": [
			rsSystem.components.RSCore
		],
		"props": {
			"index": {
				"required": true,
				"type": Object
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
			var data = {};

			data.lastPage = 0;
			data.pages = [];

			return data;
		},
		"watch": {
			"index": function(newIndex, oldIndex) {
				console.warn("Paging Index Updated: ", oldIndex, "\n -> \n", newIndex);
				oldIndex.$off("selection", this.update);
				oldIndex.$off("indexed", this.update);
				newIndex.$on("selection", this.update);
				newIndex.$on("indexed", this.update);
				this.update();
			},
			"state": {
				"deep": true,
				"handler": function() {
					this.update();
				}
			}
		},
		"mounted": function() {
			rsSystem.register(this);
			this.index.$on("indexed", this.update);
			this.update();
		},
		"methods": {
			"toPage": function(page) {
				Vue.set(this.state.paging, "current", page);
//				console.warn("To Page: " + page);
			},
			"classPage": function(page) {
				if(page === this.state.paging.current) {
					return "current-page";
				} else if(page === 0) {
					return "first-page";
				} else if(page === this.state.paging.count - 1) {
					return "last-page";
				} else {
					return "general-page";
				}
			},
			"update": function() {
				this.pages.splice(0);

				if(this.state.paging && this.state.paging.count) {
					var max,
						x;

					Vue.set(this, "lastPage", this.state.paging.count - 1);

					if(this.state.paging.spread) {
						max = Math.min(this.state.paging.current + this.state.paging.spread, this.lastPage - 1);
						x = Math.max(this.state.paging.current - this.state.paging.spread, 1);
					} else {
						x = 1;
					}

//					console.log("Pages: ", x, max, _p(this.state.paging));

					for(; x<=max; x++) {
						this.pages.push(x);
					}
				}

				this.$forceUpdate();
			}
		},
		"beforeDestroy": function() {
			this.universe.$off("universe:modified", this.update);
			this.index.$off("selection", this.update);
			this.index.$off("indexed", this.update);
		},
		"template": Vue.templified("components/table/paging.html")
	});
})();
