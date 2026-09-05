// Key Vars: source, universe, event, utility
var entity = event.entity,
	heal = 0,
	temp = 0,
	location,
	message,
	isSrc,
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
		isSrc = food.types && food.types.contains("type:source:food");
		if((inv = entity.inventory.contains(food.id)) && (!isSrc || food.charges > 0)) {
			message = [];
			heal += universe.calculator.computedDiceRoll("1d6");
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
			if(food.instilled && food.instilled.length) {
				utility.grantEffects(entity, food.instilled);
				message.push("<span class=\"rendered-value  calculated-result\">" + food.instilled.length + "</span> Effects");
			}

			if(message.length) {
				heal = (entity.nickname || entity.name) + " Healed " + message.join(" and ") + " from " + food.name + " as part of their short rest";
				message = {};
				message[entity.played_by] = true;
				message["player:master"] = true;
				universe.messagePlayers(message, heal, food.icon || "fa-solid fa-drumstick", null, 7000);
			}
			
			if(isSrc) {
				food.subValues({
					"charges": 1
				});
			} else {
				sub.inventory.push(food.id);
			}
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
