/**
 * This extensions makes 2 enhancements to the way values are set to the fields
 * of a form (BasicForm). The first enhancement is the way in which fields are
 * found in a form in order to set its value. Ext used findField which is slow,
 * specially noticeble in large forms. The second enhancement is that you can
 * set an arbitrary object with nestes properties and it will match the field
 * whose id, hiddenName or name matches the property using dot notation. For
 * example you can setValues() of a form directly from this data: { name :
 * 'Sherlock Holmes', address : { street : 'Baker Street', number : '221b' } }
 * 
 * by setting the names of the field, 'name', 'address.street' and
 * 'address.number'
 * 
 * This extension was taken from the followin thread:
 * http://www.sencha.com/forum/showthread.php?50028-DISCUSS-Ext.form.BasicForm.setValues-improvement&p=238524#post238524
 * 
 * @author Animal (http://www.sencha.com/forum/member.php?10-Animal)
 * @autor Condor (http://www.sencha.com/forum/member.php?343-Condor)
 * @author province-sud-2
 *         (http://www.sencha.com/forum/member.php?71731-province-sud-2)
 * @author krause (http://www.sencha.com/forum/member.php?40584-krause) JSLinted
 *         code.
 * 
 */
Ext.override(Ext.form.Field, {
	initComponent : Ext.form.Field.prototype.initComponent.createSequence(function() {
		// Generate a function which will extract
			// the field's value from an object.
			var tries = [];
			if (this.initialConfig.id) {
				tries.push(this.initialConfig.id);
			}
			if (this.hiddenName) {
				tries.push(this.hiddenName);
			}
			if (this.name) {
				tries.push(this.name);
			}
			this.getLoadValue = new Function("data", "with(data){return " + tries.join("||") + ";}");
		})
});

/**
 * 
 */
Ext.override(Ext.form.BasicForm, {
	setValues : function(values) {
		var i, field, v, valuesObject = {};
		if (Ext.isArray(values)) {
			// array of objects. Convert to object hash
		for (i = 0, len = values.length; i < len; i++) {
			valuesObject[values[i].id] = values[i].value;
		}
		return this.setValues(valuesObject);
	} else { // object hash
			for (i = 0, items = this.items.items, len = items.length; i < len; i++) {
				field = items[i];
				v = field.getLoadValue(values);
				if (Ext.isDefined(v)) {
					if ((typeof v !== 'undefined') && (v !== null)) {
						field.setValue(v);
						if (this.trackResetOnLoad) {
							field.originalValue = field.getValue();
						}
					}
				}
			}
		}
		return this;
	}
});