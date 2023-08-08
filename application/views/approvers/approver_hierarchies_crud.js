var hierarchyWindow, hierarchyID, hierarchyForm, transactionID;

function hierarchyCRUD(type)
{
	params = new Object();
	params.id	= hierarchyID;
	params.transaction_id = transactionID;
	params.type	= type;

	if (type == "Delete")
		deleteFunction('approvers/hierarchycrud', params, 'hierarchyGrid', null);
	else
		addeditFunction('approvers/hierarchycrud', params, 'hierarchyGrid', null, hierarchyForm, hierarchyWindow);
}

function AddEditDeleteHierarchy(type)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("hierarchyGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		this.hierarchyID = sm.selected.items[0].data.id;
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
					hierarchyCRUD(type);
			}
		});
	}
	else
	{
		var smModule = Ext.getCmp("transactionsGrid").getSelectionModel();
		if (!smModule.hasSelection())
		{
			warningFunction("Warning!","Please select a transaction.");
			return;
		}
		this.transactionID = smModule.selected.items[0].data.id;

		hierarchyForm = Ext.create('Ext.form.Panel', {
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
				id		: 'hierarchy',
				name	: 'hierarchy',
				fieldLabel: 'Hierarchy'
			}, {
				xtype	: 'textfield',
				id		: 'remarks',
				name	: 'remarks',
				fieldLabel: 'Remarks'
			}, {
				xtype	: 'numberfield',	
				name	: 'sno',
				minValue: 1,
				maxValue: 100,
				fieldLabel: 'Order'
			}]
		});

		hierarchyWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Hierarchy',
			closable	: true,
			modal		: true,
			width		: 350,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [hierarchyForm],
			buttons: [{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!hierarchyForm.form.isValid()){
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
								hierarchyCRUD(type);
						}
					});
			    }
			}, {
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	hierarchyWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			hierarchyForm.getForm().load({
				url: 'approvers/hierarchyview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.hierarchyID
				},	
				success: function(form, action) { hierarchyWindow.show(); },			
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			hierarchyWindow.show();

		Ext.getCmp("hierarchy").focus();
	}
}