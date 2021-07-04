
module.exports.initialize = function(universe) {
	/**
	 * 
	 * @event player:page:update
	 */
	universe.on("player:page:update", function(event) {
		// console.log("Incoming: ", event.message.data);

		var page = universe.get(event.message.data.page),
			text = event.message.data.text;
		
		if(page && page.description !== text) {
			page.addValues({
				"versioning": 1,
				"versions": [{
					"version": page.versioning,
					"player": event.player.id,
					"text": page.description,
					"update": Date.now()
				}]
			});
			page.setValues({
				"description": text
			});
		}
	});

	/**
	 * Get a list of versions, who made it, and when
	 * @event player:page:versions
	 */
	universe.on("player:page:versions", function(event) {
		var page = universe.get(event.message.data.page),
			versions = [],
			saved,
			i;
		
		if(page) {
			for(i=0; i<page.versions.length; i++) {
				saved = page.versions[i];
				versions.push({
					"updated_by": saved.player,
					"updated_on": saved.update,
					"version": saved.version
				});
			}
		}

		universe.emit("send", {
			"type": "page:versions",
			"recipient": event.player.id,
			"versions": versions.player,
			"page": page.id
		});
	});

	/**
	 * Get a specific version that includes the text of
	 * that specific version
	 * @event player:page:version
	 */
	universe.on("player:page:version", function(event) {
		// console.log("Incoming: ", event.message.data);

		var page = universe.get(event.message.data.page),
			version = event.message.data.version,
			saved,
			i;
		
		if(page && !isNaN(version)) {
			for(i=0; i<page.versions.length; i++) {
				saved = page.versions[i];
				if(saved.version == version) {
					universe.emit("send", {
						"type": "page:version",
						"recipient": event.player.id,
						"updated_by": saved.player,
						"updated_on": saved.update,
						"text": saved.text,
						"version": version,
						"page": page.id
					});
					break;
				}
			}
		}
	});
};
