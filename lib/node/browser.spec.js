/* eslint-disable max-classes-per-file */

import * as data from '../test/data.js';

import context from './context.js';

describe('Minimal DOM implementation module', () => {

	it('Window object should be defined', (done) => {
		const { window } = context;
		expect(window).to.be.an('object');
		done();
	});

	it('Custom elements registry should be defined', (done) => {
		const { window } = context;
		expect(window.customElements).to.be.an('object');
		expect(window.customElements).to.respondTo('define');
		expect(window.customElements).to.respondTo('get');
		const name = `test-${data.getRandomID()}`;
		const constructor = class Component {};
		window.customElements.define(name, constructor);
		expect(window.customElements.get(name)).to.equal(constructor);
		done();
	});

	it('Custom elements registry whenDefined method return a Promise and resolve when element is defined', async () => {
		const { window } = context;
		expect(window.customElements).to.respondTo('whenDefined');
		const name = `test-${data.getRandomID()}`;
		expect(window.customElements.get(name)).to.be.undefined;
		const constructor = class Component {};
		const defined = window.customElements.whenDefined(name);
		expect(defined).to.be.instanceOf(Promise);
		window.customElements.define(name, constructor);
		await expect(defined).to.be.fulfilled;
		await expect(defined).to.eventually.be.undefined;
		const alreadyDefined = window.customElements.whenDefined(name);
		await expect(alreadyDefined).to.be.fulfilled;
	});

	it('Node, HTMLElement and inheriting interfaces should be defined', (done) => {
		const { window } = context;
		expect(window.Node).to.be.an('function');
		expect(window.HTMLElement).to.be.an('function');
		expect(window.HTMLUnknownElement).to.be.an('function');
		expect(window.HTMLAnchorElement).to.be.an('function');
		expect(() => new window.HTMLElement()).not.to.throw;
		expect(new window.HTMLElement()).to.be.instanceof(window.Node);
		expect(new window.HTMLUnknownElement()).to.be.instanceof(window.HTMLElement);
		expect(new window.HTMLAnchorElement()).to.be.instanceof(window.HTMLElement);
		done();
	});

	it('Document object should be defined with expected properties and methods ', (done) => {
		const { window } = context;
		const { document } = window;
		expect(document).to.be.instanceOf(Object);
		// Base element
		expect(document).to.respondTo('createElement');
		const element = document.createElement('a');
		expect(element).to.be.instanceof(window.HTMLElement);
		expect(element).to.be.instanceof(window.HTMLAnchorElement);
		expect(element.ownerDocument).to.equal(document);
		expect(element.nodeName).to.equal('a');
		// Custom element
		const name = `test-${data.getRandomID()}`;
		const constructor = class Component {};
		window.customElements.define(name, constructor);
		const custom = document.createElement(name);
		expect(custom).to.be.instanceof(constructor);
		// Default properties
		expect(document.defaultView).to.equal(window);
		expect(document.documentElement).to.be.instanceof(window.HTMLHtmlElement);
		done();
	});

	it('Element should implement DOM Node interface', (done) => {
		const { window } = context;
		const { document } = window;
		const element = document.createElement('div');
		const first = document.createElement('div');
		const second = document.createElement('div');
		expect(element.childNodes).not.to.be.undefined;
		expect(element.childNodes.length).to.equal(0);
		expect(element.parentNode).to.be.null;
		document.body.appendChild(element);
		expect(element.parentNode).to.equal(document.body);
		element.appendChild(first);
		expect(element.firstChild).to.equal(first);
		expect(element.lastChild).to.equal(first);
		expect(first.parentNode).to.equal(element);
		expect(first.nextSibling).to.be.null;
		expect(first.previousSibling).to.be.null;
		element.appendChild(second);
		expect(first.nextSibling).to.equal(second);
		expect(second.previousSibling).to.equal(first);
		element.insertBefore(second, first);
		expect(second.nextSibling).to.equal(first);
		expect(first.previousSibling).to.equal(second);
		element.removeChild(second);
		done();
	});

	it('Element should have attributes related methods', (done) => {
		const { window } = context;
		const { document } = window;
		const element = document.createElement('div');
		const name = data.getRandomID();
		const value = data.getRandomText();
		expect(element.hasAttributes()).to.be.false;
		expect(element.hasAttribute(name)).to.be.false;
		expect(element.getAttribute(name)).to.be.null;
		element.setAttribute(name, value);
		expect(element.hasAttributes()).to.be.true;
		expect(element.hasAttribute(name)).to.be.true;
		expect(element.getAttribute(name)).to.equal(value);
		element.removeAttribute(name);
		expect(element.hasAttributes()).to.be.false;
		expect(element.hasAttribute(name)).to.be.false;
		done();
	});

	it('Element should have dataset property synchronized with data-* attributes', (done) => {
		const { window } = context;
		const { document } = window;
		const element = document.createElement('div');
		const name = data.getRandomID();
		const dataName = `data-${name}`;
		const value = data.getRandomText();
		expect(element.dataset).to.be.instanceof(Object);
		expect(element.dataset[name]).to.be.undefined;
		element.dataset[name] = value;
		expect(element.hasAttribute(dataName)).to.be.true;
		expect(element.getAttribute(dataName)).to.equal(value);
		delete element.dataset[name];
		expect(element.hasAttribute(dataName)).to.be.false;
		element.setAttribute(dataName, value);
		expect(element.dataset[name]).to.equal(value);
		element.removeAttribute(dataName);
		expect(element.dataset[name]).to.be.undefined;
		done();
	});

});
