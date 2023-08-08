function MOMdocs(folder_path = '', file_name = '') {
    if (file_name == null) {
        file_name = ''
    }

    if (folder_path == null) {
        folder_path = ''
    }

    var x = 0
    x = file_name.search('/searched/path');

    var new_folder_path = '';
    if (x > 0) {
        new_folder_path = folder_path.replace('/searched/path', '/new/path/');
    } else {
        new_folder_path = '/new/floder/path/Minutes of Meetings/' + file_name;
    }
    var new_file_path = '';
    return new_folder_path;
}

function SubmitEval(doc_id) {
    doc_type = "MOM";
    evaluated_by = 420;
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

function SubmitFeedback(eval_id) {
    feedback_by = 420;
    feedback_text = Ext.getCmp("txtFeedback").value;
    Ext.Ajax.request({
        url: "adminservices_minutesof_meetings/AnswerEval",
        method: 'POST',
        params: {
            eval_id: eval_id,
            feedback_by: feedback_by,
            feedback: feedback_text
        },
        success: function (response, opts) {
            Ext.Msg.alert('Status', 'Saved successfully.')
        },

        failure: function (response, opts) {
            Ext.Msg.alert('Status', 'Save Failed.');
        }
    })
}

function ExportRequestForm(type) {
    alert ('exportrequestform');
    params = new Object();
    params.query            = query;
    params.type             = type;
    params.id               = this.id;
    params.filetype         = 'form';
    ExportDocument('adminservices_outgoing_records/exportdocument', params, type);
}

function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        displayContents(contents);
    };
    reader.readAsText(file);
}

function displayContents(contents) {
    var element = document.getElementById('file-content');
    element.textContent = contents;
}

function AckMinutes(doc_id, section_id, division_id, prepared_by, meeting_type, viewer_id, viewer_section_id, viewer_division_id, is_sec_head, is_div_head) {

    //this is probably a division meeting
    if (division_id == viewer_division_id && section_id == 28 && is_sec_head == 1) {
        Ext.Ajax.request({
            url: "adminservices_minutesof_meetings/ackMOM2",
            method: 'POST',
            params: {
                doc_id: doc_id,
                ack_id: viewer_id,
                ack_type: 'review'
            },
            success: function (response, opts) {
                Ext.Msg.alert('Status', 'Minutes marked as reviewed!')
            },
            failure: function (response, opts) {
                Ext.Msg.alert('Status', 'Failed to mark document as reviewed.');
            }
        })
        return 0;
        //you are a section head but not division head so you can review division meetings
    } else if ((viewer_section_id == section_id && is_sec_head == 1) && (meeting_type == 'Division Meeting' || meeting_type == 'Division ManCom Meeting' )) {
        Ext.Ajax.request({
            url: "adminservices_minutesof_meetings/ackMOM2",
            method: 'POST',
            params: {
                doc_id: doc_id,
                ack_id: viewer_id,
                ack_type: 'review'
            },
            success: function (response, opts) {
                Ext.Msg.alert('Status', 'Minutes marked as reviewed!')
            },
            failure: function (response, opts) {
                Ext.Msg.alert('Status', 'Failed to mark document as reviewed.');
            }
        })
        return 1;
    //you are a section head but not division head so you can review
    } else if ((viewer_section_id == section_id && is_sec_head == 1)) {
        Ext.Ajax.request({
            url: "adminservices_minutesof_meetings/ackMOM",
            method: 'POST',
            params: {
                doc_id: doc_id,
                ack_id: viewer_id,
                ack_type: 'review'
            },
            success: function (response, opts) {
                Ext.Msg.alert('Status', 'Minutes marked as reviewed!')
            },
            failure: function (response, opts) {
                Ext.Msg.alert('Status', 'Failed to mark document as reviewed.');
            }
        })
        return 1;
    //you are a division head viewing anything minutes from your division
    } else if (division_id == viewer_division_id && is_div_head == 1) {
        Ext.Ajax.request(
            {
                url: "adminservices_minutesof_meetings/ackMOM2",
                method: 'POST',
                params: {
                    doc_id: doc_id,
                    ack_id: viewer_id,
                    ack_type: 'approve'
                },
                success: function (response, opts) {
                    Ext.Msg.alert('Status', 'Minutes approved!.')
                },
                failure: function (response, opts) {
                    Ext.Msg.alert('Status', 'Failed to mark document as approved.');
                }
            })
        return 1;
    }
    //you are an outsider so no acknowledgement for you
    else {
        Ext.Msg.alert("You're not supposed to see this.", 'Cannot review/approve document.');
    }
}

