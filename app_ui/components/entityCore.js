rsSystem.component("DNDEntityCore", {
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
		}
	},
	"watch": {
	},
	"mounted": function() {
		this.$el.onclick = (event) => {
			var follow = event.srcElement.attributes.getNamedItem("data-id");
			if(follow && (follow = this.universe.index.index[follow.value]) && this.isOwner(follow)) {
				rsSystem.EventBus.$emit("display-info", follow);
				event.stopPropagation();
				event.preventDefault();
			}
		};
	},
	"methods": {
		"getEntityAdditives": function(entity, additives) {
			entity = entity || this.entity;
			additives = additives || [];
			var search,
				check,
				i;

			if(entity) {
				search = this.universe.transcribeInto(entity.feats);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(check.additive_skill || check.additive_attack || check.additive_attack_melee || check.additive_attack_range || check.additive_attack_spell || (check.additive_attack_charged && check.charges > 0)) {
						additives.push(check);
					}
				}
				search = this.universe.transcribeInto(entity.equipped);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(check.additive_skill || check.additive_attack || check.additive_attack_melee || check.additive_attack_range || check.additive_attack_spell || (check.additive_attack_charged && check.charges > 0)) {
						additives.push(check);
					}
				}
				search = this.universe.transcribeInto(entity.spells);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(check.additive_skill || check.additive_attack || check.additive_attack_melee || check.additive_attack_range || check.additive_attack_spell || (check.additive_attack_charged && check.charges > 0)) {
						additives.push(check);
					}
				}
				search = this.universe.transcribeInto(entity.effects);
				for(i=0; i<search.length; i++) {
					check = search[i];
					if(check.additive_skill || check.additive_attack || check.additive_attack_melee || check.additive_attack_range || check.additive_attack_spell || (check.additive_attack_charged && check.charges > 0)) {
						additives.push(check);
					}
				}
			}

			return additives;
		}
	}
});
