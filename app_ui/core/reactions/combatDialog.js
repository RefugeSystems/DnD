rsSystem.addInitialization(function() {
	rsSystem.universe.$on("entity:combat:turn:start", function(event) {
		var universe = rsSystem.universe,
			player = universe.getPlayer(),
			profile = universe.profile,
			bus = rsSystem.EventBus,
			details = {},
			entity,
			action;

		if(player && event && event.entity && event.entity === player.attribute.playing_as && !profile.suppress_auto_action) {
			details.entity = universe.index.entity[player.attribute.playing_as];
			// details.action = universe.index.action["action:main:attack"];
			details.title = details.entity.name + " Attack";
			details.component = "dndDialogDamage";
			bus.$emit("dialog-open", details);
		}
	});
	
	rsSystem.universe.$on("damage:taken", function(event) {
		console.warn("Damage Taken: ", event);
	});
});
