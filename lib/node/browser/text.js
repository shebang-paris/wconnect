/* eslint-disable max-classes-per-file */
const Node = require('./node');

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

	toString() {
		return this.data;
	}

}

module.exports = Text;
