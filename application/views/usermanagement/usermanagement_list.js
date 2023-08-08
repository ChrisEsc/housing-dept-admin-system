setTimeout("UpdateSessionData();", 0);
var query = null;

Ext.onReady(function(){
    var usersStore = new Ext.data.JsonStore({
        pageSize: setLimit,
        storeId: 'usersStore',
        proxy: {
            type: 'ajax',
            url: 'usermanagement/userslist',
            timeout : 1800000,
            extraParams: {query:null},
            remoteSort: false,
            params: {start: 0, limit: setLimit},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'username', 'name', 'type']
    });

    var moduleStore = new Ext.data.JsonStore({
        storeId: 'moduleStore',
        proxy: {
            type: 'ajax',
            url: 'usermanagement/modulelist',
            timeout : 1800000,
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'sno', 'module_name']
    });

    var submoduleStore = new Ext.data.JsonStore({
        storeId: 'submoduleStore',
        proxy: {
            type: 'ajax',
            url: 'usermanagement/submodulelist',
            timeout : 1800000,
            extraParams: {start: 0, limit: 20, module_id:0},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'sno', 'parent_id', 'module_name', 'link', 'thumbnail', 'menu', 'icon']
    });

    var RefreshusersGridStore = function () {
        Ext.getCmp("usersGrid").getStore().reload({params:{start:0 }, timeout: 300000});      
    };

    var RefreshmoduleGridStore = function () {
        Ext.getCmp("moduleGrid").getStore().reload({params:{start:0 }, timeout: 300000});      
    };

    var RefreshsubmoduleGridStore = function () {
        Ext.getCmp("submoduleGrid").getStore().reload({params:{start:0 }, timeout: 300000});      
    };

    var grid1 = Ext.create('Ext.grid.Panel', {
        id: 'usersGrid',
        store:usersStore,
    	split	: true,
        region	: 'west',
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 35}),
            { dataIndex: 'id', hidden: true},
            { dataIndex: 'type', hidden: true},
            { text: 'Username', dataIndex: 'username', width: '30%', renderer:addTooltip},
            { text: 'Name', dataIndex: 'name', width: '63%', renderer:addTooltip}
        ],
        columnLines: true,
        width: '30%',
        height: 400,        
        margin: '0 0 10 0',
        tbar: [{
            xtype   : 'textfield',
            id      : 'searchId',
            emptyText: 'Search here...',
            width   : '60%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("usersGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshusersGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'},
        { xtype: 'button', icon: './image/add.png', handler: function (){ AddEditDeleteUser('Add');}},
        '-',
        { xtype: 'button', icon: './image/edit.png', handler: function (){ AddEditDeleteUser('Edit');}},
        '-',
        { xtype: 'button', icon: './image/delete.png', handler: function (){ AddEditDeleteUser('Delete');}}
        ],
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    AddEditDeleteUser('Edit');
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    usersMenu.showAt(e.getXY());
                }
            }
        },
        bbar: Ext.create('Ext.PagingToolbar', {
        	id: 'pageToolbarUser',
            store: usersStore,
            pageSize: setLimit,
            displayInfo: true,
            displayMsg: 'Displaying {0} - {1} of {2}',
            emptyMsg: "No record/s to display"
        })
    });
    RefreshusersGridStore();

    var usersMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteUser('Add');}
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteUser('Edit');}
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteUser('Delete');}
        }]
    });

    var grid2 = Ext.create('Ext.grid.Panel', {
        id: 'moduleGrid',
        store:moduleStore,
        split   : true,
        region  : 'west',
        columns: [
            { dataIndex: 'id', hidden: true},
            { text: 'Menu', dataIndex: 'module_name', width: '73%', renderer:addTooltip},
            { text: 'Order', dataIndex: 'sno', width: '26%', align: 'center'}
        ],
        columnLines: true,
        width: '25%',
        height: 400,        
        margin: '0 0 10 0',
        tbar: [
        { xtype: 'tbfill'},
        { xtype: 'button', icon: './image/add.png', handler: function (){ AddEditDeleteModule('Add');}},
        '-',
        { xtype: 'button', icon: './image/edit.png', handler: function (){ AddEditDeleteModule('Edit');}},
        '-',
        { xtype: 'button', icon: './image/delete.png', handler: function (){ AddEditDeleteModule('Delete');}}
        ],
        viewConfig: {
            listeners: {
                itemclick: function(view,rec,item,index,eventObj) {                    
                    Ext.getCmp("submoduleGrid").getStore().proxy.extraParams["module_id"] = rec.get('id');
                    RefreshsubmoduleGridStore();
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    moduleMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshmoduleGridStore();

    var moduleMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteModule('Add');}
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteModule('Edit');}
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteModule('Delete');}
        }]
    });

	var grid3 = Ext.create('Ext.grid.Panel', {
        id: 'submoduleGrid',
        store:submoduleStore,
		region	: 'center',
        columns: [
            { dataIndex: 'id', hidden: true},
            { dataIndex: 'parent_id', hidden: true},
            { text: 'Module', dataIndex: 'module_name', width: '25%', renderer:addTooltip},
            { text: 'Link', dataIndex: 'link', width: '20%', renderer:addTooltip},            
            { text: 'Icon', dataIndex: 'icon', width: '20%', renderer:addTooltip},            
            { text: 'Order', dataIndex: 'sno', width: '9%', align: 'center'},
            { xtype: 'checkcolumn', text: 'Thumbnail?', dataIndex: 'thumbnail', width: '15%', align: 'center', listeners:{beforecheckchange: function() {return false}}},
            { xtype: 'checkcolumn', text: 'Menu?', dataIndex: 'menu', width: '10%', align: 'center', listeners:{beforecheckchange: function() {return false}}}           
        ],
        columnLines: true,
        width: '80%',
        height: 400,        
        loadMask: true,
        margin: '0 0 10 0',
        tbar: [
        { xtype: 'tbfill'},
        { xtype: 'button', text: 'DEFAULT', icon: './image/check.png', handler: function (){ DefaultModule();}},
        '-',
        { xtype: 'button', text: 'USERS', icon: './image/users.png', handler: function (){ AddEditDeleteModuleUsers('Sub');}},
        '-',
        { xtype: 'button', icon: './image/add.png', handler: function (){ AddEditDeleteSubModule('Add');}},
        '-',
        { xtype: 'button', icon: './image/edit.png', handler: function (){ AddEditDeleteSubModule('Edit');}},
        '-',
        { xtype: 'button', icon: './image/delete.png', handler: function (){ AddEditDeleteSubModule('Delete');}}
        ],
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    AddEditDeleteSubModule('Edit');
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    submoduleMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshsubmoduleGridStore();

    var submoduleMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Users',
            icon: './image/users.png',
            handler: function (){ AddEditDeleteModuleUsers('Sub');}
        }, {
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteSubModule('Add');}
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteSubModule('Edit');}
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteSubModule('Delete');}
        }]
    });

    var panel1 = Ext.create('Ext.panel.Panel', {
        region  : 'center',
        border  : false,
        width: '75%',
        height: '100%',
        layout: 'border',
        items   : [grid2, grid3]
    });

	Ext.create('Ext.panel.Panel', {
        title: '<?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?>',
	    width: '100%',
	    height: sheight,
	    renderTo: "innerdiv",
	    layout: 'border',
        border: false,
	    items	: [grid1, panel1]
	});
});