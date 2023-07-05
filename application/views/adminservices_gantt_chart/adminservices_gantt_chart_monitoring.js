var monthList = Ext.create('Ext.data.Store', {
    fields: ['monthNum', 'monthName'],
    data: [
        { "monthNum": 1, "monthName": "January" },
        { "monthNum": 2, "monthName": "February" },
        { "monthNum": 3, "monthName": "March" },
        { "monthNum": 4, "monthName": "April" },
        { "monthNum": 5, "monthName": "May" },
        { "monthNum": 6, "monthName": "June" },
        { "monthNum": 7, "monthName": "July" },
        { "monthNum": 8, "monthName": "August" },
        { "monthNum": 9, "monthName": "September" },
        { "monthNum": 10, "monthName": "October" },
        { "monthNum": 11, "monthName": "November" },
        { "monthNum": 12, "monthName": "December" }
    ]
});

var yearList = Ext.create('Ext.data.Store', {
    fields: ['yearNum', 'yearName'],
    data: [
        { "yearNum": 2018, "yearName": "2018" },
        { "yearNum": 2019, "yearName": "2019" },
        { "yearNum": 2020, "yearName": "2020" },
        { "yearNum": 2021, "yearName": "2021" },

    ]
});


function viewPassSlips(viewType = 'Official') {
    //Ext.panel.Panel var passSlipMonth = "<?php echo date('m');?>";

    var passSlipYear = "<?php echo date('Y');?>";       
    var passSlipMonth = "<?php echo date('m');?>";         
    var userID = "<?php echo $this->session->userdata('user_id');?>";
    var sectionID = "<?php echo $this->session->userdata('section_id');?>";
    var divisionID = "<?php echo $this->session->userdata('division_id');?>";
    var thisYear = '<?php echo date("Y");?>'
    var thisMonth = '<?php echo date("n");?>'
    var thisDivision = 0  
    

    //default value is 
    var psViewURL = 'logbookapi:4002/passslip/getSectionPassSlipRequested/' + sectionID + '/' + thisMonth + '/' + thisYear    
    isDivisionHead = "<?php echo $this->session->userdata('division_head');?>";

    var sectionList = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'commonquery/combolist_sections',
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
        fields: [{ name: 'id', type: 'int' }, { name: 'description' }, { name: 'code' }]
    })
    var divisionList = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'commonquery/combolist_divisions',
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
        fields: [{ name: 'id', type: 'int' }, { name: 'description' }, { name: 'div_code' }]
    })


    //console.log(isDivisionHead)
    if (isDivisionHead == 1 ) {        
        psViewURL = 'logbookapi:4002/passslip/getPassSlipRequested/' + userID + '/' + thisMonth + '/' + thisYear
    }
    if (viewType == 'Tracking' && (sectionID == 21 || sectionID == 2  || sectionID == 4 )) {
        var psViewURL = 'logbookapi:4002/passslip/getDivisionPassSlipRequested/' + sectionID + '/0/0/' + thisYear
    }

    if (viewType == 'Personal')
    {
        psViewURL = 'logbookapi:4002/passslip/getPassSlipRequest/' + userID + '/' + thisMonth
    }




    var passSlipStore = new Ext.data.Store({
        proxy: {
            type: 'ajax',            
            url: psViewURL,
            timeout: 1800000,
            useDefaultXhrHeader: false,
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'id', type: 'int' },
            'activity',
            'passsliprequeststaffs',
            'psLocation',
            'psDateAppliedStart',
            'psPurposeOfFieldWork'
        ]
    });
    var passSlipPanel = Ext.create('Ext.window.Window', {                    
            title: viewType + ' Pass Slips',
            id: 'winViewPassSlips',
            split: false,
            collapsed: false,
            collapsible: false,
            //region: 'east',
            autoScroll: true,
            width: '60%',
            height: '80%',

            viewConfig: {
                listeners: {
                    itemcontextmenu: function (view, record, item, index, e) {
                        e.stopEvent();
                        rowMenu.showAt(e.getXY());
                    }
                }
            },
        tbar: [           
                {
                    xtype: 'textfield',
                    id: 'txtSearchCtrlNum',                    
                    emptyText: 'Search Ctrl No. here...',
                    width: '15%',
                    hidden: true,
                    listeners:
                    {
                        specialKey: function (field, e) {
                            if (e.getKey() == e.ENTER) {
                                //Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                                var whatCN = Ext.getCmp("txtSearchCtrlNum").getValue();
                                var testSearch = Ext.getCmp('PassSlipListGrid').store.findRecord('id', whatCN);
                                console.log(testSearch.get('id'))
                                if (testSearch.get('id') == whatCN) {
                                    //alert('record found');
                                    viewPassSlip(userID, sectionID, whatCN);
                                }
                                //console.log('testing' + testSearch)
                                //Ext.getStore('PassSlipListGrid').load();
                            }
                        }
                    }
                }, 
                {

                    xtype: 'combobox', id: 'cmbMonthFilter',
                    editable: false, anyMatch: false,
                    allowBlank: false,
                    store: monthList,         
                    displayField: 'monthName', valueField: 'monthNum', emptyText: 'Filter by Month',      
                    value: thisMonth,
                    multiSelect: false,
                    hidden: false,
                    listeners: {
                        change: function (combo, record, index) {                                          
                            thisMonth = parseInt(combo.value)
                            whatYear = parseInt(Ext.getCmp('cmbYearFilter').value)
                            console.log (thisMonth, whatYear)
                            //psViewURL = 'logbookapi:4002/passslip/getDivisionPassSlipRequested/' + sectionID + '/0/0/' + thisYear;
                            //psViewURL = 'logbookapi:4002/passslip/getSectionPassSlipRequested/' + sectionID + '/' + thisMonth + '/' + whatYear <--- is this correct?

                            if (isDivisionHead == 1) {
                                psViewURL = 'logbookapi:4002/passslip/getPassSlipRequested/' + userID + '/' + thisMonth + '/' + thisYear
                            }
                            if (viewType == 'Tracking' && (sectionID == 21 || sectionID == 2 || sectionID == 4)) {
                                var psViewURL = 'logbookapi:4002/passslip/getDivisionPassSlipRequested/' + sectionID + '/0/' + thisMonth + '/' + whatYear
                            }
                            if (viewType == 'Personal') {
                                psViewURL = 'logbookapi:4002/passslip/getPassSlipRequested/' + userID + '/' + thisMonth + '/' + thisYear
                            }
                            if (viewType == 'Official') {
                                psViewURL = 'logbookapi:4002/passslip/getSectionPassSlipRequested/' + sectionID + '/' + thisMonth + '/' + whatYear 
                            }
                            Ext.getCmp('PassSlipListGrid').store.proxy.url = psViewURL;
                            Ext.getCmp('PassSlipListGrid').store.load();
                                    
                            //Ext.getCmp('PassSlipListGrid').store.filterBy(function (record, month, year) {
                            //    if (id == 2) {
                            //        return true
                            //    } else {
                            //        return false
                            //    }
                            //});    
                        }
                    }
                },
                { 
                    xtype: 'combobox', id: 'cmbYearFilter',
                    editable: false, anyMatch: false,
                    allowBlank: false,
                    store: yearList,
                    displayField: 'yearName', valueField: 'yearNum', emptyText: 'Filter by Year',
                    value: thisYear,
                    multiSelect: false,
                    listeners: {
                        change: function (combo, record, index) {                        
                            thisYear = parseInt(combo.value)
                            psViewURL = 'logbookapi:4002/passslip/getDivisionPassSlipRequested/' + sectionID + '/0/0/' + thisYear;
                            Ext.getCmp('PassSlipListGrid').store.proxy.url = psViewURL;
                            Ext.getCmp('PassSlipListGrid').store.load();
                            console.log('Hello')
                        }
                    }
                },
                {
                    xtype: 'combobox', id: 'cmbDivisionFilter',
                    editable: false, anyMatch: false,
                    allowBlank: false,
                    store: divisionList,
                    displayField: 'description', valueField: 'id', emptyText: 'Filter by Division',
                    multiSelect: false,
                    hidden: true,
                    listeners: {
                        change: function (combo, record, index) {
                            thisDivision = combo.value
                            psViewURL = 'logbookapi:4002/passslip/getDivisionPassSlipRequested/' + sectionID + '/' + thisDivision + '/0/' + thisYear;
                            Ext.getCmp('PassSlipListGrid').store.proxy.url = psViewURL;
                            Ext.getCmp('PassSlipListGrid').store.load();
                            console.log('Hello')
                        }
                    }
                },
                {
                    xtype: 'combobox', id: 'cmbSectionFilter',
                    editable: false, anyMatch: false,
                    allowBlank: false,
                    store: sectionList,
                    displayField: 'description', valueField: 'id', emptyText: 'Filter by Section',
                    multiSelect: false,
                    hidden: true,
                    listeners: {
                        change: function (combo, record, index) {
                            thisSection = combo.value
                            console.log(record)
                            psViewURL = 'logbookapi:4002/passslip/getDivisionPassSlipRequested/' + sectionID + '/0/' + thisSection + '/' + thisYear;
                            Ext.getCmp('PassSlipListGrid').store.proxy.url = psViewURL;
                            Ext.getCmp('PassSlipListGrid').store.load();
                            console.log('Hello')
                        }
                    }
                },




                { xtype: 'tbfill' },
                {
                    xtype: 'button', id: 'btnNewPS',  text: 'New Pass Slip', icon: './image/submit.png', tooltip: 'Create new daily log',
                    handler: function () {
                        var userID = "<?php echo $this->session->userdata('user_id');?>";
                        var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                        addPassSlip(userID, sectionID);
                    }
                },
                {
                    xtype: 'button', id: 'btnEditPS', text: 'Edit Pass Slip', icon: './image/edit.png', tooltip: 'Export daily log',
                    handler: function () {
                        var sm = Ext.getCmp("PassSlipListGrid").getSelectionModel();
                        var userID = "<?php echo $this->session->userdata('user_id');?>";
                        var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                        if (!sm.hasSelection()) {
                            warningFunction("Warning", "Please select a record!");
                            return;
                        }                                
                        id = sm.selected.items[0].data.id;
                        editPassSlip(userID, sectionID, id);
                        Ext.getCmp('PassSlipListGrid').getStore().load();
                    }
                },
            {


                    xtype: 'button', id: 'btnPrintPS', text: 'Print Pass Slip', icon: './image/printall.png', tooltip: 'Create new daily log',
                    handler: function () {
                        var userID = "<?php echo $this->session->userdata('user_id');?>";
                        var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                        var sm = Ext.getCmp("PassSlipListGrid").getSelectionModel();
                        if (!sm.hasSelection()) {
                            warningFunction("Warning", "Please select a record!");
                            return;
                        }
                        id = sm.selected.items[0].data.id;
                        //console.log(id);
                        printPassSlip(id);
                    }
                }, 
                {
                    xtype: 'button', id: 'btnDeletePS', text: 'Delete Pass Slip', icon: './image/delete.png', tooltip: 'Export daily log',
                    handler: function () {
                        var sm = Ext.getCmp("PassSlipListGrid").getSelectionModel();
                        psID = sm.selected.items[0].data.id;
                        Ext.Msg.show({
                            title: 'Confirmation',
                            msg: 'Are you sure you want to delete Pass Slip #'+psID +'?',
                            width: '100%',
                            icon: Ext.Msg.QUESTION,
                            buttons: Ext.Msg.YESNO,
                            fn: function (btn) {
                                if (btn == 'yes')
                                    Ext.Ajax.request(
                                        {
                                            url: 'logbookapi:4002/passslip/deletePassSlip/' + psID,
                                            method: 'DELETE',
                                            success: function (response, opts) {
                                                Ext.getCmp('PassSlipListGrid').getStore().load();
                                                Ext.Msg.alert('Status', 'Deleted Pass Slip #' + psID);
                                            },
                                            failure: function (response, opts) {
                                                Ext.Msg.alert('Status', 'Failed to delete Pass Slip Request!');
                                            }
                                        });                                            
                            }
                        });
                    }
                }
                //{ xtype: 'button', text: 'Export JO Accomplishment Reports', icon: './image/submit.png', tooltip: 'Export', handler: function () { ARexport(); } },
            ],
            items: [{
                xtype: 'container',
                layout: 'fit',
                items:
                    [
                        {
                            xtype: 'grid',
                            store: passSlipStore,
                            id: 'PassSlipListGrid',
                            margin: '12px',
                            height: 600,
                            listeners: {
                                itemdblclick: function (dv, record, item, index, e) {
                                    //alert(index + ' ' + );
                                    viewPassSlip(userID, sectionID, record.get('id'));
                                }
                            },
                            columns: [Ext.create('Ext.grid.RowNumberer', { width: '5%' }),
                            { text: 'Ctrl no.', dataIndex: 'id', hidden: false },
                            { text: 'Date Start', dataIndex: 'psDateAppliedStart', align: 'left', width: '10%', renderer: columnWrap },                                                       
                            //{ text: 'Staff',  align: 'left', width: '20%', renderer: columnWrap },                                                       
                            { text: 'Location', dataIndex: 'psLocation', align: 'left', width: '15%', renderer: columnWrap },                                                       
                            { text: 'Purpose of Fieldwork', dataIndex: 'psPurposeOfFieldWork', align: 'left', width: '70%', renderer: columnWrap }                                                                                                            
                            ]
                        }
                    ]
            }
            ],
            buttons: [
            {
                text: 'Close',
                icon: './image/close.png',
                handler: () => {
                    passSlipPanel.close();
                }
            }]
    }).show();

    console.log('poi');
    if (viewType == 'Tracking') {
        displayComponent("btnNewPS", "hide");
        displayComponent("btnEditPS", "hide");
        displayComponent("btnPrintPS", "hide");
        displayComponent("btnDeletePS", "hide");
        displayComponent("cmbDivisionFilter", "show");
        displayComponent("cmbSectionFilter", "show");
        displayComponent("txtSearchCtrlNum", "show");
        


    }
}

