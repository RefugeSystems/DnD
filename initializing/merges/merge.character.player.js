var fs = require("fs"),
	merging = require("./source/characters.important.json"),
	utility = require("./utility.js"),
	Random = require("rs-random"),
	exporting = [],
	generated = [],
	anchored = {},
	generateObjectByParent,
	getAcquiredDate,
	equipped,
	spells,
	merged,
	known,
	keys,
	inv,
	gen,
	mod,
	id,
	i,
	j,
	k,
	r,
	x;

getAcquiredDate = function(merged, id) {
	if(merged.acquired && merged.acquired[id]) {
		return merged.acquired[id].split(".")[1];
	}
	return undefined;
};

generateObjectByParent = function(merged, type, parent) {
	var generating = {},
		genParent;
	generating.id = Random.identifier(type, 10, 32).toLowerCase();
	generating.is_template = false;
	generating.is_copy = true;
	generating.acquired = getAcquiredDate(merged, parent);
	if(parent.startsWith(type)) {
		generating.parent = parent;
	} else {
		if(anchored[parent]) {
			generating.parent = anchored[parent];
		} else {
			genParent = {};
			genParent.id = Random.identifier(type, 10, 32).toLowerCase();
			genParent.description = "Temporary Object for Malformed Parent: " + parent;
			genParent.review = true;
			anchored[parent] = genParent.id;
			generated.push(genParent);
			generating.parent = genParent.id;
		}
	}
	generated.push(generating);
	return generating;
};

