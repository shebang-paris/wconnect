/**
 * Unit tests data utility functions for both node and browser environment
 * @module test/data
 */

const WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'curabitur', 'vel', 'hendrerit', 'libero', 'eleifend', 'blandit', 'nunc', 'ornare', 'odio', 'ut', 'orci', 'gravida', 'imperdiet', 'nullam', 'purus', 'lacinia', 'a', 'pretium', 'quis', 'congue', 'praesent', 'sagittis', 'laoreet', 'auctor', 'mauris', 'non', 'velit', 'eros', 'dictum', 'proin', 'accumsan', 'sapien', 'nec', 'massa', 'volutpat', 'venenatis', 'sed', 'eu', 'molestie', 'lacus', 'quisque', 'porttitor', 'ligula', 'dui', 'mollis', 'tempus', 'at', 'magna', 'vestibulum', 'turpis', 'ac', 'diam', 'tincidunt', 'id', 'condimentum', 'enim', 'sodales', 'in', 'hac', 'habitasse', 'platea', 'dictumst', 'aenean', 'neque', 'fusce', 'augue', 'leo', 'eget', 'semper', 'mattis', 'tortor', 'scelerisque', 'nulla', 'interdum', 'tellus', 'malesuada', 'rhoncus', 'porta', 'sem', 'aliquet', 'et', 'nam', 'suspendisse', 'potenti', 'vivamus', 'luctus', 'fringilla', 'erat', 'donec', 'justo', 'vehicula', 'ultricies', 'varius', 'ante', 'primis', 'faucibus', 'ultrices', 'posuere', 'cubilia', 'curae', 'etiam', 'cursus', 'aliquam', 'quam', 'dapibus', 'nisl', 'feugiat', 'egestas', 'class', 'aptent', 'taciti', 'sociosqu', 'ad', 'litora', 'torquent', 'per', 'conubia', 'nostra', 'inceptos', 'himenaeos', 'phasellus', 'nibh', 'pulvinar', 'vitae', 'urna', 'iaculis', 'lobortis', 'nisi', 'viverra', 'arcu', 'morbi', 'pellentesque', 'metus', 'commodo', 'ut', 'facilisis', 'felis', 'tristique', 'ullamcorper', 'placerat', 'aenean', 'convallis', 'sollicitudin', 'integer', 'rutrum', 'duis', 'est', 'etiam', 'bibendum', 'donec', 'pharetra', 'vulputate', 'maecenas', 'mi', 'fermentum', 'consequat', 'suscipit', 'aliquam', 'habitant', 'senectus', 'netus', 'fames', 'quisque', 'euismod', 'curabitur', 'lectus', 'elementum', 'tempor', 'risus', 'cras'];

/**
 * Generate random numbers that follow a normal distribution
 * @function gauss
 * @returns {Number} The generated number
 * @private
 */

const gauss = () => ((Math.random() * 2) - 1) + ((Math.random() * 2) - 1) + ((Math.random() * 2) - 1);

/**
 * Generate random numbers that follow a normal distribution with a given mean and standard deviation
 * @function gaussMS
 * @param {Number} mean
 * @param {Number} deviation
 * @returns {Number} The generated number
 * @private
 */

const gaussMS = (mean, deviation) => Math.round((gauss() * deviation) + mean);

/**
 * Inject random punctuation into a sentence
 * @function punctuate
 * @param {Array} sentence An array with all words constituting a sentence
 * @private
 */

const punctuate = (sentence) => {
	const { length } = sentence;
	sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1); // eslint-disable-line no-param-reassign
	sentence[length - 1] += '.'; // eslint-disable-line no-param-reassign
	if (length < 4) return sentence;
	const base = 6;
	const average = Math.log(length) / Math.log(base);
	const deviation = average / base;
	const nb = Math.round(gaussMS(average, deviation));
	for (let i = 0; i <= nb; i += 1) {
		const position = Math.round((i * length) / (nb + 1));
		if (position < (length - 1) && position > 0) {
			sentence[position] += ','; // eslint-disable-line no-param-reassign
		}
	}
	return true;
};

/**
 * Get random text with lorem ipsum style
 * @function getRandomText
 * @param {Number} num The desired number of words
 * @returns {String} The generated text
 * @instance
 */

export const getRandomText = (num) => {
	let nb = num || 100;
	const words = [WORDS[0], WORDS[1]];
	nb -= 2;
	for (let i = 0; i < nb; i += 1) {
		const position = Math.floor(Math.random() * WORDS.length);
		const word = WORDS[position];
		if (i > 0 && words[i - 1] === word) {
			i -= 1;
		} else {
			words[i] = word;
		}
	}
	const sentences = [];
	let current = 0;
	while (nb > 0) {
		let length = Math.round(gaussMS(24.460, 5.080));
		if (nb - length < 4) {
			length = nb;
		}
		nb -= length;
		const sentence = [];
		for (let i = current; i < (current + length); i += 1) {
			sentence.push(words[i]);
		}
		punctuate(sentence);
		current += length;
		sentences.push(sentence.join(' '));
	}
	return sentences.join(' ');
};

/**
 * Get random integer between min and max
 * @function getRandomInteger
 * @param {Number} min
 * @param {Number} max
 * @returns {Number} The generated integer
 * @instance
 */

export const getRandomInteger = (min, max) => min + Math.floor((max - min) * Math.random());

/**
 * Get random ID
 * @function getRandomID
 * @returns {String} The generated text
 * @instance
 */

export const getRandomID = () => Math.random().toString(36).replace(/[^a-z]+/g, '');

/**
 * Get random element from array
 * @function getRandomItem
 * @param {Array} An array
 * @returns {Object} The selected item
 * @instance
 */

export const getRandomItem = (arr) => arr[getRandomInteger(0, arr.length)];
