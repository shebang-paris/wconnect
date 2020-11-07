/* eslint-disable max-classes-per-file */
const Node = require('./node');

/**
 * Default Comment interface
 */

class Comment extends Node {

	constructor(data) {
		super();
		this.nodeName = '#comment';
		this.nodeType = Node.COMMENT_NODE;
		this.data = data;
	}

	get textContent() {
		return this.data;
	}

	set textContent(data) {
		this.data = data;
	}

	get nodeValue() {
		return this.textContent;
	}

	set nodeValue(data) {
		this.textContent = data;
	}

	toString() {
		return `<!--${this.textContent}-->`;
	}

}

module.exports = Comment;
