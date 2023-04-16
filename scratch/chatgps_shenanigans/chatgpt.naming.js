function generateSimilarName(sources, minLength = 5, maxLength = 10) {
	const vowels = ['a', 'e', 'i', 'o', 'u'];
	const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];

	// define a function to randomly select a vowel or consonant
	function randomLetter(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	// define a function to calculate the phonetic similarity between two phoneme sequences
	function phoneticSimilarity(phoneme1, phoneme2) {
		if(phoneme1 === phoneme2) {
			return 1;
		}
		let score = 0;
		for(let i = 0; i < phoneme1.length; i++) {
			if(phoneme1[i] === phoneme2[i]) {
				score++;
			}
		}
		return score / phoneme1.length;
	}

	// build an array of phonemes based on the source names
	let phonemes = [];
	sources.forEach(name => {
		let phoneme = '';
		for(let i = 0; i < name.length; i++) {
			if(vowels.includes(name[i])) {
				phoneme += 'V'; // V for vowel
			} else if(consonants.includes(name[i])) {
				phoneme += 'C'; // C for consonant
			}
		}
		phonemes.push(phoneme);
	});

	// randomly select a target length for the new name
	const targetLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

	// randomly generate a new name with similar phonemes
	let newName = '';
	let maxIterations = 100;
	let bestScore = 0;
	while(maxIterations > 0) {
		maxIterations--;
		let newPhoneme = '';
		for(let i = 0; i < targetLength; i++) {
			if(i < phonemes[0].length) {
				if(phonemes.every(p => p[i] === phonemes[0][i])) {
					newPhoneme += phonemes[0][i];
				} else {
					if(phonemes.some(p => p[i] === 'V')) {
						newPhoneme += randomLetter(vowels);
					} else {
						newPhoneme += randomLetter(consonants);
					}
				}
			} else {
				newPhoneme += (i % 2 === 0) ? randomLetter(consonants) : randomLetter(vowels);
			}
		}
		let isMatch = sources.some(name => {
			return name.toLowerCase() === newName.toLowerCase();
		});
		if(!isMatch) {
			let score = phonemes.reduce((acc, phoneme) => {
				return acc + phoneticSimilarity(phoneme, newPhoneme);
			}, 0) / phonemes.length;
			if(score > bestScore) {
				bestScore = score;
				newName = newPhoneme.toLowerCase().replace(/v/g, randomLetter(vowels)).replace(/c/g, randomLetter(consonants));
			}
		}
	}

	return newName;
}