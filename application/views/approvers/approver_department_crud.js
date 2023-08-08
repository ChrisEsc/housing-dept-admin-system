var deptWindow, deptID, deptForm;

function deptCRUD(type)
{
	params = new Object();
	params.id	= deptID;
	params.approver_id = approversID;
	params.type	= type;

	if (type == "Delete")
		deleteFunction('approvers/departmentcrud', params, 'departmentsGrid', 'approversGrid');
	else
	{
		params.department_id = Ext.get('departments').dom.value;
		addeditFunction('approvers/departmentcrud', params, 'departmentsGrid', 'approversGrid', deptForm, deptWindow);
		Ext.getCmp('approversGrid').getStore().reload({params:{reset:1 }, timeout: 30000});
	}	
}

function AddEditDeleteDepartment(type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("departmentsGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		this.deptID = sm.selected.items[0].data.id;
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
					deptCRUD(type);
			}
		});
	}
	else
	{
		deptForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 80,
				afterLabelTextTpl: required,
				msgTarget: 'side',
				anchor	: '100%',
				allowBlank: false
			},
			items: [{
				xtype: 'fieldcontainer',
				labelStyle: 'font-weight:bold;padding:0;',
				layout: 'hbox',
				items: [{
					xtype   	: 'combo',
					flex: 1,
					id			: 'departments',
					fieldLabel	: 'Department',
					valueField	: 'id',
					displayField: 'description',
					triggerAction: 'all',
					minChars    : 3,
					enableKeyEvents: true,
					readOnly    : false,
					matchFieldWidth: false,
					forceSelection: true,
					store: new Ext.data.JsonStore({
						proxy: {
							type: 'ajax',
							url: 'commonquery/combolist',
							timeout : 1800000,
							extraParams: {query:null, type: 'departments', category:null},
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
							Ext.get('departments').dom.value = record[0].data.id;
						}
					}
				}, {
					xtype: 'button',
					hidden: crudMaintenance,
					margins     : '0 0 0 5',
					text: '...',
					tooltip: 'Add/Edit/Delete Division',
					handler: function (){ viewMaintenance('divisions', null); }
				}, {
					xtype: 'button',
					hidden: crudMaintenance,
					margins		: '0 0 0 5',
					text: '...',
					tooltip: 'Add/Edit/Delete Department',
					handler: function (){ viewMaintenance('departments', 'divisions'); }
				}]
			}]
		});

		deptWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Department',
			closable	: true,
			modal		: true,
			width		: 400,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [deptForm],
			buttons: [{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!deptForm.form.isValid()){
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
								deptCRUD(type);
						}
					});
			    }
			}, {
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	deptWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			deptForm.getForm().load({
				url: 'approvers/departmentview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.deptID
				},	
				success: function(form, action) 
				{
					deptWindow.show(); 

					var data = action.result.data;
					Ext.getCmp("departments").setRawValue(data.department_desc);
					Ext.get('departments').dom.value = data.department_id;
				},
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			deptWindow.show();

		Ext.getCmp("departments").focus();
	}
}