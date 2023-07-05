var SubModuleWindow, SubModuleID, parentID, submoduleForm;

function submodule_crud(type)
{
	params = new Object();

	params.id		= SubModuleID;
	params.parent_id = parentID;
	params.type		= type;

	if (type == "Delete")
		deleteFunction('usermanagement/submodulecrud', params, 'submoduleGrid', null);
	else
		addeditFunction('usermanagement/submodulecrud', params, 'submoduleGrid', null, submoduleForm, SubModuleWindow);
}

function AddEditDeleteSubModule(type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("submoduleGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		this.SubModuleID = sm.selected.items[0].data.id;		
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
					submodule_crud(type);
			}
		});
	}
	else
	{
		var smModule = Ext.getCmp("moduleGrid").getSelectionModel();
		if (!smModule.hasSelection())
		{
			warningFunction("Warning!","Please select a Module.");
			return;
		}
		this.parentID = smModule.selected.items[0].data.id;

		submoduleForm = Ext.create('Ext.form.Panel', {
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
					fieldLabel: 'Sub Module Name'
				}, {
					xtype	: 'textfield',
					name	: 'link',
					fieldLabel: 'Link'
				}, {
					xtype	: 'textfield',
					name	: 'icon',
					fieldLabel: 'Icon',
					afterLabelTextTpl: null,
					allowBlank: true
				}, {
					xtype	: 'numberfield',	
					name	: 'sno',
					minValue: 1,
					maxValue: 100,
					fieldLabel: 'Order'
				}, {
	                xtype: 'checkbox',
	                name: 'ckthumbnail',                                    
	                inputValue: 1,   
	                checked: true,
	                margin: '0 0 0 124',
	                boxLabel: 'Thumbnail Display?'
	            }, {
	                xtype: 'checkbox',
	                name: 'ckmenu',                                    
	                inputValue: 1,   
	                checked: true,
	                margin: '0 0 0 124',
	                boxLabel: 'Menu Display?'
				}]
			});

			SubModuleWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Sub Module',
			closable	: true,
			modal		: true,
			width		: 350,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [submoduleForm],
			buttons: [
			{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!submoduleForm.form.isValid()){
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
								submodule_crud(type);
						}
					});
			    }
			},
			{
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	SubModuleWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			submoduleForm.getForm().load({
				url: 'usermanagement/submoduleview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.SubModuleID
				},	
				success: function(form, action) { SubModuleWindow.show(); },				
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			SubModuleWindow.show();

		Ext.getCmp("module_name").focus();
	}
}