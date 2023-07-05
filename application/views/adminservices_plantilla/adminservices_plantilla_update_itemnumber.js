var updateItemNumberWindow, plantillaID, updateItemNumberForm;
var currentYear = new Date().getFullYear();

function updateItemNumber(type)
{
	params 			 				= new Object();
	params.plantilla_header_id		= plantillaID;
	params.new_item_number  	 	= Ext.getCmp("new_item_number").getRawValue();
	params.new_year 			 	= Ext.getCmp("new_year").getRawValue();
	
	addeditFunction('adminservices_plantilla/update_itemnumber', params, 'positionsListGrid', null, updateItemNumberForm, updateItemNumberWindow);
}

function UpdateItemNumber(type)
{
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
	var sm = Ext.getCmp("positionsListGrid").getSelectionModel();
	if (!sm.hasSelection())
	{
		warningFunction("Warning!","Please select record.");
		return;
	}

	plantillaID = sm.selected.items[0].data.id;

	updateItemNumberForm = Ext.create('Ext.form.Panel', {
		border		: false,
		bodyStyle	: 'padding:15px;',
		autoScroll : true,		
		fieldDefaults: {
			labelAlign	: 'right',
			labelWidth: 90,
			msgTarget: 'side',
			anchor	: '100%',
        },
		items: [{
			xtype 		: 'fieldset',
			title 		: 'Previous Item Details',
			defaultType : 'textfield',
			items: [
				{fieldLabel: 'Position', id: 'position_description', name: 'position_description', readOnly: true},
                {fieldLabel: 'Item Number', id: 'prev_item_number', name: 'item_number', readOnly: true},
                {fieldLabel: 'Year', id: 'prev_year', name: 'year', readOnly: true}
			]
		},{
			xtype 		: 'fieldset',
			title 		: 'New Item Number Details',
			fieldDefaults: {
				afterLabelTextTpl: required,
				allowBlank: false
			},
			items: [
				{xtype: 'numberfield', fieldLabel: 'New Item Number', id: 'new_item_number', name: 'new_item_number'},
                {xtype: 'numberfield', fieldLabel: 'Year', id: 'new_year', name: 'new_year', value: currentYear, readOnly: true}
			]
		}]
	});

	updateItemNumberWindow = Ext.create('Ext.window.Window', {
		title		: 'Update Item Number',
		closable	: true,
		modal		: true,
		width		: 360,
		autoHeight	: true,
		resizable	: false,
		buttonAlign	: 'center',
		header: {titleAlign: 'center'},
		items: [updateItemNumberForm],
		buttons: [
		{
		    text	: 'Save',
		    icon	: './image/save.png',
		    handler: function ()
		    {
				if (!updateItemNumberForm.form.isValid()){
					errorFunction("Error!",'Please fill-in the required fields (Marked red).');
				    return;
		        }
				Ext.Msg.show({
					title	: 'Confirmation',
					msg		: 'Are you sure you want to Save?',
					width	: '100%',
					icon	: Ext.Msg.QUESTION,
					buttons	: Ext.Msg.YESNO,
					fn: function(btn){
						if (btn == 'yes')
							updateItemNumber(type);
					}
				});
		    }
		},
		{
		    text	: 'Close',
		    icon	: './image/close.png',
		    handler: function ()
		    {
		    	updateItemNumberWindow.close();
		    }
		}],
	});

	updateItemNumberForm.getForm().load({
		url: 'adminservices_plantilla/itemnumber_view',
		timeout: 30000,
		waitMsg:'Loading data...',
		params: { id: this.plantillaID },		
		success: function(form, action) {
			updateItemNumberWindow.show();
			var data = action.result.data;

			Ext.getCmp("position_description").setRawValue(data.position_description);
			Ext.getCmp("prev_item_number").setRawValue(data.prev_item_number)
			Ext.getCmp("prev_year").setRawValue(data.prev_year);
			Ext.getCmp("new_item_number").setRawValue(data.new_item_number)
			Ext.getCmp("new_year").setRawValue(data.new_year);
		},		
		failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
	});
}