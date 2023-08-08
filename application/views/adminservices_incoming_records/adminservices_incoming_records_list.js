setTimeout("UpdateSessionData();", 0);

var query = null, record_type_filter = 0, priority = 0, division_filter = 0, status = <?php if(isset($incoming_communications_status) && $incoming_communications_status != '') echo $incoming_communications_status; else echo 'null';?>;
var year = "<?php echo date('Y');?>"
var month = 0 //'<?php echo date("n");?>'
var isDepartmentHead, isDivisionAssigned, isAsstDepartmentHead;
var status_filter_store;
var thisYear = '<?php echo date("Y");?>'
var thisMonth = '<?php echo date("n");?>'

var yearList = Ext.create('Ext.data.Store', {
    fields: ['yearNum', 'yearName'],
    data: [
        { "yearNum": 2018, "yearName": "2018" },
        { "yearNum": 2019, "yearName": "2019" },
        { "yearNum": 2020, "yearName": "2020" },
        { "yearNum": 2021, "yearName": "2021" },
    ]
});

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
        { "monthNum": 12, "monthName": "December" },
        { "monthNum": 0, "monthName": "All" }
    ]
});

function ExportDocs(type) {
    params = new Object();
    params.query    = query;
    params.type     = type;
    params.filetype     = 'grid'; 
    ExportDocument('adminservices_incoming_records/exportdocument', params, type);
}

