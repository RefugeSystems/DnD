var Calculator = require("../../../app/universe/calculator/dnd"),
	RSObject = require("../../../app/storage/rsobject");

describe("DnD Expression Calculator", function() {
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
		calculator.process(source._data.armor, source, function(err, res) {
			if(err) {
				done(err);
			} else {
				expect(eval(res)).toBe(10);
				calculator.process(source._data.spell_dc, source, function(err, res) {
					if(err) {
						done(err);
					} else {
						expect(eval(res)).toBe(13);
						calculator.process("int + score", source, function(err, res) {
							if(err) {
								done(err);
							} else {
								expect(eval(res)).toBe(10);
								done();
							}
						});
					}
				});
			}
		});
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
		calculator.process("relation.charisma", source, function(err, res) {
			if(err) {
				done(err);
			} else {
				expect(res).toBe("5");
				done();
			}
		});
	});
	
	it("parses out dice references correctly", function() {
		var result = calculator.rawDice("int + 1d6 + 9d9 + 9 - 4");
		expect(result["remainder"]).toBe("9 - 4 + int");
		expect(result["d6"]).toBe("1");
		expect(result["d9"]).toBe("9");
	});
});
