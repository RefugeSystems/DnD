// Key Vars: source, universe, event, utility
var entity = event.entity,
	heal = 0,
	temp = 0,
	location,
	message,
	food,
	inv,
	add,
	set,
	sub;

if(entity) {
	set = {};
	sub = {
		"inventory": []
	};
	add = {
		"hp_temp": 0,
		"hp": 0
	};
	
	if(entity.spell_casting_level) {
		set.spell_slots = Object.assign({}, entity.spell_slot_max);
	}
	
	if((location = universe.get(entity.location)) && location.is_restful) {
		set.hp = entity.hp_max;
	}
	
	if(event.food && (food = universe.get(event.food))) {
		if((inv = entity.inventory.indexOf(food.id)) !== -1) {
			message = [];
			heal += universe.calculator.computedDiceRoll("2d8");
			if(food.damage) {
				if(food.damage["damage_type:heal"]) {
					heal += universe.calculator.computedDiceRoll(food.damage["damage_type:heal"], entity);
				}
				if(food.damage["damage_type:temphp"]) {
					temp += universe.calculator.computedDiceRoll(food.damage["damage_type:temphp"], entity);
				}
			}

			if(heal) {
				message.push("<span class=\"rendered-value  calculated-result\">" + heal + "</span> HP");
				add.hp += heal;
			}
			if(temp) {
				message.push("<span class=\"rendered-value  calculated-result\">" + temp + "</span> Temp HP");
				add.hp_temp += temp;
			}
			if(food.instilled_self && food.instilled_self.length) {
				utility.grantEffects(entity, food.instilled_self);
				message.push("<span class=\"rendered-value  calculated-result\">" + food.instilled_self.length + "</span> Effects");
			}

			if(message.length) {
				heal = (entity.nickname || entity.name) + " Healed " + message.join(" and ") + " from " + food.name + " as part of their long rest";
				message = {};
				message[entity.played_by] = true;
				message["player:master"] = true;
				universe.messagePlayers(message, heal, food.icon || "fa-solid fa-drumstick", null, 7000);
			}
			
			sub.inventory.push(food.id);
		} else {
			message[entity.played_by] = true;
			message["player:master"] = true;
			universe.messagePlayers(message, (entity.nickname || entity.name) + " tried to eat " + food.name + " but does not have any", food.icon || "fa-solid fa-drumstick", null, 7000);
		}
	}
	
	set.last_rest = universe.time;
	
	entity.addValues(add);
	entity.setValues(set);
	entity.subValues(sub);
}
