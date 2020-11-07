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
		const { document, Node } = window;
		expect(document).to.be.instanceOf(Object);
		// Default properties
		expect(document.nodeName).to.equal('#document');
		expect(document.nodeType).to.equal(Node.DOCUMENT_NODE);
		expect(document.documentElement).to.be.instanceof(window.HTMLHtmlElement);
		expect(document.head).to.be.instanceof(window.HTMLHeadElement);
		expect(document.body).to.be.instanceof(window.HTMLBodyElement);
		// Base element
		expect(document).to.respondTo('createElement');
		const element = document.createElement('a');
		expect(element).to.be.instanceof(window.HTMLElement);
		expect(element).to.be.instanceof(window.HTMLAnchorElement);
		expect(element.ownerDocument).to.equal(document);
		expect(element.tagName).to.equal('A');
		expect(element.nodeName).to.equal(element.tagName);
		expect(element.nodeType).to.equal(Node.ELEMENT_NODE);
		// Custom element
		const name = `test-${data.getRandomID()}`;
		const constructor = class Component {};
		window.customElements.define(name, constructor);
		const custom = document.createElement(name);
		expect(custom).to.be.instanceof(constructor);
		// Custom built-in element
		const is = `test-${data.getRandomID()}`;
		expect(window.customElements.define.bind(is, constructor, { extends: 'div' })).to.throw();
		const extended = class Component extends window.HTMLDivElement {};
		window.customElements.define(is, extended, { extends: 'div' });
		const mismatch = document.createElement('article', { is });
		expect(mismatch).not.to.be.instanceof(extended);
		const builtin = document.createElement('div', { is });
		expect(builtin).to.be.instanceof(extended);
		expect(builtin.getAttribute('is')).to.equal(is);
		// Text node
		expect(document).to.respondTo('createTextNode');
		const textData = data.getRandomID();
		const text = document.createTextNode(textData);
		expect(text.nodeName).to.equal('#text');
		expect(text.nodeType).to.equal(Node.TEXT_NODE);
		expect(text.toString()).to.equal(textData);
		// Comment node
		expect(document).to.respondTo('createComment');
		const commentData = data.getRandomID();
		const comment = document.createComment(commentData);
		expect(comment.nodeName).to.equal('#comment');
		expect(comment.nodeType).to.equal(Node.COMMENT_NODE);
		expect(comment.toString()).to.equal(`<!--${commentData}-->`);
		// Import
		expect(document).to.respondTo('importNode');
		const other = new window.Document();
		const external = other.createElement('div');
		const child = other.createElement('div');
		external.appendChild(child);
		expect(external.ownerDocument).to.equal(other);
		expect(child.ownerDocument).to.equal(other);
		const imported = document.importNode(external, true);
		expect(imported).not.to.equal(external);
		expect(imported.parentNode).to.be.null;
		expect(imported.ownerDocument).to.equal(document);
		expect(imported.firstChild.ownerDocument).to.equal(document);
		done();
	});

	it('Custom element lifecycle hooks should be called appropriately', (done) => {
		const { window } = context;
		const { document } = window;
		const name = `test-${data.getRandomID()}`;
		const observedAttributes = spy();
		const observedAttribute = 'id';
		/* eslint-disable class-methods-use-this,lines-between-class-members */
		const constructor = class Component extends window.HTMLElement {
			adoptedCallback() {}
			connectedCallback() {}
			disconnectedCallback() {}
			static get observedAttributes() {
				observedAttributes();
				return [observedAttribute];
			}
			attributeChangedCallback() {}
		};
		/* eslint-enable class-methods-use-this,lines-between-class-members */
		const adoptedCallback = spy.on(constructor.prototype, 'adoptedCallback');
		const connectedCallback = spy.on(constructor.prototype, 'connectedCallback');
		const disconnectedCallback = spy.on(constructor.prototype, 'disconnectedCallback');
		const attributeChangedCallback = spy.on(constructor.prototype, 'attributeChangedCallback');
		window.customElements.define(name, constructor);
		expect(connectedCallback).not.to.be.have.been.called();
		expect(observedAttributes).to.be.have.been.called();
		const custom = document.createElement(name);
		expect(custom).to.be.instanceof(constructor);
		document.body.appendChild(custom);
		expect(connectedCallback).to.be.have.been.called();
		expect(disconnectedCallback).not.to.be.have.been.called();
		document.body.removeChild(custom);
		expect(disconnectedCallback).to.be.have.been.called();
		expect(attributeChangedCallback).not.to.be.have.been.called();
		const otherAttribute = data.getRandomID();
		const firstValue = data.getRandomID();
		const secondValue = data.getRandomID();
		custom.setAttribute(observedAttribute, firstValue);
		expect(attributeChangedCallback).to.be.have.been.called.with.exactly(observedAttribute, null, firstValue);
		custom.setAttribute(otherAttribute, firstValue);
		expect(attributeChangedCallback).to.be.have.been.called.once;
		custom.setAttribute(observedAttribute, secondValue);
		expect(attributeChangedCallback).to.be.have.been.nth(2).called.with.exactly(observedAttribute, firstValue, secondValue);
		const other = new window.Document();
		expect(adoptedCallback).not.to.be.have.been.called();
		other.body.appendChild(custom);
		expect(adoptedCallback).to.be.have.been.called.with(document, other);
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

	it('Element innerHTML setter should parse given string and create child nodes', (done) => {
		const { window } = context;
		const { document } = window;
		const element = document.createElement('div');
		const text = 'This is a text';
		const comment = 'This is a comment';
		const attributeName = 'attribute';
		const attributeValue = 'value';
		const subnode = 'This is a title';
		const innerHTML = `${text}<!--${comment}--> <span ${attributeName}="${attributeValue}">${subnode}</span><br/>`;
		element.innerHTML = innerHTML;
		expect(element.childNodes.length).to.equal(5);
		expect(element.childNodes[0].nodeType).to.equal(window.Node.TEXT_NODE);
		expect(element.childNodes[0].toString()).to.equal(text);
		expect(element.childNodes[1].toString()).to.equal(`<!--${comment}-->`);
		expect(element.childNodes[2].toString()).to.equal(' ');
		expect(element.childNodes[3].tagName.toLowerCase()).to.equal('span');
		expect(element.childNodes[3].hasAttribute(attributeName)).to.be.true;
		expect(element.childNodes[3].getAttribute(attributeName)).to.equal(attributeValue);
		expect(element.childNodes[4].tagName.toLowerCase()).to.equal('br');
		expect(element.innerHTML).to.equal(innerHTML);
		done();
	});

	it('Element innerText should set and return element viewable text content', (done) => {
		const { window } = context;
		const { document } = window;
		const element = document.createElement('div');
		const text = 'This is a text';
		const comment = 'This is a comment';
		const text2 = 'This is another text';
		element.innerText = text;
		expect(element.childNodes.length).to.equal(1);
		expect(element.childNodes[0].nodeType).to.equal(window.Node.TEXT_NODE);
		expect(element.childNodes[0].textContent).to.equal(text);
		expect(element.innerText).to.equal(text);
		element.innerHTML = `${text}<!--${comment}--><br/>${text2}`;
		expect(element.innerText).to.equal(`${text}\n${text2}`);
		element.innerText = '';
		expect(element.childNodes.length).to.equal(0);
		done();
	});

	it('HTMLTemplate interface should be defined with expected properties and methods ', (done) => {
		const { window } = context;
		const { document, Node } = window;
		const template = document.createElement('template');
		expect(template.content.nodeName).to.equal('#document-fragment');
		expect(template.content.nodeType).to.equal(Node.DOCUMENT_FRAGMENT_NODE);
		expect(template.content.ownerDocument).to.not.equal(document);
		const value = data.getRandomText();
		template.innerHTML = value;
		expect(template.content.innerHTML).to.equal(value);
		done();
	});

	it('Tree walker should be defined and have required methods', (done) => {
		const { window } = context;
		const { document } = window;
		const root = document.createElement('div');
		const element1 = document.createElement('div');
		const element2 = document.createElement('div');
		const element1a = document.createElement('div');
		const element1b = document.createElement('div');
		const element1c = document.createElement('div');
		const element2a = document.createElement('div');
		element1.appendChild(element1a);
		element1.appendChild(element1b);
		element1.appendChild(element1c);
		element2.appendChild(element2a);
		root.appendChild(element1);
		root.appendChild(element2);
		expect(document).to.respondTo('createTreeWalker');
		const walker = document.createTreeWalker(root);
		expect(walker.currentNode).to.equal(root);
		expect(walker.nextNode()).to.equal(element1);
		expect(walker.nextSibling()).to.equal(element2);
		expect(walker.previousSibling()).to.equal(element1);
		expect(walker.parentNode()).to.equal(root);
		expect(walker.firstChild()).to.equal(element1);
		expect(walker.parentNode()).to.equal(root);
		expect(walker.lastChild()).to.equal(element2);
		expect(walker.nextNode()).to.equal(element2a);
		expect(walker.nextNode()).to.be.null;
		expect(walker.previousNode()).to.equal(element2);
		expect(walker.previousNode()).to.equal(element1c);
		expect(walker.previousNode()).to.equal(element1b);
		expect(walker.previousNode()).to.equal(element1a);
		expect(walker.previousNode()).to.equal(element1);
		expect(walker.previousNode()).to.equal(root);
		done();
	});

});
