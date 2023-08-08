var meeting_name = ''
var meeting_type = ''
var meeting_date = ''
var meeting_section = ''
var time_started = ''
var time_ended = ''
var attendees = ''
var agenda = ''
var venue = ''
var discussion = ''
var documentation = ''

var today = new Date();
today.setDate(today.getDate() + 0)

var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();

var default_date = mm + '/' + dd + '/' + yyyy;

var meeting_types = Ext.create('Ext.data.Store', {
    fields: ['name'],
    data: [
        { "name": "Division Meeting" },
        { "name": "Division ManCom Meeting" },
        { "name": "Section Meeting" }
        //...
    ]
})

var section_names = Ext.create('Ext.data.Store', {
    fields: ['id', 'description', 'code'],
    data: [
        { "id":"2", "description": "Finance and Supply Management Section", "code":"FSMS"},
        { "id": "4", "description": "Information and Communication Technology Section", "code":"ICTS" },
        { "id": "5", "description": "Urban Planning Section", "code": "UPS" },
        { "id": "8", "description": "Land Acquisition and Banking Section", "code": "LABS" },
        { "id": "9", "description": "Housing Construction Section", "code": "HD" },
        { "id": "10", "description": "Emancipation Section", "code": "ES" },
        { "id": "12", "description": "Community Services and Estate Management Section", "code": "CSEM" },
        { "id": "18", "description": "Human Resource and Organization Development Section", "code": "HROD" },
        { "id": "20", "description": "Social Entrepreneurship Program Section", "code": "SEP" },
        { "id": "21", "description": "Personnel Development and Records Management Section", "code": "PDRM" },
        { "id": "23", "description": "Support Services Section", "code": "SS" },
        { "id": "25", "description": "Application and Profiling Section", "code": "APS" },
        { "id": "28", "description": "Division Admin. Assistant", "code": "DAS" },
        { "id": "29", "description": "Program Development and Management Section", "code": "PDM" }
        //...
    ]
})

function ReloadSubmitMOM() {
    //meeting_name = Ext.getCmp('txtMeetingName').value;
    meeting_type = Ext.getCmp('cmbMeetingType').getValue();
    meeting_date = Ext.getCmp('dfMeetingDate').getRawValue();
    meeting_section = Ext.getCmp('cmbSection').getValue('id');

    time_started = Ext.getCmp('txtTimeStarted').value;
    time_ended = Ext.getCmp('txtTimeEnded').value;
    attendees = Ext.getCmp('txtAttendees').value;
    agenda = Ext.getCmp('txtAgenda').value;
    venue = Ext.getCmp('txtVenue').value;
    discussion = Ext.getCmp('txtDiscussion').getValue();
    documentation = Ext.getCmp('form-file').getValue();
}

