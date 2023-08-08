var today = new Date();
today.setDate(today.getDate() + 0)

var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
var default_date = yyyy + '-' + mm + '-' + dd;

var thisYear = '<?php echo date("Y");?>'
var thisMonth = '<?php echo date("n");?>'

function editDailyLog(dlStaffID, dlSectionID, dlLogID) {
    var d = new Date();
    var n = d.getFullYear();
    dlYear = n;
    var section_activities_list_log = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'logbookapi:4002/sectionactivity/getStaffActivityTarget/' + dlSectionID + '/' + dlStaffID + '/' + dlYear,
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
    });
    var pass_slips_list = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: ' logbookapi:4002/passslip/getSectionPassSlipRequested/' + dlSectionID + '/' + thisMonth + '/' + thisYear,
            timeout: 1800000,
            //extraParams: { query: null, type: 'sections' },
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'id', type: 'int' }, { name: 'activity' }, { name: 'psPurposeOfFieldWork' }]
    });
    var RefreshGridStore = function () {
        Ext.getCmp("ganttLogListGrid").getStore().reload({ params: { reset: 1, start: 0 }, timeout: 300000 });
    };
    Ext.Ajax.request(
        {
            url: 'logbookapi:4002/dailylog/getDailylogsByID/' + dlLogID,
            method: 'GET',                    
            success: function (f, a)
            {
                var response = Ext.decode(f.responseText);
                var winDL = Ext.create('Ext.window.Window', {
                    id: 'winDLEdit',
                    title: "Edit Daily Log",
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
                                    //default section activity to clicked column
                                    { xtype: 'combobox', id: 'cmbSectionActivity', editable: false, value: response["sectionactivity.sectionactivityID"],anyMatch: false, allowBlank: false, fieldLabel: 'Section Activity', margin: '12px', store: section_activities_list_log, displayField: 'activity', valueField: 'sectionactivityID', emptyText: 'Section Activity', },
                                    { xtype: 'datefield', id: 'dfLogDate', fieldLabel: 'Activity Date', value: response.logDate, margin: '12px', emptyText: 'Click to pick date.', format: 'Y-m-d' },                                    
                                    { xtype: 'combobox', id: 'cmbPassSlip', editable: false,  anyMatch: false, allowBlank: true, fieldLabel: 'Pass Slip:', margin: '12px', store: pass_slips_list, displayField: 'psPurposeOfFieldWork', valueField: 'id', emptyText: 'Pass slip', },
                                    { xtype: 'textfield', id: 'txtVenue', fieldLabel: 'Location', value: response.logLocation, margin: '12px', emptyText: 'Where did this activity take place?' },
                                    { xtype: 'textfield', id: 'txtQuantity', fieldLabel: 'Quantity', value: response.logQty, margin: '12px', emptyText: 'How many times or how many items?' },
                                    { xtype: 'textarea', id: 'txtActivity', fieldLabel: 'Activity', value: response.logActivity, labelAlign: 'top', width: '100%', minHeight: '150', margin: '12px', emptyText: 'What did you do for this activity?' },
                                    {
                                        xtype: 'fieldcontainer',
                                        defaultType: 'checkboxfield',
                                        margin: '12px',
                                        items: [
                                            {
                                                boxLabel: 'Completed Activity',
                                                inputValue: '1',
                                                id: 'chkComplete'
                                            }
                                        ]
                                    }
                                ]
                        }
                    ],
                    buttons: [
                        {
                            text: 'Delete', handler: function () {
                                Ext.Ajax.request(
                                    {                                                                             
                                        url: 'logbookapi:4002/dailylog/delete/' + dlLogID,
                                        method: 'DELETE',                                         
                                        success: function (response, opts) { 
                                            //RefreshGridStore();
                                            //Ext.getCmp('ganttListGrid').getStore().load();
                                            winDL.close();   
                                            Ext.Msg.alert('Status', 'Deleted Daily Log #' + dlLogID);
                                            Ext.getCmp('ganttLogListGridView').getStore().load();
                                        },
                                        failure: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Failed to delete Daily Log!');
                                        }
                                    });
                            }
                        },
                        { xtype: 'tbfill' },
                        {
                            text: 'Update',
                            handler: function () {                                                                
                                let passsliprequest = { 'id': Ext.getCmp('cmbPassSlip').getValue('id') }        

                                //this error should only appear to not division head level staff
                                chkActivityID = Ext.getCmp('cmbSectionActivity').getValue('id')
                                isDivisionHead = "<?php echo $this->session->userdata('division_head');?>";
                                if ((chkActivityID == 0 || chkActivityID == null) && (dlSectionID != 0 && isDivisionHead != 1)) {
                                    Ext.Msg.alert('Status', 'Failed to update Daily Log! Condition: SectionActivity is 0 or null');
                                    throw new Error("Something went badly wrong!");
                                }

                                Ext.Ajax.request(
                                    {
                                        url: "logbookapi:4002/dailylog/updateDailyLogs",
                                        method: 'PUT',                                                                                
                                        params: {
                                            activity_id: dlLogID,
                                            id: dlLogID,
                                            logActivity: Ext.getCmp('txtActivity').value,
                                            logCompleted: Ext.getCmp('chkComplete').value ? 1 : 0,
                                            logDate: Ext.getCmp('dfLogDate').getValue(),
                                            logLocation: Ext.getCmp('txtVenue').value,
                                            logQty: parseInt(Ext.getCmp('txtQuantity').value),
                                            month: Ext.getCmp('dfLogDate').getValue().getMonth() + 1,
                                            passsliprequest_id: passsliprequest,
                                            sectionactivityID: Ext.getCmp('cmbSectionActivity').getValue('id'),
                                            staffID: dlStaffID                                                                                   
                                        },
                                        success: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Daily Log updated!');                                            
                                            //Ext.getCmp('ganttListGrid').getStore().load();
                                            //Ext.getCmp('ganttListGridView').getStore().load();
                                            Ext.getCmp('ganttLogListGridView').getStore().load();
                                            winDL.close();                                            
                                        },
                                        failure: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Failed to update Daily Log!');
                                        }
                                    })
                            }
                        },
                        {
                            text: 'Close',
                            handler: function () {
                                winDL.close();
                            }
                        }]
                });

                //set values here before showing
                Ext.getCmp('cmbPassSlip').setValue(response["passsliprequest.id"])
                winDL.show();
            }
        }
    );
}

