var holidayWindow, holidayID, holidayForm;
 
function holidaysCRUD(type)
{ 
	params = new Object();

	if (type == "Delete")
	{
		params.id		= holidayID;
		params.type		= type;

		deleteFunction('adminservices_biometrics_dtr/holidays_crud', params, 'holidaysGrid', 'biometricsRecordsListGrid');
	}
	else
	{
		params.id			= holidayID;
		params.calendar_id 	= calendar_id;
		params.type 		= type;

		addeditFunction('adminservices_biometrics_dtr/holidays_crud', params, 'holidaysGrid', 'biometricsRecordsListGrid', holidayForm, holidayWindow);
	}
}

function AddEditDeleteHoliday(type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("holidaysGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		holidayID = sm.selected.items[0].data.id;
	}

	if (type == "Delete")
	{
		Ext.Msg.show({
			title	: 'Confirmation',
			msg		: 'Are you sure you want to ' + type + ' record?',
			width	: '100%',
			icon	: Ext.Msg.QUESTION,
			buttons	: Ext.Msg.YESNO,
			fn: function(btn){
				if (btn == 'yes')
					holidaysCRUD(type);
			}
		});
	}
	else
	{
		holidayForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 80,
				afterLabelTextTpl: required,
				msgTarget: 'side',
				anchor	: '100%', 
				allowBlank: false
	        },
			items: [{
				xtype		: 'datefield',
				id			: 'holiday_date',
				name		: 'holiday_date',
				fieldLabel	: 'Holiday Date'
            }, {
				xtype		: 'textarea',
				id			: 'holiday_description',
				name		: 'holiday_description',
				fieldLabel	: 'Description'
            }]
		});

		holidayWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Holiday',
			closable	: true,
			modal		: true,
			width		: 350,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [holidayForm],
			buttons: [
			{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!holidayForm.form.isValid()){
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
								holidaysCRUD(type);
						}
					});
			    }
			},
			{
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	holidayWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			holidayForm.getForm().load({
				url: 'adminservices_biometrics_dtr/holidaysview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.holidayID, 
					type: type
				},	
				success: function(form, action) {
					holidayWindow.show();
					var data = action.result.data;
				},			
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			holidayWindow.show();

		Ext.getCmp("holiday_date").focus();
	}
}