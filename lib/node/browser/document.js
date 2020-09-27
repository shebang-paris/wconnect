/* eslint-disable max-classes-per-file */
const Node = require('./node');
const Text = require('./text');
const Comment = require('./comment');
const TreeWalker = require('./walker');
const { Element, interfaces } = require('./element');

/**
 * DocumentFragment interface
 */

class DocumentFragment extends Node {

	get innerHTML() {
		return this.childNodes.map((child) => `${child}`).join('');
	}

	set innerHTML(html) {
		const element = new Element();
		element.ownerDocument = this.ownerDocument;
		element.innerHTML = html;
		element.childNodes.forEach((child) => this.appendChild(child));
	}

}

/**
 * Document interface
 */

class Document extends Node {

	constructor() {
		super();
		this.nodeName = '#document';
		this.nodeType = Node.DOCUMENT_NODE;
		this.documentElement = this.appendChild(this.createElement('html'));
		this.head = this.documentElement.appendChild(this.createElement('head'));
		this.body = this.documentElement.appendChild(this.createElement('body'));
	}

	createElement(tagName) {
		const constructor = (this.defaultView && this.defaultView.customElements.get(tagName)) || Object.keys(interfaces)
			.reduce((found, name) => (interfaces[name].tagNames.indexOf(tagName) !== -1 ? interfaces[name] : found), interfaces.HTMLUnknownElement);
		const element = new Proxy(new constructor(), {
			set: (obj, name, value) => {
				const previous = obj[name];
				Object.assign(obj, { [name]: value });
				if (name === 'ownerDocument') {
					if (obj.childNodes) obj.childNodes.forEach((child) => Object.assign(child, { [name]: value }));
				}
				return true;
			},
		});
		element.tagName = tagName.toUpperCase();
		element.nodeName = element.tagName;
		element.localName = tagName.toLowerCase();
		element.ownerDocument = this;
		return element;
	}

	createTextNode(data) {
		const text = new Text(data);
		text.ownerDocument = this;
		return text;
	}

	createComment(data) {
		const comment = new Comment(data);
		comment.ownerDocument = this;
		return comment;
	}

	createTreeWalker(root) { // eslint-disable-line class-methods-use-this
		return new TreeWalker(root);
	}

	createDocumentFragment() {
		const fragment = new DocumentFragment();
		fragment.nodeName = '#document-fragment';
		fragment.nodeType = Node.DOCUMENT_FRAGMENT_NODE;
		fragment.ownerDocument = this;
		return fragment;
	}

	get outerHTML() {
		return this.innerHTML;
	}

	importNode(node, deep) {
		const newNode = node.cloneNode(deep);
		newNode.ownerDocument = this;
		newNode.parentNode = null;
		return newNode;
	}

	static get tagNames() {
		return ['document'];
	}

}
interfaces.Document = Document;

module.exports = Document;
