var userWindow, userID, form;

function user_crud()
{
	addeditFunction('personalinformation/usercrud', null, null, null, form, userWindow);
}

function ChangePassword()
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	form = Ext.create('Ext.form.Panel', {
		border		: false,
		bodyStyle	: 'padding:15px;',		
		fieldDefaults: {
			labelAlign		: 'right',
			labelWidth		: 120,
			afterLabelTextTpl: required,
			msgTarget		: 'side',
			anchor			: '100%',
			allowBlank		: false
		},
		items: [{
			xtype		: 'textfield',	
			id			: 'user_name',				
			name		: 'user_name',
			fieldLabel	: 'User Name'
		}, {							
			xtype		: 'textfield',
			id			: 'current_password',
			name		: 'current_password',
			fieldLabel	: 'Current Password',
			inputType	:'password',
			afterLabelTextTpl: null,
			readOnly	: true
		}, {							
			xtype		: 'textfield',
			id			: 'password',
			name		: 'password',
			fieldLabel	: 'New Password',
			inputType	:'password',
			allowBlank	: false
		}, {							
			xtype		: 'textfield',
			id			: 'password2',
			name		: 'password2',
			fieldLabel	: 'Confirm Password',
			inputType	:'password',
			allowBlank	: false
		}]
	});

    userWindow = Ext.create('Ext.window.Window', {
			title		: 'Change Password',
			closable	: true,
			modal		: true,
			width		: 450,
			autoHeight	:true,
			resizable	: false,
			buttonAlign	: 'center',
			header		: {titleAlign: 'center'},
			items		: [form],
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
								user_crud();
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
		}).show();

		form.getForm().load({
			url: 'personalinformation/userview',
			timeout: 30000,
			waitMsg:'Loading data...',
			failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
		});
		Ext.getCmp("user_name").focus();
}