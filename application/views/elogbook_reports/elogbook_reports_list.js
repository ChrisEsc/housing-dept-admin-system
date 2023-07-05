//setTimeout("UpdateSessionData();", 0);

var section_id, logbook_type = 0, staff_id = 0, expected_deliverable_id = 0;
var month_id = new Date().getMonth() + 1;
var year = new Date().getFullYear();
var index, dtr_header_id, day;
var query = null;

Ext.onReady(function(){
    var treeStore = Ext.create('Ext.data.TreeStore', {
        proxy: {
            type    : 'ajax',
            timeout : 1800000,
            reader  : 'json',
            url     : 'elogbook_reports/sectionstree'
        },
        listeners: {
            load: function(treeStore, node, records, successful, eOpts) {
                var node = node.findChild('qtip', 'This Section', true);
                section_id = node.data.id;
                // console.log(section_id);
                Ext.getCmp("sectionsTree").getSelectionModel().select(node);
                Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["section_id"] = section_id;
                RefreshRecordsListGridStore();
            }
        }
    });

    var RefreshTreeStore = function () {
        Ext.getCmp("sectionsTree").getStore().reload({params:{reset:1 }, timeout: 300000});      
    };

    var tree = Ext.create('Ext.tree.Panel', {
        title       : 'Sections',
        split       : true,
        region      : 'west',
        collapsible : true,
        id          : 'sectionsTree',
        store       : treeStore,
        width       : '20%',
        minWidth    : 200,
        margin      : '0 0 10 0',
        height      : 500,        
        rootVisible : false,
        viewConfig  : {
            loadMask:true,
            listeners: {
                beforeitemclick(tree, record, item, index, e, eOpts) {
                    if (record.raw && record.raw.disabled == true) {                
                        return false;
                    }
                    return true;
                },
                itemclick: function(view, record, item, index, e, eOpts) {
                    section_id = record.data.id;
                    // console.log(record.raw.id);

                    // if the selected tree node is a div admin asstant or the division head, use their employee_id
                    if(record.raw.isDivAdminAssistant || record.raw.isDivHead)
                    {
                        section_id = 0;
                        staff_id = record.raw.id;                        
                    }
                    // reload grid data after getting section id, and/or staff id
                    Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["section_id"] = section_id;
                    Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["staff_id"] = staff_id;
                    RefreshRecordsListGridStore();

                    // reload staff combobox after getting section id
                    Ext.getCmp("staff_id").getStore().proxy.extraParams["section_id"] = section_id;
                    Ext.getCmp("staff_id").getStore().reload();

                    // reload expected deliverables combobox after getting section id
                    Ext.getCmp("expected_deliverable_id").getStore().proxy.extraParams["section_id"] = section_id;
                    Ext.getCmp("expected_deliverable_id").getStore().proxy.extraParams["month_id"] = month_id;
                    Ext.getCmp("expected_deliverable_id").getStore().reload();

                    Ext.getCmp("staff_id").setRawValue("All Staff");
                }
            }
        }
    });

    var store = new Ext.data.JsonStore({
        proxy: {
            type: 'ajax',
            url: 'elogbook_reports/elogbook_reportslist',
            timeout : 1800000,
            extraParams: {section_id: section_id, logbook_type: logbook_type, month_id: month_id, year: year, staff_id: staff_id, expected_deliverable_id: expected_deliverable_id},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id'
            }
        },
        listeners: {
            load: function(store, records, successful, eOpts) {
                //console.log(store.proxy.reader.jsonData); 
            },
            metachange: function(store, meta)
            {
                Ext.getCmp("elogbookReportsListGrid").reconfigure(store.fields, meta.columns);
            }
        },
        fields: []
    });

    var RefreshRecordsListGridStore = function () {
        Ext.getCmp("elogbookReportsListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});      
    };

    var logbook_metadata = [
        {dataIndex: 'id', hidden: true},
        {dataIndex: 'staff_id', hidden: true},
        {text: "Date", dataIndex: 'log_date', flex: 0.4},
        {text: "Staff", dataIndex: 'staff_name', flex: 0.7, align: 'left'},
        {text: "Expected Deliverable/s for the Month", dataIndex: 'expected_deliverable', flex: 1, align: 'left', renderer: columnWrap},
        {text: "Location", dataIndex: 'log_location', align: 'left', flex: 0.5, renderer: columnWrap},
        {text: "Qty.", dataIndex: 'log_quantity', align: 'center', flex: 0.2},
        {text: "Activity", dataIndex: 'log_activity', align: 'left', flex: 2, renderer: columnWrap}
    ];

    var passslip_metadata = [
        {dataIndex: 'id', hidden: true},
        {dataIndex: 'staff_ids', hidden: true},
        {text: "Date Requested", dataIndex: 'date_requested', flex: 0.4, renderer: columnWrap},
        {text: "Staff", dataIndex: 'staff_names', flex: 0.7, align: 'left', renderer: columnWrap},
        {text: "Date/s Applied", dataIndex: 'dates_applied', flex: 0.6, align: 'center', renderer: columnWrap},
        {text: "Expected Deliverable/s for the Month", dataIndex: 'expected_deliverable', align: 'left', flex: 1, renderer: columnWrap},
        {text: "Purpose", dataIndex: 'purpose', align: 'left', flex: 1, renderer: columnWrap},
        {text: "Confirmation of Field Work", dataIndex: 'confirmation', align: 'left', flex: 0.8, renderer: columnWrap},
        {text: "Status", dataIndex: 'status', align: 'center', flex: 0.3}
    ];

    var grid = Ext.create('Ext.grid.Panel', {
        id          : 'elogbookReportsListGrid',
        region      : 'center',
        store       : store,
        columns     : [],
        viewConfig  : {
            enableTextSelection: true
        },
        listeners: {
            itemdblclick: function() {
            },
            cellcontextmenu: function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            }
        },
        //columnLines: true,
        width       : '85%',
        minWidth    : 700,
        height      : 400,
        title       : 'Summary',
        titleAlign  : 'center',
        loadMask    : true,
        margin      : '0 0 10 0',
        tbar: [
        {                           
            xtype       : 'combo',
            id          : 'logbook_type',            
            name        : 'logbook_type',
            width       : 90,
            mode        : 'local',
            triggerAction: 'all',
            editable    : false,
            store: new Ext.data.ArrayStore({
                fields: ['id', 'description'],
                data: [[0, 'Logbook'], [1, 'Pass Slip']]
            }),
            listeners: 
            {
                afterrender: function ()
                {

                    Ext.suspendLayouts();
                    grid.reconfigure(null, logbook_metadata);
                    Ext.resumeLayouts(true);
                },
                select: function (combo, record, index)
                {      
                    logbook_type = record[0].data.id;

                    Ext.suspendLayouts();
                    Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["logbook_type"] = logbook_type;
                    RefreshRecordsListGridStore();

                    if(logbook_type == 0)
                        grid.reconfigure(null, logbook_metadata);
                    else
                        grid.reconfigure(null, passslip_metadata);
                    Ext.resumeLayouts(true);
                }
            },
            value       : 'Logbook',
            valueField  : 'id',
            displayField: 'description'
        }, {
            xtype           : 'combo',
            width           : 100,
            id              : 'month_id',
            valueField      : 'id',
            displayField    : 'month',
            // value           : 'September',
            value           : new Date().toLocaleString('default', { month: 'long' }),  // js implementation of parsing current month to string
            triggerAction   : 'all',
            enableKeyEvents : true,
            editable        : false,
            store: new Ext.data.ArrayStore({
                fields: ['id', 'month'],
                data: [
                    [1, 'January'],
                    [2, 'February'],
                    [3, 'March'],
                    [4, 'April'],
                    [5, 'May'],
                    [6, 'June'],
                    [7, 'July'],
                    [8, 'August'],
                    [9, 'September'],
                    [10, 'October'],
                    [11, 'November'],
                    [12, 'December']
                ]
            }),
            listeners: 
            {
                select: function (combo, record, index)
                {      
                    month_id = record[0].data.id;
                    Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["month_id"] = month_id;
                    Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["year"] = year;
                    RefreshRecordsListGridStore();

                     // reload staff combobox after getting section id
                    Ext.getCmp("staff_id").getStore().proxy.extraParams["section_id"] = section_id;
                    Ext.getCmp("staff_id").getStore().reload();


                    // reload expected deliverables combobox after getting section id
                    Ext.getCmp("expected_deliverable_id").getStore().proxy.extraParams["section_id"] = section_id;
                    Ext.getCmp("expected_deliverable_id").getStore().proxy.extraParams["month_id"] = month_id;
                    Ext.getCmp("expected_deliverable_id").getStore().reload();
                }
            }
        }, {
            xtype           : 'combo',
            width           : 100,
            id              : 'year',
            valueField      : 'id',
            displayField    : 'year',
            value           : new Date().getFullYear(),  // js implementation of parsing current month to string
            triggerAction   : 'all',
            enableKeyEvents : true,
            editable        : false,
            store: new Ext.data.ArrayStore({
                fields: ['id', 'year'],
                data: [
                    [1, '2019'],
                    [2, '2020']
                ]
            }),
            listeners: 
            {
                select: function (combo, record, index)
                {      
                    year = record[0].data.year;
                    Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["month_id"] = month_id;
                    Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["year"] = year;
                    RefreshRecordsListGridStore();

                     // reload staff combobox after getting section id
                    Ext.getCmp("staff_id").getStore().proxy.extraParams["section_id"] = section_id;
                    Ext.getCmp("staff_id").getStore().reload();


                    // reload expected deliverables combobox after getting section id
                    Ext.getCmp("expected_deliverable_id").getStore().proxy.extraParams["section_id"] = section_id;
                    Ext.getCmp("expected_deliverable_id").getStore().proxy.extraParams["year"] = year;
                    Ext.getCmp("expected_deliverable_id").getStore().reload();
                }
            }
        }, {                           
            xtype           : 'combo',
            width           : 200,
            id              : 'staff_id',
            valueField      : 'id',
            displayField    : 'description',
            emptyText       : 'All Staff',
            triggerAction   : 'all',
            enableKeyEvents : true,
            editable        : false,
            store: new Ext.data.JsonStore({
                proxy: {
                    type    : 'ajax',
                    url     : 'elogbook_reports/section_stafflist',
                    timeout : 1800000,
                    extraParams: {section_id: section_id},
                    reader  : {
                        type    : 'json',
                        root    : 'data',
                        idProperty: 'id'
                    }
                },
                params: {start: 0, limit: 10},
                fields: [{name: 'id', type: 'int'}, 'description'],
                listeners: {
                    beforeload: function (store, operation, eOpts) {
                        Ext.getCmp("staff_id").getStore().proxy.extraParams["section_id"] = section_id;
                    },
                    load: function (store, records, successful, eOpts) {
                        store.add({
                            id: 0,
                            description: 'All Staff'
                        });
                    }
                }
            }),
            listeners: 
            {
                select: function (combo, record, index)
                {      
                    staff_id = record[0].data.id;
                    Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["staff_id"] = staff_id;
                    RefreshRecordsListGridStore();
                }
            }
        }, {                           
            xtype           : 'combo',
            width           : 400,
            id              : 'expected_deliverable_id',
            valueField      : 'activity_id',
            displayField    : 'expected_deliverables',
            emptyText       : 'All Expected Deliverable/s',
            triggerAction   : 'all',
            enableKeyEvents : true,
            editable        : false,
            store: new Ext.data.JsonStore({
                proxy: {
                    type    : 'ajax',
                    url     : 'elogbook_reports/expected_deliverableslist',
                    timeout : 1800000,
                    extraParams: {section_id:section_id, month_id:month_id},
                    reader  : {
                        type    : 'json',
                        root    : 'data',
                        idProperty: 'activity_id'
                    }
                },
                storeId: "expected_deliverables_combo",
                params: {start: 0, limit: 10},
                fields: [{name: 'id', type: 'int'}, {name: 'activity_id', type: 'int'}, 'expected_deliverables'],
                listeners: {
                    beforeload: function (store, operation, eOpts) {
                        Ext.getCmp("expected_deliverable_id").getStore().proxy.extraParams["section_id"] = section_id;
                        Ext.getCmp("expected_deliverable_id").getStore().proxy.extraParams["month_id"] = month_id;
                    },
                    load: function (store, records, successful, eOpts) {
                        store.add({
                            activity_id: 0,
                            expected_deliverables: 'All Expected Deliverable/s'
                        });
                    }
                }
            }),
            listeners: 
            {
                select: function (combo, record, index)
                {      
                    expected_deliverable_id = record[0].data.activity_id;
                    // console.log(expected_deliverable_id);
                    Ext.getCmp("elogbookReportsListGrid").getStore().proxy.extraParams["expected_deliverable_id"] = expected_deliverable_id;
                    RefreshRecordsListGridStore();
                }
            }            
        }, 
        { xtype: 'tbfill'},
        ]
    });
    RefreshRecordsListGridStore();

    Ext.create('Ext.panel.Panel', {
        title   : '<?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?>',
        width   : '100%',
        height  : sheight,
        renderTo: "innerdiv",
        layout  : 'border',
        border  : false,
        items   : [tree,grid]
    });
});