for(i=0; i<merging.length; i++) {
	merged = merging[i];
	mod = null;
	id = merged.id;
	if(!id.startsWith("entity:")) {
		id = "entity:" + id;
	}
	try {
		// console.log("Merging: " + merged.name);
		merged = utility.loadModifiers(merged);
		merged.id = id;
		equipped = {};
		spells = {};

		if(merged.type) {
			merged.types = ["type:" + merged.type];
		}
		delete(merged.type);
		if(merged.health) {
			merged.hp = merged.health;
		}
		if(merged.viewRange) {
			merged.view = merged.viewRange;
		}
		delete(merged.viewRange);
		if(merged.maxHealth) {
			merged.hp_rolled = merged.maxHealth;
		}
		delete(merged.maxHealth);

		if(merged.radius) {
			merged.effect_radius = merged.radius;
		}
		delete(merged.radius);
		if(merged.shape !== undefined) {
			merged.effect_shape = merged.shape;
		}
		delete(merged.shape);
		if(merged.verbal === true) {
			merged.cast_uses_verbal = true;
		}
		delete(merged.verbal);
		if(merged.somatic === true) {
			merged.cast_uses_gestures = true;
		}
		delete(merged.somatic);
		if(typeof(merged.material) === "string") {
			merged.cast_uses_material = merged.material.split(",");
		}
		delete(merged.material);
		if(typeof(merged.school) === "string") {
			merged.type = "type:magic:" + merged.school;
		}
		delete(merged.school);
		if(merged.target) {
			merged.targets = ["type:" + merged.target];
		}
		delete(merged.target);
		if(merged.discounts) {
			merged.discount = merged.discount || {};
			merged.discount = Object.assign(merged.discount, merged.discounts);
		}
		delete(merged.discounts);
		if(merged.discount) {
			merged.discount = merged.discount || {};
			merged.discount["all"] = merged.discount;
		} else if(merged.discountGeneral) {
			merged.discount = merged.discount || {};
			merged.discount["all"] = merged.discountGeneral;
		}
		delete(merged.discountGeneral);
		delete(merged.discount);
		if(merged.save) {
			merged.cast_save = "skill:" + merged.save;
		}
		delete(merged.save);
		if(merged.castWith) {
			merged.cast_with = "skill:" + merged.castWith;
		}
		delete(merged.castWith);
		if(merged.template !== undefined) {
			merged.is_template = merged.template;
		}
		delete(merged.reactions);
		if(merged.instanceOf) {
			merged.parent = merged.instanceOf;
		}
		delete(merged.instanceOf);
		if(merged.memorized) {
			merged.spells = [];
			for(j=0; j<merged.memorized.length; j++) {
				spells[merged.memorized[j]] = true;
			}
		}
		delete(merged.memorized);
		if(merged.isStore) {
			merged.is_shop = merged.isStore;
		}
		delete(merged.isStore);
		if(merged.hitDice) {
			merged.hit_dice = merged.hitDice;
		}
		delete(merged.hitDice);
		if(merged.coin) {
			merged.gold = parseFloat(parseFloat(merged.coin).toFixed(2));
		}
		delete(merged.coin);
		if(merged.template) {
			merged.is_template =  merged.template;
		}
		delete(merged.template);
		if(merged.nation) {
			merged.nation = "nation:" + merged.nation;
		}
		if(merged.gender) {
			merged.gender = "gender:" + merged.gender;
		}
		if(merged.user) {
			merged.review = true;
			merged.owned = merged.owned || {};
			merged.owned[merged.user] = "review";
		}
		delete(merged.user);
		if(merged.owner && !merged.owner.startsWith("npc") && !merged.owner.startsWith("unde") && merged.owner !== "undefined") {
			merged.review = true;
			merged.owned = merged.owned || {};
			merged.owned[merged.owner] = "review";
		}
		delete(merged.owner);
		if(merged.feats) {
			inv = [];
			for(k=0; k<merged.feats.length; k++) {
				sk = merged.feats[k];
				if(!sk.startsWith("feat:")) {
					sk = "feat:" + sk;
				}
				if(merged.owned && Object.keys(merged.owned).length) {
					gen = generateObjectByParent(merged, "feat", sk);
					gen.character = id;
					gen.creature = id;
					gen.user = id;
					inv.push(gen.id);
				} else {
					inv.push(sk);
				}
			}
			merged.feats = inv;
		}
		if(merged.weight) {
			merged.weight = parseInt(merged.weight);
		}
		if(merged.age) {
			merged.age = parseInt(merged.age);
		}
		if(merged.height) {
			merged.height = parseInt(merged.height);
		}

		if(merged.knowledge) {
			merged.spells_known = [];
			sk = Object.keys(merged.knowledge);
			known = {};
			inv = [];
			for(k=0; k<sk.length; k++) {
				if(merged.knowledge[sk[k]] && merged.knowledge[sk[k]].length) {
					for(x=0; x<merged.knowledge[sk[k]].length; x++) {
						if(typeof(merged.knowledge[sk[k]][x]) === "string" && !known[merged.knowledge[sk[k]][x]]) {
							known[merged.knowledge[sk[k]][x]] = true;
							// inv.push(generateObjectByParent(merged, "knowledge", merged.knowledge[sk[k]][x]));
							if(merged.knowledge[sk[k]][x].startsWith("knowledge:")) {
								r = merged.knowledge[sk[k]][x];
							} else {
								r = "knowledge:" + merged.knowledge[sk[k]][x];
							}
							inv.push(r);
						}
					}
				}
				if(sk[k].startsWith("spell:")) {
					if(merged.owned && Object.keys(merged.owned).length) {
						gen = generateObjectByParent(merged, "spell", sk[k]);
						gen.character = id;
						gen.caster = id;
						gen.user = id;
						merged.spells_known.push(gen.id);
						if(merged.spells && spells[sk[k]]) {
							merged.spells.push(gen.id);
						}
					} else {
						merged.spells.push(sk[k]);
					}
				}
			}
			inv.sort();
			merged.knowledges = inv;
		}
		delete(merged.knowledge);

		if(typeof(merged.spellSlots) === "object") {
			keys = Object.keys(merged.spellSlots);
			inv = {};
			for(k=0; k<keys.length; k++) {
				inv[keys[k]] = merged.spellSlots[keys[k]];
			}
			merged.spell_slots = inv;
		}
		delete(merged.spellSlots);
		if(merged.level) {
			merged.archetypes = merged.archetypes || [];
			keys = Object.keys(merged.level);
			for(k=0; k<keys.length; k++) {
				inv = "archetype:" + keys[k].replace("class:", "") + ":";
				for(x=1; x<=merged.level[keys[k]]; x++) {
					merged.archetypes.push(inv + x);
				}
			}
			merged.level = merged.level.self || 0;
		}
		if(merged.equipment) {
			merged.equipped = [];
			inv = Object.keys(merged.equipment);
			for(k=0; k<inv.length; k++) {
				if(!merged.equipment[inv[k]].startsWith("item:")) {
					r = "item:" + merged.equipment[inv[k]];
				} else {
					r = merged.equipment[inv[k]];
				} 
				// if(equipped[r]) {
				// 	equipped[r]++;
				// } else {
				// 	equipped[r] = 1;
				// }
				merged.equipped.push(r);
			}
		}
		delete(merged.equipment);
		if(merged.inventory) {
			sk = Object.keys(merged.inventory);
			inv = [];
			for(k=0; k<sk.length; k++) {
				if(!sk[k].startsWith("item:")) {
					r = "item:" + sk[k];
				} else {
					r = sk[k];
				}
				if(typeof(merged.inventory[sk[k]]) !== "number") {
					merged.inventory[sk[k]] = parseInt(merged.inventory[sk[k]]) || 0;
				}
				for(j=0; j<merged.inventory[sk[k]]; j++) {
					inv.push(r);
				}
				// if(merged.owned && Object.keys(merged.owned).length) {
				// 	for(x=0; x<merged.inventory[sk[k]]; x++) {
				// 		// gen = generateObjectByParent(merged, "item", r);
				// 		// console.log(" + " + r + " -> " + gen);
				// 		if(equipped[r]) {
				// 			merged.equipped.push(gen.id);
				// 			equipped[r]--;
				// 		}
				// 		if(merged.charges && merged.charges[sk[k]]) {
				// 			gen.charges = parseInt(merged.charges[sk[k]]);
				// 		}
				// 		if(merged.recharging && merged.recharging[sk[k]]) {
				// 			gen.recharges_long = parseInt(merged.recharging[sk[k]]);
				// 		}
				// 		gen.character = id;
				// 		gen.creature = id;
				// 		gen.user = id;
				// 		inv.push(gen.id);
				// 	}
				// } else {
				// 	inv.push(r);
				// }
			}
			sk = Object.keys(equipped);
			for(k=0; k<sk.length; k++) {
				if(equipped[sk[k]] !== 0) {
					merged.description = merged.description || "";
					merged.description += "  \nEquipment Missing: " + sk[k] + " -> " + equipped[sk[k]];
				}
			}
			merged.inventory = inv;
		}
		if(id.indexOf("npc:") !== -1) {
			merged.is_npc = true;
		}

		utility.finalize(merged);

		delete(merged.equipment);
		delete(merged.action_max);
		delete(merged.bonusActions);
		delete(merged.reactions);
		delete(merged.advantages);
		delete(merged.assessment);
		delete(merged.rate);
		delete(merged.casted);
		delete(merged.ability);
		delete(merged.minimums);
		delete(merged.maximums);
		delete(merged.modifiers);
		delete(merged.coordinates);
		delete(merged.marking);
		delete(merged.classes);
		delete(merged.armor);
		delete(merged.movement_ground);
		delete(merged.movement_fly);
		delete(merged.movement_swim);
		delete(merged.locked);
		delete(merged.requirement);
		delete(merged.created);
		delete(merged.creator);
		delete(merged.updated);
		delete(merged.updater);
		delete(merged.expansion);
		delete(merged.manualCharges);
		delete(merged._search);
		delete(merged.charges);
		delete(merged.acquired);
		delete(merged.overviewMaxHistory);
		delete(merged.overviewVersion);
		delete(merged.statePuzzle);
		delete(merged.immunities);
		delete(merged.experience);
		delete(merged.reactions);
		delete(merged.actions);
		delete(merged.bonusActions);
		delete(merged.proficiencies);
		delete(merged.rolls);
		delete(merged.state);
		delete(merged.user);
		delete(merged.experience);
		delete(merged.messages);
		delete(merged.recharging);
		delete(merged.acquired);
		delete(merged.notes);
		delete(merged.moves);
		delete(merged.modified);
		delete(merged.collections);
		delete(merged.known);

		if(merged.name && merged.name.indexOf("---") === -1) {
			exporting.push(merged);
		} else {
			console.log(" [!] Skipped: " + merged.name);
		}
	} catch(e) {
		console.log("Error: " + id + " [" + (mod?mod.id:"none") + "]: ", e);
	}
}

exporting = generated.concat(exporting);
fs.writeFile("_characters.important.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
module.exports.data = exporting;
