

//do not touch this working code
function addPassSlip(dlStaffID, dlSectionID) {
    var d = new Date();
    var n = d.getFullYear();
    var purposePS = 'Others';
    var typePS = 'Official';
    dlYear = n;
    var section_activities_list_log = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'logbookapi:4002/sectionactivity/getStaffActivityTarget/' + dlSectionID + '/' + dlStaffID + '/' + dlYear,
            timeout: 1800000,
            //extraParams: { query: null, type: 'sections' },
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'sectionactivityID'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'sectionactivityID', type: 'int' }, { name: 'activity' }]
    });
    var staff_list = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'logbookapi:4002/passslip/passSlipStaff/' + dlSectionID,
            timeout: 1800000,
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'staffid'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'staffID', type: 'int' }, { name: 'staffName' }]
    });

    var winPS = Ext.create('Ext.window.Window', {
        id: 'winPassSlip',        
        title: "New Pass Slip",
        scrollable: true,
        setAutoScroll: true,
        center: true,        
        width: '60%',
        height: '70%',
        items: [
            {
                xtype: 'container', layout: 'fit', margin: '6px', setAutoScroll: true,
                items:
                    [      
                        {
                            xtype: 'fieldcontainer',
                            id: 'radPassType',
                            fieldLabel: 'Type:',
                            defaultType: 'radiofield',
                            margin:'12px',
                            defaults: {
                                flex: 1
                            },
                            layout: 'hbox',
                            items: [
                                {
                                    boxLabel: 'OFFICIAL',
                                    name: 'passType',
                                    inputValue: 'Official',
                                    value: 1,
                                    id: 'rbtnOfficial',
                                    listeners: {
                                        change: function (cb, nv, ov) {
                                            if (nv) {
                                                //displayComponent("radPurpose", "show"); //doesn't work with radiofield id
                                                purposePS = 'Coordinate';
                                                typePS = 'Official';
                                                displayComponent("radPurprose", "show");
                                                displayComponent("cmbSectionActivities", 'hide');
                                                displayComponent("txtReason", "show");
                                            }
                                        }
                                    }
                                }, {
                                    boxLabel: 'PERSONAL',
                                    name: 'passType',
                                    inputValue: 'Personal',
                                    value: 0,
                                    id: 'rbtnPersonal',
                                    listeners: {
                                        change: function (cb, nv, ov) {
                                            if (nv) {
                                                purposePS = 'Personal';
                                                typePS = 'Personal';
                                                displayComponent("radPurprose", "hide");
                                                displayComponent("cmbSectionActivities", 'hide');
                                                displayComponent("txtReason", "show");
                                            }
                                        }
                                    }
                                }
                            ]
                        },
                        { xtype: 'datefield', id: 'dfPSDate', fieldLabel: 'Date', margin: '12px', emptyText: 'Click to pick date.', format: 'Y-m-d', value: new Date() },
                        {
                            xtype: 'combobox', id: 'cmbStaff',
                            editable: false, anyMatch: false,
                            allowBlank: false, fieldLabel: 'Name:',
                            margin: '12px', store: staff_list,
                            displayField: 'staffName', valueField: 'staffID', emptyText: 'Staff',
                            multiSelect: true
                        },
                        { xtype: 'textfield', id: 'txtLocation', fieldLabel: 'Location', margin: '12px', emptyText: 'Where will this activity take place?' },
                        {
                            xtype: 'fieldcontainer',
                            id: 'radPurprose',
                            fieldLabel: 'Purpose',
                            defaultType: 'radiofield',
                            allowBlank: false,
                            margin: '12px',
                            defaults: {
                                flex: 1
                            },
                            layout: 'vbox',
                            items: [
                                {
                                    boxLabel: 'to coordinate with',
                                    name: 'passReason',
                                    inputValue: 'Coordinate',
                                    value: 0,
                                    id: 'radBtnCoordinate',
                                    listeners: {
                                        change: function (cb, nv, ov) {
                                            if (nv) {
                                                displayComponent("cmbSectionActivities", "hide");
                                                displayComponent("txtReason", "show");
                                                purposePS = 'Coordinate'
                                            }
                                        }
                                    }
                                }, {
                                    boxLabel: 'to attend meeting / conference',
                                    name: 'passReason',
                                    inputValue: 'Meeting',
                                    value: 0,
                                    id: 'radBtnPersonal',
                                    listeners: {
                                        change: function (cb, nv, ov) {
                                            if (nv) {
                                                displayComponent("cmbSectionActivities", "hide");
                                                displayComponent("txtReason", "show");
                                                purposePS = 'Meeting'
                                            }
                                        }
                                    }
                                }, {
                                    boxLabel: 'to secure / follow-up documents',
                                    name: 'passReason',
                                    inputValue: 'Secure',
                                    value: 0,
                                    id: 'radBtnDocuments',
                                    listeners: {
                                        change: function (cb, nv, ov) {
                                            if (nv) {
                                                displayComponent("cmbSectionActivities", "hide");
                                                displayComponent("txtReason", "show");
                                                purposePS = 'Secure';
                                            }
                                        }
                                    }
                                }, {
                                    boxLabel: 'Others',
                                    name: 'passReason',
                                    inputValue: 'Others',
                                    value: 1,
                                    id: 'radBtnOthers',
                                    listeners: {
                                        change: function (cb, nv, ov) {
                                            if (nv) {
                                                displayComponent("cmbSectionActivities", "show");
                                                displayComponent("txtReason", "hide");
                                                purposePS = 'Others'
                                            }
                                        }
                                    }

                                }
                            ]
                        },
                        {
                            xtype: 'combobox', id: 'cmbSectionActivities', editable: false, anyMatch: false, allowBlank: false,
                            fieldLabel: 'Section Activity:', margin: '12px', store: section_activities_list_log, displayField: 'activity', valueField: 'id',
                            hidden: false,
                            listeners: {
                                change: function (cb, nv, ov) {
                                    if (nv) {
                                        console.log (nv,ov, nv.value)
                                    }
                                }
                            }

                        },
                        { xtype: 'textfield', id: 'txtReason', fieldLabel: 'Please Specify:', margin: '12px', emptyText: 'What is this pass slip for?', hidden: true },
                    ]
            }
        ],
        buttons: [
            {
                text: 'Submit',                
                handler: function () {
                    ////////console.log('test: ' + Ext.getCmp('cmbStaff').value)
                    //return
                    ////////console.log(Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d'))
                    //return
                    staffArray = Ext.getCmp('cmbStaff').getValue()
                    staffArray2 = []

                    staffArray.forEach((item) => {
                        staffArray2.push({ staffID: item })})
                    ////////console.log(staffArray2)

                    console.log('TESTING ' + Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d') );
                    if ((Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d') == '0000-00-00') || (Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d') == ''))
                    {
                        Ext.Msg.alert('Status', 'Pass Slip Request Failed! No date present.');
                        throw new Error('Date Required!')
                    }


                    Ext.Ajax.request(
                        {
                            url: " logbookapi:4002/passslip/createPassSlipRequest",
                            method: 'POST',
                            waitTitle: 'Connecting',
                            waitMsg: 'Sending data...',                            
                            params: {

                                psDateAppliedStart: Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d'),                                
                                psLocation: Ext.getCmp('txtLocation').value,
                                activity: purposePS,
                                purpose: purposePS,
                                psPurposeOfFieldWork:  checkReason(purposePS, typePS),                                
                                staffName: Ext.encode(staffArray2),
                                division_id: "<?php echo $this->session->userdata('division_id');?>",
                                section_id: dlSectionID,
                                activity_id: Ext.getCmp('cmbSectionActivities').getValue('id'),
                                //doesn't work if 0 or not sectionactivityID not found in sectionactivities
                                sectionactivityID: Ext.getCmp('cmbSectionActivities').getValue('id'),     

                                staffID: dlStaffID                                
                            },
                            success: function (response, opts) {
                                Ext.Msg.alert('Status', 'Pass Slip Request saved!');                                
                                //try {
                                    //Ext.getCmp('radPassType').setValue('')
                                    Ext.getCmp('dfPSDate').setValue(new Date())
                                    Ext.getCmp('txtLocation').setValue('')
                                    Ext.getCmp('cmbStaff').setValue('')
                                    Ext.getCmp('txtLocation').setValue('')
                                    Ext.getCmp('cmbSectionActivities').setValue('')
                                    Ext.getCmp('txtReason').setValue('')
                                    Ext.getCmp('PassSlipListGrid').getStore().load();                                
                                //} catch (e) {
                                    ////////console.log ('error' + e )
                                //}
                                //winPS.close();
                            },
                            failure: function (response, opts) {
                                Ext.Msg.alert('Status', 'Pass Slip Request Failed!');
                            }
                        })
                }
            },
            {
                text: 'Close',
                handler: function () {
                    winPS.close();
                }
            }]
    });
    winPS.show();
}   


