Ext.ns('Ext.ux.util.ObjectUtils');

/**
 * Flattens an object o with nested objects to a simple object whose property
 * names will be formed by the parent property name dot the nested property name.
 * @param {Object} o The original object
 * @param {String} root The source of the properties
 */
Ext.ux.util.ObjectUtils.flatten = function (o, root) {
    var map = {};
    root = root ? root + '.' : '';
    for (p in o) {
        v = o[p];
        if (typeof v === 'object') {
            Ext.apply(map, Ext.ux.util.ObjectUtils.flatten(v, root + p));
        } else if (typeof v !== 'function') {
            map[root + p] = v;
        }
    }
    return map;
};


/**
 * Clones a data object with nested atributes.  Use only for simple Javascript
 * data objects, don't try to clone an Ext component, for example.
 * 
 * @param {Object/Array} o Object or array to clone
 * @return {Object/Array} Deep clone of an object or an array
 * @author Ing. Jozef Sakáloš
 */
Ext.ux.util.ObjectUtils.clone = function(o) {
    // http://www.sencha.com/forum/showthread.php?26644-Ext.ux.clone()-Object-or-Array-cloning-function&p=125086#post125086
    if(!o || 'object' !== typeof o) {
        return o;
    }
    if('function' === typeof o.clone) {
        return o.clone();
    }
    var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
    var p, v;
    for(p in o) {
        if(o.hasOwnProperty(p)) {
            v = o[p];
            if(v && 'object' === typeof v) {
                c[p] = Ext.ux.util.ObjectUtils.clone(v);
            }
            else {
                c[p] = v;
            }
        }
    }
    return c;
}; // eo function clone  