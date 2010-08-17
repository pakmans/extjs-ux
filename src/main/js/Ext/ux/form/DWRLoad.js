/**
 * @class Ext.ux.form.Action.DWRLoad
 * @extends Ext.form.Action
 * Load data from DWR function
 * options: dwrFunction, dwrArgs
 * @constructor
 * @param {Object} form
 * @param {Object} options
 */
Ext.ux.form.Action.DWRLoad = function(form, options) {
	Ext.ux.form.Action.DWRLoad.superclass.constructor.call(this, form, options);
};

Ext.extend(Ext.ux.form.Action.DWRLoad, Ext.form.Action, {
	// private
	type: 'dwrload',
	
	run: function() {
		var dwrFunctionArgs, loadArgs, loadArgName, i;
		
		dwrFunctionArgs = [];
		loadArgs = this.options.dwrArgs || [];
		if (loadArgs instanceof Array) {
			// Note: can't do a foreach loop over arrays because Ext added the "remove" method to Array's prototype.
			// This "remove" method gets added as an argument unless we explictly use numeric indexes.
			for (i = 0; i < loadArgs.length; i++) {
				dwrFunctionArgs.push(loadArgs[i]);
			}
		} else { // loadArgs should be an Object
			for (loadArgName in loadArgs) {
				dwrFunctionArgs.push(loadArgs[loadArgName]);
			}
		}
		
		if (this.options.dwrFunction.length > 1) {
			// PKM: Added if to check if the dwrFunction recieves parameters or not.
			//      dwrCall always has at least 1 parameter which is the callback
			//      function, so if it has more than one we push the params
			//      else we don't else the callback will never be invoked by
			//      DWR because expects the only parameter to be the callback.
			dwrFunctionArgs.push(this.getParams());
		}
		
		dwrFunctionArgs.push({
			callback: this.success.createDelegate(this, this.createCallback(), 1)
			//,exceptionHandler: this.failure.createDelegate(this, this.createCallback(), 1)
		});
		this.options.dwrFunction.apply(Object, dwrFunctionArgs);
	},
	
	// private
	getParams: function() {
		var bp, p;
		
		bp = this.form.baseParams || {};
		p = this.options.params || {};
		Ext.applyIf(p, bp);
		return p;
	},
	
	success: function(response) {
		var result;
		
		result = this.handleResponse(response);
		if (result === true || !result.success || !result.data) {
			this.failureType = Ext.form.Action.LOAD_FAILURE;
			this.form.afterAction(this, false);
			return;
		}
		this.form.clearInvalid();
		this.form.setValues(result.data);
		this.form.dwrLoadResult = result;
		this.form.afterAction(this, true);
	},
	
	handleResponse: function(response) {
		var flatData, jsonData, messages, errors, rs, data;
		
		if (this.form.reader) {
			messages = [];
			errors = [];
			if (response.data) { // Response comes from a GenericResponse(Java) from the server
				jsonData = [response.data];
				messages = response.messages;
				errors = response.errors;
			} else { // Straight response from DWR server
				jsonData = [response];
			}
			rs = this.form.reader.readRecords(jsonData);
			data = rs.records && rs.records[0] ? rs.records[0].data : null;
			this.result = {
				success: response.data ? response.success : rs.success,
				data: data,
				messages: messages,
				errors: errors
			};
			return this.result;
		}
		flatData = Ext.ux.ObjUtil.flatten(response.data);
		this.result = Ext.applyIf({
			data: flatData
		}, response);
		return this.result;
	}
});
Ext.form.Action.ACTION_TYPES.dwrload = Ext.ux.form.Action.DWRLoad;
