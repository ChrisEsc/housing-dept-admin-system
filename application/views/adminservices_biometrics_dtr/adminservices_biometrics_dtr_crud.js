var dtr_header_ids = new Array();
var days = new Array();
var dtr_datas = new Array();

function biometricsDtrCRUD()
{
	params = new Object();
	params.dtr_header_ids 	= dtr_header_ids.toString();
	params.days 			= days.toString();
	params.dtr_datas		= dtr_datas.toString();

	// change this function to own ajax call, not function call - because save button's disable property needs to be changed
	// deleteFunction('adminservices_biometrics_dtr/crud', params, 'biometricsRecordsListGrid', null);

	processingFunction("Processing data, please wait...");
	Ext.Ajax.request({
		url 	:"adminservices_biometrics_dtr/crud",
		method 	: 'POST',
		params 	: {
			dtr_header_ids 	: dtr_header_ids.toString(), 
			days 			: days.toString(), 
			dtr_datas 		: dtr_datas.toString()
		},
		success : function(f,a)
		{
			Ext.MessageBox.hide();
			var response = Ext.decode(f.responseText);									
			if (response.success == true)
			{
				Ext.getCmp("save").setDisabled(true);
				Ext.getCmp("biometricsRecordsListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});
				infoFunction('Status', response.data);
			}
			else
				errorFunction("Error!",response.data);
		}
	});
}

function BatchSaveDTRModifications()
{
	Ext.Msg.show({
		title	: 'Confirmation',
		msg		: 'Are you sure you want to save?',
		width	: '100%',
		icon	: Ext.Msg.QUESTION,
		buttons	: Ext.Msg.YESNO,
		fn: function(btn){
			if (btn == 'yes')
			{
				biometricsDtrCRUD();
			}
		}
	});
}