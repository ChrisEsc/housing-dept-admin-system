var years = [];

function ViewItemNumberHistoryTable()
{
	var sm = Ext.getCmp("positionsListGrid").getSelectionModel();

    // // prepare data for year store
    // var calendar_year = new Date().getFullYear();
    // var years = [];
    // year = new Date().getFullYear();
    // for(var i=(year-2); i<=(year+2); i++) years.push([i]);
    // var yearsStore = new Ext.data.SimpleStore
    // ({
    //       fields : ['years'],
    //       data : years
    // });

	var store = new Ext.data.JsonStore({
        proxy: {
            type        : 'ajax', 
            url         : 'adminservices_plantilla/itemnumber_historylist', 
            //extraParams : {calendar_year: calendar_year, query:query}, 
            remoteSort  : false,
            params      : {start:0, limit: 33},
            reader      : {
                type            : 'json', 
                root            : 'data', 
                idProperty      : 'id',
                totalProperty   : 'count'
            }
        },
        fields: [],
        listeners:
        {
            load: function(store, records, successful, eOpts) {
                // Ext.getCmp("itemNoHistoryGrid").reconfigure(null, store.years);
                var columns = grid.getView().getHeaderCt().getGridColumns();

                for(i = 0; i < 5; i++)
                    years[i] = store.getProxy().getReader().rawData.years[i];

                Ext.getCmp("itemNoHistoryGrid").reconfigure(null, {

                });

                i = 0;
                Ext.each(columns, function (col) { 
                    if(i>2) {
                        col.setText(years[i-3]);
                        grid.columns[i].dataIndex = years[i];
                    }
                    i++;
                }); 
            }
            // metachange: function(store, meta) 
            // {
            //     Ext.getCmp("itemNoHistoryGrid").reconfigure(null, meta.columns);
            // }
        }
    });

    var RefreshItemNoHistoryGridStore = function() { 
        Ext.getCmp("itemNoHistoryGrid").getStore().reload({params:{reset: 1}, timeout: 300000});
    };

    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'itemNoHistoryGrid', 
        region: 'center',
        plugins: [cellEditing],
        store:store, 
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 35}),
            { dataIndex: 'id', hidden: true},
            { text: 'Title of Position', dataIndex: 'position_description', width: '45%', renderer:addTooltip},
            { text: '', dataIndex: '' + years[0], width: '10%', renderer:addTooltip},
            { text: '', dataIndex: '' + years[1], width: '10%', renderer:addTooltip},
            { text: '', dataIndex: '' + years[2], width: '10%', renderer:addTooltip},
            { text: '', dataIndex: '' + years[3], width: '10%', renderer:addTooltip},
            { text: '', dataIndex: '' + years[4], width: '10%', renderer:addTooltip}
        ],
        //autoHeight: true,
        border: false, 
        columnLines: true, 
        width: '100%', 
        height: 500,
        viewConfig: {
            listeners: {
                // itemdblclick: function() {
                //     AddEditDeleteItemNo('Edit', calendar_year);
                // }, 
                itemcontextmenu: function(view, record, item, index, e) {
                    e.stopEvent();
                    rowMaintenanceMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshItemNoHistoryGridStore();

    var rowMaintenanceMenu = Ext.create('Ext.menu.Menu', {
        items: [
        {
            text: 'Add', 
            icon: './image/add.png', 
            handler: function () { AddEditDeleteItemNo('Add', calendar_year);}
        }, {
            text: 'Edit', 
            icon: './image/edit.png', 
            handler: function () { AddEditDeleteItemNo('Edit', calendar_year);}
        }, {
            text: 'Delete', 
            icon: './image/delete.png',
            handler: function () {
                AddEditDeleteItemNo('Delete', calendar_year);}
        }]
    });

    itemNoHistoryWindow = Ext.create('Ext.window.Window', {
        title: 'Item Number History Table', 
        closable: true, 
        modal: true, 
        width: '40%', 
        autoHeight: true, 
        resizable: false, 
        border: false, 
        buttonAlign: 'center', 
        header: {titleAlign: 'center'}, 
        items: [grid], 
        tbar: [{
            xtype: 'textfield', 
            id: 'searchMaintenance', 
            emptyText: 'Search here...', 
            width: '50%', 
            listeners: 
            {
                specialKey: function(field, e) {
                    if(e.getKey()==e.ENTER) {
                        Ext.getCmp("itemNoHistoryGrid").getStore().proxy.extraParams["query"]=Ext.getCmp("searchMaintenance").getValue();
                        RefreshitemNoHistoryGridStore();
                    }
                }
            }
        }, 
        { xtype: 'tbfill'}, 
        {
            xtype       : 'combo',
            id          : 'calendar_year',
            name        : 'calendar_year',
            width       : 100,
            //store       : yearsStore,
            mode        : 'local',
            displayField: 'years',
            valueField  : 'years',
            value       : new Date().getFullYear(),
            allowBlank  : false,
            editable    : false,
            listeners   :
            {
                select: function (combo, record, index)
                {
                    calendar_year = Ext.getCmp("calendar_year").getRawValue();
                    Ext.getCmp("itemNoHistoryGrid").getStore().proxy.extraParams["calendar_year"] = calendar_year;
                    RefreshitemNoHistoryGridStore();
                }
            }
        },'-',
        { xtype: 'button', icon: './image/add.png', tooltip: 'Add', handler: function () {
                AddEditDeleteItemNo('Add', calendar_year);}}, 
        { xtype: 'button', icon: './image/edit.png', tooltip: 'Edit', handler: function () {
                AddEditDeleteItemNo('Edit', calendar_year);}}, 
        { xtype: 'button', icon: './image/delete.png', tooltip: 'Delete', handler: function () {
                AddEditDeleteItemNo('Delete', calendar_year);}}]
    }).show();
}