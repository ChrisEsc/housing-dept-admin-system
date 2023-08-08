//setTimeout("UpdateSessionData();", 0);
var query = null;
var employment_status = 1;
var active_year;    // active year for salary grades

function ExportDocs(type) {
    params = new Object();
    params.query    = query;
    params.type     = type;
    params.filetype     = 'grid';
    ExportDocument('adminservices_plantilla/exportdocument', params, type);
}

Ext.onReady(function(){
    var store = new Ext.data.JsonStore({
        pageSize: setLimit,
        storeId: 'myStore',
        proxy: {
            type: 'ajax',
            url: 'adminservices_plantilla/positions_list',
            timeout : 1800000,
            extraParams: {employment_status: employment_status, query:query},
            remoteSort: false,
            //params: {start: 0, limit: setLimit},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        listeners: {
            load: function (store, records, succesful, eOpts) {
                active_year = store.proxy.reader.jsonData.active_year;
            }
        },
        fields: [{name: 'id', type: 'int'}, 'old_item_number', 'new_item_number', 'position_description', 'staff_name', 'date_appointed', 'salary_grade_step', 'authorized_annual_rate', 'budget_year_annual_rate', 'increase_amount', 'remarks']
    });
    
    var RefreshGridStore = function () {
        Ext.getCmp("positionsListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});      
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'positionsListGrid',
        region  : 'center',
        store   : store,
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 35}),
            { dataIndex: 'id', hidden: true},
            { dataIndex: 'status', hidden: true},
            { 
                text: 'Item No.',
                columns: [{
                    text: 'Old', 
                    dataIndex: 'old_item_number', 
                    width: 50,
                    renderer:addTooltip
                },{
                    text: 'New', 
                    dataIndex: 'new_item_number', 
                    width: 50,
                    renderer:addTooltip
                }]
            },
            { text: 'Title of Position', dataIndex: 'position_description', width: '20%', renderer:addTooltip},
            { text: 'Name of Incumbent', dataIndex: 'staff_name', width: '15%', renderer:addTooltip},
            { text: 'Date of Appointment', dataIndex: 'date_appointed', width: '10%', renderer:addTooltip},  
            { 
                text: 'Authorized Rate Per Annum',
                columns: [{
                    text: 'Grade/Step', 
                    align: 'center',
                    dataIndex: 'salary_grade_step', 
                    width: 100,
                    renderer: addTooltip
                },{
                    text: 'Amount', 
                    align: 'right',
                    dataIndex: 'authorized_annual_rate', 
                    width: 150,
                    renderer:addTooltip
                }]
            }, { 
                text: 'Budget Year Per Annum',
                columns: [{
                    text: 'Grade/Step', 
                    align: 'center',
                    dataIndex: 'salary_grade_step', 
                    width: 100,
                    renderer:addTooltip
                },{
                    text: 'Amount', 
                    align: 'right',
                    dataIndex: 'budget_year_annual_rate', 
                    width: 150,
                    renderer:addTooltip
                }]
            }, 
            { text: 'Increase', align: 'right', dataIndex: 'increase_amount', width: '5%', renderer:addTooltip},
            { text: 'Remarks', align: 'left', dataIndex: 'remarks', width: '15%', renderer:addTooltip},
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
            handler: function (){ AddEditDeletePosition('Add');}
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeletePosition('Edit');}
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeletePosition('Delete');}
        }, {
            text: 'Update Item Number',
            icon: './image/details.png',
            handler: function (){ UpdateItemNumber();}
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
            emptyText: 'Search Item No., Title of Position, Name of Incumbent, Date of Appointment, or Remarks',
            width   : '30%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("positionsListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshGridStore();
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
                    Ext.getCmp("positionsListGrid").getStore().proxy.extraParams["employment_status"] = 1;
                    RefreshGridStore();
                    Ext.getCmp("positionsListGrid").columns[3].show();
                    Ext.getCmp("positionsListGrid").columns[4].show();

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
                    Ext.getCmp("positionsListGrid").getStore().proxy.extraParams["employment_status"] = 2;
                    RefreshGridStore();
                    Ext.getCmp("positionsListGrid").columns[3].hide();
                    Ext.getCmp("positionsListGrid").columns[4].hide();

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
                    Ext.getCmp("positionsListGrid").getStore().proxy.extraParams["employment_status"] = 3;
                    RefreshGridStore();
                    Ext.getCmp("positionsListGrid").columns[3].hide();
                    Ext.getCmp("positionsListGrid").columns[4].hide();

                }
            }
        }, 
        { xtype: 'tbfill'},
        // { text    : 'Item No. History', icon    : './image/lists.png', tooltip : 'Update Item No. History Table', handler: function (){ ViewItemNumberHistoryTable();}},
        { text    : 'Salary Grade Table', icon    : './image/lists.png', tooltip : 'Update Salary Grade Details', handler: function (){ ViewSalaryGradeTable();}},
        '-',
        { xtype: 'button', text: 'ADD', icon: './image/add.png', tooltip: 'Add Position', handler: function (){ AddEditDeletePosition('Add');}},
        { xtype: 'button', text: 'EDIT', icon: './image/edit.png', tooltip: 'Edit Position', handler: function (){ AddEditDeletePosition('Edit');}},
        { xtype: 'button', text: 'DELETE', icon: './image/delete.png', tooltip: 'Delete Position', handler: function (){ AddEditDeletePosition('Delete');}},
        { xtype: 'button', text: 'UPDATE', icon: './image/details.png', tooltip: 'Update Item Number', handler: function (){ UpdateItemNumber();}},
        // '-',
        // {
        //     text: 'Download',
        //     tooltip: 'Extract Data to PDF or EXCEL File Format',
        //     icon: './image/download.png',
        //     menu: 
        //     {
        //         items: 
        //         [
        //             {
        //                 text    : 'Export PDF Format',
        //                 icon: './image/pdf.png',
        //                 handler: function ()
        //                 {
        //                     ExportDocs('PDF');
        //                 }
        //             }, 
        //             {
        //                 text    : 'Export Excel Format',
        //                 icon: './image/excel.png',
        //                 handler: function ()
        //                 {
        //                     ExportDocs('Excel');
        //                 }
        //             }
        //         ]
        //     }
        // }
        ]
    });
});