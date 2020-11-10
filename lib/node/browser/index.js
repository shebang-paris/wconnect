const { Element, interfaces } = require('./element');
const Node = require('./node');
const Document = require('./document');
const MutationObserver = require('./observer');
require('./template');

/**
 * Default window interface
 */

const window = {};

/**
 * Custom elements registry
 */

const customElements = {};

const CustomElementRegistry = {
	define: (name, constructor, options) => {
		if (options && options.extends) {
			const parent = Object.keys(interfaces)
				.reduce((found, classname) => (interfaces[classname].tagNames.indexOf(options.extends) !== -1 ? interfaces[classname] : found), interfaces.HTMLUnknownElement);
			if (!(new constructor() instanceof parent)) throw new TypeError('Illegal constructor: localName does not match the HTML element interface');
		}
		if (customElements[name] instanceof Function) customElements[name]();
		const attributes = constructor.prototype.attributeChangedCallback ? constructor.observedAttributes : [];
		customElements[name] = { constructor, options, attributes };
	},
	get: (name) => customElements[name] && customElements[name].constructor,
	upgrade: () => {
		// TODO
	},
	whenDefined: (name) => {
		if (customElements[name]) return Promise.resolve();
		return new Promise((resolve) => {
			customElements[name] = resolve;
		});
	},
};

window.customElements = CustomElementRegistry;

/**
 * Nodes
 */

window.Node = Node;
window.Element = Element;
window.Document = Document;

/**
 * Document
 */

const document = new Document();
document.defaultView = window;
window.document = document;

/**
 * Observers
 */

window.MutationObserver = MutationObserver;

/**
 * Interfaces
 */

Object.keys(interfaces).forEach((name) => {
	window[name] = interfaces[name];
});

module.exports = { window };
