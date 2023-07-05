var maintenanceWindow, immunization_residentID;

function viewMaintenance(type) 
{
    var store = new Ext.data.JsonStore({
        proxy: {
            type: 'ajax', 
            url: 'commonquery/maintenancelist', 
            extraParams: {start: 0, limit: 20, query: null, type: type}, 
            reader: {
                type: 'json', 
                root: 'data', 
                idProperty: 'id'
            }
        }, 
        fields: [], 
        listeners: 
        {
            metachange: function(store, meta) 
            {
                Ext.getCmp("maintenanceGrid").reconfigure(null, meta.columns);
            }
        }
    });

    var RefreshGridStore = function() { 
        Ext.getCmp("maintenanceGrid").getStore().reload({params:{reset: 1}, timeout: 300000});
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'maintenanceGrid', 
        region: 'center', 
        store:store, 
        columns: [], 
        autoHeight: true, 
        border: false, 
        columnLines: true, 
        width: '100%', 
        height: 205, 
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    AddEditDeleteMaintenanceCrud('Edit', type);
                }, 
                itemcontextmenu: function(view, record, item, index, e) {
                    e.stopEvent();
                    rowMaintenanceMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshGridStore();

    var rowMaintenanceMenu = Ext.create('Ext.menu.Menu', {
        items: [
        {
            text: 'Add', 
            icon: '../image/add.png', 
            handler: function () { AddEditDeleteMaintenanceCrud('Add', type);}
        }, {
            text: 'Edit', 
            icon: '../image/edit.png', 
            handler: function () { AddEditDeleteMaintenanceCrud('Edit', type);}
        }, {
            text: 'Delete', 
            icon: '../image/delete.png',
            handler: function () {
                AddEditDeleteMaintenanceCrud('Delete', type);}
        }]
    });

    maintenanceWindow = Ext.create('Ext.window.Window', {
        title: type.toUpperCase() + ' List', 
        closable: true, 
        modal: true, 
        width: 500, 
        autoHeight: true, 
        resizable: false, 
        border: false, 
        buttonAlign: 'center', 
        header: {titleAlign: 'center'}, 
        items: [grid], 
        tbar: [
        {
            xtype: 'textfield', 
            id: 'searchMaintenance', 
            emptyText: 'Search here...', 
            width: '50%', 
            listeners: 
            {
                specialKey: function(field, e) {
                    if(e.getKey()==e.ENTER) {
                        Ext.getCmp("maintenanceGrid").getStore().proxy.extraParams["query"]=Ext.getCmp("searchMaintenance").getValue();
                        RefreshGridStore();
                    }
                }
            }
        }, 
        { xtype: 'tbfill'}, 
        { xtype: 'button', icon: '../image/add.png', tooltip: 'Add Record', handler: function () {
                AddEditDeleteMaintenanceCrud('Add', type);}}, 
        { xtype: 'button', icon: '../image/edit.png', tooltip: 'Edit Record', handler: function () {
                AddEditDeleteMaintenanceCrud('Edit', type);}}, 
        { xtype: 'button', icon: '../image/delete.png', tooltip: 'Delete Record', handler: function () {
                AddEditDeleteMaintenanceCrud('Delete', type);}}]
    }).show();
}