//includes delete 
function editPassSlip(dlStaffID, dlSectionID, psID) {
    var d = new Date();
    var n = d.getFullYear();
    var purposePS = 'Others';
    var typePS = 'Official';
    dlYear = n;
    var section_activities_list_log = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'logbookapi:4002/sectionactivity/getStaffActivityTarget/' + dlSectionID + '/' + dlStaffID + '/' + dlYear,
            timeout: 1800000,
            //extraParams: { query: null, type: 'sections' },
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'sectionactivityID'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'sectionactivityID', type: 'int' }, { name: 'activity' }]
    });
    var staff_list = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'logbookapi:4002/passslip/passSlipStaff/' + dlSectionID,
            timeout: 1800000,
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'staffid'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'staffID', type: 'int' }, { name: 'staffName' }]
    });

    ////////console.log(psID);
    Ext.Ajax.request(
        {
            url: 'logbookapi:4002/passslip/getPassSlipRequestDetail/' + psID,
            method: 'GET',
            success: function (f, a)
            {
                var response = Ext.decode(f.responseText)
                
                ////////console.log(response.activity_id)
                ////////console.log(response.passsliprequeststaffs)
                var winPS = Ext.create('Ext.window.Window', {
                    id: 'winPassSlip',
                    title: "New Pass Slip",
                    scrollable: true,
                    setAutoScroll: true,
                    center: true,
                    width: '60%',
                    height: '70%',
                    items: [
                        {
                            xtype: 'container', layout: 'fit', margin: '6px', setAutoScroll: true,
                            items:
                                [
                                    {
                                        xtype: 'fieldcontainer',
                                        id: 'radPassType',
                                        fieldLabel: 'Size',
                                        defaultType: 'radiofield',
                                        margin: '12px',
                                        defaults: {
                                            flex: 1
                                        },
                                        layout: 'hbox',
                                        items: [
                                            {
                                                boxLabel: 'OFFICIAL',
                                                name: 'passType',
                                                inputValue: 'Official',
                                                value: 1,
                                                id: 'rbtnOfficial',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            //displayComponent("radPurpose", "show"); //doesn't work with radiofield id
                                                            displayComponent("radPurprose", "show");
                                                            displayComponent("cmbSectionActivities", 'show');
                                                            displayComponent("txtReason", "hide");
                                                        }
                                                    }
                                                }
                                            }, {
                                                boxLabel: 'PERSONAL',
                                                name: 'passType',
                                                inputValue: 'Personal',
                                                value: 0,
                                                id: 'rbtnPersonal',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("radPurprose", "hide");
                                                            displayComponent("cmbSectionActivities", 'hide');
                                                            displayComponent("txtReason", "show");
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    { xtype: 'datefield', id: 'dfPSDate', fieldLabel: 'Date', margin: '12px', emptyText: 'Click to pick date.', format: 'Y-m-d', 
                                    value: new Date() },
                                    {
                                        xtype: 'combobox', id: 'cmbStaff',
                                        editable: false, anyMatch: false,
                                        allowBlank: false, fieldLabel: 'Name:',
                                        margin: '12px', store: staff_list,
                                        displayField: 'staffName', valueField: 'staffID', emptyText: 'Staff',
                                        multiSelect: true//,
                                        //value: response["passsliprequeststaffs.staffID"]
                                    },
                                    {
                                        xtype: 'textfield', id: 'txtLocation', fieldLabel: 'Location', margin: '12px',
                                        emptyText: 'Where did this activity take place?',
                                        value: response.psLocation
                                    },
                                    {
                                        xtype: 'fieldcontainer',
                                        id: 'radPurprose',
                                        fieldLabel: 'Purpose',
                                        defaultType: 'radiofield',
                                        allowBlank: false,
                                        margin: '12px',
                                        defaults: {
                                            flex: 1
                                        },
                                        layout: 'vbox',
                                        items: [
                                            {
                                                boxLabel: 'to coordinate with',
                                                name: 'passReason',
                                                inputValue: 'Coordinate',
                                                value: 0,
                                                id: 'radBtnCoordinate',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("cmbSectionActivities", "hide");
                                                            displayComponent("txtReason", "show");
                                                            purposePS = 'Coordinate'
                                                        }
                                                    }
                                                }
                                            }, {
                                                boxLabel: 'to attend meeting / conference',
                                                name: 'passReason',
                                                inputValue: 'Meeting',
                                                value: 0,
                                                id: 'radBtnPersonal',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("cmbSectionActivities", "hide");
                                                            displayComponent("txtReason", "show");
                                                            purposePS = 'Meeting'
                                                        }
                                                    }
                                                }
                                            }, {
                                                boxLabel: 'to secure / follow-up documents',
                                                name: 'passReason',
                                                inputValue: 'Secure',
                                                value: 0,
                                                id: 'radBtnDocuments',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("cmbSectionActivities", "hide");
                                                            displayComponent("txtReason", "show");
                                                            purposePS = 'Secure';
                                                        }
                                                    }
                                                }
                                            }, {
                                                boxLabel: 'Others',
                                                name: 'passReason',
                                                inputValue: 'Others',
                                                value: 1,
                                                id: 'radBtnOthers',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("cmbSectionActivities", "show");
                                                            displayComponent("txtReason", "hide");
                                                            purposePS = 'Others'
                                                        }
                                                    }
                                                }

                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'combobox', id: 'cmbSectionActivities', editable: false, anyMatch: false, allowBlank: false, fieldLabel: 'Section Activity:', margin: '12px',
                                        store: section_activities_list_log, displayField: 'activity',
                                        valueField: 'id', hidden: false,
                                        listeners: {
                                            change: function (cb, nv, ov) {
                                                if (nv) {
                                                    console.log (nv, ov)
                                                }
                                            }
                                        }
                                    },
                                    {
                                        xtype: 'textfield', id: 'txtReason', fieldLabel: 'Please Specify:', margin: '12px', emptyText: 'What is this pass slip for?', hidden: true,
                                        value: response.psPurposeOfFieldWork
                                    },
                                ]
                        }
                    ],
                    buttons: [
                        {
                            text: 'Delete', handler: function () {
                                Ext.Ajax.request(
                                    {
                                        url: 'logbookapi:4002/passslip/deletePassSlip/' + psID,
                                        method: 'DELETE',
                                        success: function (response, opts) {                                            
                                            Ext.getCmp('PassSlipListGrid').getStore().load();
                                            winPS.close();
                                            Ext.Msg.alert('Status', 'Deleted Pass Slip #' + psID);
                                        },
                                        failure: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Failed to delete Pass Slip Request!');
                                        }
                                    });
                            }
                        },
                        { xtype: 'tbfill' },
                        {
                            text: 'Submit',
                            handler: function () {
                                ////////console.log('test: ' + Ext.getCmp('cmbStaff').value)
                                //return
                                //////console.log(Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d'))
                                //return
                                staffArray = Ext.getCmp('cmbStaff').getValue()
                                staffArray2 = []
                                staffArray.forEach((item) => {
                                    staffArray2.push({ staffID: item })
                                })



                                //lockdown if empty date or explicit 0000-00-00 where is the validation?
                                if ((Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d') == '0000-00-00') || (Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d') == ''))
                                {
                                    Ext.Msg.alert('Status', 'Pass Slip Request Failed! No date present.');
                                    throw new Error('Date Required!')
                                }

                                //////console.log(staffArray2)
                                Ext.Ajax.request(
                                    {
                                        url: "logbookapi:4002/passslip/updatePassSlipRequest/",
                                        method: 'PUT',
                                        waitTitle: 'Connecting',
                                        waitMsg: 'Sending data...',
                                        params: {
                                            psDateAppliedStart: Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d'),      
                                            psDateAppliedEnd: Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d'),                                           
                                            psLocation: Ext.getCmp('txtLocation').value,
                                            psPurposeOfFieldWork: checkReason(purposePS, typePS),   
                                                            
                                            //staffName: Ext.encode(staffArray2), //no personnel data?
                                            //staffID: dlStaffID,
                                            staffName: Ext.encode(staffArray2),
                                            division_id: "<?php echo $this->session->userdata('division_id');?>",
                                            sectionactivityID: Ext.getCmp('cmbSectionActivities').getValue('id'),
                                            id: psID
                                        },
                                        success: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Pass Slip Request Updated Succesfully!');
                                            Ext.getCmp('PassSlipListGrid').getStore().load();                                
                                            winPS.close();
                                        },
                                        failure: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Pass Slip Update Failed!');
                                        }
                                    })
                            }
                        },
                        {
                            text: 'Close',
                            handler: function () {
                                winPS.close();
                            }
                        }]
                });

                //set values here instead?
                staffArray = response.passsliprequeststaffs
                staffArray2 = []
                staffArray.forEach((item) => {
                    staffArray2.push(item.staffID)
                })
                Ext.getCmp('cmbStaff').setValue(staffArray2)
                try {
                    Ext.getCmp('cmbSectionActivities').setValue(response.sectionactivity['sectionactivityID']);
                }catch{
                    console.log ('Failed to read sectionId probably...')
                }finally{
                    winPS.show();  
                }
            }  
        }
    );    

}   