function addDailyLog(dlStaffID, dlSectionID) {
    var d = new Date();
    var n = d.getFullYear();
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

    var pass_slips_list= new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url:' logbookapi:4002/passslip/getSectionPassSlipRequested/' + dlSectionID + '/' + thisMonth + '/' + thisYear,
            timeout: 1800000,
            //extraParams: { query: null, type: 'sections' },
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'id', type: 'int' }, { name: 'activity' }, { name: 'psPurposeOfFieldWork' }]
    });

    var winDL = Ext.create('Ext.window.Window', {
        id: 'winAddDailyLog',        
        title: "Add Daily Log",
        scrollable: true,
        setAutoScroll: true,
        center: true,        
        width: '60%',
        height: '70%',
        items: [
            {
                xtype: 'container', layout: 'fit', margin: '6px', id: 'containerDL', setAutoScroll: true,
                items:
                    [           
                        { xtype: 'combobox', id: 'cmbSectionActivity', editable: false, anyMatch: false, allowBlank: false, fieldLabel: 'Section Activity', margin: '12px', store: section_activities_list_log, displayField: 'activity', valueField: 'sectionactivityID', emptyText: 'Section Activity', },
                        { xtype: 'datefield', id: 'dfLogDate', name: 'dfDeadline', fieldLabel: 'Activity Date', margin: '12px', emptyText: 'Click to pick date.', format: 'Y-m-d', value: new Date() },                     
                        { xtype: 'combobox', id: 'cmbPassSlip', editable: false, anyMatch: false, allowBlank: true, fieldLabel: 'Pass Slip:', margin: '12px', store: pass_slips_list, displayField: 'psPurposeOfFieldWork', valueField: 'id', emptyText: 'Pass slip', },
                        { xtype: 'textfield', id: 'txtVenue', fieldLabel: 'Location', margin: '12px', emptyText: 'Where did this activity take place?' },
                        { xtype: 'textfield', id: 'txtQuantity', fieldLabel: 'Quantity', margin: '12px', emptyText: 'How many times or how many items?'},
                        { xtype: 'textarea', id: 'txtActivity', fieldLabel: 'Activity', value: '', labelAlign: 'top', width: '100%', minHeight: '150', margin: '12px', emptyText: 'What did you do for this activity?' },
                        {xtype: 'fieldcontainer',                            
                            defaultType: 'checkboxfield',
                            margin: '12px',
                            items: [{
                                boxLabel: 'Completed Activity',                                    
                                inputValue: '1',
                                id: 'chkComplete'
                            }]
                        }                            
                    ]
            }
        ],
        buttons: [
            {
                text: 'Submit',
                handler: function () {
                    //this error should only appear to not division head level staff
                    chkActivityID = Ext.getCmp('cmbSectionActivity').getValue('id')
                    isDivisionHead = "<?php echo $this->session->userdata('division_head');?>";
                    if ((chkActivityID == 0 || chkActivityID == null) && (dlSectionID != 0 && isDivisionHead != 1))
                    {
                        Ext.Msg.alert('Status', 'Failed to submit Daily Log! Condition: SectionActivity is 0 or null');
                        throw new Error("Something went badly wrong!");
                    }

                    Ext.Ajax.request(
                    {
                            url: "logbookapi:4002/dailylog/createDailyLogs",
                        method: 'POST',
                        waitTitle: 'Connecting',
                        waitMsg: 'Sending data...',   
                        //timeout: 1800000,
                        params: {
                            month: Ext.getCmp('dfLogDate').getValue().getMonth()+1,
                            staffID: dlStaffID,
                            logDate: Ext.getCmp('dfLogDate').getValue(),
                            logLocation: Ext.getCmp('txtVenue').value,
                            passsliprequest_id: parseInt(Ext.getCmp('cmbPassSlip').getValue('id')),
                            logQty: parseInt(Ext.getCmp('txtQuantity').value),
                            logCompleted: Ext.getCmp('chkComplete').value ? 1 : 0,
                            logActivity: Ext.getCmp('txtActivity').value,
                            sectionactivityID: Ext.getCmp('cmbSectionActivity').getValue('id')
                        },
                        success: function (response, opts) {
                            Ext.Msg.alert('Status', 'Daily Log saved!');
                            try { 
                                Ext.getCmp('dfLogDate').setValue(new Date())
                                Ext.getCmp('txtVenue').setValue('')
                                Ext.getCmp('cmbPassSlip').setValue('')
                                Ext.getCmp('txtQuantity').setValue('')
                                Ext.getCmp('chkComplete').setValue('')
                                Ext.getCmp('txtActivity').setValue('')
                                Ext.getCmp('cmbSectionActivity').setValue('')
                                Ext.getCmp('ganttLogListGridView').getStore().load();
                                Ext.getCmp('ganttListGrid').getStore().load();                                
                            }
                            catch (ex) {
                                
                            }
                        },
                        failure: function (response, opts) {
                            Ext.Msg.alert('Status', 'Failed to save Daily Log!');
                        }
                    })
                }
            },
            {
                text: 'Close',
                handler: function () {                    
                    try {
                        Ext.getCmp("ganttLogListGridView").getStore().load();
                        Ext.getCmp('ganttListGrid').getStore().load();                        
                        winDL.close();
                    } catch (ex) {
                        winDL.close();
                    }
                }
            }]
    });
    winDL.show();
}