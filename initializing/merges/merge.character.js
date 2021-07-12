var fs = require("fs"),
	merging = require("./source/characters.json"),
	utility = require("./utility.js"),
	exporting = [],
	merged,
	keys,
	inv,
	mod,
	id,
	i,
	k,
	r,
	x;

for(i=0; i<merging.length; i++) {
	merged = merging[i];
	mod = null;
	id = merged.id;
	try {
		// console.log("Merging: " + merged.name);
		utility.loadModifiers(merged);

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
		if(merged.viewRange) {
			merged.view = merged.viewRange;
		}
		delete(merged.viewRange);
		if(merged.viewRange) {
			merged.view = merged.viewRange;
		}
		delete(merged.viewRange);

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
			merged.spells = merged.memorized;
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
		if(merged.feat) {
			merged.review = true;
			merged.note = merged.note || "";
			merged.note += "\n\nPreviously tied to a Feat: " + merged.feat;
		}
		delete(merged.feat);
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
			sk = Object.keys(merged.knowledge);
			inv = [];
			r = {};
			for(k=0; k<sk.length; k++) {
				if(merged.knowledge[sk[k]]) {
					for(x=0; x<merged.knowledge[sk[k]].length; x++) {
						if(!r[merged.knowledge[sk[k]][x]]) {
							r[merged.knowledge[sk[k]][x]] = true;
							if(typeof(merged.knowledge[sk[k]][x]) === "string") {
								if(merged.knowledge[sk[k]][x].startsWith("knowledge")) {
									inv.push(merged.knowledge[sk[k]][x]);
								} else {
									console.log(" > Invalid Knowledge Reference: " + merged.knowledge[sk[k]][x]);
								}
							}
						}
					}
				}
			}
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
				merged.equipped.push(merged.equipment[inv[k]]);
			}
		}
		if(merged.inventory) {
			sk = Object.keys(merged.inventory);
			inv = [];
			for(k=0; k<sk.length; k++) {
				for(x=0; x<merged.inventory[sk[x]]; x++) {
					inv.push(sk[k]);
				}
			}
			merged.inventory = inv;
		}
		if(id.indexOf("npc:") !== -1) {
			merged.is_npc = true;
		}

		merged.id = "entity:" + id;
		utility.finalize(merged);

		delete(merged.equipment);
		delete(merged.actions);
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
		delete(merged.mvoement_ground);
		delete(merged.mvoement_fly);
		delete(merged.mvoement_swim);
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

fs.writeFile("_characters.json", JSON.stringify({"import": exporting}, null, "\t"), () => {});
