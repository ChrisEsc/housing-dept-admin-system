setTimeout("UpdateSessionData();", 0);
var query = null;

function ExportGridList(type) {
    params = new Object();
    params.type     = type;
    params.date_from = Ext.getCmp("dateFrom").getValue();
    params.date_to  = Ext.getCmp("dateTo").getValue();
    params.query    = Ext.getCmp("searchId").getValue();  
    params.reporttype = 'List';
    
    ExportDocument('audit_logs/exportdocument', params, type);
}

Ext.onReady(function(){
    var store = new Ext.data.JsonStore({
        pageSize: setLimit,
        storeId: 'myStore',
        proxy: {
            type: 'ajax',
            url: 'audit_logs/loglist',
            extraParams: {query:query, date_from: Ext.Date.subtract(new Date(), Ext.Date.DAY, 3), date_to: Ext.Date.add(new Date(), Ext.Date.DAY, 3)},
            remoteSort: false,
            params: {start: 0, limit: setLimit},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },        
        fields: [{name: 'id', type: 'int'}, 'table' , 'date_created', 'transaction_type', 'transaction_id', 'query_type', 'created_by']
    });
    
    var RefreshGridStore = function () {
        Ext.getCmp("audit_logsGrid").getStore().reload({params:{start:0 }, timeout: 300000});      
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'audit_logsGrid',
        region  : 'center',
        store:store,        
        columns: [
            { dataIndex: 'id', hidden: true},
            { dataIndex: 'table', hidden: true},
            { text: 'Date & Time', dataIndex: 'date_created', width: '15%'},
            { text: 'Transaction Type', dataIndex: 'transaction_type', width: '45%', renderer:addTooltip},
            { text: 'ID', dataIndex: 'transaction_id', width: '5%'},
            { text: 'Query Type', dataIndex: 'query_type', width: '9%'},
            { text: 'User', dataIndex: 'created_by', width: '25%'}
        ],
        columnLines: true,
        width: '100%',
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                // itemdblclick: function() {
                //     ViewDetails();
                // },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    // rowMenu.showAt(e.getXY());
                }
            }
        },
        bbar: Ext.create('Ext.PagingToolbar', {
            store: store,
            pageSize: setLimit,
            displayInfo: true,
            displayMsg: 'Displaying {0} - {1} of {2}',
            emptyMsg: "No record/s to display"
        })
    });
    RefreshGridStore(); 

    // var rowMenu = Ext.create('Ext.menu.Menu', {
    //     items: [
    //     {
    //         text: 'View Details',
    //         icon: './image/view.png',
    //         handler: function (){ ViewDetails();}
    //     }]
    // });

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
                        Ext.getCmp("audit_logsGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshGridStore();
                    }
                }
            }
        }, {
            xtype: 'label',
            html: '<font size=2 color=><b>From:</b></font>'
        }, { xtype: 'datefield', id:'dateFrom', emptyText: 'From',  value: Ext.Date.subtract(new Date(), Ext.Date.DAY, 3), width: 100},
        {
            xtype: 'label',
            html: '<font size=2 color=><b>To:</b></font>'
        }, { xtype: 'datefield', id:'dateTo', emptyText: 'To',  value: Ext.Date.add(new Date(), Ext.Date.DAY, 3), width: 100},
        { xtype: 'button', text: 'RELOAD', icon: './image/load.png', tooltip: 'Reload grid based on date range', 
            handler: function (){ 
                Ext.getCmp("audit_logsGrid").getStore().proxy.extraParams["date_from"] = Ext.getCmp("dateFrom").getValue();
                Ext.getCmp("audit_logsGrid").getStore().proxy.extraParams["date_to"] = Ext.getCmp("dateTo").getValue();
                RefreshGridStore();
            }
        }, { xtype: 'tbfill'},
        {
            text: 'Download',
            tooltip: 'Extract Data to PDF File Format',
            icon: './image/pdf.png',
            handler: function ()
            {
                ExportGridList('PDF');
            }
        }]
    });
});
