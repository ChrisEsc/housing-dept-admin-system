function ViewSalaryGradeTable()
{
	var sm = Ext.getCmp("positionsListGrid").getSelectionModel();

    // prepare data for year store
    var calendar_year = active_year;
    var years = [];
    year = new Date().getFullYear();
    for(var i=(year-2); i<=(year+2); i++) years.push([i]);
    var yearsStore = new Ext.data.SimpleStore
    ({
          fields : ['years'],
          data : years
    });

	var store = new Ext.data.JsonStore({
        proxy: {
            type        : 'ajax', 
            url         : 'adminservices_plantilla/salary_gradeslist', 
            extraParams : {calendar_year: active_year, query:query},
            remoteSort  : false,
            params      : {start:0, limit: 33},
            reader      : {
                type        : 'json', 
                root        : 'data', 
                idProperty     : 'id'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'salary_grade', 'step_1', 'step_2', 'step_3', 'step_4', 'step_5', 'step_6', 'step_7', 'step_8', 'year']
    });

    var RefreshSalariesGridStore = function() { 
        Ext.getCmp("salariesGrid").getStore().reload({params:{start:0, limit: 33, reset: 1}, timeout: 300000});
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'salariesGrid', 
        region: 'center', 
        store:store, 
        columns: [
        	Ext.create('Ext.grid.RowNumberer', {width: 35}),
            { dataIndex: 'id', hidden: true},
        	{ text: 'SG', align: 'center', dataIndex: 'salary_grade', width: '8%'},
            { text: 'Step 1', align: 'right', dataIndex: 'step_1', width: '11%'},
            { text: 'Step 2', align: 'right', dataIndex: 'step_2', width: '11%'},
            { text: 'Step 3', align: 'right', dataIndex: 'step_3', width: '11%'},
            { text: 'Step 4', align: 'right', dataIndex: 'step_4', width: '11%'},
            { text: 'Step 5', align: 'right', dataIndex: 'step_5', width: '11%'},
            { text: 'Step 6', align: 'right', dataIndex: 'step_6', width: '11%'},
            { text: 'Step 7', align: 'right', dataIndex: 'step_7', width: '11%'},
            { text: 'Step 8', align: 'right', dataIndex: 'step_8', width: '11%'},
        ], 
        border: false, 
        //columnLines: true, 
        width: '100%', 
        height: 500, 
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    AddEditDeleteSalary('Edit', calendar_year);
                }, 
                itemcontextmenu: function(view, record, item, index, e) {
                    e.stopEvent();
                    rowMaintenanceMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshSalariesGridStore();

    var rowMaintenanceMenu = Ext.create('Ext.menu.Menu', {
        items: [
        {
            text: 'Add', 
            icon: './image/add.png', 
            handler: function () { AddEditDeleteSalary('Add', calendar_year);}
        }, {
            text: 'Edit', 
            icon: './image/edit.png', 
            handler: function () { AddEditDeleteSalary('Edit', calendar_year);}
        }, {
            text: 'Delete', 
            icon: './image/delete.png',
            handler: function () {
                AddEditDeleteSalary('Delete', calendar_year);}
        }]
    });

    holidaysWindow = Ext.create('Ext.window.Window', {
        title: 'Salary Grade Table', 
        closable: true, 
        modal: true, 
        //maximizable: true,
        width: '90%', 
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
                        Ext.getCmp("salariesGrid").getStore().proxy.extraParams["query"]=Ext.getCmp("searchMaintenance").getValue();
                        RefreshSalariesGridStore();
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
            store       : yearsStore,
            mode        : 'local',
            displayField: 'years',
            valueField  : 'years',
            value       : active_year,
            allowBlank  : false,
            editable    : false,
            listeners   :
            {
                select: function (combo, record, index)
                {
                    calendar_year = Ext.getCmp("calendar_year").getRawValue();
                    Ext.getCmp("salariesGrid").getStore().proxy.extraParams["calendar_year"] = calendar_year;
                    RefreshSalariesGridStore();
                }
            }
        },
        { 
            text    : 'Set as Active Year', 
            icon    : './image/approve.png', 
            tooltip : 'Set as Active Year', 
            handler : function (){
                Ext.MessageBox.wait('Loading...');
                Ext.Ajax.request({
                    url     : "adminservices_plantilla/setactive_year",
                    method  : 'POST',
                    params  : {active_year:calendar_year},
                    success: function(f,a)
                    {
                        var response = Ext.decode(f.responseText);
                        Ext.MessageBox.hide();
                        if (response.success == false)
                            warningFunction("Warning", response.data);
                        else
                            infoFunction("Info", response.data);

                        RefreshSalariesGridStore();
                        Ext.getCmp("positionsListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000}); // cannot use RefreshGridStore(), that's why this is used
                    }
                });
                console.log(calendar_year);

            }
        },'-',
        { xtype: 'button', icon: './image/add.png', tooltip: 'Add', handler: function () {
                AddEditDeleteSalary('Add', calendar_year);}}, 
        { xtype: 'button', icon: './image/edit.png', tooltip: 'Edit', handler: function () {
                AddEditDeleteSalary('Edit', calendar_year);}}, 
        { xtype: 'button', icon: './image/delete.png', tooltip: 'Delete', handler: function () {
                AddEditDeleteSalary('Delete', calendar_year);}}]
    }).show();
}