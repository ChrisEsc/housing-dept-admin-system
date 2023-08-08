var id;

function ExportRequestForm(type) {
    params = new Object();
    params.query            = query;
    params.type             = type;
    params.id               = this.id;
    params.filetype         = 'form';
    ExportDocument('adminservices_outgoing_records/exportdocument', params, type);
}

function View()
{   
    alert ('view function');
    var sm = Ext.getCmp("outgoingRecordsListGrid").getSelectionModel();
    if (!sm.hasSelection())
    {
        errorFunction("Warning","Please select a record!");
        return;
    }
    id = sm.selected.items[0].data.id;
    alert ('selected id ' + id);
    Ext.MessageBox.wait('Loading...');
    Ext.Ajax.request({
        url     :"adminservices_outgoing_records/view",
        method  : 'POST',
        params  : { id: id},
        success: function(f,a)
        {
            var response = Ext.decode(f.responseText);     
            var htmlData =
                '<table width="100%" style="background: #ff6666;border: solid 1px white;">' +
                    '<tr style="background: #ff6666;">';

            htmlData +=                    
                '</tr><tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;" width="20%"><font color=black size=2>Control #</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;" width="80%"><font color=black size=2>'+response.header_details[0].control_number+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Com. Date</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].date_communication+'</td>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Details</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].details+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>From</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].from_name+'</td>' +
                '</tr>'  +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>For/To</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].to_name+'</td>' +
                '</tr>';

            htmlData += '</table>';
            htmlData +=
                '<table width="100%" style="background: #5aa865;border: solid 1px white;">';

            htmlData += '<tr style="background: #5aa865;"></tr><td colspan="7" align="center" style="padding: 2px;" width="100%"><font color=white size=2><b>Filed Copy Details</b></font></td></tr>';
            htmlData += '<tr >' +
                        '<td valign="top" align="center" style="background: #c1e1c6; padding: 2px;" width="5%"><font color=black size=2><b>No.</b></td>' +
                        '<td valign="top" align="left" style="background: #c1e1c6; padding: 2px;" width="50%"><font color=black size=2><b>Attachment</b></td>' +
                        '<td valign="top" align="left" style="background: #c1e1c6; padding: 2px;" width="45%"><font color=black size=2><b>Description</b></td>';

            for (var i = 0; i < response.attachments_count; i++) { 
                    htmlData += '</tr><tr >' +
                        '<td valign="top" align="center" style="background: #c1e1c6; padding: 2px;" ><font color=black size=2>'+(i+1)+'</td>' +
                        '<td valign="top" align="left" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2><a href="'+response.attachments[i].attachment_path+'" target=blank download>'+response.attachments[i].attachment_full_name+'</a></td>' +
                        '<td valign="top" align="left" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+response.attachments[i].description+'</td>' +
                        '</tr>';
            };

            htmlData += '</table>';
            var htmlTrackingData =
                '<table width="100%" style="background: #ff6666;border: solid 1px white;">';

            htmlTrackingData += '<tr style="background: #ff6666;"></tr><td colspan="7" align="center" style="padding: 2px;" width="100%"><font color=white size=2><b>Tracking Details</b></font></td></tr>';
            htmlTrackingData +=                    
                '</tr><tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;" width="20%"><font color=black size=2>Date Logged</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;" width="80%"><font color=black size=2>'+response.tracking_details[0].date_logged+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Status</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.tracking_details[0].status+'</td>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>From Division</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.tracking_details[0].assigned_division_name+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Action Taken by Division</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.tracking_details[0].action_taken+'</td>' +
                '</tr>'  +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Action Taken Date</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.tracking_details[0].action_taken_date+'</td>' +
                '</tr>'  +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Days from Action Taken</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.tracking_details[0].duration_action_taken+'</td>' +
                '</tr>';

            htmlTrackingData += '</table>';

            var htmlLoad = new Ext.XTemplate(htmlData);
            var htmlApprovers = new Ext.XTemplate(htmlTrackingData);
            var centerPanel = Ext.create('Ext.panel.Panel', {
                region  : 'center',
                autoScroll : true,
                buttonAlign : 'center',
                html    : htmlLoad.applyTemplate(null),
                buttons: [{
                    text    : 'Close',
                    icon    : './image/close.png',
                    handler: function ()
                    {
                        mainWindow.close();
                    }
                }]
            });

            var eastPanel = Ext.create('Ext.panel.Panel', {
                title   : 'Tracking',
                split   : true,
                collapsed: true,
                collapsible: true,
                region  : 'east',
                autoScroll : true,
                width   : '100%',           
                html    : htmlApprovers.applyTemplate(null)
            });

            mainWindow = Ext.create('Ext.window.Window', {
                title       : 'Outgoing Communication Details',
                header      : {titleAlign: 'center'},
                closable    : true,
                modal       : true,
                width       : 750,
                height      : 410,
                resizable   : false,        
                layout      : 'border',
                items       : [eastPanel, centerPanel]
            }).show();
            Ext.MessageBox.hide();  
        }
    });    
}