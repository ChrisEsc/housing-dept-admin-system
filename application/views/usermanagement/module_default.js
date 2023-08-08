var groupID;

function DefaultModule()
{       
    var defaultusersStore = new Ext.data.JsonStore({
        storeId: 'defaultusersStore',
        proxy: {
            type: 'ajax',
            url: 'usermanagement/defaultgroup',
            timeout : 1800000,
            extraParams: {start: 0, limit: 20, query:null},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'description']
    });

    var defaultmodulesStore = new Ext.data.JsonStore({
        storeId: 'defaultmodulesStore',
        proxy: {
            type: 'ajax',
            url: 'usermanagement/defaultmodules',
            timeout : 1800000,
            extraParams: {start: 0, limit: 20, group_id:0},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'description']
    });

    var RefreshDefaultUsersGridStore = function () {
        Ext.getCmp("defaultusersGrid").getStore().reload({params:{reset:1 }, timeout: 300000});      
    };

    var RefreshDefaultModulesGridStore = function () {
        Ext.getCmp("defaultmodulesGrid").getStore().reload({params:{reset:1 }, timeout: 300000});      
    };

    var grid1 = Ext.create('Ext.grid.Panel', {
        id: 'defaultusersGrid',
        store:defaultusersStore,
        region  : 'center',
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 35}),
            { dataIndex: 'id', hidden: true},
            { text: 'Group', dataIndex: 'description', width: '90%', renderer:addTooltip}
        ],
        columnLines: true,
        width: '100%',
        height: '100%',        
        viewConfig: {
            listeners: {
                itemclick: function(view,rec,item,index,eventObj) {    
                    groupID = rec.get('id');
                    Ext.getCmp("defaultmodulesGrid").getStore().proxy.extraParams["group_id"] = rec.get('id');
                    RefreshDefaultModulesGridStore();
                }
            }
        }
    });
    RefreshDefaultUsersGridStore();

    var grid2 = Ext.create('Ext.grid.Panel', {
        id: 'defaultmodulesGrid',
        store:defaultmodulesStore,
        region  : 'center',
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 35}),
            { dataIndex: 'id', hidden: true},
            { text: 'Modules', dataIndex: 'description', width: '90%', renderer:addTooltip}
        ],
        columnLines: true,
        width: '100%',
        height: '100%',        
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    AddEditDeleteDefaultModules('Edit');
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    usersDefaultModules.showAt(e.getXY());
                }
            }
        }
    });
    RefreshDefaultModulesGridStore();

    var usersDefaultModules = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteDefaultModules('Add');}
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteDefaultModules('Edit');}
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteDefaultModules('Delete');}
        }]
    });

    var centerPanel = Ext.create('Ext.panel.Panel', {        
        region  : 'center',
        width   : '65%',
        layout: 'border',
        items   : [grid2]
    });

    var westPanel = Ext.create('Ext.panel.Panel', {        
        split   : true,
        region  : 'west',
        width   : '35%',
        layout: 'border',
        items   : [grid1]
    });

    mainWindow = Ext.create('Ext.window.Window', {
        title       : 'Default User Modules',
        header      : {titleAlign: 'center'},
        closable    : true,
        modal       : true,
        width       : 700,
        height      : 400,
        resizable   : false,        
        layout      : 'border',
        items       : [westPanel, centerPanel]
    }).show();
}