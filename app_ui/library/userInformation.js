/**
 * 
 * @class UserInformation
 * @constructor
 * @module Library
 * @param {String} username
 * @param {String} id
 * @param {String} token
 * @param {String} [name] Optional additional identifier for the name of the user.
 */
class UserInformation {
	constructor(username, id, token, name) {
		/**
		 * The visible identifier for the user that is chosen by the user.
		 * @property username
		 * @type String
		 */
		this.username = username;
		/**
		 * Optional additional identifier for the name of the user.
		 * @property name
		 * @type String
		 * @default ""
		 */
		this.name = name || "";
		/**
		 * Used to authenticate this session. Established by the authentication process.
		 * @property token
		 * @type String
		 */
		this.token = token;
		/**
		 * The underlying identifier for the user that is issued by the system.
		 * @property id
		 * @type String
		 * @default null
		 */
		this.id = id || null;

		/**
		 * Timestamp
		 * @property established
		 * @type Number
		 */
		this.established = Date.now();
		/**
		 * 
		 * Timestamp
		 * @property last
		 * @type Number
		 */
		this.last = this.established;
	}
	
	setPasscode(code) {
		if(code) {
			this.passcode = code;
		} else {
			delete(this.code);
		}
	}
	
	toString() {
		return "User: " + this.username;
	}
	
	toJSON() {
		return {
			"username": this.username,
			"passcode": this.passcode,
			"established": this.established,
			"age": this.last - this.established,
			"last": this.last,
			"tokenDefined": !!this.token,
			"token": null
		};
	}
}