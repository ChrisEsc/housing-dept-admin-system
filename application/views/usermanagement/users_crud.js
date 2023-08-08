var userWindow, userID, userType = 'Staff', form;

function user_crud(type)
{
	params = new Object();
	params.id	= userID;
	params.type	= type;

	if (type == "Delete")
		deleteFunction('usermanagement/usercrud', params, 'usersGrid', null);
	else
	{
		params.user_type = userType;		
		params.staff_id = Ext.get('staff_id').dom.value;
		addeditFunction('usermanagement/usercrud', params, 'usersGrid', null, form, userWindow);
	}
	Ext.getCmp("pageToolbarUser").moveFirst();
}

function AddEditDeleteUser(type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("usersGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		this.userID = sm.selected.items[0].data.id;
		this.userType = sm.selected.items[0].data.type;
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
					user_crud(type);
			}
		});
	}
	else
	{
		form = Ext.create('Ext.form.Panel', {
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
				id		: 'user_name',				
				name	: 'user_name',				
				fieldLabel: 'Username'
			}, {							
				xtype	: 'textfield',
				id		: 'password',
				name	: 'password',
				fieldLabel: 'Password',
				inputType:'password',
				allowBlank: false
			}, {							
				xtype	: 'textfield',
				id		: 'password2',
				name	: 'password2',
				fieldLabel: 'Confirm Password',
				inputType:'password',
				allowBlank: false
			}, {							
	            xtype   	: 'combo',
	            id			: 'staff_id',
	            fieldLabel	: 'Name',
	            valueField	: 'id',
	            displayField: 'name',
	            allowBlank	: false,
	            triggerAction: 'all',
	            minChars    : 2,
	            forceSelection: true,
	            enableKeyEvents: true,
	            readOnly    : false,
	            store: new Ext.data.JsonStore({
			        proxy: {
			            type: 'ajax',
			            url: 'userinformation/stafflist',
			            timeout : 1800000,
			            extraParams: {query:null, status: 2},
			            reader: {
			                type: 'json',
			                root: 'data',
			                idProperty: 'id'
			            }
			        },
			        params: {start: 0, limit: 10},
			        fields: [{name: 'id', type: 'int'}, 'name']
	            }),
	            listeners: 
	            {
	                select: function (combo, record, index)
	                {		   
	                	Ext.get('staff_id').dom.value  = Ext.getCmp("staff_id").getValue();	     		
	                }
	            }
			}, {
                xtype: 'checkbox',
                id  : 'admin',
                name: 'admin',                                    
                inputValue: 1,   
                margin: '0 0 0 123',
                boxLabel: 'Admininistrator'
            }]
		});

		userWindow = Ext.create('Ext.window.Window', {
			title		: type + ' User',
			closable	: true,
			modal		: true,
			width		: 400,
			autoHeight	:true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [form],
			buttons: [{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!form.form.isValid()){
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
								user_crud(type);
						}
					});
			    }
			}, {
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	userWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			form.getForm().load({
				url: 'usermanagement/userview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.userID,
					user_type: this.userType
				},
				success: function(form, action) {
					userWindow.show();
					
					var data = action.result.data;

					Ext.getCmp("staff_id").getStore().proxy.extraParams["query"] = query;
					Ext.getCmp("staff_id").getStore().reload({params:{start:0 }, timeout: 300000});      

					Ext.getCmp("staff_id").setRawValue(data.name);
					Ext.get('staff_id').dom.value  = data.staff_id;			
				},
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			userWindow.show();
		
		Ext.getCmp("user_name").focus();
	}
}