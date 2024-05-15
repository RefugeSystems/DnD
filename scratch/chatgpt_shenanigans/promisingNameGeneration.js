function generateRandomName(names, minLength = 3, maxLength = 20) {
	// Initialize an empty object to store the markov chain data
	let markovChain = {};
  
	// Loop through each name in the array
	for (let i = 0; i < names.length; i++) {
	  let name = names[i].toLowerCase();
  
	  // Loop through each character in the name
	  for (let j = 0; j < name.length; j++) {
		let char = name[j];
  
		// If the character is not the last one in the name
		if (j < name.length - 1) {
		  let nextChar = name[j + 1];
  
		  // If the current character is not already in the markov chain
		  if (!markovChain[char]) {
			markovChain[char] = {};
		  }
  
		  // If the next character is not already in the markov chain for the current character
		  if (!markovChain[char][nextChar]) {
			markovChain[char][nextChar] = 0;
		  }
  
		  // Increment the count for the next character
		  markovChain[char][nextChar]++;
		}
	  }
	}
  
	// Generate a new name by starting with a random character and using the markov chain to determine the next character
	let newName = "";
	let chars = Object.keys(markovChain);
	let randomChar = chars[Math.floor(Math.random() * chars.length)];
	newName += randomChar;
  
	// Keep generating new characters until the name reaches the maximum length or a stopping point is reached
	while (newName.length < maxLength && Math.random() < 0.75) {
	  let nextChars = Object.keys(markovChain[randomChar]);
  
	  // If there are no more possible characters to add, break out of the loop
	  if (nextChars.length === 0) {
		break;
	  }
  
	  let randomNextChar =
		nextChars[Math.floor(Math.random() * nextChars.length)];
	  newName += randomNextChar;
	  randomChar = randomNextChar;
	}
  
	// If the name is too short, generate a new name
	if (newName.length < minLength) {
	  return generateRandomName(names, minLength, maxLength);
	}
  
	return newName;
  }
  