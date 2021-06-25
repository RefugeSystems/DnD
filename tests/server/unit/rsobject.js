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
	
	it("can add deeply nested Object Array values", function() {
		var a = {},
			b = {},
			res;
			
		a.on = {};
		b.on = {};

		a.on.attack = [{
			"id": 0,
			"a": 1
		}];
		a.on.long_rest = [{
			"id": 10,
			"a": 12
		}];
		b.on.attack = [{
			"id": 1,
			"b": 1
		}];
		b.on.short_rest = [{
			"id": 20,
			"b": 11
		}];
		
		a.new_obj = {
			"j": 4
		};
		b.old_obj = {
			"k": 9
		};

		res = RSObject.addObjects(a, b);
		expect(res.on.attack).toBeDefined();
		expect(res.on.long_rest).toBeDefined();
		expect(res.on.short_rest).toBeDefined();
		expect(res.new_obj.j).toBe(4);
		expect(res.old_obj.k).toBe(9);
		expect(res.on.long_rest[0]).toBeDefined();
		expect(res.on.long_rest[0].id).toBe(10);
		expect(res.on.long_rest[0].a).toBe(12);
		expect(res.on.long_rest[0].b).not.toBeDefined();
		expect(res.on.short_rest[0].id).toBe(20);
		expect(res.on.short_rest[0].a).not.toBeDefined();
		expect(res.on.short_rest[0].b).toBe(11);
		expect(res.on.attack.length).toBe(2);
	});
	
	it("can subtract from Array values", function() {
		var a = {},
			b = {},
			res;
			
		a.effects = ["a", "b", "c"];
		b.effects = ["b"];

		a.number = 9;
		b.number = 4;

		a.other = 19;
		b.another = 51;

		res = RSObject.subValues(a.effects, b.effects);
		console.log("Result: ", res);
		expect(res.indexOf("b")).toBe(-1);
		expect(res.indexOf("a")).toBe(0);
		expect(res.indexOf("c")).toBe(1);
	});
});
