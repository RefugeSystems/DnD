var clean = ["updated", "created", "_search", "_event", "_events", "_sync", "_eventsCount"],
    cleaned = [],
    skip = {},
    field,
    keys,
    i,
    j;

for(i=0; i<clean.length; i++) {
    skip[clean[i]] = true;
}

for(j=0; j<fields.length; j++) {
    cleaned.push(field = {});
    keys = Object.keys(fields[j]);
    for(i=0; i<keys.length; i++) {
        if(!skip[keys[i]]) {
            field[keys[i]] = fields[j][keys[i]];
        }
    }
}