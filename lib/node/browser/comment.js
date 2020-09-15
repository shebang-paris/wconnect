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

	toString() {
		return `<!--${this.data}-->`;
	}

}

module.exports = Comment;
