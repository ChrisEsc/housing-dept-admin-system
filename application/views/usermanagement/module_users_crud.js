var moduserWindow, userID, modusersForm;

function moduser_crud(type)
{
	params = new Object();
	params.id	= userID;
	params.type	= type;

	if (type == "Delete")
		deleteFunction('usermanagement/moduleusercrud', params, 'moduleusersGrid', null);	
	else
	{
		params.module_id = moduleID;
		params.user_id	= Ext.get('user_id').dom.value;
		addeditFunction('usermanagement/moduleusercrud', params, 'moduleusersGrid', null, modusersForm, moduserWindow);
	}
}

function AddEditDeleteModUser(type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if (type == "Delete" || type == "Edit")
	{
		var sm = Ext.getCmp("moduleusersGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		this.userID = sm.selected.items[0].data.id;
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
					moduser_crud(type);
			}
		});
	}
	else
	{
		modusersForm = Ext.create('Ext.form.Panel', {
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
	            id			: 'user_id',
	            fieldLabel	: 'User',
	            valueField	: 'id',
	            displayField: 'module_users',
	            allowBlank	: false,
	            triggerAction: 'all',
	            minChars    : 2,
	            forceSelection: true,
	            enableKeyEvents: true,
	            readOnly    : false,
	            matchFieldWidth: false,
	            store: new Ext.data.JsonStore({
			        proxy: {
			            type: 'ajax',
			            url: 'usermanagement/userslist',
			            timeout : 1800000,
			            reader: {
			                type: 'json',
			                root: 'data',
			                idProperty: 'id'
			            }
			        },
			        params: {start: 0, limit: 10},
			        fields: [{name: 'id', type: 'int'}, 'module_users']
	            }),
	            listeners: 
	            {
	                select: function (combo, record, index)
	                {		   
	                	Ext.get('user_id').dom.value  = record[0].data.id;	     		
	                }
	            }
			},{
                xtype: 'fieldcontainer',
                labelStyle: 'font-weight:bold;padding:0;',
                layout: 'hbox',
                items: [
                {
	                xtype: 'checkbox',
	                id  : 'ckadd',
	                name: 'ckadd',                                    
	                inputValue: 1,   
	                checked: true,
	                margin: '0 0 0 72',
	                boxLabel: 'Add'
	            },{
	                xtype: 'checkbox',
	                id  : 'ckedit',
	                name: 'ckedit',                                    
	                inputValue: 1,   
	                checked: true,
	                margin: '0 0 0 10',
	                boxLabel: 'Edit'
	            },{
	                xtype: 'checkbox',
	                id  : 'ckdelete',
	                name: 'ckdelete',                                    
	                inputValue: 1,   
	                checked: true,
	                margin: '0 0 0 10',
	                boxLabel: 'Delete'
	            }]
			}]
		});

		moduserWindow = Ext.create('Ext.window.Window', {
			title		: type + ' User',
			closable	: true,
			modal		: true,
			width		: 400,
			autoHeight	:true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [modusersForm],
			buttons: [{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!modusersForm.form.isValid()){
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
								moduser_crud(type);
						}
					});
			    }
			}, {
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	moduserWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			modusersForm.getForm().load({
				url: 'usermanagement/moduleuserview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: { id: this.userID},		
				success: function(form, action) {					
					moduserWindow.show();
					var data = action.result.data;
					Ext.getCmp("user_id").setRawValue(data.user_name);
					Ext.get('user_id').dom.value = data.user_id;
				},		
				failure: function(f,action) { warningFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			moduserWindow.show();

		Ext.getCmp("user_id").focus();
	}
}