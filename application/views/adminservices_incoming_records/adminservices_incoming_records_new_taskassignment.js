var divisionAssignmentWindow, divisionAssignmentForm;
var priority_id;
var secselarray, section_id

function sectionTxtBlaster(sec_id, txtmsg, item, index)
{
	if (item[0] == sec_id ) {
		smsDataBuilder(item[3], txtmsg)
	}
}

function divisionTxtBlaster(div_id, txtmsg, item, index) {
	if (item[0] == div_id || item[0] == 'cc') {
		smsDataBuilder(item[2], txtmsg)
	}
}

var smsData = null;
function smsDataBuilder(toWho, sendWhat) {
	var smsText = '{"sendto"' + ':' + '"' + toWho + '",' +
		'"body"' + ':' + '"' + sendWhat + '",' +
		'"device_id"' + ':' +  '3274' +'}'
	if (smsData == null) {
		smsData = smsText;
	}
	else {
		smsData = smsData + ',' +  smsText ;
	}
}

function sendToSections(section_list, priority_id) {
	sm = Ext.getCmp("incomingRecordsListGrid").getSelectionModel();
	comm_text = sm.selected.items[0].data.subject
	comm_text2 = Ext.util.Format.stripTags(comm_text)
	comm_cn = sm.selected.items[0].data.control_number
	comm_from = sm.selected.items[0].data.from_name
	comm_date = sm.selected.items[0].data.date_communication

	if (priority_id == 4) {
		comm_priority = 'Urgent'
	}
	else if (priority_id == 3) {
		comm_priority = 'High'
	}
	else {
		comm_priority = 'Normal'
	}

	txtMsg =  comm_priority + ' priority incoming communication from ' + comm_from + ' with control no. ' + comm_cn + ' dated ' + comm_date + ' ' + comm_text2

	txtCount = 0
	for (i = 0; i <= section_list.length; i++) {
		// sendSMSXHR(toWhom, txtMessage, senderModule)
		// send to section head
		sendSMS4(section_list[i], txtMsg, "Incoming Communications - Task Assignment")
		txtCount += 1;
	}
	//add provision here to message big bosses
	txtCount += 1;
	sendSMS4('09XXXXXXXXX', txtMsg, "Incoming Communications - Task Assignment");
	return txtCount
}

var division_id_list = null
function getDivisionList(item)
{

}
function divisionAssignmentCRUD()
{
	section_id_list = Array.from(section_id);
	division_id_list = []
	
	//handle division formatting here
	i = 0
	for (i = 0; i <= section_id_list.length; i++)
	{
		var x = String(section_id_list[i])
		switch (x) {
			case '2' : case '21' : case '23' : case '29':

				if (division_id_list.includes('1') == false) {
					division_id_list.push('1')
				}
				break;
			case '4' : case '5' : case '25':
				if (division_id_list.includes('2') == false) {
					division_id_list.push('2')
				}
				break;
			case '8' : case '9' : case '10':
				if (division_id_list.includes('4') == false) {
					division_id_list.push('4')
				}
				break;
			case '12' : case '18' : case '20':
				if (division_id_list.includes('6') == false) {
					division_id_list.push('6')
				}
				break;
        }
    }
	params = new Object();
	params.id = incomingRecordID;
	params.division_id = '"' + division_id_list.toString() + '"'
	params.section_id = '"'+ section_id.toString() + '"'
	params.priority_id = priority_id;

	sendToSections(section_id_list, priority_id)
	addeditFunction('adminservices_incoming_records/divisionassignment_crud', params, 'incomingRecordsListGrid', null, divisionAssignmentForm, divisionAssignmentWindow);
}

