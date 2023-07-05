var id;

function ExportForm(type) {

    params = new Object();
    params.query            = query;
    params.type             = type;
    params.id               = this.id;
    params.filetype         = 'form';
    ExportDocument('adminservices_plantilla/exportdocument', params, type);

}

function View()
{   
    var sm = Ext.getCmp("positionsListGrid").getSelectionModel();
    id = sm.selected.items[0].data.id;
    if (!sm.hasSelection())
    {
        errorFunction("Warning","Please select a record!");
        return;
    }

    Ext.MessageBox.wait('Loading...');
    Ext.Ajax.request(
      {
            url     : "adminservices_plantilla/view",
            method  : 'POST',
            params  : {id: id},
            success: function(f,a)
            {
                var response = Ext.decode(f.responseText);     
                var htmlData =
                    '<table width="100%" style="background: #ff6666;border: solid 1px white;">' +
                        '<tr style="background: #ff6666;">';

                htmlData +=                    
                    '</tr><tr >' +
                    '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;" width="15%"><font color=black size=2>Plate No.</td>' +
                    '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;" width="85%"><font color=black size=2>'+response.details[0].item_number+'</td>' +
                    '</tr>' +
                    '<tr >' +
                    '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Vehicle Description</td>' +
                    '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.details[0].position_description+'</td>' +
                    '<tr >' +
                    '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Policy No.</td>' +
                    '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.details[0].division_description+'</td>' +
                    '</tr>' +
                    '<tr >' +
                    '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Status</td>' +
                    '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.details[0].salary_grade+'</td>' +
                    '</tr>';

                htmlData += '</table>';

                htmlData +=
                    '<table width="100%" style="background: #5aa865;border: solid 1px white;">';

                htmlData += '<tr style="background: #5aa865;"></tr><td colspan="7" align="center" style="padding: 2px;" width="100%"><font color=white size=2><b>VEHICLE INSURANCE HISTORY</b></font></td></tr>';
                htmlData += '<tr >' +
                            '<td rowspan="2" valign="top" align="center" style="background: #c1e1c6; padding: 2px;" width="5%"><font color=black size=2><b>No.</b></td>' +
                            '<td rowspan="2" valign="top" align="left" style="background: #c1e1c6; padding: 2px;" width="20%"><font color=black size=2><b>Name of Incumbent</b></td>' +
                            '<td colspan="2" valign="top" align="left" style="background: #c1e1c6; padding: 2px;" width="25%"><font color=black size=2><b>Date of Appointment</b></td>' +
                            '<td rowspan="2" valign="top" align="left" style="background: #c1e1c6; padding: 2px;" width="25%"><font color=black size=2><b>Remarks</b></td>'
                            '</tr>' +
                            '<td valign="top" align="center" style="background: #c1e1c6; padding: 2px;" width="5%"><font color=black size=2><b>From</b></td>' +
                            '<td valign="top" align="left" style="background: #c1e1c6; padding: 2px;" width="20%"><font color=black size=2><b>To</b></td>' +
                            '</tr>';
                           
                for (var i = 0; i < response.history_count; i++) {
                     
                     htmlData += '</tr><tr >' +
                            '<td valign="top" align="center" style="background: #c1e1c6; padding: 2px;" ><font color=black size=2>'+(i+1)+'</td>' +
                            '<td valign="top" align="left" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+response.history[i].staff_name+'</td>' +
                            '<td valign="top" align="left" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+response.history[i].date_appointed+'</td>' +
                            '<td valign="top" align="left" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+response.history[i].date_vacated+'</td>' +
                            '<td valign="top" align="left" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+response.history[i].remarks+'</td>' +
                            '</tr>';

                };

                htmlData += '</table>';

                var htmlLoad = new Ext.XTemplate(htmlData);
                  
                var centerPanel = Ext.create('Ext.panel.Panel', {
                    region  : 'center',
                    autoScroll : true,
                    buttonAlign : 'center',
                    html    : htmlLoad.applyTemplate(null),
                    buttons: [
                    {
                        text: 'Download',
                        tooltip: 'Extract Data to PDF or EXCEL File Format',
                        icon: './image/download.png',
                        menu: 
                        {
                            items: 
                            [
                                {
                                    text    : 'Export PDF Format',
                                    icon: './image/pdf.png',
                                    handler: function ()
                                    {
                                        ExportRequestForm('PDF');
                                    }
                                }, 
                                {
                                    text    : 'Export Excel Format',
                                    icon: './image/excel.png',
                                    handler: function ()
                                    {
                                        ExportRequestForm('Excel');
                                    }
                                }
                            ]
                        }
                    },
                    {
                        text    : 'Close',
                        icon    : './image/close.png',
                        handler: function ()
                        {
                            mainWindow.close();
                        }
                    }]
                });

                mainWindow = Ext.create('Ext.window.Window', {
                    title       : 'Position Details',
                    header      : {titleAlign: 'center'},
                    closable    : true,
                    modal       : true,
                    width       : 750,
                    height      : 410,
                    resizable   : false,        
                    layout      : 'border',
                    items       : [centerPanel]
                }).show();
                Ext.MessageBox.hide();  
            }
    });    
}