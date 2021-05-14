
/**
 * 
 * 
 * @class rsCards
 * @constructor
 * @module Components
 * @zindex 1
 */
rsSystem.component("rsCards", {
	"inherit": true,
	"mixins": [
		rsSystem.components.RSCore
	],
	"props": {
		"selection": {
			"required": false,
			"type": String
		},
		"labeling": {
			"required": false,
			"type": String
		},
		"corpus": {
			"required": true,
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

//		data.select_label = "";
//		data.card_label = "";
		data.current = 0;
		
		return data;
	},
	"computed": {
		"select_label": function() {
			return this.selection || "Select";
		},
		"card_label": function() {
			return this.labeling || "Card";
		}
	},
	"watch": {
		"state": {
			"deep": true,
			"handler": function() {
				this.update();
			}
		}
	},
	"mounted": function() {
		rsSystem.register(this);
		
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.index.index[follow.value]) && this.isOwner(follow)) {
				event.stopPropagation();
				rsSystem.EventBus.$emit("display-info", follow);
			}
		};
	},
	"methods": {
		"cardZIndex": function(index, card) {
			return (this.corpus.length + 10) - index;
		},
		"cardClass": function(index, card) {
			if(index < this.current) {
				return "passed";
			} else if(index === this.current) {
				return "current";
			}
		},
		"cardOffset": function(index, card) {
			var offset = (index - this.current) * 30 + 10;
			return "top: " + offset + "px; left: " + offset + "px;";
		},
		"toCard": function(index) {
			if(this.current !== index) {
				Vue.set(this, "current", index);
			}
		},
		"nextCard": function() {
			if(this.current < this.corpus.length - 1) {
				Vue.set(this, "current", this.current + 1);
			} else {
				Vue.set(this, "current", 0);
			}
		},
		"prevCard": function() {
			if(this.current > 0) {
				Vue.set(this, "current", this.current - 1);
			} else {
				Vue.set(this, "current", this.corpus.length - 1);
			}
		},
		"selectCard": function(card) {
			this.$emit("selected", card);
		},
		"update": function() {
			this.$forceUpdate();
		}
	},
	"beforeDestroy": function() {
		this.universe.$off("universe:modified", this.update);
	},
	"template": Vue.templified("components/cards.html")
});
