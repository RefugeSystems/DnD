var types = Object.keys(rsSystem.universe.listing),
	count = 0,
	i;

for(i=0; i<types.length; i++) {
	count += rsSystem.universe.listing[types[i]].length;
}

console.log(count);