function DeleteMOM() {
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

    //third check
    if (view_id != uploaded_id) {
        errorFunction("Warning", "You cannot delete MOMs authored by other personnel.");
        return;
    }

    //fourth and final
    if (view_id == uploaded_id && (mom_status == "FOR REVIEW" || mom_status == "FOR APPROVAL")) {
        Ext.Ajax.request({
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
        errorFunction("Warning", "You can only delete MOM with FOR REVIEW status. ");
        return;
    }
}

function CreateEvalForm(doc_id, section_id, viewer_id) {
    var sm = Ext.getCmp("minutesOfMeetingsListGrid").getSelectionModel();
    if (!sm.hasSelection()) {
        errorFunction("Warning", "Please select a record!");
        return;
    }

    if (section_id != 29 || viewer_id == 3) {
        errorFunction("Warning", "Only PDM section can evaluate a document.");
        return;
    }

    id = sm.selected.items[0].data.id;
    agenda = sm.selected.items[0].data.agenda;
    var centerPanel = Ext.create('Ext.panel.Panel', {
        region: 'center',
        autoScroll: true,
        buttonAlign: 'center',
        //html: htmlLoad.applyTemplate(null),
        items: [
            {
                xtype: 'container', layout: 'fit',
                items: [{ xtype: 'textarea', id: 'txtPDMEval', fieldLabel: 'PDM Evaluation', labelWidth: 100, height: 300,  margin: 10, emptyText: 'This meeting was about ' + agenda }],
            }
            ],
        buttons: [
            {
                text: 'Evaluate This file',
                icon: './image/evaluation.png',
                disable: false,
                hidden: false,
                handler: () => {
                    SubmitEval(doc_id);
                    mainWindow2.close();
                    //RefreshGridStore();
                    //location.reload(); 
                }
            },
            {
                text: 'Close',
                icon: './image/close.png',
                handler: () => {
                    mainWindow2.close();
                }
            }
        ]
    });

    mainWindow2 = Ext.create('Ext.window.Window', {
        title: 'Minutes of Meeting',
        header: { titleAlign: 'center' },
        closable: true,
        modal: true,
        width: 750,
        height: 410,
        resizable: false,
        layout: 'border',
        maximizable: false,
        items: [centerPanel],

    }).show();
    Ext.MessageBox.hide();  
}

function CreateFeedbackForm(doc_id) {
    var sm = Ext.getCmp("momEvalListGrid").getSelectionModel();
    if (!sm.hasSelection()) {
        errorFunction("Warning", "Please select a record!");
        return;
    }
    id = sm.selected.items[0].data.id;
    eval = sm.selected.items[0].data.evaluation
    var centerPanel = Ext.create('Ext.panel.Panel', {
        region: 'center',
        autoScroll: true,
        buttonAlign: 'center',
        //html: htmlLoad.applyTemplate(null),
        items: [
            { xtype: 'textarea', id: 'txtFeedback', fieldLabel: 'Feedback', labelWidth: 100, width: 600, height: 135, emptyText: eval}
        ],
        buttons: [
            {
                text: 'Submit Feedback',
                icon: './image/evaluation.png',
                disable: false,
                hidden: false,
                handler: () => {
                    SubmitFeedback(id);
                    mainWindow2.close();
                }

            },
            {
                text: 'Close',
                icon: './image/close.png',
                handler: () => {
                    mainWindow2.close();
                }
            }
        ]
    });

    mainWindow2 = Ext.create('Ext.window.Window', {
        title: 'Feedback to Evaluation# ' + id, //' of Minutes of Meeting #' + doc_id,
        header: { titleAlign: 'center' },
        closable: true,
        modal: true,
        width: 750,
        height: 410,
        resizable: false,
        layout: 'border',
        maximizable: true,
        items: [centerPanel],

    }).show();
    Ext.MessageBox.hide();
}

function View() {   
    var sm = Ext.getCmp("minutesOfMeetingsListGrid").getSelectionModel();
    
    if (!sm.hasSelection()) {
        errorFunction("Warning","Please select a record!");
        return;
    }
    id = sm.selected.items[0].data.id;
    
    Ext.MessageBox.wait('Loading...');
    Ext.Ajax.request({
            url :"adminservices_minutesof_meetings/minutesof_meetingslist",
            method  : 'POST',
            params: { id: id },
            extraParams: { query: query },
            success: function(f,a)
            {
                var response = Ext.decode(f.responseText);     
                var ey = MOMdocs(response.data[0].documentation, response.data[0].documentation);
                var folder_link = '<a href="' + ey + '" target=_blank>' + response.data[0].documentation + '</a></li>';
                var htmlData =
                    '<table width="100%" style="background: #ffffff; border: solid 1px white;">';
                htmlData +=                    
                    '</tr><tr width="100%"  >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;" width="12%"><font color=black size=2>Meeting Type </td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;" width="88%"><font color=black size=2>'+response.data[0].meeting_type+'</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Division</td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>'+response.data[0].division_description+'</td>' +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Section</td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>'+response.data[0].section_description+'</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Date and Time</td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>'+response.data[0].meeting_datetime+'</td>' +
                    '</tr>'  +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Venue</td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>'+response.data[0].venue+'</td>' +
                    '</tr>'+
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Agenda</td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>'+response.data[0].agenda+'</td>' +
                    '</tr>' +
                    '<tr width="100%"  >' +
                    //'<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Discussion</td>' +
                    //'<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].discussion + '</td>' +
                    '<td><hr></td>' +
                    '<td><hr></td>'+
                    '</tr>' + 

                    '<tr width="100%"  >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Discussion</td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].discussion + '</td>' +
                    '</tr>' + 

                    '<tr width="100%"  >' +
                    '<td><hr></td>' +
                    '<td><hr></td>' +
                    //'<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Discussion</td>' +
                    //'<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].discussion + '</td>' +
                    '</tr>' + 

                    '<tr width="100%"  >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Date Submitted</td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].prepared_date + '</td>' +
                    '</tr>'  +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c1c1c1; padding: 2px;"><font color=black size=2>Complete Document</td>' +
                    //'<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2><a href="file:' + response.data[0].documentation + '/">Download</a></td>' +
                    '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + folder_link + '</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c3c3c3; padding: 2px;"><font color=black size=2>Prepared By</td>' +
                '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].prepared_name+ '</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c3c3c3; padding: 2px;"><font color=black size=2>Reviewed By</td>' +
                '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].reviewed_name + '</td>' +
                    '</tr>' +
                    '<tr width="100%" >' +
                    '<td valign="top" align="right" style="background: #c3c3c3; padding: 2px;"><font color=black size=2>Approved By</td>' +
                '<td valign="top" align="left" style="background: #ffffff; padding: 2px;"><font color=black size=2>' + response.data[0].approved_name + '</td>' +
                    '</tr>' +
                    '</table > '
                    //{ xtype: 'textarea', id: 'txtEval2', fieldLabel: 'Evaluation', value: 32, width: '100%', height: '20%', value: response.data[0].accomplishments }
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
                            text: 'Evaluate',
                            icon: './image/evaluation.png',
                            disable: false,
                            hidden: false,
                            handler: () => { CreateEvalForm(id, response.data[0].viewer_section_id, response.data[0].viewer_id); }
                        },
                        {
                            text: 'Review/Approve',
                            id: 'btnAckMOM',
                            hidden: false,
                            icon: './image/approve.png',
                            handler: () => {
                                AckMinutes(id, response.data[0].section_id, response.data[0].division_id, response.data[0].prepared_by, response.data[0].meeting_type, response.data[0].viewer_id,
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


                var htmlEvalData = response.data[0].evaluations_list;
                var htmlApprovers2 = new Ext.XTemplate(htmlEvalData);

                var evalStore = new Ext.data.JsonStore({
                    pageSize: setLimit,
                    storeId: 'evalStore',
                    data: response.data[0].evaluations_list,
                    fields: [{ name: 'id', type: 'int' }, { name: 'doc_id', type: 'int' }, 'evaluated_by', 'evaluation_date',
                            'evaluation', 'responded_by', 'response_date', 'response', 'status', 'evaluated_name', 'responded_name']
                });


                var rowMenu2 = Ext.create('Ext.menu.Menu', {
                    items: [
                        {
                            text: 'Respond to Evaluation',
                            icon: './image/view.png',
                            handler: function () { CreateFeedbackForm(id); RefreshGridStore }
                        },
                        {
                            text: 'Delete Evaluation',
                            icon: './image/delete.png',
                            handler: function () { DeleteMOM2(); RefreshGridStore() }
                        }]
                });

                var eastPanel = Ext.create('Ext.panel.Panel', {
                    title: 'Evaluations for Minutes of Meeting # ' + response.data[0].id + ': ' + response.data[0].agenda,
                    id: 'win-mom-eval',
                    split: true,
                    collapsed: true,
                    collapsible: true,
                    region: 'east',
                    autoScroll: true,
                    width: '100%',
                    items: [{
                            xtype: 'container',
                            layout: 'fit',
                            items:
                            [
                                {
                                    xtype: 'grid',
                                    store: evalStore,
                                    id: 'momEvalListGrid',
                                    margin: '12px',
                                    //plugins: [
                                      //  Ext.create('Ext.grid.plugin.RowEditing', {
                                          //  clicksToEdit: 1
                                        //})
                                    //],
                                    viewConfig: {
                                        listeners: {
                                            itemdblclick: function () {
                                                ViewEval();
                                            },
                                            itemcontextmenu: function (view, record, item, index, e) {
                                                e.stopEvent();
                                                rowMenu2.showAt(e.getXY());
                                            }
                                        }
                                    },
                                    height: sheight-100,
                                    columns: [Ext.create('Ext.grid.RowNumberer', { width: 30 }),
                                        { dataIndex: 'id', hidden: true },
                                        //{ text: 'Evaluation ID', dataIndex: 'doc_id', align: 'center', width: '10%', renderer: columnWrap },
                                        { text: 'Date Evaluated', dataIndex: 'evaluation_date', align: 'center', width: '9%', renderer: columnWrap },                                   
                                        { text: 'Evaluator', dataIndex: 'evaluated_name', align: 'center', width: '15%', renderer: columnWrap },
                                        { text: 'Evaluation', dataIndex: 'evaluation', align: 'left', width: '25%', renderer: columnWrap },
                                        {text: 'Feedback from Staff', dataIndex: 'response', align: 'left', width: '25%', renderer: columnWrap,
                                            //editor: {
                                            //xtype: 'textfield',
                                            //allowBlank: false
                                            //}
                                        },
                                        {text: 'Staff Concerned', dataIndex: 'responded_name', align: 'center', width: '15%', renderer: columnWrap},
                                        {text: 'Date Responded', dataIndex: 'response_date', align: 'center', width: '9%', renderer: columnWrap }
                                        ]
                                    }
                                ]
                          }
                    ],
                    buttons: [
                        {
                            text: 'Submit Evaluation',
                            icon: './image/evaluation.png',
                            disable: true,
                            hidden: true,
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
                    title       : 'Minutes of Meeting #' + id,
                    header      : {titleAlign: 'center'},
                    closable    : true,
                    modal       : true,
                    width       : 750,
                    height      : 410,
                    resizable   : false,        
                    layout: 'border',
                    maximizable: true,
                    items: [eastPanel, centerPanel],

                }).show();
                Ext.MessageBox.hide();  
            }
    });    
}