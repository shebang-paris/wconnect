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

	appendChild(node) {
		this.childNodes.push(node);
		Object.assign(node, { parentNode: this });
		return node;
	}

	insertBefore(node, reference) {
		if (reference.parentNode !== this) throw new Error('The node before which the new node is to be inserted is not a child of this node');
		const index = (node.parentNode && node.parentNode.childNodes.indexOf(node)) || -1;
		if (index !== -1) node.parentNode.childNodes.splice(index, 1);
		const newindex = this.childNodes.indexOf(reference);
		this.childNodes.splice(newindex, 0, node);
		Object.assign(node, { parentNode: this });
		return node;
	}

	removeChild(node) {
		const index = this.childNodes.indexOf(node);
		if (index !== -1) {
			Object.assign(node, { parentNode: null });
			return this.childNodes.splice(index, 1);
		}
		return null;
	}

}

Node.ELEMENT_NODE = 1;
Node.TEXT_NODE = 3;
Node.COMMENT_NODE = 8;

module.exports = Node;