Ext.onReady(function(){
	var store = new Ext.data.JsonStore({
        pageSize: 10,
        storeId: 'myStore22',
        proxy: {
            type: 'ajax',
            url: 'adminservices_incoming_records/incoming_records_list',
            timeout : 1800000,
            extraParams: {record_type_filter:record_type_filter, priority:priority, division_filter: division_filter, query:query, status:status, year:year, month:month},
            //remoteSort: false,
            //remoteSort: true,
            params: { start: 0, limit: 10 },
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        listeners: {
            load: function (store, records, successful, eOpts) {
                isDepartmentHead = store.proxy.reader.jsonData.department_head;                
                isDivisionAssigned = store.proxy.reader.jsonData.division_assigned;
                isAsstDepartmentHead = store.proxy.reader.jsonData.is_asst_dept_head;
                grid.syncRowHeights();

                if(status == 0)
                    Ext.getCmp("status_filter").setRawValue("All");
                else if(status == 1)
                    Ext.getCmp("status_filter").setRawValue("Pending Div. Assigning");
                else if(status == 2)
                    Ext.getCmp("status_filter").setRawValue("Pending Acknowledgement");
                else if(status == 3)
                    Ext.getCmp("status_filter").setRawValue("Pending Action Taken");
                else if(status == 4)
                    Ext.getCmp("status_filter").setRawValue("Closed");
                else if (status == 5)
                    Ext.getCmp("status_filter").setRawValue("On Process");

                if (isDepartmentHead)
                {
                    displayComponent ("divisionAssignment", "show");
                    displayComponent ("addRecord", "hide");
                    displayComponent ("editRecord", "hide");
                    displayComponent ("deleteRecord", "hide");
                    displayComponent ("uploadDocument", "hide");
                    displayComponent("divisionAssignmentRow", "show");
                    displayComponent ("addRecordRow", "hide");
                    displayComponent ("editRecordRow", "hide");
                    displayComponent ("deleteRecordRow", "hide");
                    displayComponent ("uploadDocumentRow", "hide");
                    displayComponent ("viewStatistics", "show");

                    status_filter_store = new Ext.data.ArrayStore({
                        id          : "status_store",
                        fields      : ['id', 'description'],
                        data: [
                            [0, 'All'], 
                            [1, 'Pending Div. Assigning'],
                            [2, 'Pending Acknowledgement'],
                            [3, 'Pending Action Taken'],
                            [4, 'Closed'],
                            [5, 'On Process']
                        ]
                    });
                }
                else if (isDivisionAssigned)
                {
                    if (!isAsstDepartmentHead)  displayComponent ("division_filter", "hide");
                    displayComponent("updateActionTaken", "show");
                    displayComponent("sectionAssignmentRow", "show");
                    displayComponent ("acknowledgeCommunication", "show");
                    displayComponent ("addRecord", "hide");
                    displayComponent ("editRecord", "hide");
                    displayComponent ("deleteRecord", "hide");
                    displayComponent ("uploadDocument", "hide");
                    displayComponent("updateActionTakenRow", "show");
                    displayComponent ("acknowledgeCommunicationRow", "show");
                    displayComponent ("addRecordRow", "hide");
                    displayComponent ("editRecordRow", "hide");
                    displayComponent ("deleteRecordRow", "hide");
                    displayComponent ("uploadDocumentRow", "hide");
                    //displayComponent ("viewStatistics", "show");

                    status_filter_store = new Ext.data.ArrayStore({
                        id          : "status_store",
                        fields      : ['id', 'description'],
                        data: [
                            [0, 'All'],
                            [2, 'Pending Acknowledgement'],
                            [3, 'Pending Action Taken'], 
                            [4, 'Closed'],
                            [5, 'On Process']
                        ]
                    });
                }
                else
                {
                    displayComponent("divisionAssignmentRow", "show");
                    status_filter_store = new Ext.data.ArrayStore({
                        id          : "status_store",
                        fields      : ['id', 'description'],
                        data: [
                            [0, 'All'], 
                            [1, 'Pending Div. Assigning'],
                            [2, 'Pending Acknowledgement'],
                            [3, 'Pending Action Taken'],
                            [4, 'Closed'],
                            [5, 'On Process']
                            
                        ]
                    });
                }

                Ext.getCmp("status_filter").bindStore(status_filter_store);
            }
        },
        //store
        fields: [{ name: 'id', type: 'int' }, 'from_office', 'record_type', 'control_number', 'date_communication',
            'date_logged', 'date_deadline', 'subject', 'from_name', 'to_name', 'priority', 'status', 'status_style', 'division_description',
            'division_code', 'section_code', 'side_notes', 'action_taken_count', 'action_taken', 'date_action_taken', 'duration_action_taken', 'attachment_full_names', 'attachment_links', 'date_uploaded', 'attachment_descriptions', 'acknowledger', 'date_action_taken', 'date_acknowledged', 'responder', 'actions_taken']
    });
    
    var RefreshGridStore = function () {
        Ext.getCmp("incomingRecordsListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});
    };

    var headerClick = function () {
        grid.syncRowHeights();
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'incomingRecordsListGrid',
        region  : 'center',
        store: store,
        cls     : 'gridCss',
        syncRowHeight: false,
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 25}),
            { dataIndex: 'id', hidden: true},
            { dataIndex: 'status', hidden: true},
            { text: 'Ctrl<br>#', locked: true, dataIndex: 'control_number', align: 'center', width: 65, renderer:columnWrap, listeners:{headerClick}},
            { text: 'Date Logged', locked: true, dataIndex: 'date_logged', align: 'center', width: 130, renderer: columnWrap, hidden: false, listeners: { headerClick } },
            //{ text: 'Date Deadline', locked: true, dataIndex: 'date_deadline', align: 'center', width: 130 },
            { text: 'Com.<br>Date', locked: true, dataIndex: 'date_communication', align: 'center', width: 70, renderer: columnWrap, listeners: { headerClick } },
            { text: 'Details', locked: true, dataIndex: 'subject', align: 'left', width: 400, renderer:columnWrap, listeners:{headerClick}},
            { text: 'From', lockable: false, dataIndex: 'from_name', align: 'center', width: '14%', renderer: columnWrap, listeners: { headerClick } },
            { text: 'From Office', dataIndex: 'from_office', align: 'center', width: '14%', renderer: columnWrap, listeners: { headerClick } },
            { text: 'For (To)', dataIndex: 'to_name', align: 'center', width: '14%', renderer: columnWrap, listeners: { headerClick } },
            { text: 'Priority', dataIndex: 'priority', align: 'center', width: '7%', renderer:priorityRenderer, listeners:{headerClick}},
            { text: 'Status', dataIndex: 'status_style', align: 'left', width: '12%', renderer:columnWrap, listeners:{headerClick}},
            { text: 'Communication Softcopy', dataIndex: 'attachment_links', align: 'left', width: '20%', renderer: columnWrap, listeners: { headerClick } },
            //renderer: addTooltip
            { text: 'Assigned<br>Divisions', dataIndex: 'division_code', align: 'center', width: '9%', renderer:divisionRenderer, listeners: { headerClick } },
            { text: 'Assigned<br>Sections', dataIndex: 'section_code', align: 'center', width: '9%', renderer: sectionRenderer, listeners: { headerClick } },
            { text: 'Side Notes', dataIndex: 'side_notes', align: 'left', width: '35%', renderer:columnWrap, listeners:{headerClick}},
            { text: 'Date<br>Acknowledged', dataIndex: 'date_acknowledged', align: 'left', width: '15%', renderer: columnWrap, listeners: { headerClick } },
            { text: 'Acknowledged by', dataIndex: 'acknowledger', align: 'left', width: '15%', renderer: columnWrap, listeners: { headerClick } },
            
            { text: 'Date<br>Action Taken', dataIndex: 'date_action_taken', align: 'center', width: '12%', renderer: columnWrap, listeners: { headerClick } },
            { text: 'Last/Lastest Action Taken by Division', dataIndex: 'action_taken', align: 'left', width: '35%', renderer: columnWrap, listeners: { headerClick } },
            { text: 'Action Taken by', dataIndex: 'responder', align: 'left', width: '15%', renderer: columnWrap, listeners: { headerClick } },
            { text: 'Action Taken<br>Duration', dataIndex: 'duration_action_taken', align: 'center', width: '12%', renderer: addTooltip, listeners: { headerClick } },
            { text: '# of Actions Taken by Division', dataIndex: 'action_taken_count', align: 'left', width: '10%', renderer: columnWrap, listeners: { headerClick } },
            { text: 'Previous Actions Taken', dataIndex: 'actions_taken', align: 'left', width: '35%', renderer: columnWrap, listeners: { headerClick } },
            { text: 'Deadline', dataIndex: 'date_deadline', align: 'center', width: '12%', renderer: columnWrap, listeners: { headerClick } }
            //{ text: 'Softcopy<br>Date Filed', dataIndex: 'date_uploaded', align: 'center', width: '12%', renderer:columnWrap, listeners:{headerClick}},
            //{ text: 'Softcopy<br>Description', dataIndex: 'attachment_descriptions', align: 'left', width: '15%', renderer:columnWrap, listeners:{headerClick}}
        ],
        width: '100%',
        height  : sheight,
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    ViewRecord();
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    rowMenu.showAt(e.getXY());
                }
            }
        },
        bbar: Ext.create('Ext.PagingToolbar', {
            id: 'pageToolbar',
            store: store,
            pageSize: setLimit,
            displayInfo: true,
            displayMsg: 'Displaying {0} - {1} of {2}',
            emptyMsg: "No record/s to display"
        })
    });
	RefreshGridStore(); 

	var rowMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            id: 'addRecordRow',
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteIncomingRecord('Add');}
        }, {
            id: 'editRecordRow',
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteIncomingRecord('Edit');}
        }, {
            id: 'deleteRecordRow',
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteIncomingRecord('Delete');}
        }, {
            id: 'divisionAssignmentRow',
            text: 'Division Assignment',
            hidden: true,
            disabled: true,
            icon: './image/details.png',
            handler: function (){ DivisionAssignment();}
        },{
            id: 'acknowledgeCommunicationRow',
            text: 'Acknowledge Com.',
            hidden: true,
            disabled: true,
            icon: './image/lists.png',
            handler: function (){ AcknowledgeCommunication();}
        }, {
            id: 'sectionAssignmentRow',
            text: 'Section Assignment',
            hidden: true,
            disabled: true,
            icon: './image/details.png',
                handler: function () { SectionAssignment(isDivisionAssigned); }
        }, {
            id: 'updateActionTakenRow',
            text: 'Report Action Taken',
            hidden: true,
            disabled: true,
            icon: './image/details.png',
            handler: function (){ UpdateActionTaken(isAsstDepartmentHead);}
        }, {
            id: 'uploadDocumentRow',
            text: 'Upload Scanned Document',
            icon: './image/upload.png',
            handler: function (){ UploadDocument('Upload');}
        },{
            text: 'View Record',
            icon: './image/view.png',
            handler: function (){ ViewRecord();}
        }]
    });
 
    Ext.create('Ext.panel.Panel', {
        title   : '<?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?>',
        //width: swidth,
        width   : '100%',
        height  : sheight,
        renderTo: "innerdiv",
        layout  : 'border',
        border  : false,
        items   : [grid],
        tbar: [{
            xtype   : 'textfield',
            id      : 'searchId',
            emptyText: 'Search here...',
            width   : '25%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshGridStore();
                    }
                }
            }
        }, '-', {                           
            xtype           : 'combo',
            width           : 125,
            id              : 'status_filter',
            valueField      : 'id',
            displayField    : 'description',
            emptyText       : 'Com. Status',
            triggerAction   : 'all',
            enableKeyEvents : true,
            editable        : false,
            mode            : 'local',
            listeners: 
            {
                select: function (combo, record, index)
                {      
                    status = record[0].data.id;
                    Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["status"] = status;
                    RefreshGridStore();
                }
            }
        }, {
            xtype           : 'combo',
            width           : 80,
            id              : 'division_filter',
            valueField      : 'id',
            displayField    : 'code',
            emptyText       : 'Division',
            triggerAction   : 'all',
            enableKeyEvents : true,
            editable        : false,
            store: new Ext.data.JsonStore({
                proxy: {
                    type    : 'ajax',
                    url     : 'commonquery/combolist_withcodes',
                    timeout : 1800000,
                    extraParams: {query:null, type: 'divisions'},
                    reader  : {
                        type    : 'json',
                        root    : 'data',
                        idProperty: 'id'
                    }
                },
                params: {start: 0, limit: 10},
                fields: [{name: 'id', type: 'int'}, 'code'],
                listeners: {
                    load: function (store, records, successful, eOpts) {
                        store.add({
                            id: 0,
                            code: 'All'
                        });
                    }
                }
            }),
            listeners: 
            {
                select: function (combo, record, index)
                {
                    division_filter = record[0].data.id;
                    Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["division_filter"] = division_filter;
                    RefreshGridStore();
                }
            }            
        }, {
            xtype           : 'combo',
            width           : 125,
            id              : 'record_type_filter',
            valueField      : 'id',
            displayField    : 'description',
            emptyText       : 'Com. Type',
            triggerAction   : 'all',
            enableKeyEvents : true,
            editable        : false,
            store: new Ext.data.JsonStore({
                proxy: {
                    type    : 'ajax',
                    url     : 'commonquery/combolist',
                    timeout : 1800000,
                    extraParams: {query:null, type: 'record_types'},
                    reader  : {
                        type    : 'json',
                        root    : 'data',
                        idProperty: 'id'
                    }
                },
                params: {start: 0, limit: 10},
                fields: [{name: 'id', type: 'int'}, 'description'],
                listeners: {
                    load: function (store, records, successful, eOpts) {
                        store.add({
                            id: 0,
                            description: 'All'
                        });
                    }
                }
            }),
            listeners: 
            {
                select: function (combo, record, index)
                {      
                    record_type_filter = record[0].data.id;
                    Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["record_type_filter"] = record_type_filter;
                    RefreshGridStore();
                }
            }            
        }, {                           
            xtype           : 'combo',
            width           : 100,
            id              : 'priority',
            valueField      : 'id',
            displayField    : 'description',
            emptyText       : 'Priority',
            triggerAction   : 'all',
            enableKeyEvents : true,
            editable        : false,
            store           : new Ext.data.ArrayStore({
                fields: ['id', 'description'],
                data: [[4, 'Urgent'],[3, 'High'], [2, 'Normal'], [1, 'Low'], [0, 'All']]
            }),
            listeners: 
            {
                select: function (combo, record, index)
                {      
                    priority = record[0].data.id;
                    Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["priority"] = priority;
                    RefreshGridStore();
                }
            }            
        }, {
            xtype: 'combobox', id: 'cmbMonthFilter',
            editable: false, anyMatch: false,
            allowBlank: false,
            store: monthList,
            displayField: 'monthName', valueField: 'monthNum', emptyText: 'Filter by Month',
            value: 0,
            multiSelect: false,
            hidden: false,
            listeners: {
                select: function (combo, record, index) {
                    month = combo.value;
                    Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["month"] = month;
                    RefreshGridStore(); 
                }
            }
        }, {
            xtype: 'combo',
            width: 100,
            id: 'year',
            valueField: 'id',
            displayField: 'description',
            emptyText: year,
            triggerAction: 'all',
            enableKeyEvents: true,
            editable: false,
            store: new Ext.data.ArrayStore({
                fields: ['id','description'],
                data: [[2018, '2018'], [2019, '2019'], [2020, '2020'], [2021, '2021'], [0, 'All']]
            }),
            listeners:
            {
                select: function (combo, record, index) {
                    year = record[0].data.id;
                    Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["year"] = year;
                    RefreshGridStore();
                }
            }
        }, '-', { 
            xtype: 'button', 
            id: 'clearFilter', 
            text: 'CLEAR', 
            icon: './image/reload.png', 
            tooltip: 'Clear all filters', 
            handler: function (){ 
                status = null;
                Ext.getCmp("searchId").setValue("");
                Ext.getCmp("status_filter").clearValue();
                Ext.getCmp("division_filter").clearValue();
                Ext.getCmp("record_type_filter").clearValue();
                Ext.getCmp("priority").clearValue();
                Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["query"] = null;
                Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["status"] = status;
                Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["division_filter"] = 0;
                Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["record_type_filter"] = 0;
                Ext.getCmp("incomingRecordsListGrid").getStore().proxy.extraParams["priority"] = 0;
                Ext.getCmp("pageToolbar").moveFirst();
            }
        },
        { xtype: 'tbfill'},
        { xtype: 'button', id: 'addRecord', text: 'ADD', icon: './image/add.png', tooltip: 'Add Incoming Record', handler: function (){ AddEditDeleteIncomingRecord('Add');}},
        { xtype: 'button', id: 'editRecord', text: 'EDIT', icon: './image/edit.png', tooltip: 'Edit Incoming Record', handler: function (){ AddEditDeleteIncomingRecord('Edit');}},
        { xtype: 'button', id: 'deleteRecord', text: 'DELETE', icon: './image/delete.png', tooltip: 'Delete Incoming Record', handler: function (){ AddEditDeleteIncomingRecord('Delete');}},
        { xtype: 'button', id: 'divisionAssignment', hidden: true, disabled: true, text: 'Division Assignment', icon: './image/details.png', tooltip: 'Division Assignment', handler: function (){ DivisionAssignment();}},
        { xtype: 'button', id: 'acknowledgeCommunication', hidden: true, disabled: true, text: 'Acknowledge Com.', icon: './image/lists.png', tooltip: 'Acknowledge that you have read the communication first before updating action taken.', handler: function (){ AcknowledgeCommunication();}},
        { xtype: 'button', id: 'updateActionTaken', hidden: true, disabled: true, text: 'Update Action Taken', icon: './image/details.png', tooltip: 'Action taken must be in past tense form and should reflect the final action taken for the said communication.', handler: function (){ UpdateActionTaken(isAsstDepartmentHead);}},
        { xtype: 'button', id: 'uploadDocument', text: 'Upload Scanned Document', icon: './image/upload.png', tooltip: 'Upload Scanned Document', handler: function (){ UploadDocument('Upload');}},
        // { xtype: 'button', id: 'viewRecord', text: 'VIEW RECORD', icon: './image/view.png', tooltip: 'View Record', handler: function (){ ViewRecord();}},
        '-',
        //{ xtype: 'button', id: 'viewStatistics', text: 'VIEW STATISTICS', icon: './image/chart.png', tooltip: 'View Statistics', handler: function (){ ViewStatistics();}},
        //{ xtype: 'button', id: 'viewStatistics', text: 'VIEW STATISTICS', icon: './image/chart.png', tooltip: 'View Statistics', handler: function () { ViewStatistics(); } },
        {
            xtype: 'button', id: 'btnPrint', text: 'Export Results', icon: './image/chart.png', tooltip: 'Print Results from Grid', handler: function () {
                Ext.Ajax.request({
                    url: 'adminservices_incoming_records/incoming_records_printing',
                    method: 'GET',
                    params: {
                        record_type_filter: record_type_filter,
                        priority: priority,
                        division_filter: division_filter,
                        query: query,
                        status: status,
                        year: year,
                        month: month,
                        start: 0, limit: 999
                    },
                    timeout: 1800000,
                    reader: {
                        type: 'json',
                        root: 'data',
                        idProperty: 'id',
                        totalProperty: 'totalCount'
                    },
                    success: function (response) {
                        var text = Ext.decode( response.responseText);
                        window.open('./pdf/reports/CHUDDIA Incoming Communications.pdf'); 
                    }
                });
            }
         
        },
        ]
    });
});