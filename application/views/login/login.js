Ext.onReady(function(){
	
	var mainWindow, form;

    function user_login()
	{
		form.submit({
			url: 'login/userauthentication',
			method: "POST",	
		    success: function(f,action)
		    {				
				Ext.MessageBox.hide();

				if (action.result.success == true)
				{	
					loadFunction("Access Granted. Please Wait...", "WELCOME! "+action.result.name);
					//window.location = "<?php echo base_url().'index.php/'; ?>" + action.result.data;
					window.location = "<?php echo base_url().'./'; ?>" + action.result.data;
					mainWindow.close();
				}
				else 
					errorFunction('Error!', action.result.data);
		    },
		    failure: function(f,action) { errorFunction("Error!",action.result.data); }
	    });

		Ext.MessageBox.show({
			msg         : "Processing data, please wait...",
			progressText: "Saving...",
			width       : '100%',
			wait        : true,
			waitConfig  : {interval:100}
		});
	}

	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	form = Ext.create('Ext.form.Panel', {
		border		: false,
		bodyStyle	: 'padding:15px;',				
		defaults: {
            anchor: '100%'
        },	
        fieldDefaults: {
			labelAlign	: 'right',
			labelWidth	: 75,
			afterLabelTextTpl: required,
			msgTarget: 'side',
			allowBlank: false
        },
		items: [
		{
			xtype	: 'textfield',
			id		: 'user_name',
			name	: 'user_name',
			fieldLabel: 'User Name',
			listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("password").focus();
                    }
                }
            }			
		},{							
			xtype	: 'textfield',
			name	: 'password',
			id		: 'password',
			fieldLabel: 'Password',
			inputType:'password',
			listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("type").focus();
                    }
                }
            }
		},{
			xtype	:'combo',
			emptyText: 'Select Type...',
			editable: false,
			id		: 'type',
			name	: 'type',
			fieldLabel: 'User Type',
			mode	: 'local',
			triggerAction: 'all',
			store	: new Ext.data.ArrayStore({
				fields: ['myId', 'Type'],
				data: [[1, 'Staff'], [2, 'Client']]
			}),
			listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("btnLogin").focus();
                    }
                }
            },
            value: 'Staff',
			valueField: 'Type',
			displayField: 'Type'
		},{
			xtype	: 'label',
			html	: '<a href="#" onclick="emailFunction()">Forgot password?</a>',
			margin	: '0 0 0 80'
		}]
	});

    mainWindow = Ext.create('Ext.window.Window', {
		title		: 'AUTHENTICATION',
	    closable	: false,
	    width		: 350,
	    autoHeight	:true,
		resizable	: false,
		buttonAlign	: 'center',
		header: {titleAlign: 'center'},
	    items: [form],
	    buttons: [
	    {
	        text	: 'Login',
	        id		: 'btnLogin',
	        icon: './image/login.png', 
	        handler: function ()
	        {
				if (!form.form.isValid()){
					errorFunction("Error!",'Please fill-in the required fields (Marked red).');
				    return;
	            }
				user_login();
	        }
	    }],
	}).show();	
	Ext.getCmp("user_name").focus();
});