function viewDailyLogs() {
    //console.log ('tulog')
    var passSlipYear = "<?php echo date('Y');?>";
    var passSlipMonth = "<?php echo date('m');?>";
    var userID = "<?php echo $this->session->userdata('user_id');?>";
    var sectionID = "<?php echo $this->session->userdata('section_id');?>";
    var divisionID = "<?php echo $this->session->userdata('division_id');?>";



    var elogStore = new Ext.data.Store({
        storeId: 'elogStore',
        proxy: {
            type: 'ajax',
            //url: 'logbookapi:4002/dailylog/getActivities/' + userID + '/' + passSlipMonth + '/' + passSlipYear,
            url: 'adminservices_gantt_chart/getPersonalLogs?staff_id=' + userID + '&month_num=' + passSlipMonth + '&year_num=' + passSlipYear,
            //url: 'adminservices_gantt_chart/getPersonalLogs',
            timeout: 1800000,
            //useDefaultXhrHeader: false,
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        autoLoad: true,
        //params: { staff_id: userID, month_num: passSlipMonth, year_num: passSlipYear },
        fields: [{name: 'id', type: 'int'}, 'logDate', 'logLocation', 'logActivity']
    });
    var elogPanel = Ext.create('Ext.window.Window', {                    
        //title: 'E-Log Entries for Section Activity #' + activityID + ": " + activityName,
        title: 'E-Log Entries',
        width: '45%',
        height: '60%',
        id: 'winViewElogs',
        //split: false,
        //collapsed: false,
        //collapsible: false,
        region: 'west',
        autoScroll: true,
        viewConfig: {
            listeners: {
                itemcontextmenu: function (view, record, item, index, e) {
                    e.stopEvent();
                    rowMenu.showAt(e.getXY());
                }
            }
        },
        tbar: [
           
            {

                xtype: 'combobox', id: 'cmbMonthFilter',
                editable: false, anyMatch: false,
                allowBlank: false,
                store: monthList,
                displayField: 'monthName', valueField: 'monthNum', emptyText: 'Filter by Month',
                multiSelect: false,
                hidden: false,
                //value: thisMonth,
                listeners: {
                    change: function (combo, record, index) {
                        thisMonth2 = combo.value
                        console.log ('poi >>>' + combo.value)
                        dlViewURL = 'adminservices_gantt_chart/getPersonalLogs?staff_id=' + userID + '&month_num=' + thisMonth2 + '&year_num=' + passSlipYear,
                        Ext.getCmp('ganttLogListGridView').store.proxy.url = dlViewURL;
                        Ext.getCmp('ganttLogListGridView').store.load();
                        console.log('Hello')
                    }
                }
            },
            { xtype: 'tbfill' },
            {
                xtype: 'button', text: 'Delete Daily Log', icon: './image/delete.png', tooltip: 'Export daily log',
                handler: function () {
                    var sm = Ext.getCmp("ganttLogListGridView").getSelectionModel();
                    dlID = sm.selected.items[0].data.id;
                    dlLogDate = sm.selected.items[0].data.logDate
                    userID = "<?php echo $this->session->userdata('user_id');?>";
                    Ext.Msg.show({
                        title: 'Confirmation',
                        msg: 'Are you sure you want to delete Daily Log #' + dlID + '?',
                        width: '100%',
                        icon: Ext.Msg.QUESTION,
                        buttons: Ext.Msg.YESNO,
                        fn: function (btn) {
                            if (btn == 'yes')
                                Ext.Ajax.request(
                                    {
                                        //url: 'logbookapi:4002/dailylog/deleteByDate/' + dlLogDate + '/' + userID,
                                        url: 'logbookapi:4002/dailylog/delete/' + dlID,
                                        method: 'DELETE',
                                        success: function (response, opts) {
                                            Ext.getCmp('ganttLogListGridView').getStore().load();
                                            Ext.Msg.alert('Status', 'Deleted Daily Log #' + dlID);
                                        },
                                        failure: function (response, opts) {
                                            Ext.Msg.alert('Status', 'Failed to delete Daily Log!');
                                        }
                                    });
                        }
                    });
                }
            },
            {
                xtype: 'button', text: 'New Daily Log', icon: './image/submit.png', tooltip: 'Create new daily log',
                handler: function () {
                    var userID = "<?php echo $this->session->userdata('user_id');?>";
                    var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                    addDailyLog(userID, sectionID);
                    Ext.getCmp('ganttLogListGridView').getStore().load();
                }
            },
            {
                xtype: 'button', text: 'Edit Daily Log', icon: './image/edit.png', tooltip: 'Export daily log',
                handler: function () {
                    var sm = Ext.getCmp("ganttLogListGridView").getSelectionModel();
                    if (!sm.hasSelection()) {
                        warningFunction("Warning", "Please select a record!");
                        return;
                    }
                    var userID = "<?php echo $this->session->userdata('user_id');?>";
                    var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                    id = sm.selected.items[0].data.id;
                    editDailyLog(userID, sectionID, id);
                    Ext.getCmp('ganttLogListGridView').getStore().load();
                }
            }
            
        ],
        items: [{
            xtype: 'container',
            layout: 'fit',
            items:
                [
                    {
                        xtype: 'grid',
                        store: elogStore,
                        id: 'ganttLogListGridView',
                        margin: '12px',
                        height: 420, //sheight - 100,
                        columns: [Ext.create('Ext.grid.RowNumberer', { width: '5%' }),
                        {dataIndex: 'id', hidden: true },                        
                        {text: 'Logged Date', dataIndex: 'logDate', align: 'center', width: '15%', renderer: columnWrap },
                        { text: 'Location', dataIndex: 'logLocation', align: 'center', width: '15%', renderer: columnWrap },
                        { text: 'Activity', dataIndex: 'logActivity', align: 'left', width: '60%', renderer: columnWrap },
                        ]
                    }
                ]
        }
        ],
        buttons: [
            {
                text: 'Close',
                icon: './image/close.png',
                handler: () => {
                    elogPanel.close();
                }
            }]
    }).show();


}