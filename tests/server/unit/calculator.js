var Calculator = require("../../../app/universe/calculator/dnd"),
	RSObject = require("../../../app/storage/rsobject");

xdescribe("DnD Expression Calculator", function() {
	var calculator,
		database,
		universe,
		manager;

	beforeEach(function() {
		universe = universe = new global.mock.Universe();
		database = {};
		database.field = {};
		database.field.name = {
			"id": "name",
			"type": "string"
		};
		database.field.description = {
			"id": "description",
			"type": "string"
		};
		database.field.strength = {
			"id": "strength",
			"type": "number"
		};
		database.field.dexterity = {
			"id": "dexterity",
			"type": "number"
		};
		database.field.constitution = {
			"id": "constitution",
			"type": "number"
		};
		database.field.wisdom = {
			"id": "wisdom",
			"type": "number"
		};
		database.field.intelligence = {
			"id": "intelligence",
			"type": "number"
		};
		database.field.charisma = {
			"id": "charisma",
			"type": "number"
		};
		database.field.spell_dc = {
			"id": "spell_dc",
			"type": "calculation"
		};
		database.field.armor = {
			"id": "armor",
			"type": "calculation"
		};
		database.field.relation = {
			"id": "relation",
			"type": "string"
		};
		
		universe.debug = true;
		calculator = new Calculator(universe);
		manager = new global.mock.ClassManager(database, {"id":"test"});
		manager.fieldIDs = ["name", "description", "strength", "dexterity", "constitution", "wisdom", "intelligence", "charisma", "spell_dc", "armor", "relation"];
	});

	it("breaks down expressions", function(done) {
		var source = new RSObject(universe, manager, {
			"id": "test:object:one",
			"name": "Object Name",
			"description": "Test description",
			"strength": 10,
			"dexterity": 10,
			"constitution": 10,
			"wisdom": 10,
			"intelligence": 10,
			"charisma": 10,
			"spell_dc": "intelligence/2 + 8",
			"armor": "10 + (this.dex/2 - 5)"
		});
		source.updateFieldValues();
		// console.log("Process: ", calculator.process("1d6 + 1d6 + 1d8 + 5"));
		calculator.process(source._data.armor, source)
		.then(function(res) {
			expect(res).toBe(10);
			return calculator.process(source._data.spell_dc, source);
		})
		.then(function(res) {
			expect(res).toBe(13);
			return calculator.process("int + score", source);
		})
		.then(function(res) {
			expect(res).toBe(10);
		})
		.then(done)
		.catch(done);
	});
	
	it("manages to calculate across objects", function(done) {
		var source,
			tar;
		
		tar = new RSObject(universe, manager, {
			"id": "test:object:target",
			"name": "Object",
			"description": "Test description",
			"strength": 5,
			"dexterity": 5,
			"constitution": 5,
			"wisdom": 5,
			"intelligence": 5,
			"charisma": 5,
			"spell_dc": "intelligence/2 + 8",
			"armor": "10 + (this.dex/2 - 5)"
		});
		
		source = new RSObject(universe, manager, {
			"id": "test:object:one",
			"name": "Object Name",
			"description": "Test description",
			"strength": 10,
			"dexterity": 10,
			"constitution": 10,
			"wisdom": 10,
			"intelligence": 10,
			"charisma": 10,
			"relation": "test:object:target",
			"spell_dc": "intelligence/2 + 8",
			"armor": "10 + (this.dex/2 - 5)"
		});
		
		source.updateFieldValues();
		tar.updateFieldValues();
		
		universe.setObjectReturn(tar);
		calculator.process("relation.charisma", source)
		.then(function(res) {
			expect(res).toBe(5);
			done();
		})
		.catch(done);
	});
	
	it("parses out dice references correctly", function() {
		var result = calculator.parseDiceRoll("int + 1d6 + 9d9 + intd6 + ( (str + chadimire)/2 )d31 + 9 - 4");
		expect(result["remainder"]).toBe("int+9-4");
		expect(result["d6"]).toBe("1+int");
		expect(result["d9"]).toBe("9");
		expect(result["d31"]).toBe("((str+chadimire)/2)");
	});
	
	it("can calculate a flat number", function(done) {
		calculator.process("9")
		.then(function(res) {
			expect(res).toBe(9);
			return calculator.process(19 + 4);
		})
		.then(function(res) {
			expect(res).toBe(23);
		})
		.then(done)
		.catch(done);
	});
	
	it("can reduce a dice roll", function(done) {
		var source;
		
		source = new RSObject(universe, manager, {
			"id": "test:object:one",
			"name": "Object Name",
			"description": "Test description",
			"strength": 10,
			"dexterity": 10,
			"constitution": 10,
			"wisdom": 10,
			"intelligence": 10,
			"charisma": 10,
			"relation": "test:object:target",
			"spell_dc": "intelligence/2 + 8",
			"armor": "10 + (this.dex/2 - 5)"
		});
		
		source.updateFieldValues();
		
		calculator.reduceDiceRoll("int + 2d6 + 1d6 + 1d8 + 5d8")
		.then(function(res) {
			expect(res).toBe("3d6 + 6d8 + int");
			return calculator.reduceDiceRoll("int + 2d6 + intd6 + dexd8 + 5d8 + 2 + ((int-5)/2)");
		})
		.then(function(res) {
			expect(res).toBe("(2+int)d6 + (dex+5)d8 + int+2+((int-5)/2)");
			return calculator.reduceDiceRoll("int + 2d6 + intd6 + dexd8 + 5d8 + 3 + ((int - 4) / 2)", source);
		})
		.then(function(res) {
			expect(res).toBe("12d6 + 15d8 + 16");
			done();
		})
		.catch(done);
	});
	
	it("can calculate a dice roll", function(done) {
		var source;
		
		source = new RSObject(universe, manager, {
			"id": "test:object:one",
			"name": "Object Name",
			"description": "Test description",
			"strength": 10,
			"dexterity": 10,
			"constitution": 10,
			"wisdom": 10,
			"intelligence": 10,
			"charisma": 10,
			"relation": "test:object:target",
			"spell_dc": "intelligence/2 + 8",
			"armor": "10 + (this.dex/2 - 5)"
		});
		
		source.updateFieldValues();
		
		calculator.rollDice("6d6")
		.then(function(res) {
			expect(6 <= res && res <= 36).toBe(true);
			return calculator.rollDice("intd6", source);
		})
		.then(function(res) {
			expect(10 <= res && res <= 60).toBe(true);
			done();
		})
		.catch(done);
	});
});
