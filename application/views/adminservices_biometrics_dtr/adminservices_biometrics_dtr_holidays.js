var holiday_query = null;

function ViewHolidays()
{
	var sm = Ext.getCmp("biometricsRecordsListGrid").getSelectionModel();
	calendar_id = calendar_id;

	var store = new Ext.data.JsonStore({
        proxy: {
            type: 'ajax', 
            url: 'adminservices_biometrics_dtr/holidayslist', 
            extraParams: {start: 0, limit: 20, query: holiday_query, calendar_id: calendar_id}, 
            reader: {
                type: 'json', 
                root: 'data', 
                idProperty: 'id'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'holiday_date', 'holiday_description']
    });

    var RefreshHolidaysGridStore = function() { 
        Ext.getCmp("holidaysGrid").getStore().reload({params:{reset: 1}, timeout: 300000});
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'holidaysGrid', 
        region: 'center', 
        store:store, 
        columns: [
        	Ext.create('Ext.grid.RowNumberer', {width: 35}),
        	{ text: 'Date', align: 'left', dataIndex: 'holiday_date', width: '30%'},
            { text: 'Description', align: 'left', dataIndex: 'holiday_description', width: '70%'},
        ], 
        autoHeight: true, 
        border: false, 
        columnLines: true, 
        width: '100%', 
        height: 205, 
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    AddEditDeleteHoliday('Edit');
                }, 
                itemcontextmenu: function(view, record, item, index, e) {
                    e.stopEvent();
                    rowMaintenanceMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshHolidaysGridStore();

    var rowMaintenanceMenu = Ext.create('Ext.menu.Menu', {
        items: [
        {
            text: 'Add', 
            icon: './image/add.png', 
            handler: function () { AddEditDeleteHoliday('Add');}
        }, {
            text: 'Edit', 
            icon: './image/edit.png', 
            handler: function () { AddEditDeleteHoliday('Edit');}
        }, {
            text: 'Delete', 
            icon: './image/delete.png',
            handler: function () {
                AddEditDeleteHoliday('Delete');}
        }]
    });

    holidaysWindow = Ext.create('Ext.window.Window', {
        title: 'Holidays List', 
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
                        Ext.getCmp("holidaysGrid").getStore().proxy.extraParams["query"]=Ext.getCmp("searchMaintenance").getValue();
                        RefreshHolidaysGridStore();
                    }
                }
            }
        }, 
        { xtype: 'tbfill'}, 
        { xtype: 'button', icon: './image/add.png', tooltip: 'Add', handler: function () {
                AddEditDeleteHoliday('Add');}}, 
        { xtype: 'button', icon: './image/edit.png', tooltip: 'Edit', handler: function () {
                AddEditDeleteHoliday('Edit');}}, 
        { xtype: 'button', icon: './image/delete.png', tooltip: 'Delete', handler: function () {
                AddEditDeleteHoliday('Delete');}}]
    }).show();
}