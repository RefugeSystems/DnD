/**
 *
 *
 * @class DNDControlEquipment
 * @constructor
 * @module Components
 */
rsSystem.component("DNDControlEquipment", {
	"props": {
		"universe": {
			"required": true,
			"type": Object
		}
	},
	"computed": {
		"playerCharacter": function() {
			return this.getPlayerCharacter();
		}
	},
	"methods": {
		"isWeapon": function(item) {
			return item.ranged || item.melee || item.thrown || item.is_ranged || item.is_melee || item.is_thrown;
		},
		"consumeItem": function(item, entity) {
			entity = entity || this.entity;
			if(item && entity) {
				rsSystem.EventBus.$emit("dialog-open", {
					"title": this.entity.name + " Actions",
					"component": "dndDialogDamage",
					"action": "channel:use",
					"entity": entity,
					"channel": item
				});
			}
		},
		"giveItem": function(item, to, from) {
			this.sendEquipmentControl("inventory:give", item, from, to);
		},
		"dropItem": function(item, entity) {
			this.sendEquipmentControl("inventory:drop", item, entity);
		},
		"give": function(item, to, from) {
			this.sendEquipmentControl("inventory:give", item, from, to);
		},
		"drop": function(item, entity) {
			this.sendEquipmentControl("inventory:drop", item, entity);
		},
		"equipItem": function(item, entity) {
			this.sendEquipmentControl("equip:items", item, entity);
		},
		"mainhandItem": function(item, entity) {
			// if(!entity) {
			// 	entity = this.entity;
			// }
			// if(entity) {
			// 	this.universe.send("item:mainhand", {
			// 		"item": item?item.id || item:item,
			// 		"entity": entity.id || entity
			// 	});
			// }
			this.sendSingleEquipmentControl("item:mainhand", item, entity);
		},
		"unequipItem": function(item, entity) {
			this.sendEquipmentControl("unequip:items", item, entity);
		},
		"dischargeItem": function(item, entity) {
			this.sendEquipmentControl("object:charges", item, entity, null, -1);
		},
		"rechargeItem": function(item, entity) {
			this.sendEquipmentControl("object:charges", item, entity, null, 1);
		},
		"revealItem": function(item, entity) {
			this.sendEquipmentControl("inventory:reveal", item, entity);
		},
		"hideItem": function(item, entity) {
			this.sendEquipmentControl("inventory:hide", item, entity);
		},
		"attuneItem": function(item, entity) {
			this.sendEquipmentControl("items:attune", item, entity);
		},
		"unattuneItem": function(item, entity) {
			this.sendEquipmentControl("items:unattune", item, entity);
		},
		"versatilityToOneHanded": function(item, entity) {
			this.sendEquipmentControl("items:verstility:1handed", item, entity);
		},
		"versatilityToTwoHanded": function(item, entity) {
			this.sendEquipmentControl("items:verstility:2handed", item, entity);
		},
		"getPlayerCharacter": function() {
			try {
				return this.universe.index.entity[this.universe.index.player[this.universe.connection.session.player].attribute.playing_as];
			} catch(missinggReference) {
				console.warn("Could not isolate player character: ", missinggReference);
				return null;
			}
		},
		"sendEquipmentControl": function(command, item, entity, target, charges) {
			if(!entity) {
				entity = this.entity;
			}
			if(!entity) {
				entity = this.getPlayerCharacter();
			}
			var send = {
				"items": [item.id || item],
				"entity": entity.id || entity
			};
			if(target) {
				send.target = target.id || true;
			}
			if(charges) {
				send.change = charges;
			}
			console.log("Equipment Control: ", send);
			this.universe.send(command, send);
		},
		"sendSingleEquipmentControl": function(command, item, entity, target, charges) {
			if(!entity) {
				entity = this.entity;
			}
			if(!entity) {
				entity = this.getPlayerCharacter();
			}
			var send = {
				"item": item.id || item,
				"entity": entity.id || entity
			};
			if(target) {
				send.target = target.id || true;
			}
			if(charges) {
				send.change = charges;
			}
			this.universe.send(command, send);
		},
		"noOp": function() {}
	}
});
