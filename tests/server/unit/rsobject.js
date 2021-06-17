var RSObject = require("../../../app/storage/rsobject");

describe("RSObject", function() {
	var universe,
		manager,
		details,
		testing;

	beforeEach(function(done) {
		universe = new global.mock.Universe();
		manager = new global.mock.ClassManager({}, {"id":"test"});

		details = {
			"id": "testid",
			"name": "hi"
		};

		manager.initialize(["name", "description", "a", "b", "c", "sub_a", "sub_b", "sub_c"])
		.then(done)
		.catch(done);
	});
	
	it("can add values", function() {
		var a = {},
			b = {},
			res;
			
		a.dice = "2d4";
		b.dice = "4d8";
		
		a.num = 4;
		b.num = 0;
		
		a.bool = true;
		b.bool = false;
			
		expect(RSObject.addValues(2, 5)).toBe(7);
		expect(RSObject.addValues("hi", "there")).toBe("hi there");
		expect(RSObject.addValues("1d6", "3d6", "dice")).toBe("1d6 + 3d6");
		
		res = RSObject.addValues(a, b);
		expect(res.dice).toBe(a.dice + " " + b.dice);
		expect(res.bool).toBe(a.bool && b.bool);
		expect(res.num).toBe(a.num + b.num);
	});
	
	it("can set Object values", function() {
		var a = {},
			b = {},
			res;
			
		a.dice = "2d4";
		b.dice = "4d8";
		
		a.num = 4;
		b.num = 0;
		
		a.bool = true;
		b.bool = false;

		res = RSObject.setObjects(a, b);
		expect(res.num).toBe(0);
		expect(res.dice).toBe("4d8");
		expect(res.bool).toBe(false);
	});
	
	it("can add Object values", function() {
		var a = {},
			b = {},
			res;
			
		a.dice = "2d4";
		b.dice = "4d8";
		
		a.num = 4;
		b.num = 0;

		a.old_data = 3;
		b.new_data = 9;
		
		a.bool = true;
		b.bool = false;

		res = RSObject.addObjects(a, b);
		expect(res.num).toBe(4);
		expect(res.dice).toBe("2d4 4d8");
		expect(res.bool).toBe(false);
		expect(res.old_data).toBe(3);
		expect(res.new_data).toBe(9);
	});
});
