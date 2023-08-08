function upload_document(type) 
{
	params 					= new Object();
	params.record_id 		= incomingRecordID;
	params.type				= type;

	//delete function not implmented yet
	if (type == "Delete")
	{
		params.id			= attachmentID;
		deleteFunction('adminservices_incoming_records/upload_document', params, 'incomingRecordsListGrid', null);
	}
	else
	{
		addeditFunction('adminservices_incoming_records/upload_document', params, 'incomingRecordsListGrid', null, uploadForm, uploadWindow);
	}

	Ext.getCmp("pageToolbar").moveFirst();
}

function UploadDocument(type)
{
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	var sm = Ext.getCmp("activityReportingListGrid").getSelectionModel();
	if (!sm.hasSelection())
	{
		errorFunction("Warning","Please select a record!");
		return;
	}

	incomingRecordID = sm.selected.items[0].data.id;

	//delete function not implemented yet
	if (type == 'Delete')
	{
		Ext.Msg.show({
			title	: 'Confirmation',
			msg		: 'Are you sure you want to ' + type + ' record?',
			width	: '100%',
			icon	: Ext.Msg.QUESTION,
			buttons	: Ext.Msg.YESNO,
			fn: function(btn){
				if (btn == 'yes')
					upload_document(type);
			}
		});
	}
	else
	{
		uploadForm = Ext.create('Ext.form.Panel', {
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
			items: [
			{
	            xtype: 'fileuploadfield',
	            buttonText: 'Browse File',
	            name: 'form-file',
	            id: 'form-file',
	            emptyText: 'Select File to Attach..',
	            fieldLabel: 'File',
	            fileInputAttributes: {
		            accept: 'application/xml',
		            multiple: ''
		        }
	        },{
	            xtype       : 'textarea',
	            id          : 'description',
	            name        : 'description',
	            fieldLabel  : 'Description',
	            afterLabelTextTpl: null,
	            allowBlank 	: true
	        }]
		});

		uploadWindow = Ext.create('Ext.window.Window', {
			title		: 'Upload Document',
			closable	: true,
			modal		: true,
			width		: 450,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [uploadForm],
			buttons: [
			{
			    text	: 'Upload',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!uploadForm.form.isValid()){
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
							{
								uploadForm.submit({
			                        url: 'adminservices_incoming_records/upload_document',
			                        waitMsg: 'Uploading document',
			                        method: "POST",	
			                        params: {record_id: incomingRecordID, type: type, com_type: 'Incoming'},
			                        timeout: 1800000,
			                        success: function(form, action) {
			                        	try 
			                        	{
			                        		var data = action.result.data;
			                        		Ext.getCmp('incomingRecordsListGrid').getStore().reload({params:{start:0 }, timeout: 1000});
			                        		infoFunction('Status', action.result.data);
			                        		//infoFunction('Status', 'Successfully Uploaded');
			                            	uploadWindow.close();
			                        	}
			                        	catch(err) {
											// errorFunction("Error!",'Connection Problem / Error Occurred.');
											errorFunction("Error!",err);
										}
			                        	
			                        },
			                        failure: function(form, action) {
			                            errorFunction('Error!',action.result.data);
			                        }
			                    });
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
			    	uploadWindow.close();
			    }
			}],
		}).show();
		Ext.getCmp("form-file").focus();
	}
}