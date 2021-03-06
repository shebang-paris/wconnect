const MutationObserver = require('./observer');

/**
 * Default DOM Node interface
 */

class Node {

	constructor() {
		this.nodeName = null;
		this.nodeType = null;
		this.parentNode = null;
		this.ownerDocument = null;
		this.childNodes = [];
		this.data = '';
	}

	get firstChild() {
		return this.childNodes.length ? this.childNodes[0] : null;
	}

	get lastChild() {
		return this.childNodes.length ? this.childNodes[this.childNodes.length - 1] : null;
	}

	get nextSibling() {
		const index = this.parentNode.childNodes.indexOf(this);
		return index !== -1 && index < this.parentNode.childNodes.length - 1 ? this.parentNode.childNodes[index + 1] : null;
	}

	get previousSibling() {
		const index = this.parentNode.childNodes.indexOf(this);
		return index !== -1 && index > 0 ? this.parentNode.childNodes[index - 1] : null;
	}

	getRootNode() {
		let parent = this;
		while (parent.parentNode) {
			parent = parent.parentNode;
		}
		return parent;
	}

	cloneNode(deep) {
		let node;
		if (this.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
			node = this.ownerDocument.createDocumentFragment();
		} else if (this.nodeType === Node.TEXT_NODE) {
			node = this.ownerDocument.createTextNode(this.textContent);
		} else if (this.nodeType === Node.COMMENT_NODE) {
			node = this.ownerDocument.createComment(this.textContent);
		} else if (this.nodeType === Node.ELEMENT_NODE) {
			node = this.ownerDocument.createElement(this.tagName.toLowerCase());
			node.attributes = this.attributes;
		}
		if (deep && this.childNodes.length) {
			this.childNodes.map((child) => child.cloneNode(deep))
				.forEach((child) => node.appendChild(child));
		}
		node.ownerDocument = null;
		return node;
	}

	appendChild(node) {
		if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
			node.childNodes.forEach((subnode) => this.appendChild(subnode));
		} else {
			this.childNodes.push(node);
			Object.assign(node, { parentNode: this, ownerDocument: this.ownerDocument || this });
			MutationObserver.trigger(this, MutationObserver.CHILD, {
				addedNodes: [node],
				previousSibling: this.childNodes[this.childNodes.length - 2] || null,
				nextSibling: null,
			});
		}
		return node;
	}

	insertBefore(node, reference) {
		if (reference.parentNode !== this) throw new Error('The node before which the new node is to be inserted is not a child of this node');
		if (node.parentNode) node.parentNode.removeChild(node);
		const newindex = this.childNodes.indexOf(reference);
		const insert = (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) ? node.childNodes : [node];
		Array.prototype.splice.apply(this.childNodes, [newindex, 0].concat(insert));
		insert.forEach((subnode) => Object.assign(subnode, { parentNode: this }));
		MutationObserver.trigger(this, MutationObserver.CHILD, {
			addedNodes: insert,
			previousSibling: this.childNodes[newindex - 1] || null,
			nextSibling: reference,
		});
		return node;
	}

	removeChild(node) {
		const index = this.childNodes.indexOf(node);
		if (index !== -1) {
			Object.assign(node, { parentNode: null });
			MutationObserver.trigger(this, MutationObserver.CHILD, {
				removedNodes: [node],
				previousSibling: this.childNodes[index - 1] || null,
				nextSibling: this.childNodes[index + 1] || null,
			});
			return this.childNodes.splice(index, 1);
		}
		return null;
	}

}

Node.ELEMENT_NODE = 1;
Node.TEXT_NODE = 3;
Node.COMMENT_NODE = 8;
Node.DOCUMENT_NODE = 9;
Node.DOCUMENT_FRAGMENT_NODE = 11;

module.exports = Node;
