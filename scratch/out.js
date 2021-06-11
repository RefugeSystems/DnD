var count = 0,
	seen = {};

	seen.mt = {};
seen.cat = {};

Object.keys(rep.asmt_metric).forEach(function(i) {
	var o = rep.asmt_metric[i];
	if(o.metric_type) {
		if(!seen.mt[o.metric_type]) {
			seen.mt[o.metric_type] = {};
		}
		if(!seen.mt[o.metric_type][i]) {
			seen.mt[o.metric_type][i] = 0;
		}
		seen.mt[o.metric_type][i]++;
	}
	if(o.category) {
		if(!seen.cat[o.category]) {
			seen.cat[o.category] = {};
		}
		if(!seen.cat[o.category][i]) {
			seen.cat[o.category][i] = 0;
		}
		seen.cat[o.category][i]++;
	}
});
console.log(JSON.stringify(seen, null, 4));