function DivisionAssignment()
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	var sm = Ext.getCmp("incomingRecordsListGrid").getSelectionModel();
	if (!sm.hasSelection())
	{
		errorFunction("Warning","Please select a record!");
		return;
	}
	
	incomingRecordID = sm.selected.items[0].data.id;

	divisionAssignmentForm = Ext.create('Ext.form.Panel', {
		border: false,
		bodyStyle: 'padding:10px;',
		fieldDefaults: {
			labelAlign: 'right',
			labelWidth: 100,
			afterLabelTextTpl: required,
			msgTarget: 'side',
			anchor: '100%',
			allowBlank: false
		},
		items: [{
				xtype: 'checkboxgroup',
				id: 'chkgroup',
				name: 'chkgroup',
				fieldLabel: 'Delegate to the following sections',
				checkedArr: [],
				columns: 5,
				vertical: true,
				labelAlign: 'top',
				allowBlank: false,
				itemId: 'mySections',
				defaults: {
					flex: 1,
					name: 'myCheck',
					listeners: {
						change: function (field, newValue, oldValue) {
							var group = field.up('checkboxgroup');
							if (field.name == 'all') {
								//group.doCheckUnCheck
							} else {
								var len = group.query('[name=section]').length;
								//allCB = group.down('[name=section]');

								if (newValue) {
									group.checkedArr.push(field.inputValue);
									secselarray = group.checkedArr;
								} else {
									Ext.Array.remove(group.checkedArr, field.inputValue);
									secselarray = group.checkedArr;
								}
								//group.doSetCBValue(allCB, len == group.checkedArr.length)
							}
						}
					}
                },
				doSetCBValue: function (f, v) {
					//Check or uncheck
					f.suspendEvent('change');
					f.setValue(v);
					f.resumeEvent('change');
				},
				items: [{
					xtype: 'checkbox',
					id: 'chk2',
					boxLabel: 'FMSS',
					name: 'section',
					inputValue: 2
				}, {
					xtype: 'checkbox',
					id: 'chk21',
					boxLabel: 'HRMD',
					name: 'section',
					inputValue: 21
				}, {
					xtype: 'checkbox',
					id: 'chk4',
					boxLabel: 'ICT',
					name: 'section',
					inputValue: 4
				}, {
					xtype: 'checkbox',
					id: 'chk5',
					boxLabel: 'UPS',
					name: 'section',
					inputValue: 5
				}, {
					xtype: 'checkbox',
					id: 'chk25',
					boxLabel: 'APS',
					name: 'section',
					inputValue: 25
				}, {
					xtype: 'checkbox',
					id: 'chk8',
					boxLabel: 'LABS',
					name: 'section',
					inputValue: 8
				}, {
					xtype: 'checkbox',
					id: 'chk9',
					boxLabel: 'HCS',
					name: 'section',
					inputValue: 9
				}, {
					xtype: 'checkbox',
					id: 'chk10',
					boxLabel: 'ES',
					name: 'section',
					inputValue: 10
				}, {
					xtype: 'checkbox',
					id: 'chk12',
					boxLabel: 'CSEM',
					name: 'section',
					inputValue: 12
				}, {
					xtype: 'checkbox',
					id: 'chk18',
					boxLabel: 'HROD',
					name: 'section',
					inputValue: 18
				}, {
					xtype: 'checkbox',
					id: 'chk20',
					boxLabel: 'SEP',
					name: 'section',
					inputValue: 20
				}, {
					xtype: 'checkbox',
					id: 'chk29',
					boxLabel: 'PDRM (Formerly PDM)',
					name: 'section',
					inputValue: 29
				}]
			},
			//{
			//	xtype: 'displayfield',
			//	value: '',
			//	itemId: 'yourSelection',
			//	fieldLabel: '<b>You have Selected</b>',
			//	anchor: '100%'
			//},
			{
            xtype       : 'combo',
            flex        : 1,
            labelAlign  : 'right',
            id          : 'priority_description',
            fieldLabel  : 'Priority',
            valueField  : 'id',
            displayField: 'description_style',
            triggerAction: 'all',
            minChars    : 3,
            enableKeyEvents: true,
            matchFieldWidth: true,
            editable 	: false,
            tpl 		: Ext.create('Ext.XTemplate',
            						'<tpl for=".">',
            						'<div class="x-boundlist-item" style="background-color: {value}"><font color=white><b>{description}</b></font></div>',
            						'</tpl>'),
            store           : new Ext.data.ArrayStore({
                fields: ['id', 'description', 'value'],
                data: [
                	[4, 'Urgent', '#ec5d5d'], 
					//[3, 'High', '#FFD700'],
					[2, 'Normal', '#5391e1'], 
                	[1, 'Low', '#34bb50']]
            }),
            listeners: 
            {
            	change: function (element, newValue)
            	{
            		var backgroundColor;
            		var inputEl = element.inputCell.child('input');

            		if (newValue == 1) newValue = "#34bb50";
					else if (newValue == 2) newValue = "#5391e1";
					else if (newValue == 3) newValue = "#FFD700";
            		else if (newValue == 4) newValue = "#ec5d5d";
            		inputEl.applyStyles('background-color:' + newValue);
            		inputEl.applyStyles('background-image: none');
            		inputEl.applyStyles('color:white');
            		inputEl.applyStyles('font-weight:bold');
            	},
                select: function (combo, record, index)
                {        
                    Ext.get('priority_description').dom.value = record[0].data.id;
                    Ext.getCmp("priority_description").setRawValue(record[0].data.description);
                }
            }
        },{
			xtype		: 'textarea',	
			id			: 'side_notes',				
			name		: 'side_notes',				
			labelAlign	: 'right',
			anchor		: '100%',
			fieldLabel	: 'Side Notes',
			afterLabelTextTpl: null,
			msgTarget	: 'side',
			allowBlank	: true
		}]
	});
	divisionAssignmentWindow = Ext.create('Ext.window.Window', {
		title		: 'Task Assignment',
		closable	: true,
		width		: 400,
		modal		: true,
		autoHeight	: true,
		resizable	: false,
		buttonAlign	: 'center',
		header: {titleAlign: 'center'},
		items: [divisionAssignmentForm],
		buttons: [
		{
		    text	: 'Update',
		    icon	: './image/save.png',
		    handler: function ()
		    {
		    	if (!divisionAssignmentForm.form.isValid()){
					errorFunction("Error!",'Please fill-in the required fields (Marked red).');
				    return;
		        }
				Ext.Msg.show({
					title	: 'Confirmation',
					msg		: 'Are you sure you want to set section assignment?',
					width	: '100%',
					icon	: Ext.Msg.QUESTION,
					buttons	: Ext.Msg.YESNO,
					fn: function(btn){
						if (btn == 'yes')
						{
							///something is wrong here
							section_id = secselarray //secselarray.toString();
							priority_id = Ext.get('priority_description').dom.value;
							divisionAssignmentCRUD();
						}
					}
				});
		    }
		},
		{
		    text	: 'Close',
		    icon	: './image/close.png',
		    handler: function ()
		    {
		    	divisionAssignmentWindow.close();
		    }
		}],
	}).show();
	Ext.getCmp("side_notes").focus();
	divisionAssignmentForm.getForm().load ({
		url: 'adminservices_incoming_records/divisionassignment_view',
		timeout: 30000,
		waitMsg:'Loading data...',
		params: { id: this.incomingRecordID },
		success: function(form, action) {
			divisionAssignmentWindow.show();
			var data = action.result.data;
			//Ext.get('division_description').dom.value = data.division_id;
			//Ext.getCmp("division_description").setRawValue(data.division_description);

			//var div_assign = data.division_id;
			var section_assign2 = data.section_id.split(","); //this is faulty af
			//var div_assign = div_assign.split(data.division_id, ",");
			section_assign2.forEach(loadDivCheckboxes);

			function loadDivCheckboxes(item) {
				if (item == 2) {
					Ext.getCmp('chk2').setValue(true);
				}
				if (item == 4) {
					Ext.getCmp('chk4').setValue(true);
				}
				if (item== 5) {
					Ext.getCmp('chk5').setValue(true);
				}
				if (item == 8) {
					Ext.getCmp('chk8').setValue(true);
				}
				if (item == 9) {
					Ext.getCmp('chk9').setValue(true);
				}
				if (item == 10) {
					Ext.getCmp('chk10').setValue(true);
				}
				if (item == 12) {
					Ext.getCmp('chk12').setValue(true);
				}
				if (item == 18) {
					Ext.getCmp('chk18').setValue(true);
				}
				if (item == 20) {
					Ext.getCmp('chk20').setValue(true);
				}
				if (item == 21) {
					Ext.getCmp('chk21').setValue(true);
				}
				if (item == 23) {
					Ext.getCmp('chk23').setValue(true);
				}
				if (item == 25) {
					Ext.getCmp('chk25').setValue(true);
				}
				if (item == 28) {
					Ext.getCmp('chk28').setValue(true);
				}
				if (item == 29) {
					Ext.getCmp('chk29').setValue(true);
				}
			}

			Ext.getCmp("priority_description").setValue(data.priority_id);
			Ext.get('priority_description').dom.value = data.priority_id;
			Ext.getCmp("priority_description").setRawValue(data.priority_description);
		},
		failure: function(f, action) { errorFunction("Error!",'Please contact system administrator.'); }
	});
}