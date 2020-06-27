import * as data from './data.js';

describe('Unit tests data utility functions', () => {

	it('Method getRandomText should be defined and return a text', (done) => {
		expect(data.getRandomText).to.be.a('function');
		expect(data.getRandomText()).to.be.a('string');
		done();
	});

	it('Method getRandomInteger should be defined and return an integer', (done) => {
		expect(data.getRandomInteger).to.be.a('function');
		expect(data.getRandomInteger(1, 10)).to.be.a('number');
		expect(data.getRandomInteger(1, 10)).to.be.within(0, 10);
		done();
	});

	it('Method getRandomID should be defined and return an ID string', (done) => {
		expect(data.getRandomID).to.be.a('function');
		expect(data.getRandomID()).to.be.a('string');
		expect(data.getRandomID()).to.match(/^[a-z]+$/);
		done();
	});

	it('Method getRandomItem should be defined and return an array item', (done) => {
		const length = data.getRandomInteger(1, 10);
		const arr = (new Array(length)).fill(null).map((item, index) => index);
		expect(data.getRandomItem).to.be.a('function');
		expect(data.getRandomItem(arr)).to.be.oneOf(arr);
		done();
	});

});
