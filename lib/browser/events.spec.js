import * as events from './events.js';
import * as data from '../test/data.js';

describe('DOM events listeners', () => {

	it('Event listener attached to DOM element should be triggered when corresponding event is dispatched', (done) => {
		expect(events).to.respondTo('addEventListener');
		const element = document.createElement('a');
		events.addEventListener(element, 'click', () => {
			done();
		});
		element.click();
	});

	it('Event listener attached to DOM element with capture flag should be triggered first when corresponding event is dispatched', (done) => {
		const element = document.createElement('a');
		document.body.appendChild(element);
		let capture = false;
		events.addEventListener(element, 'click', () => {
			expect(capture).to.be.true;
			document.body.removeChild(element);
			done();
		});
		events.addEventListener(document, 'click', () => {
			capture = true;
		}, true);
		element.click();
	});

	it('Event listener attached to DOM element with configuration capture flag should be triggered first when corresponding event is dispatched', (done) => {
		const element = document.createElement('a');
		document.body.appendChild(element);
		let capture = false;
		events.addEventListener(element, 'click', () => {
			expect(capture).to.be.true;
			document.body.removeChild(element);
			done();
		});
		events.addEventListener(document, 'click', () => {
			capture = true;
		}, { capture: true });
		element.click();
	});

	it('Event listener attached to DOM element with configuration once flag should be triggered once when corresponding event is dispatched', (done) => {
		const element = document.createElement('a');
		document.body.appendChild(element);
		let index = 0;
		window.requestAnimationFrame(() => {
			expect(index).to.equal(1);
			document.body.removeChild(element);
			done();
		});
		events.addEventListener(element, 'click', () => {
			index += 1;
		}, { once: true });
		element.click();
		element.click();
	});

	it('Specific event listener can be detached from DOM element and should not be triggered when corresponding event is dispatched', (done) => {
		expect(events).to.respondTo('removeEventListener');
		const element = document.createElement('a');
		const onClick = spy();
		events.addEventListener(element, 'click', onClick);
		events.removeEventListener(element, 'click', onClick);
		element.click();
		expect(onClick).to.not.have.been.called();
		done();
	});

	it('Specific event listener with capture flag can be detached from DOM element and should not be triggered when corresponding event is dispatched', (done) => {
		expect(events).to.respondTo('removeEventListener');
		const element = document.createElement('a');
		document.body.appendChild(element);
		const onClick = spy();
		events.addEventListener(document, 'click', onClick, true);
		events.removeEventListener(document, 'click', onClick);
		document.dispatchEvent(new Event('click'));
		expect(onClick).to.not.have.been.called();
		document.body.removeChild(element);
		done();
	});

	it('All event listeners for a specific event can be detached from DOM element and should not be triggered', (done) => {
		expect(events).to.respondTo('removeEventListener');
		const element = document.createElement('a');
		const onClick1 = spy();
		const onClick2 = spy();
		events.addEventListener(element, 'click', onClick1);
		events.addEventListener(element, 'click', onClick2);
		events.removeEventListener(element, 'click');
		element.click();
		expect(onClick1).to.not.have.been.called();
		expect(onClick2).to.not.have.been.called();
		done();
	});

	it('All event listeners can be detached from DOM element and should not be triggered', (done) => {
		expect(events).to.respondTo('removeEventListener');
		const element = document.createElement('a');
		const onClick = spy();
		events.addEventListener(element, 'click', onClick);
		events.addEventListener(element, 'focus', onClick);
		events.removeEventListener(element);
		element.click();
		element.focus();
		expect(onClick).to.not.have.been.called();
		done();
	});

	it('Several event listeners can be attached to a DOM element for the same event', (done) => {
		const element = document.createElement('a');
		let index = 1;
		events.addEventListener(element, 'click', () => {
			expect(index).to.equal(1);
			index += 1;
		});
		events.addEventListener(element, 'click', () => {
			expect(index).to.equal(2);
			events.removeEventListener(element);
			done();
		});
		element.click();
	});

	it('Event dispatched by DOM element should be a CustomEvent and event listener should be called', (done) => {
		expect(events).to.respondTo('dispatchEvent');
		const element = document.createElement('div');
		const eventName = data.getRandomID();
		const eventData = { key: data.getRandomID() };
		document.body.appendChild(element);
		events.addEventListener(element, eventName, (event) => {
			expect(event).to.be.instanceof(CustomEvent);
			expect(event.type).to.equal(eventName);
			expect(event.target).to.equal(element);
			expect(event.detail).to.deep.equal(eventData);
			element.parentNode.removeChild(element);
			events.removeEventListener(element);
			done();
		});
		events.dispatchEvent(element, eventName, eventData);
	});

	it('Bubbling event dispatched by DOM element should propagate to parent', (done) => {
		const container = document.createElement('div');
		const element = document.createElement('div');
		container.appendChild(element);
		document.body.appendChild(container);
		const eventName = data.getRandomID();
		const eventData = { key: data.getRandomID() };
		const eventBubbleName = data.getRandomID();
		const eventBubbleData = { key: data.getRandomID() };
		let index = 1;
		events.addEventListener(element, eventName, () => {
			index += 1;
		});
		events.addEventListener(element, eventBubbleName, () => {
			index += 1;
		});
		events.addEventListener(container, eventBubbleName, (event) => {
			expect(event).to.be.instanceof(CustomEvent);
			expect(event.type).to.equal(eventBubbleName);
			expect(event.target).to.equal(element);
			expect(event.detail).to.deep.equal(eventBubbleData);
			expect(index).to.equal(3);
			container.parentNode.removeChild(container);
			events.removeEventListener(element);
			events.removeEventListener(container);
			done();
		});
		events.dispatchEvent(element, eventName, eventData);
		events.dispatchEvent(element, eventBubbleName, eventBubbleData, true);
	});

	it('Cancelable event dispatched by DOM element can be cancel', (done) => {
		const container = document.createElement('div');
		const element = document.createElement('div');
		container.appendChild(element);
		document.body.appendChild(container);
		const eventName = data.getRandomID();
		const eventData = { key: data.getRandomID() };
		const listener = spy();
		events.addEventListener(container, eventName, listener);
		events.addEventListener(element, eventName, (event) => {
			event.stopPropagation();
			window.setTimeout(() => {
				expect(listener).to.not.have.been.called();
				container.parentNode.removeChild(container);
				events.removeEventListener(element);
				events.removeEventListener(container);
				done();
			});
		});
		events.dispatchEvent(element, eventName, eventData, true);
	});

	it('Passive event listener call to preventDefault is inoperative', (done) => {
		const element = document.createElement('div');
		document.body.appendChild(element);
		const eventName = data.getRandomID();
		const eventData = { key: data.getRandomID() };
		events.addEventListener(element, eventName, (event) => {
			event.preventDefault(); // Should be inoperative
			expect(event.defaultPrevented).to.be.false;
		}, { passive: true });
		events.addEventListener(element, eventName, (event) => {
			event.preventDefault();
			expect(event.defaultPrevented).to.be.true;
		}, { passive: false });
		events.addEventListener(element, eventName, (event) => {
			expect(event.defaultPrevented).to.be.true;
			element.parentNode.removeChild(element);
			events.removeEventListener(element);
			done();
		});
		events.dispatchEvent(element, eventName, eventData, false, true);
	});

	it('Registered event listeners for the same event and target should be called according to associated elements hierarchy and order', (done) => {
		const element = document.createElement('div');
		const adjacent = document.createElement('div');
		const subelement = document.createElement('div');
		element.appendChild(subelement);
		document.body.appendChild(element);
		document.body.appendChild(adjacent);
		const eventName = data.getRandomID();
		const eventData = { key: data.getRandomID() };
		let index = 0;
		events.addEventListener(window, eventName, events.register(subelement, eventName, () => {
			expect(index).to.equal(1);
			index += 1;
		}));
		events.addEventListener(window, eventName, events.register(adjacent, eventName, () => {
			expect(index).to.equal(2);
			events.removeEventListener(window);
			element.parentNode.removeChild(element);
			adjacent.parentNode.removeChild(adjacent);
			done();
		}));
		events.addEventListener(window, eventName, events.register(element, eventName, () => {
			expect(index).to.equal(0);
			index += 1;
		}));
		events.dispatchEvent(window, eventName, eventData);
	});

});
