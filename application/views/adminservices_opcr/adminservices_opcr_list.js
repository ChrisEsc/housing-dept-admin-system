//setTimeout("UpdateSessionData();", 0);
function ExportDocs(type) {
	params = new Object();
    params.query    = query;
    params.type     = type;
    params.filetype     = 'grid'; 
    ExportDocument('adminservices_opcr/exportdocument', params, type);
}

Ext.onReady(function(){
	var store = new Ext.data.JsonStore({
        pageSize: setLimit,
        storeId: 'myStore',
        proxy: {
            type: 'ajax',
            url: 'adminservices_opcr/opcr_list',
            timeout : 1800000,
            extraParams: {},
            remoteSort: false,
            params: {start: 0, limit: setLimit},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },        
        fields: [{name: 'id', type: 'int'}, 'new_item_number', 'position_description', 'staff_name', 'date_appointed', 'salary_grade_step', 'authorized_annual_rate', 'budget_year_annual_rate', 'increase_amount', 'remarks']
    });
    
    var RefreshGridStore = function () {
        Ext.getCmp("opcrListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});      
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'opcrListGrid',
        region  : 'center',
        store   : store,
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 25}),
            { dataIndex: 'id', hidden: true},
            { text: 'Major Final Output (MFO)<br>Programs/Activities/Projects (PAP)', align: 'center', dataIndex: 'position_description', width: '15%', renderer:addTooltip},
            { text: 'SUCCESS INDICATORS<br>(Targets + Measures)', align: 'center', dataIndex: 'staff_name', width: '20%', renderer:addTooltip},
            { text: 'Allotted Budget', align: 'center', dataIndex: 'date_appointed', width: '10%', renderer:addTooltip},
            { text: 'Division/Individuals<br>Accountable', align: 'center', dataIndex: 'increase_amount', width: '10%', renderer:addTooltip},
            { text: 'Actual Accomplishments', align: 'center', dataIndex: 'increase_amount', width: '20%', renderer:addTooltip},
            { text: 'Q', align: 'center', dataIndex: 'remarks', width: '3%', renderer:addTooltip},
            { text: 'E', align: 'center', dataIndex: 'remarks', width: '3%', renderer:addTooltip},
            { text: 'T', align: 'center', dataIndex: 'remarks', width: '3%', renderer:addTooltip},
            { text: 'Ave.', align: 'center', dataIndex: 'remarks', width: '3%', renderer:addTooltip},
            { text: 'Remarks', align: 'center', dataIndex: 'remarks', width: '10%', renderer:addTooltip},
        ],
        //columnLines: true,
        width: '100%',
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    UpdateIncumbent();
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    rowMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshGridStore(); 

    var rowMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteOPCRItem('Add');}
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteOPCRItem('Edit');}
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteOPCRItem('Delete');}
        }, {
            text: 'Incumbent Details',
            icon: './image/details.png',
            handler: function (){ UpdateIncumbent();}
        }, {
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
            emptyText: '',
            width   : '30%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("opcrListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshGridStore();
                    }
                }
            }
        }, 
        { xtype: 'tbfill'},
        { xtype: 'button', text: 'ADD', icon: './image/add.png', tooltip: 'Add Position', handler: function (){ AddEditDeleteOPCRItem('Add');}},
        { xtype: 'button', text: 'EDIT', icon: './image/edit.png', tooltip: 'Edit Position', handler: function (){ AddEditDeleteOPCRItem('Edit');}},
        { xtype: 'button', text: 'DELETE', icon: './image/delete.png', tooltip: 'Delete Position', handler: function (){ AddEditDeleteOPCRItem('Delete');}},
        { xtype: 'button', text: 'INCUMBENT DETAILS', icon: './image/details.png', tooltip: 'Incumbent Details', handler: function (){ UpdateIncumbent();}},
        { xtype: 'button', text: 'VIEW', icon: './image/view.png', tooltip: 'View Incumbent/s', handler: function (){ ViewPosition();}}
        ]
    });
});