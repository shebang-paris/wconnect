/* eslint-disable max-classes-per-file */

import * as data from '../test/data.js';

import context from './context.js';

import Source from './data.js';

describe('Data module', () => {

	it('Source class should be defined and instances have defined methods and properties', (done) => {
		expect(Source.constructor).to.be.a('function');
		const source = new Source();
		expect(source).to.have.property('loading');
		expect(source.loading).to.be.false;
		expect(source).to.have.property('defer');
		expect(source.defer).to.be.false;
		expect(source).to.respondTo('attachTo');
		expect(source).to.respondTo('getData');
		expect(source).to.respondTo('setData');
		expect(source).to.respondTo('load');
		expect(source).to.respondTo('isLoaded');
		expect(source).to.respondTo('reset');
		done();
	});

	it('Source setData method should set source data and trigger a loaded event', (done) => {
		const { events } = context;
		const source = new Source();
		const obj = { [data.getRandomID()]: data.getRandomID() };
		events.addEventListener(source, 'loaded', () => {
			expect(source.getData()).to.deep.equal(obj);
			expect(source.isLoaded()).to.be.true;
			done();
		});
		source.setData(obj);
	});

	const createElement = () => {
		const { window } = context;
		const is = `test-${data.getRandomID()}`;
		const constructor = class Component extends window.HTMLElement {};
		window.customElements.define(is, constructor, { extends: 'article' });
		return is;
	};

	it('Element attached to a non deferred source should trigger the source loading upon attachment to DOM tree', (done) => {
		const { events, window } = context;
		const { document } = window;
		const is = createElement();
		let loaded = false;
		const element = document.createElement('div', { is });
		events.addEventListener(element, 'sourceloaded', () => {
			expect(loaded).to.be.true;
			element.parentNode.removeChild(element);
			done();
		});
		class LocalSource extends Source {
			load(el) {
				expect(el).to.equal(element);
				loaded = true;
				this.setData({});
			}
		}
		const source = new LocalSource();
		source.attachTo(element);
		expect(loaded).to.be.false;
		document.body.appendChild(element);
	});

	it('Element attached to a deferred source should trigger the source loading when corresponding element\'s event type is triggered', (done) => {
		const { events, window } = context;
		const { document } = window;
		const is = createElement();
		const element = document.createElement('article', { is });
		let loaded = false;
		let initied = false;
		events.addEventListener(element, 'init', () => {
			initied = true;
		});
		events.addEventListener(element, 'sourceloaded', () => {
			expect(loaded).to.be.true;
			element.parentNode.removeChild(element);
			done();
		});
		class LocalSource extends Source {
			constructor() {
				super();
				this.defer = 'init';
			}
			load(el) { // eslint-disable-line class-methods-use-this
				expect(el).to.equal(element);
				loaded = true;
				expect(initied).to.be.true;
				this.setData({});
			}
		}
		const source = new LocalSource();
		source.attachTo(element);
		document.body.appendChild(element);
		expect(loaded).to.be.false;
		events.dispatchEvent(element, 'init');
	});

	it('Element attached to several sources with only one deferred should trigger a data event when each source is loaded', (done) => {
		const { events, window } = context;
		const { document } = window;
		const is = createElement();
		const element = document.createElement('section', { is });
		let initied = false;
		events.addEventListener(element, 'init', () => {
			initied = true;
		});
		// First source with no deferring
		class LocalSource1 extends Source {
			load() {
				this.setData({ source1: true });
			}
		}
		const source1 = new LocalSource1();
		source1.attachTo(element);
		// Second source, deferred until init event
		class LocalSource2 extends Source {
			constructor() {
				super();
				this.defer = 'init';
			}
			load() {
				this.setData({ source2: true });
			}
		}
		const source2 = new LocalSource2();
		source2.attachTo(element);
		// Data event listener
		events.addEventListener(element, 'data', (e) => {
			const { detail } = e;
			expect(source1.isLoaded()).to.be.true;
			if (!source2.isLoaded()) { // Event for source 1
				expect(initied).to.be.false;
				expect(detail).to.have.property('source1');
			} else { // Event for source 2
				expect(initied).to.be.true;
				expect(detail).to.have.property('source2');
				element.parentNode.removeChild(element);
				done();
			}
		});
		document.body.appendChild(element);
		setTimeout(() => events.dispatchEvent(element, 'init'), data.getRandomInteger(50, 100));
	});

	it('Element attached to several sources deferred to the same event should trigger a single data event when these sources are loaded', (done) => {
		const { events, window } = context;
		const { document } = window;
		const is = createElement();
		const element = document.createElement('span', { is });
		// First source, deferred until init event, with short loading
		class LocalSource1 extends Source {
			constructor() {
				super();
				this.defer = 'init';
			}
			load() {
				setTimeout(() => this.setData({ key1: true }), 0);
			}
		}
		const source1 = new LocalSource1();
		source1.attachTo(element);
		// Second source, deferred until init event, with long loading
		class LocalSource2 extends Source {
			constructor() {
				super();
				this.defer = 'init';
			}
			load() {
				setTimeout(() => this.setData({ key2: true }), data.getRandomInteger(50, 100));
			}
		}
		const source2 = new LocalSource2();
		source2.attachTo(element);
		// Data event listener
		events.addEventListener(element, 'data', (e) => {
			expect(source1.isLoaded()).to.be.true;
			expect(source2.isLoaded()).to.be.true;
			const { detail } = e;
			expect(detail).to.have.property('key1');
			expect(detail).to.have.property('key2');
			element.parentNode.removeChild(element);
			done();
		});
		document.body.appendChild(element);
		setTimeout(() => events.dispatchEvent(element, 'init'), data.getRandomInteger(50, 100));
	});

	it('Source attached to component should be attached to all component instances', (done) => {
		const { events, window } = context;
		const { document } = window;
		// Create component and instances
		const is = createElement();
		const elements = [];
		const nb = data.getRandomInteger(5, 10);
		for (let i = 0; i < nb; i += 1) {
			const element = document.createElement('article', { is });
			elements.push(element);
		}
		// Create source
		class LocalSource extends Source {
			load() { // eslint-disable-line class-methods-use-this
				this.setData({});
			}
		}
		const source = new LocalSource();
		source.attachTo(window.customElements.get(is));
		// Source event listener
		let loaded = 0;
		elements.forEach((element) => {
			events.addEventListener(element, 'sourceloaded', (e) => {
				const { target } = e;
				expect(elements.includes(target)).to.be.true;
				element.parentNode.removeChild(element);
				loaded += 1;
				if (loaded === nb) done();
			});
			document.body.appendChild(element);
		});
	});

});
