/**
 * Declares a cipher based on a scripture passage to encode or
 * decode text.
 * 
 * The first line of the encoded text is encrypted using a standard
 * key_text provided as a constant in the `primary_text` property and
 * can be set manually to switch that text if needed.
 * 
 * After the first line there is always an empty line to separate the key
 * from the encoded text.
 * 
 * The second to last line is always an empty line and the last line is
 * always the arcane name of the signatory in the Radiant Circle, with their
 * Rank, Name, and Temple or blood rite, such as "Alcolyte Oneian of Kieratar"
 * 
 * The cipher works by mapping characters from the plain text to 2 characters
 * that designate the line number and character position within that line from the
 * scripture passage, where 0-9 are represented as 0-9 and 10-35 are represented as
 * the letters a-z (10 = a, 11 = b, ..., 34 = y, 35 = z) and 36-61 are represented as
 * the letters A-Z (36 = A, 37 = B, ..., 60 = Y, 61 = Z).
 * 
 * For example, the first character 'R' in "Radiance" is at line 0, position 0,
 * so it is encoded as "00". The second character 'a' is at line 0, position 1,
 * so it is encoded as "01". The third character 'd' is at line 0, position 2,
 * so it is encoded as "02", and so on.
 * 
 * When multiple occurrences of the same character exist, one is chosen at random
 * to add variability to the encoding. So in the above case, an 'e' could be encoded
 * as "08" for the second occurrence in "Radiance".
 * 
 * When a character does not exist in the scripture passage, it is encoded as "Za" and
 * characters in the key text that can not be referenced by this method are ignored. As
 * such, a decrypted string is not guaranteed to match the source exactly.
 * 
 * @class ScriptureCipher
 * @constructor
 * @param {String} key_text 
 */
var ScriptureCipher = function(text_title, key_text) {
	text_title = text_title.toLowerCase().trim();
	key_text = key_text.toLowerCase().trim();

	var characterMap = ScriptureCipher.mapText(key_text),
		notEncoded = {};

	notEncoded["\n"] = true;
	notEncoded["+"] = true;
	notEncoded["*"] = true;

	/**
	 * Encrypts the provided text using the provided key text.
	 * @method encrypt
	 * @param {String} text To encrypt using the provided key text. This text is
	 * 		converted to lower case for encoding purposes.
	 * @param {String} signatory The signatory to append at the end of the text
	 * @returns {String} Encrypted text
	 */
	this.encrypt = function(text, signatory) {
		var lines = text.trim().toLowerCase().split("\n"),
			encrypted = [],
			i;

		// Encrypt the first line using the `primary_text` as the key
		encrypted.push(this._encrypt(ScriptureCipher.primaryMap, text_title));
		encrypted.push(""); // Empty line

		// Encrypt the rest of the text using the provided `key_text`
		for(i=0; i<lines.length; i++) {
			encrypted.push(this._encrypt(characterMap, lines[i]));
		}

		// Add an empty line and the signatory at the end
		encrypted.push("");
		encrypted.push(this._encrypt(characterMap, signatory.toLowerCase()));

		// Return the encrypted text as a single string
		return encrypted.join("\n");
	};

	/**
	 * 
	 * @method decrypt
	 * @param {String} text To decrypt using the provided key text. Note that
	 * 		this String can NOT be converted to lower case as that would corrupt
	 * 	 	the encoding.
	 * @returns {String} Decrypted text
	 */
	this.decrypt = function(text) {
		var lines = text.trim().split("\n"),
			decrypted = [],
			i;

		// Decrypt the first line using the `primary_text` as the key
		decrypted.push(this._decrypt(ScriptureCipher.primaryMap, lines[0]));

		// Decrypt the rest of the text using the provided `key_text`
		for(i=1; i<lines.length; i++) {
			decrypted.push(this._decrypt(characterMap, lines[i]));
		}

		// Return the decrypted text as a single string
		return decrypted.join("\n");
	};

	/**
	 * Basic method to perform the encryption process with a given key.
	 * @method _encrypt
	 * @param {Object} key_map
	 * @param {String} text 
	 * @return {String} Encrypted text
	 */
	this._encrypt = function(key_map, text) {
		var out = [],
			choices,
			pick,
			i,
			c;

		for(i = 0; i < text.length; i++) {
			c = text.charAt(i);
			if(notEncoded[c]) {
				out.push(c + " ");
			} else if(c !== "\r") {
				choices = key_map[c];

				// If the character isn't in the map (or has no positions), encode as "Za"
				if(!choices || !choices.length) {
					if(isNaN(c)) {
						out.push("Za");
					} else {
						// Numbers receive a special encoding that adds ambiguity with long texts but ensures encodability
						out.push("N" + c);
					}
				} else {
					// Choose a random occurrence for variability
					pick = choices[Math.floor(Math.random() * choices.length)];
					out.push(ScriptureCipher.pointToCode(pick[0], pick[1]));
				}
			}
		}

		return out.join("");
	};

	/**
	 * Basic method to perform the decryption process with a given key.
	 * @method _decrypt
	 * @param {Object} key_map
	 * @param {String} text 
	 * @return {String} Decrypted text
	 */
	this._decrypt = function(key_map, text) {
		var out = [],
			code,
			ch,
			c,
			i;

		// Decode in 2-character chunks. If odd length, ignore trailing char.
		for(i = 0; i + 1 < text.length; i += 2) {
			code = text.substring(i, i + 2);
			ch = code.charAt(0);

			// "Za" or unknown codes become "?" in output (lossy as described)
			c = key_map[code];
			if(c) {
				ch = c.charAt(0);
				out.push(c);
			} else if(notEncoded[ch]) {
				out.push(ch);
			} else if(ch === "N" && !isNaN(code.charAt(1))) {
				// Special handling for numbers encoded as "N0" to "N9"
				out.push(code.charAt(1));
			} else {
				out.push("?");
			}
		}

		return out.join("");
	};

	/**
	 * Debug method to retrieve internal state data for testing.
	 * @method debug
	 * @returns {Object} Internal state data
	 */
	this.debug = function() {
		var output = {};
		output.text_title = text_title;
		output.key_text = key_text;
		output.characterMap = JSON.parse(JSON.stringify(characterMap));
		output.notEncoded = JSON.parse(JSON.stringify(notEncoded));
		return output;
	};
};

