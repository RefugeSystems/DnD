/**
 * 
 * @class Player
 * @extends RSObject
 * @constructor
 * @param {Object} details
 * @param {Universe} details
 * @param {TypeManager} manager
 */
var RSObject = require("../rsobject"),
	defaultPlayers = [];

defaultPlayers.push({
	"id": "master",
	"username": "master",
	"master": true,
	"description": "Default master account"
});
	
class Player extends RSObject {
	constructor(details, universe, manager) {
		super(details, universe, manager);
		
		this.guarenteeData(defaultPlayers);
	}
}
