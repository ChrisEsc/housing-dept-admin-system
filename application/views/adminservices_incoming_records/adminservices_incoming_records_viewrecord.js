var id;

function ExportForm(type) {

    params = new Object();
    params.query            = query;
    params.type             = type;
    params.id               = this.id;
    params.filetype         = 'form';
    ExportDocument('adminservices_incoming_records/exportdocument', params, type);

}

function ViewRecord()
{   
    var sm = Ext.getCmp("incomingRecordsListGrid").getSelectionModel();
    if (!sm.hasSelection())
    {
        warningFunction("Warning","Please select a record!");
        return;
    }
    id = sm.selected.items[0].data.id;

    Ext.MessageBox.wait('Loading...');
    Ext.Ajax.request(
    {
        url     : "adminservices_incoming_records/view",
        method  : 'POST',
        params  : {id: id},

        success: function(f,a)
        {
            var response = Ext.decode(f.responseText);     
            var htmlData =
                '<table width="100%" style="background: #ff6666;border: solid 1px white;">' +
                    '<tr width="100%" style="background: #ff6666;">';

            htmlData +=                    
                '</tr><tr >' +
                '<td width="20%" valign="top" align="right" style="background: #ffbec2; padding: 2px;" width="20%"><font color=black size=2>Control #</td>' +
                '<td width="80%" valign="top" align="left" style="background: #ffd9d9; padding: 2px;" width="80%"><font color=black size=2>'+response.header_details[0].control_number+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td width="20%" valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Com. Date</td>' +
                '<td width="80%" valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].date_communication+'</td>' +
                '<tr >' +
                '<td width="20%" valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Details</td>' +
                '<td width="80%" valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].details+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td width="20%" valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>From</td>' +
                '<td width="80%" valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].from_name+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td width="20%" valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Originating Office</td>' +
                '<td width="80%" valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>' + response.header_details[0].from_office + '</td>' +
                '</tr>' +
                '<tr >' +
                '<td width="20%" valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>For/To</td>' +
                '<td width="80%" valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].to_name+'</td>' +
                '</tr>' + 
                '<tr >' +
                '<td width="20%" valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Resolve By</td>' +
                '<td width="80%" valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>' + response.header_details[0].date_deadline + '</td>' +
                '</tr>'
                //'<tr>' +
                //'<td width="20%" valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Action Taken History</td>' +
                //'<td width="80%" valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>' + response.header_details[0].actions_taken + '</td>' +
                //'</tr>' 
                    ;

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
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Assigned Division</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.tracking_details[0].assigned_division_name+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Side Notes</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.tracking_details[0].side_notes+'</td>' +
                '</tr>'  +
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
                buttons: [
                // {
                //     text: 'Download',
                //     tooltip: 'Extract Data to PDF or EXCEL File Format',
                //     icon: './image/download.png',
                //     menu: 
                //     {
                //         items: 
                //         [
                //             {
                //                 text    : 'Export PDF Format',
                //                 icon: './image/pdf.png',
                //                 handler: function ()
                //                 {
                //                     ExportForm('PDF');
                //                 }
                //             }, 
                //             {
                //                 text    : 'Export Excel Format',
                //                 icon: './image/excel.png',
                //                 handler: function ()
                //                 {
                //                     ExportForm('Excel');
                //                 }
                //             }
                //         ]
                //     }
                // },
                {
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
                title       : 'Incoming Communication Details',
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