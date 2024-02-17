
rsSystem.initializations.push(function(universe) {
	var calendar,
		setting;

	if((setting = universe.get("setting:calendar")) && (calendar = universe.get(setting.value))) {
		universe.calendar.setCalendar(calendar);
		universe.$on("updated", function(object) {
			if(universe.calendar.isFollowing(object)) {
				universe.calendar.update();
			}
		});
	} else {
		console.warn("Failed to locate default calendar, fallback to manual");
		this.calendar.nameMonths([
			"Alucevum",
			"Vaknaevum",
			"Borgevum",
			"Skaparvum",
			"Umqavum",
			"Comiaevum",
			"Unkulevum",
			"Dormevum"
		]);
		this.calendar.nameDays([
			"Horallum",
			"Horaneskja",
			"Horantono",
			"Horavis",
			"Horanquil",
			"Horakkir"
		]);
		this.calendar.setDays([25]);
	}
});
