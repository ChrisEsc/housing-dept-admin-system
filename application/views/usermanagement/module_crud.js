var ModuleWindow, ModuleID, moduleForm;

function module_crud(type)
{
	params = new Object();
	params.id	= ModuleID;
	params.type	= type;

	if (type == "Delete")
		deleteFunction('usermanagement/modulecrud', params, 'moduleGrid', null);
	else
		addeditFunction('usermanagement/modulecrud', params, 'moduleGrid', null, moduleForm, ModuleWindow);
}

function AddEditDeleteModule(type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("moduleGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		this.ModuleID = sm.selected.items[0].data.id;
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
					module_crud(type);
			}
		});
	}
	else
	{
		moduleForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 120,
				afterLabelTextTpl: required,
				msgTarget: 'side',
				anchor	: '100%',
				allowBlank: false
	        },
			items: [{
				xtype	: 'textfield',
				id		: 'module_name',
				name	: 'module_name',
				fieldLabel: 'Module Name'
			}, {
				xtype	: 'numberfield',	
				id		: 'sno',
				name	: 'sno',
				minValue: 1,
				maxValue: 100,
				fieldLabel: 'Order'
			}]
		});

		ModuleWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Module',
			closable	: true,
			modal		: true,
			width		: 350,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [moduleForm],
			buttons: [{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!moduleForm.form.isValid()){
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
								module_crud(type);
						}
					});
			    }
			}, {
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	ModuleWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			moduleForm.getForm().load({
				url: 'usermanagement/moduleview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.ModuleID
				},	
				success: function(form, action) { ModuleWindow.show(); },			
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			ModuleWindow.show();

		Ext.getCmp("module_name").focus();
	}
}