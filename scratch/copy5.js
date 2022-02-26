var universe = rsSystem.lookup().universe,
	knowledgeMap = {},
	acquiredMap = {},
	sessionMap = {},
	acquireds = [],
    quickSet,
	getSession,
	getTime,
	i,
	j,
	k;

getSession = function(acquired) {
	if(acquired) {
		var parts = acquired.split(".");
		return parseInt(parts[0]);
	}
	return 0;
};

getTime = function(acquired) {
	if(acquired) {
		var parts = acquired.split(".");
		return parseInt(parts[1]);
	}
	return 0;
};

quickSet = function(id, field, value) {
    universe.send("master:quick:set", {
        "object": id,
        "field": field,
        "value": value
    });
};

knowers.forEach(function(character) {
	var keys = Object.keys(character.acquired),
		time,
		key,
		i;
	for(i=0; i<keys.length; i++) {
		key = keys[i];
		time = getTime(character.acquired[key]);
		if(!acquiredMap[key]) {
			acquireds.push(key);
		}
		if(!acquiredMap[key] || time < acquiredMap[key]) {
			sessionMap[key] = getSession(character.acquired[key]);
			acquiredMap[key] = time;
		}
	}
});

knowledges.forEach(function(knowledge) {
	if(knowledge && knowledge.id) {
		knowledgeMap[knowledge.id] = knowledge;
	}
});

acquireds.forEach(function(id) {
	if(knowledgeMap[id] && acquiredMap[id]) {
		if(sessionMap[id] < 10) {
			quickSet(id, "acquired_in", "meeting:label:000" + sessionMap[id]);
		} else {
			quickSet(id, "acquired_in", "meeting:label:00" + sessionMap[id]);
		}
		quickSet(id, "acquired", acquiredMap[id] - 17280000);
	}
});
