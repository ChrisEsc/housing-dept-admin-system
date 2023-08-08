setTimeout("UpdateSessionData();", 0);
var query = null, record_type_filter = 0, division_filter = 0, status = <?php if(isset($outgoing_communications_status) && $outgoing_communications_status != '') echo $outgoing_communications_status; else echo '0';?>;
var isDepartmentHead, isDivisionAssigned, isAsstDepartmentHead;
var status_filter_store;

function ExportDocs(type) {
    params = new Object();
    params.query    = query;
    params.type     = type;
    params.filetype     = 'grid'; 
    ExportDocument('adminservices_outgoing_records/exportdocument', params, type);
}

Ext.onReady(function(){
	var store = new Ext.data.JsonStore({
        pageSize: 10,
        storeId: 'myStore',
        proxy: {
            type: 'ajax',
            url: 'adminservices_outgoing_records/outgoing_records_list',
            timeout : 1800000,
            extraParams: {record_type_filter:record_type_filter, division_filter:division_filter, query:query, status:status},
            remoteSort: false,
            params: {start: 0, limit: 10},
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

                status_filter_store = new Ext.data.ArrayStore({
                    id          : "status_store",
                    fields      : ['id', 'description'],
                    data: [
                        [0, 'All'], 
                        [3, 'Pending Action Taken'], 
                        [4, 'Closed']
                    ]
                });

                if (isDepartmentHead)
                {
                    displayComponent ("addRecord", "hide");
                    displayComponent ("editRecord", "hide");
                    displayComponent ("deleteRecord", "hide");
                    displayComponent ("uploadDocument", "hide");
                    displayComponent ("addRecordRow", "hide");
                    displayComponent ("editRecordRow", "hide");
                    displayComponent ("deleteRecordRow", "hide");
                    displayComponent ("uploadDocumentRow", "hide");
                }
                else if (isDivisionAssigned)
                {
                    if (!isAsstDepartmentHead)  displayComponent ("division_filter", "hide");
                    displayComponent ("updateActionTaken", "show");
                    displayComponent ("addRecord", "hide");
                    displayComponent ("editRecord", "hide");
                    displayComponent ("deleteRecord", "hide");
                    displayComponent ("uploadDocument", "hide");
                    displayComponent ("updateActionTakenRow", "show");
                    displayComponent ("addRecordRow", "hide");
                    displayComponent ("editRecordRow", "hide");
                    displayComponent ("deleteRecordRow", "hide");
                    displayComponent ("uploadDocumentRow", "hide");
                }

                Ext.getCmp("status_filter").bindStore(status_filter_store);
            }
        },
        fields: [{name: 'id', type: 'int'}, 'record_type', 'control_number', 'date_communication', 'date_logged', 'subject', 'from_name', 'to_name', 'status', 'status_style', 'division_description', 'division_code', 'side_notes', 'action_taken', 'date_action_taken', 'duration_action_taken', 'attachment_full_name', 'attachment_links', 'date_uploaded', 'attachment_descriptions']
    });
    
    var RefreshGridStore = function () {
        Ext.getCmp("outgoingRecordsListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});      
    };

    var headerClick = function () {
        grid.syncRowHeights();
    }

    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'outgoingRecordsListGrid',
        region  : 'center',
        store   : store,
        syncRowHeight: false,
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 25}),
            { dataIndex: 'id', hidden: true},
            { dataIndex: 'status', hidden: true},
            { text: 'Ctrl<br>#', locked: true, dataIndex: 'control_number', align: 'center', width: 65, renderer:columnWrap, listeners:{headerClick}},
            { text: 'Com.<br>Date', locked: true, dataIndex: 'date_communication', align: 'center', width: 70, renderer:columnWrap, listeners:{headerClick}},
            { text: 'Details', locked: true, dataIndex: 'subject', align: 'left', width: 400, renderer:columnWrap, listeners:{headerClick}},
            { text: 'From', lockable: false, dataIndex: 'from_name', align: 'center', width: '14%', renderer:columnWrap, listeners:{headerClick}},
            { text: 'For (To)', dataIndex: 'to_name', align: 'center', width: '14%', renderer:columnWrap, listeners:{headerClick}},
            { text: 'Date Logged', dataIndex: 'date_logged', align: 'center', width: '12%', renderer:columnWrap, hidden: true, listeners:{headerClick}},
            { text: 'Status', dataIndex: 'status_style', align: 'left', width: '12%', renderer:columnWrap, listeners:{headerClick}},
            { text: 'Communication Softcopy', dataIndex: 'attachment_links', align: 'left', width: '20%', renderer:columnWrap, listeners:{headerClick}},
            { text: 'From<br>Division', dataIndex: 'division_code', align: 'center', width: '9%', renderer:addTooltip, listeners:{headerClick}},
            { text: 'Action Taken by Division', dataIndex: 'action_taken', align: 'left', width: '35%', renderer:columnWrap, listeners:{headerClick}},
            { text: 'Action Taken<br>Date', dataIndex: 'date_action_taken', align: 'center', width: '12%', renderer:columnWrap, listeners:{headerClick}},
            { text: 'Softcopy<br>Date Filed', dataIndex: 'date_uploaded', align: 'center', width: '12%', renderer:columnWrap, listeners:{headerClick}},
            { text: 'Softcopy<br>Description', dataIndex: 'attachment_descriptions', align: 'left', width: '15%', renderer:columnWrap, listeners:{headerClick}},
        ],
        width: '100%',
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    View();
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
            handler: function (){ AddEditDeleteOutgoingRecord('Add');}
        }, {
            id: 'editRecordRow',
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteOutgoingRecord('Edit');}
        }, {
            id: 'deleteRecordRow',
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteOutgoingRecord('Delete');}
        }, {
            id: 'updateActionTakenRow',
            text: 'Update Action Taken',
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
            text: 'View',
            icon: './image/view.png',
            handler: function (){ View();}
        }]
    });
 
    Ext.create('Ext.panel.Panel', {
        title: '<?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?>',
        width: '100%',
        height: sheight,
        renderTo: "innerdiv",
        layout: 'border',
        border: false,
        items   : [grid],
        tbar: [{
            xtype   : 'textfield',
            id      : 'searchId',
            emptyText: 'Search here...',
            width   : '30%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("outgoingRecordsListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
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
                    Ext.getCmp("outgoingRecordsListGrid").getStore().proxy.extraParams["status"] = status;
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
                    Ext.getCmp("outgoingRecordsListGrid").getStore().proxy.extraParams["record_type_filter"] = record_type_filter;
                    RefreshGridStore();
                }
            }            
        }, '-',
        { 
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
                
                Ext.getCmp("outgoingRecordsListGrid").getStore().proxy.extraParams["query"] = null;
                Ext.getCmp("outgoingRecordsListGrid").getStore().proxy.extraParams["status"] = status;
                Ext.getCmp("outgoingRecordsListGrid").getStore().proxy.extraParams["division_filter"] = 0;
                Ext.getCmp("outgoingRecordsListGrid").getStore().proxy.extraParams["record_type_filter"] = 0;
                // RefreshGridStore();
                Ext.getCmp("pageToolbar").moveFirst();
            }
        },
        { xtype: 'tbfill'},
        { xtype: 'button', id: 'addRecord', text: 'ADD', icon: './image/add.png', tooltip: 'Add Incoming Record', handler: function (){ AddEditDeleteOutgoingRecord('Add');}},
        { xtype: 'button', id: 'editRecord', text: 'EDIT', icon: './image/edit.png', tooltip: 'Edit Incoming Record', handler: function (){ AddEditDeleteOutgoingRecord('Edit');}},
        { xtype: 'button', id: 'deleteRecord', text: 'DELETE', icon: './image/delete.png', tooltip: 'Delete Incoming Record', handler: function (){ AddEditDeleteOutgoingRecord('Delete');}},
        { xtype: 'button', id: 'updateActionTaken', hidden: true, disabled: true, text: 'Update Action Taken', icon: './image/details.png', tooltip: 'Update Action Taken', handler: function (){ UpdateActionTaken();}},
        { xtype: 'button', id: 'uploadDocument', text: 'Upload Scanned Document', icon: './image/upload.png', tooltip: 'Upload Scanned Document', handler: function (){ UploadDocument('Upload');}},
        { xtype: 'button', id: 'viewRecord', text: 'VIEW', icon: './image/view.png', tooltip: 'View Record', handler: function (){ View();}},
        '-',
        // {
        //     text: 'Download',
        //     tooltip: 'Extract Data to PDF or EXCEL File Format',
        //     icon: './image/download.png',
        //     menu: 
        //     {
        //         items: 
        //         [
        //             {
        //                 text    : 'Export PDF Format',
        //                 icon: './image/pdf.png',
        //                 handler: function ()
        //                 {
        //                     ExportDocs('PDF');
        //                 }
        //             }, 
        //             {
        //                 text    : 'Export Excel Format',
        //                 icon: './image/excel.png',
        //                 handler: function ()
        //                 {
        //                     ExportDocs('Excel');
        //                 }
        //             }
        //         ]
        //     }
        // }
        ]
    });
});