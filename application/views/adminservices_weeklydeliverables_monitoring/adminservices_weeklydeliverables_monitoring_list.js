//setTimeout("UpdateSessionData();", 0);

Ext.onReady(function(){
    var store = new Ext.data.JsonStore({
        storeId: 'myStore',
        proxy: {
            type: 'ajax',
            url: 'adminservices_weeklydeliverables_monitoring/weeklydeliverables_monitoring_list',
            timeout : 1800000,
            extraParams: {},
            remoteSort: false,
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        listeners: {
            load: function (store, records, successful, eOpts) {
                grid.syncRowHeights();

                // var grid = Ext.getCmp("weeklyDeliverablesListGrid-normal");
                var gridDom = Ext.get("weeklyDeliverablesListGrid-normal");
            }
        },
        // need a way to loop through the fields and not statically declare them
        fields: [{name: 'id', type: 'int'}, 'ppa_id', 'ppa', 'si', 'persons_incharge', 'deliverables', 'deadline',
            'week1_accomp', 'week1_eval', 'week1_remarks', 
            'week2_accomp', 'week2_eval', 'week2_remarks', 
            'week3_accomp', 'week3_eval', 'week3_remarks', 
            'week4_accomp', 'week4_eval', 'week4_remarks', 
            'week5_accomp', 'week5_eval', 'week5_remarks', 
            'week6_accomp', 'week6_eval', 'week6_remarks', 
            'week7_accomp', 'week7_eval', 'week7_remarks', 
            'week8_accomp', 'week8_eval', 'week8_remarks', 
            'week9_accomp', 'week9_eval', 'week9_remarks', 
            'week10_accomp', 'week10_eval', 'week10_remarks', 
            'week11_accomp', 'week11_eval', 'week11_remarks', 
            'week12_accomp', 'week12_eval', 'week12_remarks', 
            'week13_accomp', 'week13_eval', 'week13_remarks', 
            'week14_accomp', 'week14_eval', 'week14_remarks', 
            'week15_accomp', 'week15_eval', 'week15_remarks', 
            'week16_accomp', 'week16_eval', 'week16_remarks', 
            'week17_accomp', 'week17_eval', 'week17_remarks', 
            'week18_accomp', 'week18_eval', 'week18_remarks', 
            'week19_accomp', 'week19_eval', 'week19_remarks',
            'week20_accomp', 'week20_eval', 'week20_remarks', 
            'week21_accomp', 'week21_eval', 'week21_remarks', 
            'week22_accomp', 'week22_eval', 'week22_remarks', 
            'week23_accomp', 'week23_eval', 'week23_remarks', 
            'week24_accomp', 'week24_eval', 'week24_remarks', 
            'week25_accomp', 'week25_eval', 'week25_remarks', 
            'week26_accomp', 'week26_eval', 'week26_remarks', 
            'week27_accomp', 'week27_eval', 'week27_remarks', 
            'week28_accomp', 'week28_eval', 'week28_remarks', 
            'week29_accomp', 'week29_eval', 'week29_remarks',
            'week30_accomp', 'week30_eval', 'week30_remarks', 
            'week31_accomp', 'week31_eval', 'week31_remarks', 
            'week32_accomp', 'week32_eval', 'week32_remarks', 
            'week33_accomp', 'week33_eval', 'week33_remarks', 
            'week34_accomp', 'week34_eval', 'week34_remarks', 
            'week35_accomp', 'week35_eval', 'week35_remarks', 
            'week36_accomp', 'week36_eval', 'week36_remarks', 
            'week37_accomp', 'week37_eval', 'week37_remarks', 
            'week38_accomp', 'week38_eval', 'week38_remarks', 
            'week39_accomp', 'week39_eval', 'week39_remarks',
            'week40_accomp', 'week40_eval', 'week40_remarks', 
            'week41_accomp', 'week41_eval', 'week41_remarks', 
            'week42_accomp', 'week42_eval', 'week42_remarks', 
            'week43_accomp', 'week43_eval', 'week43_remarks', 
            'week44_accomp', 'week44_eval', 'week44_remarks', 
            'week45_accomp', 'week45_eval', 'week45_remarks', 
            'week46_accomp', 'week46_eval', 'week46_remarks', 
            'week47_accomp', 'week47_eval', 'week47_remarks', 
            'week48_accomp', 'week48_eval', 'week48_remarks', 
            'week49_accomp', 'week49_eval', 'week49_remarks',
            'week50_accomp', 'week50_eval', 'week50_remarks', 
            'week51_accomp', 'week51_eval', 'week51_remarks', 
            'week52_accomp', 'week52_eval', 'week52_remarks', 
            'week53_accomp', 'week53_eval', 'week53_remarks']
    });
    
    var RefreshGridStore = function () {
        Ext.getCmp("weeklyDeliverablesListGrid").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});      
    };

    var headerClick = function () {
        grid.syncRowHeights();
    };

    var mergeRowsRenderer = function (value, meta, record, rowIndex, colIndex, store) {
       var first = !rowIndex || value !== store.getAt(rowIndex - 1).get('ppa'),
            last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get('ppa');
        meta.css += 'row-span' + (first ? ' row-span-first' : '') +  (last ? ' row-span-last' : '');
        if (first) {
            var i = rowIndex + 1;
            while (i < store.getCount() && value === store.getAt(i).get('ppa')) {
                i++;
            }
            var rowHeight = 20, padding = 6,
                height = (rowHeight * (i - rowIndex) - padding) + 'px';
            meta.attr = 'style="height:' + height + ';line-height:' + height + ';"';
        }
        return first ? value : '';
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id      : 'weeklyDeliverablesListGrid',
        region  : 'center',
        store   : store,
        cls     : 'gridCss',
        syncRowHeight: false,
        columns: [
            { dataIndex: 'id', hidden: true},   // weeklydeliverables_monitoring_header_id
            { dataIndex: 'ppa_id', hidden: true},
            { text: 'Program/Activities/<br>Projects (PAP)', locked: true, dataIndex: 'ppa', align: 'left', width: 150, listeners:{headerClick}, renderer: function (value, meta, record, rowIndex, colIndex, store) {
                var first = !rowIndex || value !== store.getAt(rowIndex - 1).get('ppa'),
                    last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get('ppa');
                meta.css += 'row-span' + (first ? ' row-span-first' : '') +  (last ? ' row-span-last' : '');
                if (first) {
                    var i = rowIndex + 1;
                    while (i < store.getCount() && value === store.getAt(i).get('ppa')) {
                        i++;
                    }
                    var rowHeight = 20, padding = 6,
                        height = (rowHeight * (i - rowIndex) - padding) + 'px';
                    meta.attr = 'style="height:' + height + ';line-height:' + height + ';"';
                }
                // return first ? value : '';
                return columnWrap(first ? value : '');
            }},
            { text: 'Success Indicators', locked: true, dataIndex: 'si', align: 'left', width: 200, listeners:{headerClick}, renderer: function (value, meta, record, rowIndex, colIndex, store) {
                var first = !rowIndex || value !== store.getAt(rowIndex - 1).get('si'),
                    last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get('si');
                meta.css += 'row-span' + (first ? ' row-span-first' : '') +  (last ? ' row-span-last' : '');
                if (first) {
                    var i = rowIndex + 1;
                    while (i < store.getCount() && value === store.getAt(i).get('si')) {
                        i++;
                    }
                    var rowHeight = 20, padding = 6,
                        height = (rowHeight * (i - rowIndex) - padding) + 'px';
                    meta.attr = 'style="height:' + height + ';line-height:' + height + ';"';
                }
                // return first ? value : '';
                return columnWrap(first ? value : '');
            }},
            { text: 'Deliverables (KRAs/Targets)', locked: true, dataIndex: 'deliverables', align: 'left', width: 200, renderer:columnWrap, listeners:{headerClick}},
            { text: 'Date/s of<br>Completion', locked: true, dataIndex: 'deadline', align: 'center', width: 100, renderer:columnWrap, listeners:{headerClick}},
            { text: 'Persons<br>in Charge', locked: true, dataIndex: 'persons_incharge', align: 'center', width: 100, renderer:columnWrap, listeners:{headerClick}, renderer: function (value, meta, record, rowIndex, colIndex, store) {
                var first = !rowIndex || value !== store.getAt(rowIndex - 1).get('persons_incharge'),
                    last = rowIndex >= store.getCount() - 1 || value !== store.getAt(rowIndex + 1).get('persons_incharge');
                meta.css += 'row-span' + (first ? ' row-span-first' : '') +  (last ? ' row-span-last' : '');
                if (first) {
                    var i = rowIndex + 1;
                    while (i < store.getCount() && value === store.getAt(i).get('persons_incharge')) {
                        i++;
                    }
                    var rowHeight = 20, padding = 6,
                        height = (rowHeight * (i - rowIndex) - padding) + 'px';
                    meta.attr = 'style="height:' + height + ';line-height:' + height + ';"';
                }
                // return first ? value : '';
                return columnWrap(first ? value : '');
            }},
            { 
                text: 'Week No. 1',
                lockable: false,
                columns: [{
                    text: 'Accomplishment Report', 
                    dataIndex: 'week1_accomp', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Evaluation and Recommendation', 
                    dataIndex: 'week1_eval', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Remarks', 
                    dataIndex: 'week1_remarks', 
                    width: 250,
                    renderer:columnWrap
                }]
            },
            { 
                text: 'Week No. 2',
                columns: [{
                    text: 'Accomplishment Report', 
                    dataIndex: 'week2_accomp', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Evaluation and Recommendation', 
                    dataIndex: 'week2_eval', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Remarks', 
                    dataIndex: 'week2_remarks', 
                    width: 250,
                    renderer:columnWrap
                }]
            },
            { 
                text: 'Week No. 3',
                columns: [{
                    text: 'Accomplishment Report', 
                    dataIndex: 'week3_accomp', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Evaluation and Recommendation', 
                    dataIndex: 'week3_eval', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Remarks', 
                    dataIndex: 'week3_remarks', 
                    width: 250,
                    renderer:columnWrap
                }]
            },
            { 
                text: 'Week No. 4',
                columns: [{
                    text: 'Accomplishment Report', 
                    dataIndex: 'week4_accomp', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Evaluation and Recommendation', 
                    dataIndex: 'week4_eval', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Remarks', 
                    dataIndex: 'week4_remarks', 
                    width: 250,
                    renderer:columnWrap
                }]
            },
            { 
                text: 'Week No. 5',
                columns: [{
                    text: 'Accomplishment Report', 
                    dataIndex: 'week5_accomp', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Evaluation and Recommendation', 
                    dataIndex: 'week5_eval', 
                    width: 250,
                    renderer:columnWrap
                },{
                    text: 'Remarks', 
                    dataIndex: 'week5_remarks', 
                    width: 250,
                    renderer:columnWrap
                }]
            }
        ],
        autoScroll: true, 
        columnLines: true,
        rowLines: false,
        height  : sheight,
        width: '100%',
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    
                },
                itemcontextmenu: function(view, record, item, index, e) {
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
        title   : '<?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?>',
        width   : '100%',
        height  : sheight,
        id      : 'panelParent',
        renderTo: "innerdiv",
        layout  : 'border',
        border  : false,
        // autoScroll: true,
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
                        Ext.getCmp("weeklyDeliverablesListGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        query = Ext.getCmp("searchId").getValue();
                        RefreshGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'},
        { 
            xtype: 'button', 
            text: 'Update Accomp. Report', 
            icon: './image/edit.png', 
            tooltip: 'Update Accomplishment Report'
            // , 
            // listeners: {
            //     click: {
            //         fn: function () {
            //             Ext.getCmp('panelParent').scrollBy(500, 500, true);
            //         }
            //     }
            // }
        },
        { xtype: 'button', text: 'Submit', icon: './image/submit.png', tooltip: 'Submit Accomplishment Report', handler: function (){ AddEditDeletePosition('Edit');}},
        { xtype: 'button', text: 'Evaluate Accomp. Report', icon: './image/evaluation.png', tooltip: 'Evaluate Accomplishment Report', handler: function (){ AddEditDeletePosition('Delete');}},
        { xtype: 'button', text: 'Post Remarks', icon: './image/details.png', tooltip: 'Post Remarks', handler: function (){ UpdateIncumbent();}}
        ]
    });
});