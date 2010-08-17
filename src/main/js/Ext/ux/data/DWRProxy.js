/**
 * @class Ext.ux.data.DWRProxy
 * @extends Ext.data.DataProxy
 * Esta clase es un proxy para la invocacion de metodos de DWR sobre un datasource
 * <p>
 * Example code:.
 * <pre><code>
 Colocar ejemplo de consumo aqui...
 </code></pre>
 *
 **/
Ext.ux.data.DWRProxy = function(dwrCall, args) {
	Ext.ux.data.DWRProxy.superclass.constructor.call(this);
	this.dwrCall = dwrCall;
	this.args = args;
	this.extraData = null;
	this.acegiSecurityMgr = new App.security.Acegi();
};

Ext.extend(Ext.ux.data.DWRProxy, Ext.data.DataProxy, {

	getExtraData: function() {
		return this.extraData;
	},
	
	getExtraArgs: function() {
		return this.extraArgs;
	},
	
	load: function(params, reader, callback, scope, arg) {
		var delegate, callParams, index;
		
		if (this.fireEvent("beforeload", this, params) !== false) {
			delegate = this.loadResponse.createDelegate(this, [reader, callback, scope, arg], 1);
			callParams = [];
			if (!Ext.utils.Generics.isEmpty(params)) {
				if (params[0]) { //params is an object from Store, but some cases you pass any Array and we need to translate.
					index = 0;
					while (params[index]) {
						callParams.push(params[index]);
						index++;
					}
				} else { //in this case is a real object (Warning! Dont use {0:value, 1:value, n:value} will be translate as an array)
					if (this.dwrCall.length > 1) {
						// PKM: Added if to check if the dwrCall recieves parameters or not.
						//      dwrCall always has at least 1 parameter which is the callback
						//      function, so if it has more than one we push the params
						//      else we don't else the callback will never be invoked by
						//      DWR because expects the only parameter to be the callback.
						callParams.push(params);
					}
				}
			}
			if (this.args && (this.args.length > 0)) {
				callParams = callParams.concat(this.args.slice());
			}
			this.extraArgs = [reader, callback, scope, arg];
			this.extraData = {
				callback: delegate,
				exceptionHandler: this.acegiSecurityMgr.dwrExceptionHandler,
				exceptionScope: this.acegiSecurityMgr
			};
			this.acegiSecurityMgr.setCallback(delegate);
			this.acegiSecurityMgr.setExtraArgs(this.extraArgs);
			callParams.push(this.extraData);
			this.dwrCall.apply(this, callParams);
		} else {
			callback.call(scope || this, null, arg, false);
		}
	},
	
	loadResponse: function(response, reader, callback, scope, arg) {
		var result;
		try {
			result = reader.read(response);
		} catch (e) {
			this.fireEvent("loadexception", this, null, response, e);
			callback.call(scope, null, arg, false);
			return;
		}
		callback.call(scope, result, arg, true);
	},
	
	update: function(dataSet) {
	},
	
	updateResponse: function(dataSet) {
	}
});
