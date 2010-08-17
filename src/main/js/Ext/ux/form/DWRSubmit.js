/**
 * @class Ext.ux.form.Action.DWRSubmit
 * @extends Ext.form.Action Submit data through DWR function options:
 *          dwrFunction
 * @constructor
 * @param {Object}
 *            form
 * @param {Object}
 *            options
 */
Ext.ux.form.Action.DWRSubmit = function(form, options) {
	Ext.form.Action.Submit.superclass.constructor.call(this, form, options);
};

Ext.extend(Ext.ux.form.Action.DWRSubmit, Ext.form.Action, {
	type : 'dwrsubmit',

	// private
	run : function() {
		var o, dwrFunctionArgs, formValueObj;

		o = this.options;
		if (o.clientValidation === false || this.form.isValid()) {
			dwrFunctionArgs = [];
			// var formValueObj =
			// this.decodeEspecial(this.form.getValues(true));
	formValueObj = this.form.getObjectValues();
	dwrFunctionArgs.push(formValueObj);
	dwrFunctionArgs.push( {
		callback : this.success.createDelegate(this, this.createCallback(), 1)
	// ,exceptionHandler: this.failure.createDelegate(this,
	// this.createCallback(), 1)
			});
	this.options.dwrFunction.apply(Object, dwrFunctionArgs);
} else if (o.clientValidation !== false) { // client validation failed
	this.failureType = Ext.form.Action.CLIENT_INVALID;
	this.form.afterAction(this, false);
}
},

// private
	success : function(response) {
		var result = this.handleResponse(response);
		if (result === true || result.success) {
			this.form.afterAction(this, true);
			return;
		}
		if (result.errors) {
			this.form.markInvalid(result.errors);
			this.failureType = Ext.form.Action.SERVER_INVALID;
		}
		this.form.afterAction(this, false);
	},

	// private
	handleResponse : function(response) {
		var rs, errors, i, r, len;

		if (this.form.errorReader) {
			rs = this.form.errorReader.read( [ response ]);
			errors = [];
			if (rs.records) {
				len = rs.records.length;
				for (i = 0; i < len; i++) {
					r = rs.records[i];
					errors[i] = r.data;
				}
			}
			if (errors.length < 1) {
				errors = null;
			}
			this.result = {
				success : rs.success,
				errors : errors
			};
			return this.result;
		}
		this.result = response;
		return this.result;
	},

	/**
	 * Converts field name into nested objects, this is required to asemble the
	 * DWR call into a real JSON call
	 * 
	 * i.e. user.person.firstName = "{user:{person:{firstName:'John'}}}"
	 * 
	 */
	decodeEspecial : function(string) {
		var obj, pair, pairs, name, value, i, j, nesteds, nested, nestedObject, len, leng;

		if (!string || !string.length) {
			return {};
		}
		obj = {};
		pairs = string.split('&');
		len = pairs.length;
		for (i = 0; i < len; i++) {
			pair = pairs[i].split('=');
			name = decodeURIComponent(pair[0]);
			value = decodeURIComponent(pair[1]);
			if (name.indexOf(".") > 0) {
				nesteds = name.split('.');
				nestedObject = obj;
				leng = nesteds.length;
				for (j = 0; j < leng; j++) {
					if (j + 1 === leng) {
						name = nesteds[j];
						if (typeof nestedObject[name] === "undefined") {
							nestedObject[name] = value;
						} else if (typeof nestedObject[name] === "string") {
							nestedObject[name] = [ nestedObject[name] ];
							nestedObject[name].push(value);
						} else if (typeof nestedObject[name] === "object") {
							nestedObject = nestedObject[name];
							nestedObject[name] = value;
						} else {
							nestedObject[name].push(value);
						}
						break;
					}
					nested = nesteds[j];
					if (typeof nestedObject[nested] === "undefined") {
						nestedObject[nested] = {};
					}
					nestedObject = nestedObject[nested];
				}
			} else {
				if (typeof obj[name] === "undefined") {
					obj[name] = value;
				} else if (typeof obj[name] === "string") {
					obj[name] = [ obj[name] ];
					obj[name].push(value);
				} else {
					obj[name].push(value);
				}
			}
		}
		return obj;
	}

});
Ext.form.Action.ACTION_TYPES.dwrsubmit = Ext.ux.form.Action.DWRSubmit;
