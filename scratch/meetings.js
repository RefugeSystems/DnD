players.forEach(function(player, i) {
    console.log(formatNumber(i) + ": " + player.name);
});


var create = [],
	last,
    meet;


var formatNumber = function(num) {
	if(num < 10) {
		return "000" + num;
	} else if(num < 100) {
		return "00" + num;
	} else if(num < 1000) {
		return "0" + num;
	} else {
		return num;
	}
};

for(i=1; i<67; i++) {
	meet = {};
	meet.id = "meeting:cardinal:" + formatNumber(i);
	meet.name = "Cardinal: Session " + i;
	meet.players = cardinal;

	if(last) {
		meet.meeting_previous = last.id;
		last.meeting_next = meet.id;
	}

	create.push(meet);
	last = meet;
}


for(i=1; i<68; i++) {
	meet = {};
	meet.id = "meeting:raven:" + formatNumber(i);
	meet.name = "Raven: Session " + i;
	meet.players = raven;

	if(last) {
		meet.meeting_previous = last.id;
		last.meeting_next = meet.id;
	}

	create.push(meet);
	last = meet;
}
