//setTimeout("UpdateSessionData();", 0);
var query = null;
var RefreshGridStore = function () {
    Ext.getCmp("minutesOfMeetingsListGrid").getStore().reload({ params: { reset: 1, start: 0 }, timeout: 300000 });
    };
var store = new Ext.data.JsonStore({
    pageSize: setLimit,
    storeId: 'myStore',
    proxy: {
        type: 'ajax',
        url: 'adminservices_minutesof_meetings/minutesof_meetingslist',
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
    fields: [{ name: 'id', type: 'int' }, { name: 'division_id', type: 'int' }, { name: 'section_id', type: 'int' }, 'division_description', 'section_description', 'meeting_name', 'meeting_type', 'meeting_datetime', 'venue', 'agenda', 'discussion', 'prepared_date', 'prepared_by', 'reviewed_by', 'approved_by', 'status', 'viewer_division_id', 'viewer_section_id', 'viewer_id', 'documentation']
});


Ext.onReady(function () {

    
    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'minutesOfMeetingsListGrid',
        region  : 'center',
        store   : store,
        // cls     : 'gridCss',
        syncRowHeight: false,
        defaults: {
            align: 'center'
        },
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 30}),
            { text: 'MOM ID', dataIndex: 'id', hidden: false, width:'10%'},
            { text: 'Date Submitted', dataIndex: 'prepared_date', align: 'center', width: '10%', renderer: columnWrap },
            
            { text: 'Meeting Type', dataIndex: 'meeting_type', align: 'center', width: '10%', renderer: columnWrap },
            { text: 'Division', dataIndex: 'division_description', align: 'center', width: '7%', renderer: columnWrap},
            { text: 'Section', dataIndex: 'section_description', align: 'center', width: '7%', renderer: columnWrap},            
            { text: 'Status', dataIndex: 'status', align: 'center', width: '10%', renderer: MonitorablesStatusRenderer  },
            { text: 'Venue', dataIndex: 'venue', align: 'center', width: '10%', renderer: columnWrap },
            { text: 'Agenda', dataIndex: 'agenda', align: 'left', width: '10%', renderer: MonitorablesPutolRenderer},
            { text: 'Discussion', dataIndex: 'discussion', align: 'left', width: '30%', renderer: MonitorablesPutolRenderer}
            
        ],
        columnLines: true,
        height  : sheight,
        width: '100%',
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                itemdblclick: function () {
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
            text: 'Evaluate Minutes',
            icon: './image/evaluation.png',
            handler: function () { View();}
        }, //{
        //    text: 'Edit',
        //    icon: './image/edit.png',
        //    handler: function (){ AddEditDeletePosition('Edit');}
        {
            text: 'View Minutes',
            icon: './image/view.png',
            handler: function () { View();}
        },

        {
                text: 'Delete Minutes',
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
                        Ext.getCmp("minutesOfMeetingsListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'},
        {xtype: 'button', text: 'Add Minutes', icon: './image/submit.png', tooltip: 'Submit Minutes of Meeting', handler: function () { CreateMOM(); }},//{ AddEditDeletePosition('Edit');}},
        { xtype: 'button', id: 'btnEvalMinutes', text: 'Evaluate Minutes', icon: './image/evaluation.png', tooltip: 'Evaluate Minutes of Meeting', handler: function () { View(); }}

        ]
    });
});