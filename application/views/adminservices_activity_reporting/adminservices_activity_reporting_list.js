//activity_reporting_list.js -> views
//setTimeout("UpdateSessionData();", 0);
//var query = null, record_type_filter = 0, priority = 0, division_filter = 0;
//var isDepartmentHead, isDivisionAssigned, isAsstDepartmentHead;
//var status_filter_store;

var query = null;

Ext.onReady(function(){
    var store = new Ext.data.JsonStore({
        pageSize: setLimit,
        storeId: 'myStore',
        proxy: {
            type: 'ajax',
            url: 'adminservices_activity_reporting/activity_reportslist',
            timeout : 1800000,
         
            remoteSort: false,
            params: { start: 0, limit: setLimit },
            //extraParams: { record_type_filter: record_type_filter, priority: priority, division_filter: division_filter, query: query, status: status },
            extraParams: { query: query },

            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },        
        fields: [{ name: 'id', type: 'int' }, { name: 'division_id', type: 'int' }, { name: 'section_id', type: 'int' }, 'documented_date', 'activity', 'division_description', 'section_description',
            'venue', 'participants', 'purpose', 'target_output', 'accomplishments', 'remarks', 'documentation', 'submit_date', 'chudd_participants', 'prepared_date', 'prepared_by', 'reviewed_by', 'approved_by', 'status', 'viewer_division_id', 'viewer_section_id', 'viewer_id', ]
    });
    
    var RefreshGridStore = function () {
        //Ext.getCmp("activityReportingListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});      
        Ext.getCmp("activityReportingListGrid").store.load({ params: { reset: 1, start: 0 } });
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'activityReportingListGrid',
        region  : 'center',
        store   : store,
        // cls     : 'gridCss',
        syncRowHeight: false,
        defaults: {
            align: 'center'
        },
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 30}),
            { text: 'PAR ID', dataIndex: 'id', hidden: false, width: '4%'},
            { text: 'Date Submitted', dataIndex: 'submit_date', align: 'center', width: '10%', renderer: addTooltip },
            { text: 'Activity Date', dataIndex: 'documented_date', align: 'center', width: '10%', renderer: columnWrap},
            { text: 'Activity', dataIndex: 'activity', align: 'left', width: '20%', renderer:columnWrap},
            { text: 'Division', dataIndex: 'division_description', align: 'center', width: '7%', renderer: columnWrap},
            { text: 'Section', dataIndex: 'section_description', align: 'center', width: '7%', renderer: columnWrap },
            { text: 'Status', dataIndex: 'status', align: 'center', width: '10%', renderer: MonitorablesStatusRenderer },
            { text: 'Venue', dataIndex: 'venue', align: 'center', width: '10%', renderer:columnWrap},            
            { text: 'Purpose', dataIndex: 'purpose', align: 'cleft', width: '10%', renderer:columnWrap},
            { text: 'Target Output', dataIndex: 'target_output', align: 'keft', width: '15%', renderer:columnWrap, hidden: true},
            { text: 'Actual Accomplishment', dataIndex: 'accomplishments', align: 'left', width: '15%', renderer: MonitorablesPutolRenderer},
            { text: 'Remarks', dataIndex: 'remarks', align: 'left', width: '10%', renderer: MonitorablesPutolRenderer}            
        ],
        columnLines: true,
        height  : sheight,
        width: '100%',
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                itemdblclick: function () {
                    Ext.getCmp("activityReportingListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                    query = Ext.getCmp("searchId").getValue();
                    console.log('6666' + query);
                    View();
                    RefreshGridStore();
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
        items: [
            {
                text: 'Evaluate Report',
                icon: './image/evaluation.png',
                handler: function () { View(); }
            },

            {
                text: 'Delete',
                icon: './image/delete.png',
                handler: function (){ DeletePAR();}
            },
            {
                text: 'View Report',
                icon: './image/view.png',
                handler: function (){ View();}
            }
            ]
    });
 
    Ext.create('Ext.panel.Panel', {
        title: '<?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?>',
        width: '100%',
        height: sheight,
        renderTo: "innerdiv",
        layout: 'border',
        border: false,
        items   : [grid],
        tbar: [
        {
            xtype   : 'textfield',
            id      : 'searchId',
            emptyText: 'Search here...',
            width   : '30%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("activityReportingListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        //query = Ext.getCmp("searchId").getValue();
                        //console.log(query);
                        RefreshGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'},
       //{ xtype: 'button', text: 'Update Accomp. Report', icon: './image/edit.png', tooltip: 'Update Accomplishment Report', handler: function (){ AddEditDeletePosition('Add');}},
            { xtype: 'button', text: 'Add Report', icon: './image/submit.png', tooltip: 'Submit Accomplishment Report', handler: function () { Testing2(); }},
            { xtype: 'button', text: 'Evaluate Report', icon: './image/evaluation.png', tooltip: 'Evaluate Accomplishment Report', handler: function () { View(); } },
            //{ xtype: 'button', text: 'Testing', tooltip: 'Testing', handler: function () { View(); } },
        //{ xtype: 'button', text: 'Post Remarks', icon: './image/details.png', tooltip: 'Post Remarks', handler: function (){ UpdateIncumbent();}},
        //{ xtype: 'button', text: 'Testing', icon: './image/details.png', tooltip: 'Post Remarks', handler: function (){TestingFun();}}
        ]

    });
});