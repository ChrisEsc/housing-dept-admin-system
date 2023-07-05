var calendar_id;
var northPanel, centerPanel, htmlLoad;
var htmlData = "";

function ViewDTR(calendar_id)
{
    northPanel = Ext.create('Ext.panel.Panel', {
        region      : 'north',
        width       : '100%',
        bodyStyle   : 'padding:5px; background:#5aa865;',
        layout      : {
            type        : 'hbox',
            pack        : 'center'
        },
        autoScroll  : true,
        items   :[{
            xtype           : 'combo',
            labelAlign      : 'left',
            id              : 'month',
            name            : 'month',
            fieldLabel      : 'Month',
            valueField      : 'id',
            displayField    : 'month_description',
            labelStyle      : 'font-weight: bold; color: white;',
            triggerAction   : 'all',
            enableKeyEvents : true,
            matchFieldWidth : true,
            forceSelection  : true,
            editable        : false,
            store: new Ext.data.JsonStore({ 
                proxy: {
                    type: 'ajax',
                    url: 'adminservices_biometrics_dtr/monthslist',
                    timeout : 1800000,
                    reader: {
                        type: 'json',
                        root: 'data',
                        idProperty: 'id'
                    }
                },
                params: {start: 0, limit: 10},
                fields: [{name: 'id', type: 'int'}, 'calendar_month', 'calendar_year', 'month_description']
            }),
            listeners: 
            {
                select: function (combo, record, index)
                {   
                    calendar_id = record[0].data.id;
                    Ext.get('month').dom.value = calendar_id;
                    Ext.getCmp("month").setRawValue(record[0].data.month_description);
                    ReloadDTR(calendar_id);
                }
            }
        }]
    });

    htmlLoad = new Ext.XTemplate(htmlData);
    centerPanel = Ext.create('Ext.panel.Panel', {
        region  : 'center',
        autoScroll : true,
        buttonAlign : 'center',
        html    : htmlLoad.applyTemplate(null),
        buttons: [{
            text    : 'Close',
            icon    : '../image/close.png',
            handler: function ()
            {
                mainWindow.close();
            }
        }]
    });

    mainWindow = Ext.create('Ext.window.Window', {
        title       : 'Daily Time Record',
        header      : {titleAlign: 'center'},
        closable    : true, 
        modal       : true,
        width       : 550,
        height      : 750,
        resizable   : false,        
        layout      : 'border',
        items       : [northPanel, centerPanel]
    }).show();
    
    ReloadDTR(calendar_id);
}

function ReloadDTR(calendar_id)
{
    //Ext.MessageBox.wait('Loading...');
    Ext.Ajax.request(
    {
        url     : "adminservices_biometrics_dtr/view_monthly_dtr",
        method  : 'POST',
        params  : {calendar_id: calendar_id, employee_id: employee_id},
        success : function(f,a)
        {
            var response = Ext.decode(f.responseText);     

            Ext.getCmp("month").setRawValue(response.header_details[0].month_description);
            //Ext.get('month').dom.value = response.header_details[0].calendar_id;
            
            var htmlData =
                '<table width="100%" style="background: #ff6666;border: solid 1px white;">' +
                    '<tr style="background: #ff6666;">';

            htmlData +=                    
                '</tr><tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;" width="30%"><font color=black size=2>Employee ID</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;" width="70%"><font color=black size=2>'+response.header_details[0].employee_id+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Name</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].name+'</td>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Position</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].position_description+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Total Tardy (min.):</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].total_tardy+'</td>' +
                '</tr>'  +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Total Undertime (min.)</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].total_undertime+'</td>' +
                '</tr>' +
                '<tr >' +
                '<td valign="top" align="right" style="background: #ffbec2; padding: 2px;"><font color=black size=2>Total Absences (days)</td>' +
                '<td valign="top" align="left" style="background: #ffd9d9; padding: 2px;"><font color=black size=2>'+response.header_details[0].total_absences+'</td>' +
                '</tr>';

            htmlData += '</table>';

            htmlData +=
                '<table width="100%" style="background: #5aa865;border: solid 1px white;">';

            htmlData += '<tr style="background: #5aa865;"></tr><td colspan="7" align="center" style="padding: 2px;" width="100%"><font color=white size=2><b>LOGS</b></font></td></tr>';
            htmlData += '<tr>' +
                        '<td rowspan="2" align="center" style="background: #c1e1c6; padding: 2px;" width="20%"><font color=black size=2><b>Day</b></td>' +
                        '<td colspan="2" align="center" style="background: #c1e1c6; padding: 2px;" width="40%"><font color=black size=2><b>A.M.</b></td>' +
                        '<td colspan="2" align="center" style="background: #c1e1c6; padding: 2px;" width="40%"><font color=black size=2><b>P.M.</b></td>' +
                        '</tr>' +
                        '<tr>' +
                        '<td align="center" style="background: #c1e1c6; padding: 2px;" width="20%"><font color=black size=2><b>In</b></td>' +
                        '<td align="center" style="background: #c1e1c6; padding: 2px;" width="20%"><font color=black size=2><b>Out</b></td>' +
                        '<td align="center" style="background: #c1e1c6; padding: 2px;" width="20%"><font color=black size=2><b>In</b></td>' +
                        '<td align="center" style="background: #c1e1c6; padding: 2px;" width="20%"><font color=black size=2><b>Out</b></td>' +
                        '</tr>' ;

            for (var i = 0; i < response.dtr_logs_count; i++) { 
                var data = response.dtr_details[i];

                htmlData += '</tr><tr >' +
                        '<td valign="top" align="center" style="background: #c1e1c6; padding: 2px;"><font color=black size=2>'+data.day+'</td>';

                // if whole day saturday, sunday, absent, leave, or holiday
                if ((data.morning_in == "SATURDAY" || data.morning_in == "SUNDAY" || data.morning_in == "ABSENT" || data.morning_in == "LEAVE" || data.morning_in == "HOLIDAY") && data.morning_out == "" && data.afternoon_in == "" && data.afternoon_out == "") {
                    htmlData += '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" colspan="4"><font color=black size=2>'+data.morning_in+'</td>' +
                    '</tr>';
                }

                // if morning is absent or leave
                else if ((data.morning_in == "ABSENT" || data.morning_in == "LEAVE") && data.afternoon_in != "" && data.afternoon_out != "") {
                // else if ((data.morning_in == "ABSENT" || data.morning_in == "LEAVE") && data.afternoon_in != "") {
                    htmlData += '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" colspan="2"><font color=black size=2>'+data.morning_in+'</td>' +
                    '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+data.afternoon_in+'</td>' +
                    '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+data.afternoon_out+'</td>' +
                    '</tr>';
                }

                // if afternoon is absent or leave
                else if ((data.afternoon_in == "ABSENT" || data.afternoon_in == "LEAVE") && data.morning_in != "" && data.morning_out != "") {
                    htmlData += '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+data.morning_in+'</td>' +
                    '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+data.morning_out+'</td>' +
                    '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" colspan="2"><font color=black size=2>'+data.afternoon_in+'</td>' +
                    '</tr>';
                }

                else {
                    htmlData += '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+data.morning_in+'</td>' +
                    '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+data.morning_out+'</td>' +
                    '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+data.afternoon_in+'</td>' +
                    '<td valign="top" align="center" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+data.afternoon_out+'</td>' +
                    '</tr>';
                }
                        
            };

            htmlData += '</table>';

		    //Ext.MessageBox.hide();
		    centerPanel.update(htmlData);
		    centerPanel.doLayout();
        }   
    });
}