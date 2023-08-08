var defaultmoduleWindow, defaultmoduleID, defaultmoduleForm;

function defaultmoduleCRUD(type)
{
	params = new Object();
	params.id		= defaultmoduleID;
	params.group_id = groupID;
	params.type		= type;

	if (type == "Delete")
		deleteFunction('usermanagement/defaultmodulecrud', params, 'defaultmodulesGrid', null);	
	else
	{		
		params.module_id	= Ext.get('module_id').dom.value;
		addeditFunction('usermanagement/defaultmodulecrud', params, 'defaultmodulesGrid', null, defaultmoduleForm, defaultmoduleWindow);
	}
}

function AddEditDeleteDefaultModules(type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if (type == "Delete" || type == "Edit")
	{
		var sm = Ext.getCmp("defaultmodulesGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		this.defaultmoduleID = sm.selected.items[0].data.id;
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
					defaultmoduleCRUD(type);
			}
		});
	}
	else
	{
		defaultmoduleForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 70,
				afterLabelTextTpl: required,
				msgTarget: 'side',
				anchor	: '100%',
				allowBlank: false
	        },
			items: [{
	            xtype   	: 'combo',
	            id			: 'module_id',
	            fieldLabel	: 'Module',
	            valueField	: 'id',
	            displayField: 'description',
	            allowBlank	: false,
	            triggerAction: 'all',
	            minChars    : 2,
	            forceSelection: true,
	            enableKeyEvents: true,
	            readOnly    : false,
	            store: new Ext.data.JsonStore({
			        proxy: {
			            type: 'ajax',
			            url: 'usermanagement/defaultmodulelist',
			            timeout : 1800000,
			            reader: {
			                type: 'json',
			                root: 'data',
			                idProperty: 'id'
			            }
			        },
			        params: {start: 0, limit: 10},
			        fields: [{name: 'id', type: 'int'}, 'description']
	            }),
	            listeners: 
	            {
	                select: function (combo, record, index)
	                {		   
	                	Ext.get('module_id').dom.value  = record[0].data.id;	     		
	                }
	            }
			}]
		});

		defaultmoduleWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Module',
			closable	: true,
			modal		: true,
			width		: 400,
			autoHeight	:true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [defaultmoduleForm],
			buttons: [{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!defaultmoduleForm.form.isValid()){
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
								defaultmoduleCRUD(type);
						}
					});
			    }
			}, {
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	defaultmoduleWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			defaultmoduleForm.getForm().load({
				url: 'usermanagement/defaultmoduleview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: { id: this.defaultmoduleID},		
				success: function(form, action) {					
					defaultmoduleWindow.show();
					var data = action.result.data;
					Ext.getCmp("module_id").setRawValue(data.description);
					Ext.get('module_id').dom.value = data.id;
				},		
				failure: function(f,action) { warningFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			defaultmoduleWindow.show();

		Ext.getCmp("module_id").focus();
	}
}