var emailcrudWindow, emailID, emailCRUDForm;

function emailMaintenanceCRUD() 
{
	params = new Object();
	processingFunction("Processing data, please wait...");

	Ext.Ajax.request({
	    url: 'login/emailvalidation',
	    method	: 'POST',
	    params: {email: Ext.getCmp("email").getValue()},
	    timeout: 1800000,
	    success: function(f,a)
	    {	  
			try {
				Ext.MessageBox.hide();
		    	emailcrudWindow.close();
				var response = Ext.decode(f.responseText);									
				if (response.success == true)
					infoFunction('Status', response.data);
				else
					errorFunction('Status', response.data);
			}
			catch(err) {
				errorFunction("Error!",'Connection Problem / Error Occur.');
			}  	
	    	
	    },
		failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
	});

}

function emailFunction()
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
	emailCRUDForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 90,
				afterLabelTextTpl: required,
				msgTarget: 'side',
				anchor	: '100%',
				allowBlank: false
	        },
			items: [{
				xtype	: 'textfield',
				id		: 'email',
				name	: 'email',
				emptyText: 'Enter email address here...',
				vtype	: 'email',
				listeners:
	            {
	                specialKey : function(field, e) {
	                    if(e.getKey() == e.ENTER) {
	                        Ext.getCmp("btnSend").focus();
	                    }
	                }
	            }
            }]
		});

	emailcrudWindow = Ext.create('Ext.window.Window', {
		title		: 'Account Help',
		closable	: true,
		modal		: true,
		width		: 400,
		autoHeight	: true,
		resizable	: false,
		buttonAlign	: 'center',
		header: {titleAlign: 'center'},
		items: [emailCRUDForm],
		buttons: [{
		    text	: 'Send',
		    id		: 'btnSend',
		    icon	: './image/mail_send.png',
		    handler: function ()
		    {
				if (!emailCRUDForm.form.isValid()){
					errorFunction("Error!",'Please fill-in the required fields (Marked red).');
				    return;
		        }
				Ext.Msg.show({
					title	: 'Confirmation',
					msg		: 'Are you sure you want to Send?',
					width	: '100%',
					icon	: Ext.Msg.QUESTION,
					buttons	: Ext.Msg.YESNO,
					fn: function(btn){
						if (btn == 'yes')
							emailMaintenanceCRUD();
					}
				});
		    }
		}],
	}).show();

	Ext.getCmp("email").focus();
}