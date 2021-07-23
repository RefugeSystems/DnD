
/**
 * 
 * 
 * @class rsSelectionBlock
 * @constructor
 * @module Components
 * @params {Universe} universe
 * @params {SelectionBlock} block To render and feed
 * @params {Array} outcome Where the selected element is queued
 */

/**
 * Emitted when the limit is hit
 * @event ready
 */
 /**
  * Emitted when the selection no longer meets the limit
  * @event not-ready
  */
rsSystem.component("rsSelectionBlock", {
	"inherit": true,
	"mixins": [
	],
	"props": {
		"universe": {
			"required": true,
			"type": Object
		},
		"block": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"choices": function() {
			var choices = [],
				archMap = {},
				entity,
				player,
				record,
				spell,
				add,
				i,
				j,
				x;

			switch(this.block.fill) {
				case "spell":
					entity = this.universe.index.entity[this.block.entity];
					if(!entity) {
						player = this.universe.index.player[this.universe.connection.session.player];
						if(player && player.attribute && player.attribute.playing_as) {
							entity = this.universe.index.entity[player.attribute.playing_as];
						}
					}
					if(entity.archetypes) {
						for(i=0; i<entity.archetypes.length; i++) {
							archMap[entity.archetypes[i]] = true;
						}
					}
					if(this.block._archetype) {
						archMap[this.block._archetype] = true;
					}
					for(i=0; i<this.universe.listing.spell.length; i++) {
						spell = this.universe.listing.spell[i];
						add = false;
						if(spell && spell.archetypes && spell.archetypes.length) {
							for(j=0; !add && j<spell.archetypes.length; j++) {
								if(archMap[spell.archetypes[j]]) {
									add = true;
								}
							}
						} else {
							add = true;
						}
						if(add && (!entity.spells_known || entity.spells_known.indexOf(spell.id) === -1) && (typeof(spell.level) === "number" && spell.level >= 0) && !spell.obscured && !spell.is_preview && !spell.disabled && !spell.is_disabled && !spell.is_template && !spell.is_copy && !spell.is_inherited) {
							choices.push(spell);
						}
					}
					break;
				default:
					for(x=0; x<this.block.choices.length; x++) {
						record = this.universe.getObject(this.block.choices[x]);
						if(record) {
							choices.push(record);
						} else {
							choices.push(this.block.choices[x]);
						}
					}
			}
				
			return choices;
		}
	},
	"data": function() {
		var data = {};

		this.limit = this.block.limit || 1;
		this.block._selected = this.block._selected || [];
		this.block._tracked = this.block._tracked || {};
		
		return data;
	},
	"mounted": function() {
		rsSystem.register(this);
		if(this.choices.length <= this.limit) {
			setTimeout(() => {
				for(var i=0; i<this.choices.length; i++) {
					this.select(this.choices[i]);
				}
			}, 0);
		}
	},
	"methods": {
		"getIcon": function(choice) {
			return this.block._tracked[choice.id || choice]?"far fa-check-square":"far fa-square";
		},
		"info": function(record) {
			rsSystem.EventBus.$emit("display-info", {
				"info": record.id || record
			});
		},
		"toggle": function(choice) {
			if(this.block._tracked[choice.id || choice]) {
				this.deselect(choice);
			} else {
				this.select(choice);
			}
		},
		"select": function(choice) {
			if(!this.block._tracked[choice.id || choice]) {
				Vue.set(this.block._tracked, choice.id || choice, true);
				this.block._selected.uniquely(choice.id);
				this.$forceUpdate(); // TODO: Not updating naturally?
				this.complete();
			}
		},
		"deselect": function(choice) {
			if(this.block._tracked[choice.id || choice]) {
				Vue.set(this.block._tracked, choice.id || choice, false);
				this.block._selected.purge(choice.id);
				this.$forceUpdate(); // TODO: Not updating naturally?
				this.complete();
			}
		},
		"complete": function() {
			if(this.block._selected.length === this.limit) {
				Vue.set(this.block, "_completed", true);
				this.$emit("selected", this.block);
			} else {
				Vue.set(this.block, "_completed", false);
			}
		},
		"clear": function() {
			
		}
	},
	"template": Vue.templified("components/selection/block.html")
});
