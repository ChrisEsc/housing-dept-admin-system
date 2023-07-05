var maintenanceCrudWindow, maintenanceCrudID, maintenanceCrudForm;
 
function maintenanceFormCRUD(crudtype, type)
{ 
	params = new Object();

	if (crudtype == "Delete")
	{
		params.id		= maintenanceCrudID;
		params.crudtype	= crudtype;
		params.type		= type;

		deleteFunction('commonquery/maintenancecrud', params, 'maintenanceGrid', null);
	}
	else
	{
		params.id		= maintenanceCrudID;
		params.crudtype = crudtype;
		params.type		= type;

		addeditFunction('commonquery/maintenancecrud', params, 'maintenanceGrid', null, maintenanceCrudForm, maintenanceCrudWindow);
	}
}

function functionCRUD(crudtype, type)
{
	if (!maintenanceCrudForm.form.isValid()){
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
				maintenanceFormCRUD(crudtype,type);
		}
	});
}

function AddEditDeleteMaintenanceCrud(crudtype, type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(crudtype == 'Edit' || crudtype == 'Delete')	
	{
		var sm = Ext.getCmp("maintenanceGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		maintenanceCrudID = sm.selected.items[0].data.id;
	}

	if (crudtype == "Delete")
	{
		Ext.Msg.show({
			title	: 'Confirmation',
			msg		: 'Are you sure you want to ' + crudtype + ' record?',
			width	: '100%',
			icon	: Ext.Msg.QUESTION,
			buttons	: Ext.Msg.YESNO,
			fn: function(btn){
				if (btn == 'yes')
					maintenanceFormCRUD(crudtype, type);
			}
		});
	}
	else
	{
		if (type == 'departments') var department_bool = false;
		else  var department_bool = true;

		if (type == 'divisions') var division_bool = false;
		else  var division_bool = true;

		maintenanceCrudForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 80,
				afterLabelTextTpl: required,
				msgTarget: 'side',
				msgTarget: 'side',	
				anchor	: '100%', 
				allowBlank: false
	        },
			items: [
			{
				xtype	: 'textfield',
				id		: 'dept_code',
				name	: 'dept_code',
				disabled	: department_bool,
	            hidden		: department_bool,
				fieldLabel: 'Code'
            }, {
				xtype	: 'textfield',
				id		: 'div_code',
				name	: 'div_code',
				disabled	: division_bool,
	            hidden		: division_bool,
				fieldLabel: 'Code'
            }, {
				xtype	: 'textfield',
				id		: 'description',
				name	: 'description',
				fieldLabel: 'Description',
				listeners:
	            {
	                specialKey : function(field, e) {
	                    if(e.getKey() == e.ENTER) {
	                        functionCRUD(crudtype, type);
	                    }
	                }
	            }
            }]
		});

		maintenanceCrudWindow = Ext.create('Ext.window.Window', {
			title		: crudtype + ' ' + type,
			closable	: true,
			modal		: true,
			width		: 350,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [maintenanceCrudForm],
			buttons: [
			{
			    text	: 'Save',
			    icon	: '../image/save.png',
			    handler: function ()
			    {
					functionCRUD(crudtype, type);
			    }
			},
			{
			    text	: 'Close',
			    icon	: '../image/close.png',
			    handler: function ()
			    {
			    	maintenanceCrudWindow.close();
			    }
			}],
		});

		if(crudtype == 'Edit')
		{
			maintenanceCrudForm.getForm().load({
				url: 'commonquery/maintenanceview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.maintenanceCrudID, 
					type: type
				},	
				success: function(form, action) {
					maintenanceCrudWindow.show();
					var data = action.result.data;
				},			
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			maintenanceCrudWindow.show();

		Ext.getCmp("description").focus();
	}
}