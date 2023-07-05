function UpdateEval(doc_id) {
    doc_type = "MOM";
    evaluated_by = 420; //someone's key
    eval_text = Ext.getCmp('txtPDMEval').value;

    Ext.Ajax.request(
        {
            url: "adminservices_minutesof_meetings/createEval",
            method: 'POST',
            params: {
                doc_id: doc_id,
                doc_type: doc_type,
                evaluated_by: evaluated_by,
                evaluation: eval_text
            },
            success: function (response, opts) {
                Ext.Msg.alert('Status', 'Saved successfully.')
            },

            failure: function (response, opts) {
                Ext.Msg.alert('Status', 'Save Failed.');
            }
        })
}

function DeleteEvaluation() {
    //first check
    var sm = Ext.getCmp("minutesOfMeetingsListGrid").getSelectionModel();
    if (!sm.hasSelection()) {
        errorFunction("Warning", "Please select a record!");
        return;
    }
    //second check
    doc_id = sm.selected.items[0].data.id;
    documentation = sm.selected.items[0].data.documentation;
    mom_status = sm.selected.items[0].data.status;
    view_id = sm.selected.items[0].data.viewer_id;
    uploaded_id = sm.selected.items[0].data.prepared_by
    console.log (view_id, uploaded_id)

    //third check
    if (view_id != uploaded_id) {
        errorFunction("Warning", "You cannot delete MOMs authored by other personnel.");
        return;
    }

    //fourth and final
    if (view_id == uploaded_id && (mom_status == "FOR REVIEW" || mom_status == "FOR APPROVAL")) {
        Ext.Ajax.request(
            {
                url: "adminservices_minutesof_meetings/deleteMOM",
                method: 'POST',
                params: {
                    doc_id: doc_id,
                    documentation: documentation
                },
                success: function (response, opts) {
                    Ext.Msg.alert('Status', 'Minutes of Meeting #' + doc_id + ' deleted.');
                },
                failure: function (response, opts) {
                    Ext.Msg.alert('Status', 'Failed to delete document.');
                }
            })
    } else {
        errorFunction("Warning", "You can only delete evaluations without feedback. ");
        return;
    }
    
}


function ViewEval()
{   
    //alert ('view activityReportingListGrid function');
    var sm = Ext.getCmp("evaluationsListGrid").getSelectionModel();
    if (!sm.hasSelection())
    {
        errorFunction("Warning","Please select a record!");
        return;
    }
    id = sm.selected.items[0].data.id;
    //alert ('selected id ' + id);
    Ext.MessageBox.wait('Loading...');
    Ext.Ajax.request(
      {
            url:"adminservices_monitorables_evaluations/evaluations_list",
            method  : 'POST',
            params: { id: id },
            extraParams: { query: query },
            success: function(f,a)
            {
                var response = Ext.decode(f.responseText);     
                var htmlData =
                    '<table width="100%" style="background: #ffffff; border: solid 1px white;">';
                htmlData +=                    
                    '</tr><tr width="100%"  >' +
                        '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;" width="12%"><font color=black size=2>Document ID</td>' +
                        '<td valign="top" align="left" style="background: #ffffff; padding: 2px;" width="88%"><font color=black size=2>' + response.data[0].doc_type + ' #' + response.data[0].doc_id  + '</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                        '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Evaluated By</td>' +
                        '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].evaluated_name +'</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                        '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Evaluation</td>' +
                        '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].evaluation+'</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                        '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Date Evaluated </td>' +
                        '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].evaluation_date+'</td>' +
                    '</tr>'  +
                    '<tr width="100%" >' +
                        '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Response to Evaluation</td>' +
                        '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].response + '</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Date Responded </td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].response_date + '</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Responded By </td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].responded_name + '</td>' +
                    '</tr>' +

                    '</table > '
                    //{ xtype: 'textarea', id: 'txtEval2', fieldLabel: 'Evaluation', value: 32, width: '100%', height: '20%', value: response.data[0].accomplishments }

                                //'response' 				=> $value -> response,
              //  'responded_by' 			=> $value -> responded_by,
                //    'responded_name'		=> $value -> responded_name,
                    ;

                var htmlTrackingData = 'poi';
                var htmlLoad = new Ext.XTemplate(htmlData);
                var htmlApprovers = new Ext.XTemplate(htmlTrackingData);                  
                var centerPanel = Ext.create('Ext.panel.Panel', {
                    region  : 'center',
                    autoScroll: true,
                    buttonAlign : 'center',
                    html: htmlLoad.applyTemplate(null),
                    //items: [
                    //    { xtype: 'textarea', id: 'txtEval2', fieldLabel: 'Evaluation', value: 32, width: '100%', height: '20%', value: response.data[0].accomplishments }
                    //],
                    buttons: [
                        {
                            text: 'Mark as Resolved',
                            id: 'btnAckMOM',
                            hidden: true,
                            icon: './image/approve.png',
                            handler: () => {
                                AckMinutes(id, response.data[0].section_id, response.data[0].division_id, response.data[0].prepared_by, response.data[0].viewer_id,
                                    response.data[0].viewer_section_id, response.data[0].viewer_division_id, response.data[0].is_section_head, response.data[0].is_division_head);
                                mainWindow.close();
                                RefreshGridStore();
                            }                          
                        },
                        {
                            text: 'Delete',
                            id: 'btnDelete2',
                            hidden: false,
                            icon: './image/delete.png',
                            handler: () => { DeleteMOM(); mainWindow.close(); RefreshGridStore();}
                        },
                        {
                            text: 'Close',
                            icon: './image/close.png',
                            handler: () => { mainWindow.close(); }
                        }
                    ]
                });

                var eastPanel = Ext.create('Ext.panel.Panel', {
                    title: 'Evaluation for Minutes of Meeting # ' + response.data[0].id + ': ' + response.data[0].agenda,
                    id: 'win-par-eval',
                    split: true,
                    collapsed: true,
                    collapsible: true,
                    region: 'east',
                    autoScroll: true,
                    width: '100%',
                    //html: htmlApprovers.applyTemplate(null),
                    items: [{
                        xtype: 'container', //layout: 'fit',
                        items:
                            [
                                { xtype: 'textarea', id: 'txtPDMEval', fieldLabel: 'PDM Evaluation', labelWidth: 100, width: 600, height: 135, value: response.data[0].pdm_evaluation },

                            ]
                    },                   
                    ],
                    buttons: [
                        {
                            text: 'Submit Evaluation',
                            icon: './image/evaluation.png',
                            handler: () => { SubmitEval(response.data[0].id); }},

                        {
                            text: 'Close',
                            icon: './image/close.png',
                            handler: () => {
                                eastPanel.collapse();
                            }
                        }]
                });

                mainWindow = Ext.create('Ext.window.Window', {
                    title: 'Evaluation for ' + response.data[0].doc_type + ' #' + response.data[0].doc_id  ,
                    header      : {titleAlign: 'center'},
                    closable    : true,
                    modal       : true,
                    width       : 750,
                    height      : 410,
                    resizable   : false,        
                    layout: 'border',
                    maximizable: true,
                    //items: [eastPanel, centerPanel],
                    items: [ centerPanel],

                }).show();
                Ext.MessageBox.hide();  
            }
    });    
}



