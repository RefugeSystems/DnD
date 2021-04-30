var repeatitions = 3000,
	counting = 3000,
	testA = [],
	testB = [],
	testC = [],
	testD = [],
	avg,
	nz,
	t;
	
avg = function(a) {
	var s = 0,
		i;
	for(i=0; i<a.length; i++) {
		s += a[i];
	}
	return (s/a.length).toFixed(2);
};

nz = function(a) {
	var s = 0,
		i;
	for(i=0; i<a.length; i++) {
		if(a[i] != 0) s++;
	}
	return s;
};

for(var repeat=0; repeat<repeatitions; repeat++) {
    var i, mark, c = [], d = [], x = [], y = [], z = [], set = {}, count = counting;
    for(i=0; i<count; i++) {
        x.push(Math.random());
    }
	
	// Trash measurement for spin up
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
        d[i] = x[i];
    }

    mark = Date.now();
    y = y.concat(x);
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
    }
    testA.push(Date.now() - mark);

    mark = Date.now();
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
        z.push(x[i]);
    }
    testB.push(Date.now() - mark);

    mark = Date.now();
    c.push.apply(c, x);
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
    }
    testC.push(Date.now() - mark);

    mark = Date.now();
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
        d[i] = x[i];
    }
    testD.push(Date.now() - mark);
}

for(var repeat=0; repeat<repeatitions; repeat++) {
    var i, mark, c = [], d = [], x = [], y = [], z = [], set = {}, count = counting;
    for(i=0; i<count; i++) {
        x.push(Math.random());
    }
	
	// Trash measurement for spin up
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
        d[i] = x[i];
    }

    mark = Date.now();
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
        d[i] = x[i];
    }
    testD.push(Date.now() - mark);

    mark = Date.now();
    c.push.apply(c, x);
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
    }
    testC.push(Date.now() - mark);

    mark = Date.now();
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
        z.push(x[i]);
    }
    testB.push(Date.now() - mark);

    mark = Date.now();
    y = y.concat(x);
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
    }
    testA.push(Date.now() - mark);
}

for(var repeat=0; repeat<repeatitions; repeat++) {
    var i, mark, c = [], d = [], x = [], y = [], z = [], set = {}, count = counting;
    for(i=0; i<count; i++) {
        x.push(Math.random());
    }
	
	// Trash measurement for spin up
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
        d[i] = x[i];
    }

    mark = Date.now();
    c.push.apply(c, x);
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
    }
    testC.push(Date.now() - mark);

    mark = Date.now();
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
        d[i] = x[i];
    }
    testD.push(Date.now() - mark);

    mark = Date.now();
    y = y.concat(x);
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
    }
    testA.push(Date.now() - mark);

    mark = Date.now();
    for(i=0; i<x.length; i++) {
        set[x[i]] = true;
        z.push(x[i]);
    }
    testB.push(Date.now() - mark);
}

console.log(avg(testA), avg(testB), avg(testC), avg(testD));
console.log(nz(testA), nz(testB), nz(testC), nz(testD));
