/**
 * Flattens an object o with nested objects to a simple object whose property
 * names will be formed by the parent property name dot the nested property name.
 * @param {Object} o The original object
 * @param {String} root The source of the properties
 * @member Jnf flatten
 */
Ext.ux.ObjUtil.flatten = function(o, root) {
	var map = {};
	root = root ? root + '.' : '';
	for (p in o) {
		v = o[p];
		if (typeof v === 'object') {
			Ext.apply(map, Jnf.util.flatten(v, root + p));
		} else if (typeof v !== 'function') {
			map[root + p] = v;
		}
	}
	return map;
};
