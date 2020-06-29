import * as data from '../test/data.js';
import * as events from './events.js';

describe('Objects events listeners', () => {

	it('Event listener attached to object should be triggered when corresponding event is dispatched', (done) => {
		const obj = {};
		const eventName = data.getRandomID();
		const eventData = { key: data.getRandomID() };
		events.addEventListener(obj, eventName, (e) => {
			expect(e.detail).to.deep.equal(eventData);
			done();
		});
		events.dispatchEvent(obj, eventName, eventData);
	});

	it('Event listener attached to object with once flag should be triggered only once when corresponding event is dispatched', (done) => {
		const obj = {};
		const eventName = data.getRandomID();
		const eventData = { key: data.getRandomID() };
		let index = 0;
		setTimeout(() => {
			expect(index).to.equal(1);
			done();
		}, 0);
		events.addEventListener(obj, eventName, () => {
			index += 1;
		}, { once: true });
		events.dispatchEvent(obj, eventName, eventData);
		events.dispatchEvent(obj, eventName, eventData);
	});

	it('Event listener can be detached from obj and should not be triggered', (done) => {
		const obj = {};
		const eventName = data.getRandomID();
		const listener = spy();
		events.addEventListener(obj, eventName, listener);
		events.removeEventListener(obj, eventName);
		events.dispatchEvent(obj, eventName);
		expect(listener).to.not.have.been.called();
		done();
	});

	it('Several event listeners can be attached to an object for the same event', (done) => {
		const obj = {};
		const eventName = data.getRandomID();
		const eventData = { key: data.getRandomID() };
		let index = 1;
		events.addEventListener(obj, eventName, () => {
			expect(index).to.equal(1);
			index += 1;
		});
		events.addEventListener(obj, eventName, () => {
			expect(index).to.equal(2);
			events.removeEventListener(obj);
			done();
		});
		events.dispatchEvent(obj, eventName, eventData);
	});

	it('All event listeners can be detached from obj and should not be triggered', (done) => {
		const obj = {};
		const eventName = data.getRandomID();
		const eventOtherName = data.getRandomID();
		const listener = spy();
		events.addEventListener(obj, eventName, listener);
		const otherListener = spy();
		events.addEventListener(obj, eventOtherName, otherListener);
		events.removeEventListener(obj);
		events.dispatchEvent(obj, eventName);
		expect(listener).to.not.have.been.called();
		events.dispatchEvent(obj, eventOtherName);
		expect(otherListener).to.not.have.been.called();
		done();
	});

});