function checkReason(purposePS, typePS) {
    if (purposePS == 'Others' && typePS == 'Official') {
        //return Ext.getCmp('cmbSectionActivities').getValue('activity')
        return Ext.getCmp('cmbSectionActivities').getRawValue()
    } else {
        return Ext.getCmp('txtReason').value
    }
}


function printPassSlip(psID) {
    Ext.Ajax.request(
        {
            url: 'logbookapi:4002/passslip/getPassSlipRequestDetail/' + psID,
            method: 'GET',
            success: function (f, a) {
                //Ext.getCmp('PassSlipListGrid').getStore().load();
                //winPS.close();
                var response = Ext.decode(f.responseText)
                staffArray = response.passsliprequeststaffs
                staffArray2 = []
                staffArray.forEach((item) => {
                    //staffArray2.push(item.staffName)
                    //////console.log(item.staffName)
                    //////console.log(item["position.description"])
                    printPassSlip2(response, item.staffName, item["position.description"] )
                })
                //printPassSlip2()
                Ext.Msg.alert('Status', 'Printed Pass Slip #' + psID);
                    


            },
            failure: function (response, opts) {
                Ext.Msg.alert('Status', 'Failed to delete Pass Slip Request!');
            }
        });
}


async function printPassSlip2(psDetail, staffName, staffPosition) {
    Ext.Loader.setPath('PDFLib', "./documents/Gantt Chart/pdfLib/pdf.js");
    // const pdfDoc = PDFLib.PDFDocument.create();
    // //////console.log(pdfDoc)

    const url = './documents/Gantt Chart/pdfLib/invidualPassSlip.pdf';
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
    //////console.log(existingPdfBytes)
    const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    // const page = pdfDoc.addPage([350, 400]);

    ////////console.log('printing ' + staffName);
    let data = [];
    data.psDateAppliedStart = String(psDetail.psDateAppliedStart);
    data.activity = psDetail.purpose;
    //////console.log(psDetail);
    data.psPurposeOfFieldWork = String(psDetail.psPurposeOfFieldWork);
    staffName = String(staffName);
    data.position = staffPosition;
    data.psLocation = String(psDetail.psLocation);
    sectionActivity = psDetail.psPurposeOfFieldWork;
    data.id = String(psDetail.id)

    let rgb = PDFLib.rgb;

    //////console.log('check this value ' + data.activity)

    //parse officials to match value of cmbs in list

    let activityType = null;
    console.log (data.activity + ' <<activity:purpose>> ' + data.purpose)
    switch (data.activity) {
        case 'Coordinate':
            activityType = 'official'
            break;
        case 'Meeting':
            activityType = 'official'
            break;
        case 'Secure':
            activityType = 'official'
            break;
        case 'Others':
            activityType = 'official'
            break;
        case null:
            activityType = 'official'
            break;
        default:
            activityType = 'personal'
    }


    firstPage.drawText(data.psDateAppliedStart, { x: 150, y: 491, size: 10, font: helveticaFont, color: rgb(0, 0, 0) });
    if (activityType.toUpperCase() == 'OFFICIAL') {
        // issued for : OFFICIAL ACTIVITY
        firstPage.drawText('X', { x: 110, y: 454, size: 10, font: helveticaFont, color: rgb(0, 0, 0) });

    } else {
        // issued for : PERSONAL ACTIVITY
        firstPage.drawText('X', { x: 206, y: 454, size: 10, font: helveticaFont, color: rgb(0, 0, 0) });
        firstPage.drawText('X', { x: 76, y: 272, size: 10, font: helveticaFont, color: rgb(0, 0, 0) });
        // to attend to personal matters
        const psPurposeOfFieldWork = data.psPurposeOfFieldWork;

        if (psPurposeOfFieldWork.length > 15) {
            // tslint:disable-next-line:max-line-length
            firstPage.drawText(psPurposeOfFieldWork.substring(0, 40), { x: 197, y: 285, size: 5, font: helveticaFont, color: rgb(0, 0, 0) });
            // tslint:disable-next-line:max-line-length
            firstPage.drawText(psPurposeOfFieldWork.substring(41, 100), { x: 197, y: 272, size: 5, font: helveticaFont, color: rgb(0, 0, 0) });

        } else {
            firstPage.drawText(psPurposeOfFieldWork, { x: 197, y: 272, size: 5, font: helveticaFont, color: rgb(0, 0, 0) });
        }

    }

    firstPage.drawText('ctrl no. ' + data.id, { x: 30, y: 575, size: 10, font: helveticaFont, color: rgb(1, 0, 0) });
    firstPage.drawText(staffName, { x: 60, y: 425, size: 10, font: helveticaFont, color: rgb(0, 0, 0) });

    // position
    // const position = data.passsliprequeststaffs[0]['position.description'];
    const position = data.position;
    firstPage.drawText(position, { x: 90, y: 405, size: 10, font: helveticaFont, color: rgb(0, 0, 0) });

    // destination
    firstPage.drawText(data.psLocation, { x: 45, y: 375, size: 7, font: helveticaFont, color: rgb(0, 0, 0) });


    if (data.activity === 'Coordinate') {
        // to coordinate with : X
        firstPage.drawText('X', {
            x: 76,
            y: 347,
            size: 10,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });


        // to coordinate with
        firstPage.drawText(data.psPurposeOfFieldWork, {
            x: 197,
            y: 347,
            size: 5,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
    } else if (data.activity === 'Meeting') {
        // to attend meeting/ conference  : X
        firstPage.drawText('X', {
            x: 76,
            y: 337,
            size: 5,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        // to attend meeting/ conference
        firstPage.drawText(data.psPurposeOfFieldWork, {
            x: 197,
            y: 336,
            size: 5,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
    } else if (data.activity === 'Secure') {
        // to secure / follow-up documents  : X
        firstPage.drawText('X', {
            x: 76,
            y: 325,
            size: 5,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });

        // to secure / follow-up documents
        firstPage.drawText(data.psPurposeOfFieldWork, {
            x: 197,
            y: 326,
            size: 5,
            font: helveticaFont,
            color: rgb(0, 0, 0),
        });
    } else {

        // Other Official transaction, pls. specify
        if (activityType.toUpperCase() == 'OFFICIAL') {
            // Other Official transaction, pls. specify  : X
            firstPage.drawText('X', { x: 76, y: 314, size: 10, font: helveticaFont, color: rgb(0, 0, 0) });
            //   const activity = data.sectionactivity['activity'].replace(/^\s+|\s+|\r+$/g, ' ');
            const activity = sectionActivity.replace(/^\s+|\s+|\r+$/g, ' ');
            ////////console.log(activity);
            firstPage.drawText(activity.substring(0, 40), {
                x: 90,
                y: 306,
                size: 5,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });

            // continuation Other Official transaction, pls. specify
            firstPage.drawText(activity.substring(40, 80), {
                x: 90,
                y: 295,
                size: 5,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });

            // continuation Other Official transaction, pls. specify
            firstPage.drawText(activity.substring(80, 120), {
                x: 90,
                y: 284,
                size: 5,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });

        }

    }

    const pdfBytes = await pdfDoc.save();
    const txtBlob = new Blob([new Uint8Array(pdfBytes).buffer], { type: 'application/pdf' });
    file = window.URL.createObjectURL(txtBlob);
    window.open(file)
    ////////console.log(txtBlob)
}



function viewPassSlip(dlStaffID, dlSectionID, psID) {
    var d = new Date();
    var n = d.getFullYear();
    var purposePS = 'Others';
    var typePS = 'Official';
    dlYear = n;
    var section_activities_list_log = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'logbookapi:4002/sectionactivity/getStaffActivityTarget/' + dlSectionID + '/' + dlStaffID + '/' + dlYear,
            timeout: 1800000,
            //extraParams: { query: null, type: 'sections' },
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'sectionactivityID'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'sectionactivityID', type: 'int' }, { name: 'activity' }]
    });
    var staff_list = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'commonquery/combolist_staff',
            timeout: 1800000,
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'staffid'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'staffID', type: 'int' }, { name: 'staffName' }]
    });
    var activityList = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'commonquery/combolist_activities2',
            timeout: 1800000,
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'sectionactivityID'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'sectionactivityID', type: 'int' }, { name: 'activity' }]
    })


    ////////console.log(psID);
    Ext.Ajax.request(
        {
            url: 'logbookapi:4002/passslip/getPassSlipRequestDetail/' + psID,
            method: 'GET',
            success: function (f, a)
            {
                var response = Ext.decode(f.responseText)
                
                ////////console.log(response.activity_id)
                ////////console.log(response.passsliprequeststaffs)
                var winPS = Ext.create('Ext.window.Window', {
                    id: 'winPassSlip',
                    title: "View Pass Slip Details",
                    scrollable: true,
                    setAutoScroll: true,
                    center: true,
                    width: '60%',
                    height: '70%',
                    items: [
                        {
                            xtype: 'container', layout: 'fit', margin: '6px', setAutoScroll: true,
                            items:
                                [
                                    {
                                        xtype: 'fieldcontainer',
                                        id: 'radPassType',
                                        fieldLabel: 'Size',
                                        defaultType: 'radiofield',
                                        margin: '12px',
                                        defaults: {
                                            flex: 1
                                        },
                                        layout: 'hbox',
                                        disabled: true,
                                        items: [
                                            {
                                                boxLabel: 'OFFICIAL',
                                                name: 'passType',
                                                inputValue: 'Official',
                                                value: 1,
                                                id: 'rbtnOfficial',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            //displayComponent("radPurpose", "show"); //doesn't work with radiofield id
                                                            displayComponent("radPurprose", "show");
                                                            displayComponent("cmbSectionActivities", 'show');
                                                            displayComponent("txtReason", "hide");
                                                        }
                                                    }
                                                }
                                            }, {
                                                boxLabel: 'PERSONAL',
                                                name: 'passType',
                                                inputValue: 'Personal',
                                                value: 0,
                                                id: 'rbtnPersonal',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("radPurprose", "hide");
                                                            displayComponent("cmbSectionActivities", 'hide');
                                                            displayComponent("txtReason", "show");
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    },
                                    { xtype: 'datefield', id: 'dfPSDate', disabled: true,fieldLabel: 'Date', margin: '12px', emptyText: 'Click to pick date.', format: 'Y-m-d', 
                                    value: response. psDateAppliedStart },
                                    {
                                        xtype: 'combobox', id: 'cmbStaff',
                                        editable: false, anyMatch: false,
                                        allowBlank: false, fieldLabel: 'Name:',
                                        margin: '12px', store: staff_list,
                                        disabled:true,
                                        displayField: 'staffName', valueField: 'staffID', emptyText: 'Staff',
                                        multiSelect: true,
                                        disabled: true
                                        //value: response["passsliprequeststaffs.staffID"]
                                    },
                                    {
                                        xtype: 'textfield', id: 'txtLocation', fieldLabel: 'Location', margin: '12px',
                                        emptyText: 'Where did this activity take place?',
                                        disabled: true,
                                        value: response.psLocation
                                    },
                                    {
                                        xtype: 'fieldcontainer',
                                        id: 'radPurprose',
                                        fieldLabel: 'Purpose',
                                        defaultType: 'radiofield',
                                        allowBlank: false,
                                        margin: '12px',
                                        disabled: true,
                                        defaults: {
                                            flex: 1
                                        },
                                        layout: 'vbox',
                                        items: [
                                            {
                                                boxLabel: 'to coordinate with',
                                                name: 'passReason',
                                                inputValue: 'Coordinate',
                                                value: 0,
                                                id: 'radBtnCoordinate',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("cmbSectionActivities", "hide");
                                                            displayComponent("txtReason", "show");
                                                            purposePS = 'Coordinate'
                                                        }
                                                    }
                                                }
                                            }, {
                                                boxLabel: 'to attend meeting / conference',
                                                name: 'passReason',
                                                inputValue: 'Meeting',
                                                value: 0,
                                                id: 'radBtnPersonal',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("cmbSectionActivities", "hide");
                                                            displayComponent("txtReason", "show");
                                                            purposePS = 'Meeting'
                                                        }
                                                    }
                                                }
                                            }, {
                                                boxLabel: 'to secure / follow-up documents',
                                                name: 'passReason',
                                                inputValue: 'Secure',
                                                value: 0,
                                                id: 'radBtnDocuments',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("cmbSectionActivities", "hide");
                                                            displayComponent("txtReason", "show");
                                                            purposePS = 'Secure';
                                                        }
                                                    }
                                                }
                                            }, {
                                                boxLabel: 'Others',
                                                name: 'passReason',
                                                inputValue: 'Others',
                                                value: 1,
                                                id: 'radBtnOthers',
                                                listeners: {
                                                    change: function (cb, nv, ov) {
                                                        if (nv) {
                                                            displayComponent("cmbSectionActivities", "show");
                                                            displayComponent("txtReason", "hide");
                                                            purposePS = 'Others'
                                                        }
                                                    }
                                                }

                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'combobox', id: 'cmbSectionActivities', editable: false,
                                        anyMatch: false, allowBlank: false, fieldLabel: 'Section Activity:',
                                        margin: '12px', store: activityList, displayField: 'activity',
                                        valueField: 'sectionactivityID', hidden: false, disabled: true
                                    },
                                    {
                                        xtype: 'textfield', id: 'txtReason', fieldLabel: 'Please Specify:', margin: '12px', emptyText: 'What is this pass slip for?', hidden: true, disabled: true,
                                        value: response.psPurposeOfFieldWork
                                    },
                                ]
                        }
                    ],
                    buttons: [
                        {
                            text: 'Delete', disabled: true, handler: function () {
                                Ext.Ajax.request(
                                    {
                                        url: 'logbookapi:4002/passslip/deletePassSlip/' + psID,
                                        method: 'DELETE',
                                        success: function (response, opts) {                                            
                                            Ext.getCmp('PassSlipListGrid').getStore().load();
                                            winPS.close();
                                            Ext.Msg.alert('Status', 'Deleted Pass Slip #' + psID);
                                        },
                                        failure: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Failed to delete Pass Slip Request!');
                                        }
                                    });
                            }
                        },
                        { xtype: 'tbfill' },
                        {
                            text: 'Submit', disabled: true,
                            handler: function () {
                                ////////console.log('test: ' + Ext.getCmp('cmbStaff').value)
                                //return
                                //////console.log(Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d'))
                                //return
                                staffArray = Ext.getCmp('cmbStaff').getValue()
                                staffArray2 = []
                                staffArray.forEach((item) => {
                                    staffArray2.push({ staffID: item })
                                })
                                //////console.log(staffArray2)
                                Ext.Ajax.request(
                                    {
                                        url: "logbookapi:4002/passslip/updatePassSlipRequest/",
                                        method: 'PUT',
                                        waitTitle: 'Connecting',
                                        waitMsg: 'Sending data...',
                                        params: {
                                            psDateAppliedStart: Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d'),      
                                            psDateAppliedEnd: Ext.Date.format(Ext.getCmp('dfPSDate').getValue(), 'Y-m-d'),                                           
                                            psLocation: Ext.getCmp('txtLocation').value,
                                            psPurposeOfFieldWork: checkReason(purposePS, typePS),   
                                                            
                                            //staffName: Ext.encode(staffArray2), //no personnel data?
                                            //staffID: dlStaffID,
                                            staffName: Ext.encode(staffArray2),
                                            division_id: "<?php echo $this->session->userdata('division_id');?>",
                                            sectionactivityID: Ext.getCmp('cmbSectionActivities').getValue('id'),
                                            id: psID
                                        },
                                        success: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Pass Slip Request Updated Succesfully!');
                                            Ext.getCmp('PassSlipListGrid').getStore().load();                                
                                            winPS.close();
                                        },
                                        failure: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Pass Slip Update Failed!');
                                        }
                                    })
                            }
                        },
                        {
                            text: 'Close',
                            handler: function () {
                                winPS.close();
                            }
                        }]
                });

                //set values here instead?
                staffArray = response.passsliprequeststaffs
                staffArray2 = []
                staffArray.forEach((item) => {
                    staffArray2.push(item.staffID)
                })
                Ext.getCmp('cmbStaff').setValue(staffArray2)
                try {
                    Ext.getCmp('cmbSectionActivities').setValue(response.sectionactivity['sectionactivityID']);
                }catch{
                    console.log ('Failed to read sectionId probably...')
                }finally{
                    winPS.show();  
                }
                //Ext.getCmp('txtLocation').setValue(response.psLocation)
                           }  
        }
    );    

}   