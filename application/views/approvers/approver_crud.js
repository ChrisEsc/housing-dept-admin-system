var approversWindow, approversID, approversForm, hierarchyID;

function approverCRUD(type)
{
	var sm = Ext.getCmp("transactionsGrid").getSelectionModel();

	params = new Object();
	params.id	= approversID;
	params.code	= sm.selected.items[0].data.code;
	params.hierarchy_id = hierarchyID;
	params.type	= type;
	
	if (type == "Delete")
		deleteFunction('approvers/approverscrud', params, 'approversGrid', null);
	else
	{
		params.approver_id = Ext.get('approvers').dom.value;
		addeditFunction('approvers/approverscrud', params, 'approversGrid', null, approversForm, approversWindow);
	}
}

function AddEditDeleteApprover(type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("approversGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		this.approversID = sm.selected.items[0].data.id;
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
					approverCRUD(type);
			}
		});
	}
	else
	{ 
		var smhierarchy = Ext.getCmp("hierarchyGrid").getSelectionModel();
		if (!smhierarchy.hasSelection())
		{
			warningFunction("Warning!","Please select a hierarchy.");
			return;
		}
		this.hierarchyID = smhierarchy.selected.items[0].data.id;

		approversForm = Ext.create('Ext.form.Panel', {
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
			            flex: 1,
			            id			: 'approvers',
			            fieldLabel	: 'Approver',
			            valueField	: 'id',
			            displayField: 'name',
			            triggerAction: 'all',
			            minChars    : 3,
			            enableKeyEvents: true,
			            readOnly    : false,
						forceSelection: true,
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
			                	Ext.get('approvers').dom.value = record[0].data.id;
			                }
			            }
			        }]
			});

			approversWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Approver',
			closable	: true,
			modal		: true,
			width		: 350,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [approversForm],
			buttons: [
			{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!approversForm.form.isValid()){
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
								approverCRUD(type);
						}
					});
			    }
			},
			{
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	approversWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			approversForm.getForm().load({
				url: 'approvers/approversview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.approversID
				},	
				success: function(form, action) 
				{
					approversWindow.show(); 

					var data = action.result.data;
					Ext.getCmp("approvers").setRawValue(data.approver_name);
					Ext.get('approvers').dom.value = data.approver_id;
				},
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			approversWindow.show();

		Ext.getCmp("approvers").focus();
	}
}