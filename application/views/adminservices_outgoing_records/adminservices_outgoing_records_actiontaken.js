var actionTakenWindow, actionTakenForm; 
var division_id;

function updateActionTaken()
{
	params 		= new Object();
	params.id	= outgoingRecordID;

	addeditFunction('adminservices_outgoing_records/actiontaken_crud', params, 'outgoingRecordsListGrid', null, actionTakenForm, actionTakenWindow);
}

function UpdateActionTaken()
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	var sm = Ext.getCmp("outgoingRecordsListGrid").getSelectionModel();
	if (!sm.hasSelection())
	{
		errorFunction("Warning","Please select a record!");
		return;
	}
	if (isAsstDepartmentHead && sm.selected.items[0].data.division_code != 'ASSD')
	{
		warningFunction("Warning","Cannot update action taken.");
		return;
	}

	outgoingRecordID = sm.selected.items[0].data.id;

	actionTakenForm = Ext.create('Ext.form.Panel', {
		border		: false,
		bodyStyle	: 'padding:10px;',	
		fieldDefaults: {
			labelAlign	: 'right',
			labelWidth: 100,
			afterLabelTextTpl: required,
			msgTarget: 'side',
			anchor	: '100%',
			allowBlank: false
        },	
		items: [{
			xtype		: 'textarea',	
			id			: 'action_taken',				
			name		: 'action_taken',				
			labelAlign	: 'right',
			anchor		: '100%',
			fieldLabel	: 'Action/s Taken',
			afterLabelTextTpl: null,
			msgTarget	: 'side',
			minLength	: 20,
			minLengthText: 'Action taken too short.',
			listeners 	: {
				change : function(textarea, newValue, oldValue, eOpts) {
            		textarea.setValue(textarea.value.replace(/\s\s+/g, ' '));
            	}
			}
		}]
	});

	actionTakenWindow = Ext.create('Ext.window.Window', {
		title		: 'Update Action Taken',
		closable	: true,
		width		: 400,
		modal		: true,
		autoHeight	: true,
		resizable	: false,
		buttonAlign	: 'center',
		header: {titleAlign: 'center'},
		items: [actionTakenForm],
		buttons: [
		{
		    text	: 'Update',
		    icon	: './image/save.png',
		    handler: function ()
		    {
		    	if (!actionTakenForm.form.isValid()){
					errorFunction("Error!",'Please check the required fields (Marked red).');
				    return;
		        }
				Ext.Msg.show({
					title	: 'Confirmation',
					msg		: 'Are you sure you want to update action taken?',
					width	: '100%',
					icon	: Ext.Msg.QUESTION,
					buttons	: Ext.Msg.YESNO,
					fn: function(btn){
						if (btn == 'yes')
							updateActionTaken();
					}
				});
		    }
		},
		{
		    text	: 'close',
		    icon	: './image/close.png',
		    handler: function ()
		    {
		    	actionTakenWindow.close();
		    }
		}],
	}).show();
	Ext.getCmp("action_taken").focus();

	actionTakenForm.getForm().load({
		url: 'adminservices_outgoing_records/actiontaken_view',
		timeout: 30000,
		waitMsg:'Loading data...',
		params: { id: this.outgoingRecordID },
		success: function(form, action) {
			actionTakenWindow.show();
			var data = action.result.data;

		},
		failure: function(f, action) { errorFunction("Error!",'Please contact system administrator.'); }
	});
}