function CreateMOM() {
    //var sm = Ext.getCmp("minutesOfMeetingsListGrid").getGetStore();
    //vdid = sm.data.viewer_division_id;
    var vdid = store.getAt(0).get("viewer_division_id");
    var vsid = store.getAt(0).get("viewer_section_id");
    var agenda_val = 'test';
    var discussion_val = 'test';

    function set_division_template(vdid) {
        switch (vdid) {
            case '1':
                // ASSD
                agenda_val = assd_agenda;
                discussion_val = assd_discussion;
                break;
            case '2':
                // UDP
                agenda_val = udp_agenda;
                discussion_val = udp_discussion;
                break;
            case '4':
                // LHE
                agenda_val = lhe_agenda;
                discussion_val = lhe_discussion;
                break;
            case '6':
                // HCD
                agenda_val = hcd_agenda;
                discussion_val = hcd_discussion;
                break;
            default:
                // code block
                agenda_val = '';
                discussion_val = '';
        }
    }

    switch (parseInt(vsid)) {
        case 2:
            agenda_val ='FSM Section Updates';
            discussion_val = fsm_discussion;
            break;
        case 4:
            agenda_val = 'ICT Section Updates';
            discussion_val = ict_discussion;
            break;
        case 5:
            agenda_val = 'UPS Updates';
            discussion_val = ups_discussion;
            break;
        case 8:
            agenda_val = 'LABS Updates';
            discussion_val = labs_discussion;
            break;
        case 9:
            agenda_val = 'HDS Updates';
            discussion_val = hds_discussion;
            break;
        case 10:
            agenda_val = 'ES Updates';
            discussion_val = es_discussion;
            break;
        case 12:
            agenda_val = 'CSEM Updates';
            discussion_val = csem_discussion;
            break;
        case 18:
            agenda_val = 'HROD Updates';
            discussion_val = hrod_discussion;
            break;
        case 20:
            agenda_val = 'SEP Updates';
            discussion_val = sep_discussion;
            break;
        case 21:
            agenda_val = 'PDRM Updates';
            discussion_val = pdrm_discussion;
            break;
        case 23:
            agenda_val = 'OMSS Updates';
            discussion_val = omss_discussion;
            break;
        case 25:
            agenda_val = 'APS Updates';
            discussion_val = aps_discussion;
            break;
        case 28:
            set_division_template(vdid);
            break;
        case 29:
            agenda_val = 'PDM Section Updates';
            discussion_val = 'No PDM template available.';
            break;
        default:
            agenda_val = '';
            discussion_val = '';

    }

    var uForm = Ext.create('Ext.form.Panel', {
        border: false,
        bodyStyle: 'padding:15px;',
        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 80,
            layout: 'fit',
            margin: '12px',
            msgTarget: 'side',
            anchor: '100%',
            allowBlank: false
        },
        items: [{
            xtype: 'fileuploadfield',
            buttonText: 'Browse File',
            name: 'form-file',
            id: 'form-file',
            emptyText: 'Please attach Minutes of Meeting.docx containing all other attachments.',
            fieldLabel: 'File',
            allowBlank: true,
            //fileInputAttributes: {
            //    accept: 'application/xml',
            //    multiple: ''
            //}
        }]
    });

    var winMOM = Ext.create('Ext.window.Window', {
        id: 'xform-win-MOM',
        //applyTo: 'hello-win',
        title: "Minutes of Meeting",
        center: true,
        width: '100%',
        height: '100%',
        scrollable: true,
        setAutoScroll: false,
        center: true,
        grow: true,
        overflowX: 'scroll',
        overflowY: 'scroll',
        //plain: true,
        title: 'Minutes of Meeting',
        //html: 'testing123',
        //items		: [cp1,cp2,cp3],
        items: [
            {
                xtype: 'container', layout: 'fit',
                items:
                    [
                    //{xtype: 'htmleditor'},
                    //{ xtype: 'textfield', id: 'txtMeetingName', fieldLabel: 'Meeting Name', margin: '12px' },
                        { xtype: 'combobox', id: 'cmbMeetingType', anyMatch: false, allowBlank: false, fieldLabel: 'Meeting Type', margin: '12px', store: meeting_types, displayField: 'name', valueField: 'name', emptyText: 'Section Meeting', value: 'Section Meeting', allowBlank: false, },
                        { xtype: 'combobox', id: 'cmbSection', editable: false, anyMatch: false, allowBlank: false, fieldLabel: 'Section', margin: '12px', store: section_names, displayField: 'description', valueField: 'id', emptyText: 'Section', allowBlank: false, value: vsid},
                        { xtype: 'datefield', id: 'dfMeetingDate', allowBlank: false, name: 'dfMeetingDate', fieldLabel: 'Meeting Date', margin: '12px', emptyText: default_date, value: default_date},
                        { xtype: 'textfield', id: 'txtTimeStarted', allowBlank: false, fieldLabel: 'Time Started', margin: '12px', emptyText: '09:00AM' },
                        { xtype: 'textfield', id: 'txtTimeEnded', allowBlank: false, fieldLabel: 'Time Ended', margin: '12px', emptyText: '10:00AM' },
                        { xtype: 'textfield', id: 'txtAttendees', allowBlank: false, fieldLabel: 'Attendees', margin: '12px', emptyText: 'Family names separated by comma pleae...' },
                        { xtype: 'textfield', id: 'txtVenue', allowBlank: false, fieldLabel: 'Venue', margin: '12px', emptyText: 'Where did the meeting take place?' },
                    //{ xtype: 'textarea', id: 'txtAgenda', fieldLabel: 'Agenda', margin: '12px', emptyText: 'What was to be discussed?'},
                        { xtype: 'textarea', id: 'txtAgenda', allowBlank: false, fieldLabel: 'Agenda', labelAlign: 'top', labelWidth: 100, margin: '12px', height: 100, value: agenda_val },
                    //{ xtype: 'textarea', id: 'txtDiscussion', fieldLabel: 'Discussion', labelAlign: 'top', labelWidth: 100, width: 300, height: 300, margin: '12px', value: assd_discussion, grow: false},
                        //{ xtype: 'htmleditor', id: 'txtDiscussion', allowBlank: false, fieldLabel: 'Discussion', labelAlign: 'top', labelWidth: 100, width: 300, height: 450, margin: '12px', defaultValue: discussion_val, grow: false },
                        { xtype: 'htmleditor', id: 'txtDiscussion', allowBlank: false, fieldLabel: 'Discussion', labelAlign: 'top', labelWidth: 100, width: 300, height: 450, margin: '12px', defaultValue: discussion_val, grow: false },
                   
                    uForm
                    //{ xtype: 'textarea', id: 'txtRemarks', fieldLabel: 'Remarks', width: '100%', height: '20%' }
                    ]
            }
        ],
        buttons: [{
            text: 'Submit',
            //disabled : true
            handler: function () {
                ReloadSubmitMOM(),
                uForm.submit({
                    url: "adminservices_minutesof_meetings/createMOM",
                    method: 'POST',
                    params: {
                        meeting_name: meeting_name,
                        meeting_type: meeting_type,
                        meeting_date: meeting_date,
                        meeting_section: meeting_section,
                        time_started: time_started,
                        time_ended: time_ended,
                        attendees: attendees,
                        venue: venue,
                        agenda: agenda,
                        discussion: discussion,
                        documentation: documentation
                    },
                    timeout: 1800000000,
                    success: function (Form, action) {
                        infoFunction('Status', 'Successfully Uploaded Minutes of Meeting');
                        RefreshGridStore(); 
                        winMOM.close();
                    },
                    failure: function (form, action) {
                        //errorFunction("Error!", 'Connection Problem / Error Occurred.');
                        //RefreshGridStore(); 
                        //winMOM.close();
                    }
                });
            }
        }, {
            text: 'Close',
            handler: function () {
                winMOM.close();
            }
        }]
    });

    winMOM.show();
}
