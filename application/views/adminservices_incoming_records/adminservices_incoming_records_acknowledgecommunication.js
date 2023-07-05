function acknowledgeCommunication()
{
	params 		= new Object();
	params.id 	= incomingRecordID;

	addeditFunction('adminservices_incoming_records/acknowledgecommunication_crud', params, 'incomingRecordsListGrid', null, acknowledgementForm, acknowledgementWindow);
}

function AcknowledgeCommunication() {
	var userID = "<?php echo $this->session->userdata('user_id');?>";
	var sectionID = "<?php echo $this->session->userdata('section_id');?>";
	var divisionID = "<?php echo $this->session->userdata('division_id');?>";
	var divisionHead = "<?php echo $this->session->userdata('division_head');?>";
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
	var sm = Ext.getCmp("incomingRecordsListGrid").getSelectionModel();

	if (!sm.hasSelection()) {
		errorFunction("Warning", "Please select a record!");
		return;
	}

	if (sm.selected.items[0].data.status == 'Pending Action Taken' || sm.selected.items[0].data.status == 'Closed') {
		warningFunction("Warning", "Communication already acknowledged.");
		return;
	}

	incomingRecordID = sm.selected.items[0].data.id;
	Ext.Msg.show({
		title	: 'Confirmation',
		msg		: 'Do you want to acknowledge that you have read this communication?',
		width	: '100%',
		icon	: Ext.Msg.QUESTION,
		buttons	: Ext.Msg.YESNO,
		fn 		: function(btn){
			if (btn == 'yes')
			{
				Ext.Ajax.request({
					url 	: "adminservices_incoming_records/acknowledgecommunication_crud",
					method 	: 'POST',
					params 	: {id: incomingRecordID},
					timeout : 1800000,
					success : function(f,action)
					{
						try
						{
							var response = Ext.decode(f.responseText);
							if (response.success == true)
							{
								infoFunction('Status', response.data);
								if (Ext.getCmp("pageToolbar"))	Ext.getCmp("pageToolbar").doRefresh();
								sm.deselectAll();
							}
							else
								warningFunction("Error!",response.data);
						}
						catch(err)
						{
							// errorFunction("Error!", 'Connection Problem / Error Occurred.');
							errorFunction("Error!",err);
						}
					}
				});
			}
		}
	});
	

}