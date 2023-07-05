setTimeout("UpdateSessionData();", 0);

var calendar_id, period = 0, month_name;
var index, dtr_header_id, day;
var coordinates, employment_status = 1;
var query = null;

Ext.onReady(function(){
    
    var treeStore = Ext.create('Ext.data.TreeStore', {
        proxy: {
            type: 'ajax',
            timeout : 1800000,
            reader: 'json',
            url: 'adminservices_biometrics_dtr/monthstree'
        },
        listeners: {
            load: function(treeStore, node, records, successful, eOpts) {
                var node = node.findChild('qtip', 'Current Month', true);
                calendar_id = node.data.id;
                month_name = node.data.text;
                Ext.getCmp("monthsTree").getSelectionModel().select(node);
                Ext.getCmp("biometricsRecordsListGrid").getStore().proxy.extraParams["calendar_id"] = calendar_id;                                        
                RefreshRecordsListGridStore();
            }
        }
    });

    var RefreshTreeStore = function () {
        Ext.getCmp("monthsTree").getStore().reload({params:{reset:1 }, timeout: 300000});      
    };

    var tree = Ext.create('Ext.tree.Panel', {
        title: 'Month',
        split   : true,
        region  : 'west',
        collapsible: true,
        id : 'monthsTree',
        store: treeStore,
        width: '15%',
        minWidth: 200,
        margin: '0 0 10 0',
        height: 500,        
        rootVisible: false,
        viewConfig: {
            loadMask:true,
            listeners: {
                itemclick: function(view,rec,item,index,eventObj) {
                    isMonth = rec.get('leaf');
                    calendar_id = rec.get('id');

                    if (isMonth) {
                        month_name = rec.get('text');
                        Ext.getCmp("biometricsRecordsListGrid").getStore().proxy.extraParams["calendar_id"] = rec.get('id');                        
                        RefreshRecordsListGridStore();
                    }
                }
            }
        }
    });

    var store = new Ext.data.JsonStore({
        proxy: {
            type: 'ajax',
            url: 'adminservices_biometrics_dtr/biometrics_recordslist',
            timeout : 1800000,
            extraParams: {employment_status:employment_status, query:query, calendar_id:calendar_id},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id'
            }
        },
        listeners: {
            load: function(store, records, successful, eOpts) {
                //console.log(store.proxy.reader.jsonData); 
            }
        },
        fields: ['employee_id', 'dtr_header_id', 'employee_name', 'day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7', 'day_8', 'day_9', 'day_10', 'day_11', 'day_12', 'day_13', 'day_14', 'day_15', 'day_16', 'day_17', 'day_18', 'day_19', 'day_20', 'day_21', 'day_22', 'day_23', 'day_24', 'day_25', 'day_26', 'day_27', 'day_28', 'day_29', 'day_30', 'day_31']
    });


    var RefreshRecordsListGridStore = function () {
        Ext.getCmp("biometricsRecordsListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});      
    };
    
    var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1
    });

    var first_period_metadata = [
        {dataIndex: 'dtr_header_id', hidden: true},
        {text: "Emp. ID",  locked: true, dataIndex: 'employee_id', width: 75},
        {text: "Name",  locked: true, dataIndex: 'employee_name', width: 250, align: 'center'},
        {text: "1", dataIndex: 'day_1', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "2", dataIndex: 'day_2', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "3", dataIndex: 'day_3', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "4", dataIndex: 'day_4', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "5", dataIndex: 'day_5', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "6", dataIndex: 'day_6', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "7", dataIndex: 'day_7', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "8", dataIndex: 'day_8', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "9", dataIndex: 'day_9', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "10", dataIndex: 'day_10', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "11", dataIndex: 'day_11', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "12", dataIndex: 'day_12', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "13", dataIndex: 'day_13', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "14", dataIndex: 'day_14', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "15", dataIndex: 'day_15', align: 'center', flex: 1, renderer: checkIfDirtyCell}
    ];

    var second_period_metadata = [
        {dataIndex: 'dtr_header_id', hidden: true},
        {text: "Emp. ID",  locked: true, dataIndex: 'employee_id', width: 75},
        {text: "Name",  locked: true, dataIndex: 'employee_name', width: 250, align: 'center'},
        {text: "16", dataIndex: 'day_16', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "17", dataIndex: 'day_17', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "18", dataIndex: 'day_18', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "19", dataIndex: 'day_19', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "20", dataIndex: 'day_20', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "21", dataIndex: 'day_21', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "22", dataIndex: 'day_22', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "23", dataIndex: 'day_23', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "24", dataIndex: 'day_24', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "25", dataIndex: 'day_25', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "26", dataIndex: 'day_26', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "27", dataIndex: 'day_27', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "28", dataIndex: 'day_28', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "29", dataIndex: 'day_29', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "30", dataIndex: 'day_30', align: 'center', flex: 1, renderer: checkIfDirtyCell},
        {text: "31", dataIndex: 'day_31', align: 'center', flex: 1, renderer: checkIfDirtyCell}
    ];

    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'biometricsRecordsListGrid',
        region  : 'center',
        plugins: [cellEditing],
        store: store,
        columns: [],
        viewConfig: {
            enableTextSelection: true
        },
        listeners: {
            itemdblclick: function() {
                var sm = Ext.getCmp("biometricsRecordsListGrid").getSelectionModel();
                employee_id = sm.selected.items[0].data.employee_id;
                //console.log(employee_id);
                ViewDTR(calendar_id);
            },
            cellcontextmenu: function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                //console.log(cellIndex + ', ' + rowIndex + ', ' + period);
                index = rowIndex;
                if (period == 0)
                    day = cellIndex - 2;    //negative offset of 2 because of employee_id and name
                else
                    day = ((cellIndex + 15) - 2);   //offset 15 because of first 15 days, negative offset of 2 because of employee_id and name

                qtip = td.getAttribute("data-qtip");
                e.stopEvent();
                if (qtip == "Incomplete")
                {
                    coordinates = e.getXY();
                    coordinates.push(rowIndex);
                    gridCellMenu.showAt(e.getXY());
                    console.log(coordinates);
                }
                else
                    gridCellMenuModify.showAt(e.getXY());
            }
        },
        //columnLines: true,
        width: '85%',
        minWidth: 700,
        height: 400,
        title: 'Attendance Record Report',
        titleAlign: 'center',
        loadMask: true,
        margin: '0 0 10 0',
        tbar: [
        {
            xtype   : 'textfield',
            id      : 'searchId',
            emptyText: 'Search here...',
            width   : '25%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("biometricsRecordsListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshRecordsListGridStore();
                    }
                }
            }
        }, {
            xtype   : 'radio',
            boxLabel  : 'Regular',
            name      : 'employment_status',
            checked   : true,
            listeners:
            {
                focus : function() {
                    employment_status = 1;
                    Ext.getCmp("biometricsRecordsListGrid").getStore().proxy.extraParams["employment_status"] = 1;
                    RefreshRecordsListGridStore();
                }
            }
        }, {
            xtype   : 'radio',
            boxLabel  : 'Casual',
            name      : 'employment_status',
            listeners:
            {
                focus : function() {
                    employment_status = 2;
                    Ext.getCmp("biometricsRecordsListGrid").getStore().proxy.extraParams["employment_status"] = 2;
                    RefreshRecordsListGridStore();
                }
            }
        }, {
            xtype   : 'radio',
            boxLabel  : 'Job Order',
            name      : 'employment_status',
            listeners:
            {
                focus : function() {
                    employment_status = 3;
                    Ext.getCmp("biometricsRecordsListGrid").getStore().proxy.extraParams["employment_status"] = 3;
                    RefreshRecordsListGridStore();
                }
            }
        }, {
            xtype   : 'radio',
            boxLabel  : 'Others',
            name      : 'employment_status',
            listeners:
            {
                focus : function() {
                    employment_status = 4;
                    Ext.getCmp("biometricsRecordsListGrid").getStore().proxy.extraParams["employment_status"] = 4;
                    RefreshRecordsListGridStore();
                }
            }
        }, 
        { xtype: 'tbfill'},
        {                           
            xtype       : 'combo',
            id          : 'period',            
            name        : 'period',
            width       : 130,
            mode        : 'local',
            triggerAction: 'all',
            editable    : false,
            store: new Ext.data.ArrayStore({
                fields: ['id', 'description'],
                data: [[0, '1st Half (1-15)'], [1, '2nd Half (16-31)']]
            }),
            listeners: 
            {
                afterrender: function ()
                {

                    Ext.suspendLayouts();
                    grid.reconfigure(null, first_period_metadata);
                    Ext.resumeLayouts(true);
                },
                select: function (combo, record, index)
                {      
                    period = record[0].data.id;

                    Ext.suspendLayouts();
                    if(period == 0)
                        grid.reconfigure(null, first_period_metadata);
                    else
                        grid.reconfigure(null, second_period_metadata);
                    Ext.resumeLayouts(true);
                }
            },
            value       : '1st Half (1-15)',
            valueField  : 'id',
            displayField: 'description'
        },'-',{
            text    : 'Holidays',                    
            icon    : './image/calendar.png',
            tooltip : 'Update Holidays',
            handler: function ()
            {
                ViewHolidays();
            }
        },'-',{
            id      : 'save',
            text    : 'Save',
            icon    : './image/save.png',
            tooltip : 'Save Monthly Attendance Record',
            disabled: true,
            handler: function ()
            {
                BatchSaveDTRModifications();                
            }
        },{
            text    : 'Upload',            
            icon    : './image/upload.png',
            tooltip : 'Upload Biometrics File',
            handler: function ()
            {
                UploadBiometricsFile('Upload');
            }
        },{
            text    : 'Export',                    
            icon    : './image/folder.png',
            tooltip : 'Download and Upload File.',
            menu: 
            {
                items: 
                [{
                    text    : 'Batch Export to DTR',
                    id      : 'batchExport',
                    icon    : './image/excel.png',
                    handler: function ()
                    {
                        ExportDTR('Batch', period);
                    }
                },{
                    text    : 'Individual Export to DTR',
                    id      : 'individualExport',
                    icon    : './image/excel.png',
                    handler: function ()
                    {
                        ExportDTR('Individual', period);
                    }
                }]
            }
        }]
    });
    RefreshRecordsListGridStore();

    var gridCellMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Absent',
            icon: './image/edit.png',
            menu: [{
                text: 'AM',
                // icon: './image/edit.png',
                handler: function () { 
                    ModifyDTR(index, day, 'Absent', 'AM');
                }
            },{
                text: 'PM',
                handler: function () { 
                    ModifyDTR(index, day, 'Absent', 'PM');
                }
            },{
                text: 'Whole Day',
                handler: function () { 
                    ModifyDTR(index, day, 'Absent', 'Whole Day');
                }
            },]
        },{
            text: 'Leave',
            icon: './image/edit.png',
            menu: [{
                text: 'AM',
                handler: function () { 
                    ModifyDTR(index, day, 'Leave', 'AM');
                }
            },{
                text: 'PM',
                handler: function () { 
                    ModifyDTR(index, day, 'Leave', 'PM');
                }
            },{
                text: 'Whole Day',
                handler: function () { 
                    ModifyDTR(index, day, 'Leave', 'Whole Day');
                }
            },]
        },{
            text: 'Pass Slip',
            icon: './image/edit.png',
            handler: function () { 
                ModifyDTR(index, day, 'Pass Slip', null);
            }
        },{
            text: 'Incident Report',
            icon: './image/edit.png',
            handler: function () { 
                ModifyDTR(index, day, 'Incident Report', null);
            }
        }]
    });

    var gridCellMenuModify = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Manual Modification',
            icon: './image/edit.png',
            handler: function () { 
                ModifyDTR(index, day, 'Manual Modification', null);
            }
        }]
    });

    Ext.create('Ext.panel.Panel', {
        title   : '<?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?>',
        width   : '100%',
        height  : sheight,
        renderTo: "innerdiv",
        layout  : 'border',
        border  : false,
        items   : [tree,grid]
    });

    Ext.EventManager.addListener(window, 'beforeunload', onBeforeUnload, this, {
        normalized: false 
    });

    function onBeforeUnload(e) {
        var MESSAGE = 'WARNING : You have unsaved changes!';

        if (Ext.getCmp("save").isDisabled() != true) {
            if (e) e.returnValue = MESSAGE;
            if (window.event) window.event.returnValue = MESSAGE;
            return MESSAGE;
        }
    }
});
