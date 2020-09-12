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

	it('HTMLElement interface should be defined', (done) => {
		const { window } = context;
		expect(window.HTMLElement).to.be.an('function');
		expect(window.HTMLUnknownElement).to.be.an('function');
		expect(window.HTMLAnchorElement).to.be.an('function');
		expect(() => new window.HTMLElement()).not.to.throw;
		expect(new window.HTMLUnknownElement()).to.be.instanceof(window.HTMLElement);
		expect(new window.HTMLAnchorElement()).to.be.instanceof(window.HTMLElement);
		done();
	});

});