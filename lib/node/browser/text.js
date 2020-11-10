/* eslint-disable max-classes-per-file */
const Node = require('./node');
const MutationObserver = require('./observer');

/**
 * Default Text interface
 */

class Text extends Node {

	constructor(data) {
		super();
		this.nodeName = '#text';
		this.nodeType = Node.TEXT_NODE;
		this.data = data;
	}

	get textContent() {
		return this.data;
	}

	set textContent(data) {
		const oldValue = this.data;
		this.data = data;
		MutationObserver.trigger(this, MutationObserver.CONTENT, { oldValue });
	}

	get nodeValue() {
		return this.textContent;
	}

	set nodeValue(data) {
		this.textContent = data;
	}

	toString() {
		return this.textContent;
	}

}

module.exports = Text;
