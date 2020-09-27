const { Element, interfaces } = require('./element');
const Node = require('./node');
const Document = require('./document');
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
		if (customElements[name] instanceof Function) customElements[name]();
		customElements[name] = { constructor, options };
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
 * Interfaces
 */

Object.keys(interfaces).forEach((name) => {
	window[name] = interfaces[name];
});

module.exports = { window };