ScriptureCipher.alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * The primary text used for the first line encryption.
 * @property primary_text
 * @static
 * @type String
 */
ScriptureCipher.primary_text = `
Radiance keep me through the night,
Wrap me softly in Her light.
Let every shadow fade away,
And shape me pure at break of day.

Guide my heart to stillness deep,
Where blessed ones may safely sleep.
If dawn should call me to Her side,
I'll walk in peace, with joy as guide.

For in Her warmth no fear can stay,
And those She chooses need not stray.
So let me rest in quiet grace—
Prepared to meet Her shining face.`
.toLowerCase().trim();

/**
 * Creates an object to map each character in the given text to its
 * line and position within the text as well as mapping the 2-character
 * code back to the character.
 * @method mapText
 * @param {String} text 
 * @returns {Object} A mapping of characters to their positions in the text
 */
ScriptureCipher.mapText = function(text) {
	text = text.toLowerCase().trim();
	var map = {},
		line = 0,
		pos = 0,
		pt,
		c,
		i;
	
	for(i=0; i<text.length; i++) {
		c = text.charAt(i);
		if(c === "\n") {
			line++;
			pos = 0;
		} else if(c !== "\r") {
			if(!map[c]) {
				map[c] = [];
			}
			pt = ScriptureCipher.pointToCode(line, pos);
			if(map[pt]) {
				console.warn("Duplicate point mapping for", pt, "from character", c);
			}
			map[c].push([line, pos]);
			map[pt] = c; // Reverse mapping
			pos++;
		}
	}
	
	return map;
};

/**
 * Converts a line and position to a 2-character code.
 * 
 * If the line or position is out of range, a "Z" character
 * is used in its place.
 * @method pointToCode
 * @param {Integer} line 
 * @param {Integer} pos 
 * @returns {String} 2-character encoding for the given line and position.
 */
ScriptureCipher.pointToCode = function(line, pos) {
	return (ScriptureCipher.alphabet.charAt(line) || "Z") + (ScriptureCipher.alphabet.charAt(pos) || "Z");
};

/**
 * Converts a 2-character code to a line and position. If the code
 * has invalid characters, -1 is returned for that value.
 * @method codeToPoint
 * @param {String} code 
 * @returns {Array} [line, position]
 */
ScriptureCipher.codeToPoint = function(code) {
	return [ScriptureCipher.alphabet.indexOf(code.charAt(0)), ScriptureCipher.alphabet.indexOf(code.charAt(1))];
};

/**
 * The character map for the primary text.
 * @property primaryMap
 * @static
 * @type Object
 */
ScriptureCipher.primaryMap = ScriptureCipher.mapText(ScriptureCipher.primary_text);
