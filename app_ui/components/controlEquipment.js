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
		"give": function(item, to, from) {
			this.sendEquipmentContorl("inventory:give", item, from, to);
		},
		"drop": function(item, entity) {
			this.sendEquipmentContorl("inventory:Drop", item, entity);
		},
		"equipItem": function(item, entity) {
			this.sendEquipmentContorl("equip:items", item, entity);
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
			this.sendSingleEquipmentContorl("item:mainnhand", item, entity);
		},
		"unequipItem": function(item, entity) {
			this.sendEquipmentContorl("unequip:items", item, entity);
		},
		"dischargeItem": function(item, entity) {
			this.sendEquipmentContorl("object:charges", item, entity, null, -1);
		},
		"rechargeItem": function(item, entity) {
			this.sendEquipmentContorl("object:charges", item, entity, null, 1);
		},
		"revealItem": function(item, entity) {
			this.sendEquipmentContorl("inventory:reveal", item, entity);
		},
		"hideItem": function(item, entity) {
			this.sendEquipmentContorl("inventory:hide", item, entity);
		},
		"attuneItem": function(item, entity) {
			this.sendEquipmentContorl("items:attune", item, entity);
		},
		"unattuneItem": function(item, entity) {
			this.sendEquipmentContorl("items:unattune", item, entity);
		},
		"versatilityToOneHanded": function(item, entity) {
			this.sendEquipmentContorl("items:verstility:1handed", item, entity);
		},
		"versatilityToTwoHanded": function(item, entity) {
			this.sendEquipmentContorl("items:verstility:2handed", item, entity);
		},
		"getPlayerCharacter": function() {
			try {
				return this.universe.index.entity[this.universe.index.player[this.universe.connection.session.player].attribute.playing_as];
			} catch(missinggReference) {
				console.warn("Could not isolate player character: ", missinggReference);
				return null;
			}
		},
		"sendEquipmentContorl": function(command, item, entity, target, charges) {
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
			this.universe.send(command, send);
		},
		"sendSingleEquipmentContorl": function(command, item, entity, target, charges) {
			if(!entity) {
				entity = this.entity;
			}
			if(!entity) {
				entity = this.getPlayerCharacter();
			}
			var send = {
				"item": item,
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
