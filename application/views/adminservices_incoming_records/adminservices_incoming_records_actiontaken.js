var actionTakenWindow, actionTakenForm; 
var division_id;

function updateActionTaken()
{
	params = new Object();
	params.id = incomingRecordID;

	var sm = Ext.getCmp("incomingRecordsListGrid").getSelectionModel();	
	comm_cn = sm.selected.items[0].data.control_number;
	comm_priority = sm.selected.items[0].data.priority;
	comm_division_id = sm.selected.items[0].data.division_code;
	comm_action = Ext.getCmp("action_taken").getValue();

	var txtMsg = "Updated action taken for communication CN# " + comm_cn + ": " + comm_action;
	var senderModule = 'Incoming Communications - Action Taken'
	value = comm_division_id.split(",")
	console.log(value)
	if (value.includes("1")) {
		txtMsg =  "Updated action taken for communication CN# " + comm_cn + " assigned to ASSD: " + comm_action
		sendSMS4('09XXXXXXXXX', txtMsg, senderModule)
	}
	if (value.includes("2")) {
		txtMsg = "Updated action taken for communication CN# " + comm_cn + " assigned to UDP: " + comm_action
		sendSMS4('09XXXXXXXXX', txtMsg, senderModule)
		sendSMS4('09XXXXXXXXX', txtMsg, senderModule)
	}
	if (value.includes("4")) {
		txtMsg =  "Updated action taken for communication CN# " + comm_cn + " assigned to LHE: " + comm_action
		sendSMS4('09XXXXXXXXX', txtMsg, senderModule)
	}
	if (value.includes("6")) {
		txtMsg = "Updated action taken for communication CN# " + comm_cn + " assigned to HCD: " + comm_action
		sendSMS4('09XXXXXXXXX', txtMsg, senderModule)
	}
	//CC to DH
	sendSMS4('09XXXXXXXXX', txtMsg, senderModule)
	//CC to ICT
	sendSMS4('09XXXXXXXXX', txtMsg, senderModule)
	addeditFunction('adminservices_incoming_records/actiontaken_crud', params, 'incomingRecordsListGrid', null, actionTakenForm, actionTakenWindow);
}

function UpdateActionTaken(isAsstDepartmentHead)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
	var sm = Ext.getCmp("incomingRecordsListGrid").getSelectionModel();

	if (!sm.hasSelection())
	{
		errorFunction("Warning","Please select a record!");
		return;
	}
	//if sm.selected.items[

	//if (isAsstDepartmentHead && sm.selected.items[0].data.division_code != 'ASSD')
	//{
	//	warningFunction("Warning","Cannot update action taken.");
	//	return;
	//}
	if (sm.selected.items[0].data.status == 'Pending Acknowledgement')
	{
		warningFunction("Warning","Acknowledge that you have read the communication first before updating action taken.");
		return;
	}

	incomingRecordID = sm.selected.items[0].data.id;
	actionTakenForm = Ext.create('Ext.form.Panel', {
		border		: false,
		bodyStyle	: 'padding:10px;',	
		fieldDefaults: {
			labelAlign		: 'right',
			labelWidth		: 100,
			afterLabelTextTpl: required,
			msgTarget 		: 'side',
			anchor			: '100%',
			allowBlank 		: false,
			enableKeyEvents : true
        },	
		items: [{
				xtype		: 'textarea',	
				id			: 'action_taken',				
				name		: 'action_taken',				
				labelAlign	: 'right',
				anchor		: '100%',
				fieldLabel	: 'Action Taken',
				afterLabelTextTpl: null,
				msgTarget	: 'side',
				minLength	: 20,
				minLengthText: 'Action taken too short.',
				listeners 	: {
					// dynamically remove extra spaces
					change : function(textarea, newValue, oldValue, eOpts) {
            			textarea.setValue(textarea.value.replace(/\s\s+/g, ' '));
            		}
				}
			},
			{
				xtype: 'fieldcontainer',
				defaultType: 'radiofield',
				id: 'radio_flags',
				name: 'radio_flags',
				defaults: { flex: 1 },
				margin: '12px',
				layout: 'hbox',
				items: [
					{
						boxLabel: 'On Process / Work in Progress',
						name: 'radmod',
						value: 1,
						inputValue: 'onProcess',
						id: 'rbtnOnProcess'
					},
					{
						boxLabel: 'Completed ',						
						name: 'radmod',
						value: 0,
						inputValue: 'isComplete',
						id: 'rbtnIsComplete'
					}
				]
			}                            
		]
	});

	actionTakenWindow = Ext.create('Ext.window.Window', {
		title		: 'New Action Taken',
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
					errorFunction("Error!",'Please check the required field/s (Marked red).');
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
		    text	: 'Close',
		    icon	: './image/close.png',
		    handler: function ()
		    {
		    	actionTakenWindow.close();
		    }
		}],
	}).show();
	Ext.getCmp("action_taken").focus();

	actionTakenForm.getForm().load({
		url: 'adminservices_incoming_records/actiontaken_view',
		timeout: 30000,
		waitMsg:'Loading data...',
		params: { id: this.incomingRecordID },
		success: function(form, action) {
			actionTakenWindow.show();
			var data = action.result.data;

		},
		failure: function(f, action) { errorFunction("Error!",'Please contact system administrator.'); }
	});
}