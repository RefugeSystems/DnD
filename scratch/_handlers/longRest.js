/**
 * 
 * @UniverseEvent entity:rest:long
 */

var crystals = 0;

// Clear Temp HP
source.setValues({
	"hp_temp": 0
});

// Check Crystal Details
utility.removeEffects(source, [
	"effect:sickness:crystalline:1",
	"effect:sickness:crystalline:2",
	"effect:sickness:crystalline:3",
	"effect:sickness:crystalline:4",
	"effect:sickness:crystalline:5",
	"effect:sickness:crystalline:6",
	"effect:sickness:crystalline:7"
]);

source.inventory.forEach(function(item) {
	item = universe.get(item);
	if(item.parent === "item:crystal:power") {
		crystals++;
	}
});

crystals -= 2;
if(7 < crystals) {
	crystals = 7;
}
if(crystals > 0) {
	utility.grantEffects(source, ["effect:sickness:crystalline:" + crystals]);
}
