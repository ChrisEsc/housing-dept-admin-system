//setTimeout("UpdateSessionData();", 0);
var query = null;
var RefreshGridStore = function () {
    Ext.getCmp("evaluationsListGrid").getStore().reload({ params: { reset: 1, start: 0 }, timeout: 300000 });
    };
var store = new Ext.data.JsonStore({
    pageSize: setLimit,
    storeId: 'evalStore',
    proxy: {
        type: 'ajax',
        url: 'adminservices_monitorables_evaluations/evaluations_list',
        timeout: 1800000,
        extraParams: { query: query },
        remoteSort: false,
        params: { start: 0, limit: setLimit },
        reader: {
            type: 'json',
            root: 'data',
            idProperty: 'id',
            totalProperty: 'totalCount'
        }
    },
    fields: [{ name: 'id', type: 'int' }, { name: 'division_id', type: 'int' }, { name: 'section_id', type: 'int' },
        'division_description', 'section_description',
        'doc_id', 'doc_type', 'evaluation', 'evaluated_by', 'evaluation_date', 'responded_by', 'response', 'response_date',
            'status', 'document_division', 'document_section', 'doc_type_id']
});

Ext.onReady(function () {
    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'evaluationsListGrid',
        region  : 'center',
        store   : store,
        // cls     : 'gridCss',
        syncRowHeight: false,
        defaults: {
            align: 'center'
        },
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 30}),
            { dataIndex: 'id', hidden: true },
            //{ text: 'Document Type', dataIndex: 'doc_type', align: 'center', width: '10%', renderer: columnWrap },
            //{ text: 'Document ID', dataIndex: 'doc_id', align: 'center', width: '10%', renderer: columnWrap },
            { text: 'Document', dataIndex: 'doc_type_id', align: 'left', width: '10%', renderer: columnWrap },
            { text: 'Document Title', align: 'left', width: '10%', renderer: columnWrap },
            {text: 'Evaluation', dataIndex: 'evaluation', align: 'left', width: '20%', renderer: MonitorablesPutolRenderer},
            { text: 'Response to Evaluation', dataIndex: 'response', align: 'left', width: '20%', renderer: MonitorablesPutolRenderer },
            { text: 'Status', dataIndex: 'status', align: 'left', width: '30%', renderer: columnWrap }
            // present and absent implement as row expander
        ],
        columnLines: true,
        height  : sheight,
        width: '100%',
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                itemdblclick: function () {
                    ViewEval();
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
            text: 'View Evaluation',
            icon: './image/view.png',
            handler: function () { View();}
        }, {
            text: 'Delete Evaluation',
            icon: './image/delete.png',
            handler: function () { DeleteMOM(); RefreshGridStore()}
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
                        Ext.getCmp("minutesOfMeetingsListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'}
        //{xtype: 'button', text: 'View PARs', icon: './image/submit.png', tooltip: 'Submit Minutes of Meeting', handler: function () { CreateMOM(); }},//{ AddEditDeletePosition('Edit');}},
        //{xtype: 'button', id: 'btnEvalMinutes', text: 'Evaluate Minutes', icon: './image/evaluation.png', tooltip: 'Evaluate Minutes of Meeting', handler: function () { View(); }}
        ]
    });
});