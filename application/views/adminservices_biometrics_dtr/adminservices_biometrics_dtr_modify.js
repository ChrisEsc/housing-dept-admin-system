function ModifyDTR(index, day, type, subtype)
{
	var modified_dtr_string;
	var grid = Ext.getCmp("biometricsRecordsListGrid");
	var store = grid.getStore();
	var day_string = "day_" + day;
	var store_record = store.data.items[index];
	var dtr_data = store_record.data[day_string].trim();
	var split_dtr_data = dtr_data.split("-");

	dtr_header_id = store_record.data['dtr_header_id'];
	
	if (type == "Absent" || type == "Leave")
	{
		if (subtype == "AM")
			modified_dtr_string = type.toUpperCase() + "  " + split_dtr_data[1];
		else if (subtype == "PM")
			modified_dtr_string = split_dtr_data[1] + " " + type.toUpperCase() + " ";
		else
			modified_dtr_string = type.toUpperCase();
	}
	else if (type == "Pass Slip")
	{
		var split_timestamp = split_dtr_data[1].split(" ");
		modified_dtr_string = split_timestamp[0] + " 12:00 12:31 " + split_timestamp[(split_timestamp.length-1)]; 
		console.log(dtr_data);
	}
	else
	{
		ManualModification(index, dtr_data, day_string);
		return;
	}

	var employee_name = store_record.data["employee_name"];
	var timestamps = modified_dtr_string.split(" ");
	var msg = 'Please confirm the attendance of ' + employee_name + ' on ' + month_name + ' ' + day + ':';

	msg += '<br><ul>';
	for (var i = 0; i < timestamps.length;  i++) {
		msg += '<li>' + timestamps[i] + '</li>';
	}
	msg += '</ul>';

	Ext.Msg.show({
		title	: 'Confirmation',
		msg		: msg,
		width	: 300,
		icon	: Ext.Msg.QUESTION,
		buttons	: Ext.Msg.YESNO,
		fn: function(btn){
			if (btn == 'yes')
			{
				modified_dtr_string = "0-" + modified_dtr_string;
				store.data.items[index].data[day_string] = modified_dtr_string;
				Ext.suspendLayouts();
				Ext.getCmp("save").setDisabled(false);
				grid.reconfigure(store);
				grid.getView().select(coordinates[2]);
				grid.getView().focusRow(coordinates[2] + 5);	//5 is offset from bottom upwards, set to center the currently selected row
				Ext.resumeLayouts(true);

				dtr_header_ids.push(dtr_header_id);
				days.push(day);
				dtr_datas.push(modified_dtr_string);
				console.log('DTR Header IDs: ' + dtr_header_ids);
				console.log('Days: ' + days);
				console.log('DTR Data: ' + dtr_datas);
			}
		}
	});
}

function ManualModification(index, dtr_data, day_string)
{
	var split_dtr_data = dtr_data.split("-");
	var timestamps = split_dtr_data[1].split(" ");

	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	manualModificationForm = Ext.create('Ext.form.Panel', {
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
        	xtype 	: 'textfield',
        	id  	: 'morning_time_in',
        	name 	: 'morning_time_in',
        	fieldLabel: 'AM Time-in',
        	value 	: timestamps[0]
        },{
        	xtype 	: 'textfield',
        	id  	: 'morning_time_out',
        	name 	: 'morning_time_out',
        	fieldLabel: 'AM Time-out',
        	value 	: timestamps[1]
        },{
        	xtype 	: 'textfield',
        	id  	: 'afternoon_time_in',
        	name 	: 'afternoon_time_in',
        	fieldLabel: 'PM Time-in',
        	value 	: timestamps[2]
        },{
        	xtype 	: 'textfield',
        	id  	: 'afternoon_time_out',
        	name 	: 'afternoon_time_out',
        	fieldLabel: 'PM Time-out',
        	value 	: timestamps[3]
        }]
	});

	manualModificationWindow = Ext.create('Ext.window.Window', {
		title		: 'Manual Modification',
		closable	: true,
		modal		: true,
		width 		: 300,
		auotoHeight : true,
		buttonAlign : 'center',
		header: {titleAlign: 'center'},
		items: [manualModificationForm],
		buttons: [
		{
			text 	: 'Confirm',
			icon 	: './image/save.png',
			handler: function ()
			{
				if (!manualModificationForm.form.isValid()){
					errorFunction("Error!",'Please fill-in the required fields (Marked red).');
				    return;
		        }
				Ext.Msg.show({
					title	: 'Confirmation',
					msg		: 'Are you sure you want to save?',
					width	: '100%',
					icon	: Ext.Msg.QUESTION,
					buttons	: Ext.Msg.YESNO,
					fn: function(btn){
						if (btn == 'yes')
						{
							var grid = Ext.getCmp("biometricsRecordsListGrid");
							var store = grid.getStore();	
							modified_dtr_string = "0-" + Ext.getCmp("morning_time_in").getRawValue() + " " + Ext.getCmp("morning_time_out").getRawValue() + " " + Ext.getCmp("afternoon_time_in").getRawValue() + " " + Ext.getCmp("afternoon_time_out").getRawValue();
							console.log(modified_dtr_string);

							store.data.items[index].data[day_string] = modified_dtr_string;
							Ext.suspendLayouts();
							grid.reconfigure(store);
							grid.getView().select(coordinates[2]);
							grid.getView().focusRow(coordinates[2] + 5);	//5 is offset from bottom upwards, set to center the currently selected row
							Ext.resumeLayouts(true);

							Ext.getCmp("save").setDisabled(false);
							dtr_header_ids.push(dtr_header_id);
							days.push(day);
							dtr_datas.push(modified_dtr_string);
							// console.log('DTR Header IDs: ' + dtr_header_ids);
							// console.log('Days: ' + days);
							// console.log('DTR Data: ' + dtr_datas);

							manualModificationWindow.close();
						}
					}
				});
			}
		},
		{
			text 	: 'Close',
			icon 	: './image/close.png',
			handler: function ()
			{
				manualModificationWindow.close();
			}
		}]
	}).show();
}	