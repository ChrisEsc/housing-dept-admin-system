var salaryWindow, salaryID, salaryForm;
 
function salaryCRUD(type)
{ 
	params = new Object();

	params.id		= salaryID;
	params.type		= type;

	if (type == "Delete")
		deleteFunction('adminservices_plantilla/salarygrade_crud', params, 'salariesGrid', 'positionsListGrid');
	else
		addeditFunction('adminservices_plantilla/salarygrade_crud', params, 'salariesGrid', 'positionsListGrid', salaryForm, salaryWindow);
}

function AddEditDeleteSalary(type, calendar_year)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	// prepare data for year store
    var years = [];
    year = new Date().getFullYear();
    for(var i=(year-2); i<=(year+2); i++) years.push([i]);
    var yearsStore = new Ext.data.SimpleStore
    ({
          fields : ['years'],
          data : years
    });

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("salariesGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		salaryID = sm.selected.items[0].data.id;
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
					salaryCRUD(type);
			}
		});
	}
	else
	{
		salaryForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 100,
				afterLabelTextTpl: null,
				msgTarget: 'side',
				anchor	: '100%', 
				allowBlank: true
	        },
			items: [{
				xtype		: 'numberfield',
				id			: 'salary_grade',
				name		: 'salary_grade',
				afterLabelTextTpl: required,
				allowBlank	: false,
				fieldLabel	: 'Salary Grade'
            }, {
				xtype		: 'numberfield',
				id			: 'step_1',
				name		: 'step_1',
				fieldLabel	: 'Step 1'
            }, {
				xtype		: 'numberfield',
				id			: 'step_2',
				name		: 'step_2',
				fieldLabel	: 'Step 2'
            }, {
				xtype		: 'numberfield',
				id			: 'step_3',
				name		: 'step_3',
				fieldLabel	: 'Step 3'
            }, {
				xtype		: 'numberfield',
				id			: 'step_4',
				name		: 'step_4',
				fieldLabel	: 'Step 4'
            }, {
				xtype		: 'numberfield',
				id			: 'step_5',
				name		: 'step_5',
				fieldLabel	: 'Step 5'
            }, {
				xtype		: 'numberfield',
				id			: 'step_6',
				name		: 'step_6',
				fieldLabel	: 'Step 6'
            }, {
				xtype		: 'numberfield',
				id			: 'step_7',
				name		: 'step_7',
				fieldLabel	: 'Step 7'
            }, {
				xtype		: 'numberfield',
				id			: 'step_8',
				name		: 'step_8',
				fieldLabel	: 'Step 8'
            }, {
				xtype		: 'combo',
				id			: 'year',
				name		: 'year',
				store 		: yearsStore,
				mode		: 'local',
				displayField: 'years',
				valueField	: 'years',
				value 		: calendar_year,
				afterLabelTextTpl: required,
				allowBlank	: false,
				editable	: false,
				fieldLabel	: 'Year'
            }]
		});

		salaryWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Salary',
			closable	: true,
			modal		: true,
			width		: 350,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [salaryForm],
			buttons: [
			{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!salaryForm.form.isValid()){
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
								salaryCRUD(type);
						}
					});
			    }
			},
			{
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	salaryWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			salaryForm.getForm().load({
				url: 'adminservices_plantilla/salaryview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.salaryID, 
					type: type
				},
				success: function(form, action) {
					salaryWindow.show();
					var data = action.result.data;
				},
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			salaryWindow.show();
		// Ext.getCmp("holiday_date").focus();
	}
}