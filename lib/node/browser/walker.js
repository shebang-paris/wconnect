const Node = require('./node');

/**
 * Move tree walker currentNode to target if exists
 * @function walk
 * @param {Object} walker The TreeWalker object
 * @param {Function} iterator The iterator function to walk into tree
 * @returns {Node|null} The new currentNode or null
 * @private
 */

const walk = (walker, iterator) => {
	const target = iterator(walker, walker.currentNode);
	if (target) {
		Object.assign(walker, { currentNode: target });
		return walker.currentNode;
	}
	return null;
};

/**
 * Get parentNode first candidate if any
 * @function getParentNode
 * @param {Object} walker The TreeWalker object
 * @param {Node} node The start Node
 * @returns {Node|null} A eligible node if any or null
 * @private
 */

const getParentNode = (walker, node) => (walker.filter(node.parentNode) && node.parentNode)
	|| (node !== walker.root && getParentNode(walker, node.parentNode));

/**
 * Get firstChild first candidate if any
 * @function getFirstChild
 * @param {Object} walker The TreeWalker object
 * @param {Node} node The start Node
 * @param {Number} index The child index to look for
 * @returns {Node|null} A eligible node if any or null
 * @private
 */

const getFirstChild = (walker, node, index) => (walker.filter(node.childNodes[index || 0]) && node.childNodes[index || 0])
	|| (node.childNodes[index + 1] && getFirstChild(walker, node, index + 1));

/**
 * Get lastChild first candidate if any
 * @function getLastChild
 * @param {Object} walker The TreeWalker object
 * @param {Node} node The start Node
 * @param {Number} index The child index to look for
 * @returns {Node|null} A eligible node if any or null
 * @private
 */

const getLastChild = (walker, node, index) => (walker.filter(node.childNodes[index || node.childNodes.length - 1]) && node.childNodes[index || node.childNodes.length - 1])
	|| (node.childNodes[index - 1] && getLastChild(walker, node, index - 1));

/**
 * Get previousSibling first candidate if any
 * @function getPreviousSibling
 * @param {Object} walker The TreeWalker object
 * @param {Node} node The start Node
 * @returns {Node|null} A eligible node if any or null
 * @private
 */

const getPreviousSibling = (walker, node) => (walker.filter(node.previousSibling) && node.previousSibling)
	|| (node.previousSibling && getPreviousSibling(walker, node.previousSibling));

/**
 * Get nextSibling first candidate if any
 * @function getNextSibling
 * @param {Object} walker The TreeWalker object
 * @param {Node} node The start Node
 * @returns {Node|null} A eligible node if any or null
 * @private
 */

const getNextSibling = (walker, node) => (walker.filter(node.nextSibling) && node.nextSibling)
	|| (node.nextSibling && getNextSibling(walker, node.nextSibling));

/**
 * Flatten given node subtree into a one-dimensional array
 * @function flatten
 * @param {Node} node A DOM Node
 * @returns {Node[]} The array with given node and all its descendants
 * @private
 */

const flatten = (node) => node.childNodes.reduce((acc, child) => acc.concat(flatten(child)), [node]);

/**
 * Get first candidate if any
 * @function getItem
 * @param {Object} walker The TreeWalker object
 * @param {Node} node The start Node
 * @param {Number} shift The index shift to look for in TreeWalker nodes list
 * @returns {Node|null} A eligible node if any or null
 * @private
 */

const getItem = (walker, node, shift) => {
	const list = flatten(walker.root).filter((n) => walker.filter(n));
	return list.indexOf(node) !== -1 ? (list[list.indexOf(node) + shift] || null) : null;
};

/**
 * Get previous first candidate if any
 * @function getPrevious
 * @param {Object} walker The TreeWalker object
 * @param {Node} node The start Node
 * @returns {Node|null} A eligible node if any or null
 * @private
 */

const getPrevious = (walker, node) => getItem(walker, node, -1);

/**
 * Get next first candidate if any
 * @function getNext
 * @param {Object} walker The TreeWalker object
 * @param {Node} node The start Node
 * @returns {Node|null} A eligible node if any or null
 * @private
 */

const getNext = (walker, node) => getItem(walker, node, 1);

/**
 * Base TreeWalker implementation without filtering
 */

class TreeWalker {

	constructor(root) {
		this.root = root;
		this.currentNode = root || new Node();
		this.filter = () => true; // No filtering
	}

	parentNode() {
		return walk(this, getParentNode);
	}

	firstChild() {
		return walk(this, getFirstChild);
	}

	lastChild() {
		return walk(this, getLastChild);
	}

	previousSibling() {
		return walk(this, getPreviousSibling);
	}

	nextSibling() {
		return walk(this, getNextSibling);
	}

	previousNode() {
		return walk(this, getPrevious);
	}

	nextNode() {
		return walk(this, getNext);
	}

}

module.exports = TreeWalker;
