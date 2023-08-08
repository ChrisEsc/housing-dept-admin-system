setTimeout("UpdateSessionData();", 0);
var query = null, statusID = 2;

function ExportDocs(type) {

    params = new Object();
    params.query    = query;  
    params.filetype = type;
    params.status = statusID;
    ExportDocument('userinformation/exportdocument', params, type);
}

Ext.onReady(function(){
    var store = new Ext.data.JsonStore({
        pageSize: setLimit,
        storeId: 'myStore',
        proxy: {
            type: 'ajax',
            url: 'userinformation/stafflist',
            timeout : 1800000,
            extraParams: {status: statusID, query:query},
            remoteSort: false,
            params: {start: 0, limit: setLimit},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },        
        fields: [{name: 'id', type: 'int'}, 'name', 'employee_id', 'department_desc', 'division_code', 'division_desc', 'section_desc', 'position_desc', 'stype', 'temp_key', 'username', 'security_key']
    });
    
    var RefreshGridStore = function () {
        Ext.getCmp("userinformationGrid").getStore().reload({params:{start:0 }, timeout: 300000});      
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'userinformationGrid',
        region  : 'center',
        store:store,        
        columns: [
            { dataIndex: 'id', hidden: true},
            { dataIndex: 'security_key', hidden: true},
            { text: 'Emp. ID', align: 'center', dataIndex: 'employee_id', width: '5%'},
            { text: 'Name', dataIndex: 'name', width: '20%'},
            { text: 'Department', dataIndex: 'department_desc', width: '15%'},
            { text: 'Division', align: 'center', dataIndex: 'division_code', width: '5%'},
            { text: 'Section', dataIndex: 'section_desc', width: '15%'},
            { text: 'Position', dataIndex: 'position_desc', width: '15%'},
            { text: 'Type', align: 'center', dataIndex: 'stype', width: '5%'},
            { text: 'User Name', dataIndex: 'username', width: '10%'},
            { text: 'Security Key', dataIndex: 'temp_key', width: '9%'}
        ],
        columnLines: true,
        width: '100%',
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                itemdblclick: function(view,rec,item,index,eventObj) {
                    AddEditDeleteStaff('Edit', 'userinformationGrid');
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    nameMenu.showAt(e.getXY());
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

    var nameMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteStaff('Add', 'userinformationGrid');}
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteStaff('Edit', 'userinformationGrid');}
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteStaff('Delete', 'userinformationGrid');}
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
                        Ext.getCmp("userinformationGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshGridStore();
                    }
                }
            }
        }, {
            xtype       : 'radio',
            boxLabel    : 'All',
            name        : 'Status',            
            inputValue  : '1',
            id          : 'radio1',
            listeners   :
            {
                change : function() {
                    if(Ext.getCmp('radio1').checked == true)
                    {
                        statusID = 1;
                        Ext.getCmp("userinformationGrid").getStore().proxy.extraParams["status"] = 1;
                        RefreshGridStore();
                    }
                }
            }            
        }, {
            xtype       : 'radio',
            boxLabel    : 'Active',
            name        : 'Status',
            checked     : true,
            inputValue  : '2',            
            id          : 'radio2',
            listeners   :
            {
                change : function() {
                    if(Ext.getCmp('radio2').checked == true)
                    {
                        statusID = 2;
                        Ext.getCmp("userinformationGrid").getStore().proxy.extraParams["status"] = 2;
                        RefreshGridStore();
                    }
                }
            }
        }, {
            xtype       : 'radio',
            boxLabel    : 'Inactive',
            name        : 'Status',
            inputValue  : '3',
            id          : 'radio3',
            listeners   :
            {
               change : function() {
                    if(Ext.getCmp('radio3').checked == true)
                    {
                        statusID = 3;
                        Ext.getCmp("userinformationGrid").getStore().proxy.extraParams["status"] = 3;
                        RefreshGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'},
        { xtype: 'button', text: 'ADD', icon: './image/add.png', tooltip: 'Add Staff Record', handler: function (){ AddEditDeleteStaff('Add', 'userinformationGrid');}},
        { xtype: 'button', text: 'EDIT', icon: './image/edit.png', tooltip: 'Edit Staff Record', handler: function (){ AddEditDeleteStaff('Edit', 'userinformationGrid');}},
        { xtype: 'button', text: 'DELETE', icon: './image/delete.png', tooltip: 'Delete Staff Record', handler: function (){ AddEditDeleteStaff('Delete', 'userinformationGrid');}},
        '-',
        {
            text: 'Download',
            tooltip: 'Extract Data to PDF or EXCEL File Format',
            icon: './image/download.png',
            menu: 
            {
                items:  [{
                    text    : 'Export PDF Format',
                    icon: './image/pdf.png',
                    handler: function ()
                    {
                        ExportDocs('PDF');
                    }
                }, {
                    text    : 'Export Excel Format',
                    icon: './image/excel.png',
                    handler: function ()
                    {
                        ExportDocs('Excel');
                    }
                }]
            }
        }]
    });
});