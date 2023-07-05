var venue = ''
var activity = ''
var documented_date = ''
var other_participants =''
var purpose = ''
var expected_output =''
var accomplishments = ''
var meeting_section = ''
var remarks = ''
var documentation = ''
var chudd_participants = ''
var section_activity_id = ''


var today = new Date();
today.setDate(today.getDate() + 0)

var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();

var default_date = mm + '/' + dd + '/' + yyyy;

function SubmitEval(doc_id) {
    doc_type = "PAR";
    evaluated_by = 420; //someone's key
    eval_text = Ext.getCmp('txtPDMEval').value;
    ///home/ict / Documents / File - Server / PUBLIC / 4  ASSD _public/
    Ext.Ajax.request(
        {
            url: "adminservices_activity_reporting/createEval",
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

function ReloadSubmitPAR() {
    venue = Ext.getCmp('txtVenue').value;
    activity = Ext.getCmp('txtActivity').value;
    documented_date = Ext.getCmp('dfDeadline').getRawValue();
    other_participants = Ext.getCmp('txtOtherParticipants').value;
    meeting_section = Ext.getCmp('cmbSection').getValue('id');
    purpose = Ext.getCmp('txtPurpose').value;
    expected_output = Ext.getCmp('txtTarget').value;
    accomplishments = Ext.getCmp('txtAccomplishment').value;
    remarks = Ext.getCmp('txtRemarks').value;
    documentation = Ext.getCmp('form-file').getValue();
    chudd_participants = Ext.getCmp('txtCHUDDParticipants').value;
    section_activity_id = Ext.getCmp('cmbSectionActivity').getValue('id'); 
    console.log('Testing');
    console.log('Testing', section_activity_id);
}

var section_activities = new Ext.data.JsonStore({
    pageSize: setLimit,
    storeId: 'storeEmp',
    proxy: {
        type: 'ajax',
        url: 'adminservices_activity_reporting/section_activity_list',
        timeout: 1800000,
        extraParams: {},
        remoteSort: false,
        params: { start: 0, limit: setLimit },
        reader: {
            type: 'json',
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount'
        }
    },
    fields: ['id', 'activity']
});






var section_names = Ext.create('Ext.data.Store',
    {
        fields: ['id', 'description', 'code'],
        data:
            [
                { "id": "2", "description": "Finance and Supply Management Section", "code": "FSMS" },
                { "id": "4", "description": "Information and Communication Technology Section", "code": "ICTS" },
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



function Testing2() {
    //console.table(storeEmp);
    console.log("bruh");

    var uForm = Ext.create('Ext.form.Panel',
        {
            border: false,
            bodyStyle: 'padding:15px;',
            fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 80,
            //afterLabelTextTpl: required,
            msgTarget: 'side',
            anchor: '100%',
            allowBlank: false
        },
        items: [
        {
            xtype: 'fileuploadfield',
            buttonText: 'Browse File',
            name: 'form-file',
            //'fufDocumentation
            id: 'form-file',
            emptyText: 'Select File to Attach..',
            fieldLabel: 'File'
            //fileInputAttributes: {
            //    accept: 'application/xml',
            //    multiple: ''
            //}
        }]
        });





    var winAR = Ext.create('Ext.window.Window', {
        id: 'xform-win-PAR',
        //applyTo: 'hello-win',
        title: "Post-Activity Reporting",
        scrollable: true,
        setAutoScroll: true,
        center: true,
        overflowX: 'scroll',
        overflowY: 'scroll',
        width: '100%',
        height: '100%',
        title: 'Post-Activity Report',  
        items: [
            {
                xtype: 'container', layout: 'fit', margin: '6px', setAutoScroll: true,
                items:
                    [

                        { xtype: 'datefield', id: 'dfDeadline', name: 'dfDeadline', fieldLabel: 'Activity Date', margin: '12px', emptyText: default_date, value: default_date },
                        { xtype: 'textfield', id: 'txtActivity', fieldLabel: 'Activity', margin: '12px', emptyText: 'Name of the activity...' },
                        { xtype: 'combobox', id: 'cmbSection', editable: false, anyMatch: false, allowBlank: false, fieldLabel: 'Section', margin: '12px', store: section_names, displayField: 'description', valueField: 'id', emptyText: 'Section', allowBlank: false, },
                        { xtype: 'combobox', id: 'cmbSectionActivity', editable: false, anyMatch: false, allowBlank: false, fieldLabel: 'Section Activity', margin: '12px', store: section_activities, displayField: 'activity', valueField: 'id', emptyText: 'Select Section Major Activity that connects to this Post-Activity Report', },
                        { xtype: 'textfield', id: 'txtVenue', fieldLabel: 'Venue', margin: '12px', emptyText: 'Where did this meeting take place?' },
                        //{xtype: 'container', id: 'contChuddParticipants', margin: '12px', items: [ testPanel]       
                        //        //{ xtype: 'displayfield', id: 'dfChuddParticipants', fieldLabel: 'CHUDD Par6ticipants', width: 200 },
                        //        //{ xtype: 'tagfield', id: 'tfChuddParticipants', fieldLabel: 'Select CHUDD Employees:', width: 200 }]
                        //},
                        { xtype: 'textfield', id: 'txtCHUDDParticipants', fieldLabel: 'CHUDD Participants', value: '', margin: '6px', emptyText: 'Family names only, separated by comma.'  },
                        { xtype: 'textfield', id: 'txtOtherParticipants', fieldLabel: 'Other Participants', value: '', margin: '6px', emptyText: 'Non-CHUDD participants.' },
                        { xtype: 'textfield', id: 'txtPurpose', fieldLabel: 'Purpose', margin: '6px', emptyText: 'What was this activity for?'},
                        { xtype: 'textfield', id: 'txtTarget', fieldLabel: 'Target Output', margin: '6px', emptyText: 'Expected outcome...'},
                        { xtype: 'textarea', id: 'txtAccomplishment', fieldLabel: 'Actual Accomplishment', labelAlign: 'top', labelWidth: 100, margin: '6px', width: 300, height: '20%', emptyText: 'Summary of accomplishments here...'  },
                        { xtype: 'textarea', id: 'txtRemarks', fieldLabel: 'Remarks', value: '', labelAlign: 'top', width: '100%', height: '20%', margin: '6px', emptyText: 'Summary of remarks here...'  },

                       
                        //{ xtype: 'textarea', id: 'txtDocumentation', fieldLabel: 'Attached Document', value: '', labelAlign: 'top', width: '100%', height: '10%', margin: '6px' },
                        //{ xtype: 'button', id: 'btnAttachments', text: 'Attachments/Documentation', margin: '6px', handler: function () { Ext.Msg.alert('Confirm Submission', 'By submitting this Post-Activity Report...'), Ext.getCmp('txtDocumentation').value=} }
                        uForm
                    ]
            }        
        ],
        buttons: [
            {
                text: 'Submit',
                //disabled : true
                //handler: function () { Ext.Msg.alert('Confirm Submission', 'By submitting this Post-Activity Report...'), SubmitPAR(); }
                handler: function ()
                {
                    var form = uForm.getForm();
                    ReloadSubmitPAR(),
                    form.submit({
                        url: "adminservices_activity_reporting/createPAR",
                        method: 'POST',
                        params: {                            
                            venue: venue,
                            documented_date: documented_date,
                            activity: activity,
                            other_participants: other_participants,
                            purpose: purpose,
                            expected_output: expected_output,
                            accomplishments: accomplishments,
                            remarks: remarks,
                            documentation: documentation,
                            chudd_participants: chudd_participants,
                            section_activity_id: section_activity_id
                        
                        },
                        timeout: 1800000000,
                        success: function(form, action) {
                           infoFunction('Status', 'Successfully Uploaded');
                           // Ext.Msg.alert('Success', action.result.message);
                            Ext.getCmp("activityReportingListGrid").store.load({ params: { reset: 1, start: 0 } });
                            console.log('lusot');
                            winAR.close();

                        },
                        failure: function (form, action) {                  
                            errorFunction('This Error!', 'Unexpected Error');
                            //Ext.Msg.alert('Failed', action.result ? action.result.message : 'No response');
                            console.log(action);
                            winAR.close();
                        }
                    });



                }
       
            },

            {
            text: 'Close',
            handler: function () {
                winAR.close();
            }
        }]
    });

    winAR.show();
}



var testPanel = Ext.define('testpanel.form.Tag', {
    extend: 'Ext.panel.Panel',
    xtype: 'form-tag',
    width: '400px',
    height: '300px',
    //title: 'Select CHUDD Employees',
    //bodyPadding: 5,
    frame: true,
    layout: 'form',
    viewModel: {},
    items: [
        { xtype: 'displayfield', fieldLabel: 'Selected Employees' },
        {
            xtype: 'tagfield', fieldLabel: 'Select an employee:',
            store: { type: 'fname' },

            //reference: 'storeEmp',//store id
            publishes: 'value',

            displayField: 'displayfield', //field name
            valueField: 'tagfield',//contactinate this
            queryMode: 'local',
            forceSelection: false,
            triggerOnClick: false,
            createNewOnEnter: true,

        }
    ]

});