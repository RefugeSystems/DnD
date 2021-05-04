global.test_data = global.test_data || {};
global.test_data.RSObjects = {};
global.test_data.RSObjects.requested = jasmine.createSpyObj("RSObject", ["setValues", "setValue", "getValue", "checkCondition"]);
