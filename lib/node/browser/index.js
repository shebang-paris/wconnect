const interfaces = require('./element');
const Node = require('./node');
const Text = require('./text');
const Comment = require('./comment');
const TreeWalker = require('./walker');

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
 * Document
 */

const document = new Node();
document.defaultView = window;
window.document = document;

/**
 * Nodes
 */

window.Node = Node;

/**
 * New element creation
 * @function createElement
 * @param {String} tagName A string representing the event type to remove
 * @param {Object} [options] Options object
 * @returns {HTMLElement} The new created element
 */

const createElement = (tagName, options) => {
	const constructor = CustomElementRegistry.get(tagName) || Object.keys(interfaces)
		.reduce((found, name) => (interfaces[name].tagNames.indexOf(tagName) !== -1 ? interfaces[name] : found), interfaces.HTMLUnknownElement);
	const element = new constructor();
	element.tagName = tagName.toUpperCase();
	element.nodeName = element.tagName;
	element.ownerDocument = document;
	return element;
};

document.createElement = createElement;
document.documentElement = createElement('html');
document.head = document.documentElement.appendChild(createElement('head'));
document.body = document.documentElement.appendChild(createElement('body'));

/**
 * New text creation
 * @function createTextNode
 * @param {String} data The text data
 * @returns {Text} The created text node
 */

document.createTextNode = (data) => new Text(data);

/**
 * New comment creation
 * @function createComment
 * @param {String} data The comment data
 * @returns {Comment} The created comment node
 */

document.createComment = (data) => new Comment(data);

document.createTreeWalker = (root) => new TreeWalker(root);

Object.keys(interfaces).forEach((name) => {
	window[name] = interfaces[name];
});

module.exports = { window };
