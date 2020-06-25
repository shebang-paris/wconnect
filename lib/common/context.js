/**
 * Context
 */

const NAMESPACE = 'wconnect';

const root = (typeof window !== 'undefined' && window) || global;

root[NAMESPACE] = {};

export default root[NAMESPACE];
