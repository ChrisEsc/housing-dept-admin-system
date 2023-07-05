//function not used, because of some unpredictable bugs/errors
function upload_biometricsfile(type)
{
	params 					= new Object();
	params.record_id 		= incomingRecordID;
	params.type				= type;

	//delete function not implmented yet
	if (type == "Delete")
	{
		params.id			= attachmentID;
		deleteFunction('adminservices_biometrics_dtr/upload_biometricsfile', params, 'biometricsRecordsListGrid', null);
	}
	else
	{
		addeditFunction('adminservices_biometrics_dtr/upload_biometricsfile', params, 'biometricsRecordsListGrid', null, uploadForm, uploadWindow);
	}

	Ext.getCmp("pageToolbar").moveFirst();
}

function UploadBiometricsFile(type)
{        
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

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
					upload_biometricsfile(type);
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
	            emptyText: 'Select Biometrics Log File..',
	            fieldLabel: 'File',
	            fileInputAttributes: {
		            accept: 'application/xml'
		        }
	        }]
		});

		uploadWindow = Ext.create('Ext.window.Window', {
			title		: 'Upload Biometrics File',
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
			                        url: 'adminservices_biometrics_dtr/upload_biometricsfile',
			                        waitMsg: 'Uploading Biometrics Log File',
			                        method: "POST",	
			                        params: {calendar_id: calendar_id, type: type},
			                        timeout: 1800000,
			                        success: function(form, action) {   
			                        	var data = action.result.data;
			                        	Ext.getCmp('biometricsRecordsListGrid').getStore().reload({params:{start:0 }, timeout: 1000});
			                        	infoFunction('Status', action.result.data);
			                        	//infoFunction('Status', 'Successfully Uploaded');
			                            uploadWindow.close();
			                        },
			                        failure: function(form, action) {
			                        	console.log(action.response);
			                            warningFunction('Warning!',action.result.data);
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