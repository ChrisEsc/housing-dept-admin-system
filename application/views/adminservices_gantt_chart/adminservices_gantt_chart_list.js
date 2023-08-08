var query = null;
var activityID = null;
var activityName = null;
var weekNum = null;

var section_names = new Ext.data.Store({
    proxy: {
        type: 'ajax',
        url: 'commonquery/combolist_sections',
        timeout: 1800000,
        //extraParams: { query: null, type: 'sections' },
        reader: {
            type: 'json',
            root: 'data',
            idProperty: 'id'
        }
    },
    autoLoad: true,
    params: { start: 0, limit: 10 },
    fields: [{ name: 'id', type: 'int' }, { name: 'description' }, { name: 'code' }]
})

function ARexportOld(value) {
    processingFunction("Processing data, please wait...");
    Ext.Ajax.request(
        {
            url: "adminservices_gantt_chart/export_section_activities_reporting",
            method: 'POST',
            params: {
                id:value
        },
        success: function (f, opts) {
            var response = Ext.decode(f.responseText);
            var htmldump = '';
            Ext.MessageBox.hide();

            if (response.success == true) {
                var file_count = response.filenames.length;
                var i = 0;
  
                while (i != (file_count)) {
                    var file = response.filenames[i];
                    htmldump += '<a href="' + '<?php echo base_url(); ?>' + file.filename + '" download>Accomplishment Report of '+ file.fileowner+'</a></br></br>';                    
                    i = i + 1;
                }
                infoPanel("Export Completed - Click to Download File (Default A4 Size)", htmldump);
            }
            else
                errorFunction("Error!", response.data);
        },
        failure: function (response, opts) {
            Ext.Msg.alert('Status', 'POST BAD');
            }
     })
};

function ARexport(value) {
    processingFunction("Processing data, please wait...");
    Ext.Ajax.request(
        {
            url: "adminservices_gantt_chart/export_section_activities_reporting",
            method: 'POST',
            params: {
                id: value
            },
            success: function (f, opts) {
                var response = Ext.decode(f.responseText);
                var ipcrStore = new Ext.data.JsonStore({
                    pageSize: setLimit,
                    storeId: 'arStore',
                    data: response.filenames,
                    fields: ['fileowner', 'filename', 'filedata']
                });
                var centerPanel = Ext.create('Ext.panel.Panel', {
                    title: '',
                    id: 'winJOAR',
                    region: 'center',
                    autoScroll: true,
                    buttonAlign: 'center',
                    width: '100%',
                    //html: htmlApprovers.applyTemplate(null),
                    items: [{
                        xtype: 'container', //layout: 'fit',
                        items:
                            [
                                {
                                    xtype: 'grid',
                                    store: ipcrStore,
                                    id: 'joarListGrid',
                                    margin: '12px',
                                    //plugins: [
                                    //    Ext.create('Ext.grid.plugin.RowEditing', {
                                    //        clicksToEdit: 1
                                    //    })
                                    //],
                                    autoScroll: true,
                                    viewConfig: {
                                        listeners: {
                                            itemdblclick: function () {
                                                ViewEval();
                                            },
                                            itemcontextmenu: function (view, record, item, index, e) {
                                                e.stopEvent();
                                                rowMenu2.showAt(e.getXY());
                                            }
                                        }
                                    },
                                    height: sheight - 100,
                                    width: '100%',
                                    columns: [Ext.create('Ext.grid.RowNumberer', { width: '5%' }),                                   
                                    { text: 'Staff', dataIndex: 'fileowner', align: 'left', width: '60%', renderer: columnWrap },                                    
                                    {
                                        xtype: 'actioncolumn',
                                        header: 'Export PDF',
                                        width: '15%',
                                        align: 'center',
                                        items: [
                                            {
                                                icon: './image/view.png',
                                                tooltip: 'View/Save',
                                                handler: function (grid, rowIndex, colIndex) {
                                                    var rec = grid.getStore().getAt(rowIndex);
                                                    filepath = rec.get('filename')//record.get('filedata');
                                                    Export2PDF(filepath);
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'actioncolumn',
                                        header: 'Export DOC',
                                        width: '15%',
                                        align: 'center',
                                        items: [
                                            {
                                                icon: './image/view.png',
                                                tooltip: 'View/Save',
                                                handler: function (grid, rowIndex, colIndex) {
                                                    var rec = grid.getStore().getAt(rowIndex);
                                                    owner = rec.get('fileowner')//record.get('filedata');
                                                    htmlraw = rec.get('filedata')//record.get('filedata')
                                                    Export2Doc(htmlraw, owner, 'AR');
                                                }
                                            }
                                        ]
                                    }
                                    ]
                                }
                            ]
                    },
                    ],
                    buttons: [
                        {
                            text: 'Close',
                            icon: './image/close.png',
                            handler: () => {
                                //eastPanel.collapse();
                                mainWindow.close();
                            }
                        }]
                });

                mainWindow = Ext.create('Ext.window.Window', {
                    title: 'Accomplishment Report',
                    header: { titleAlign: 'center' },
                    closable: true,
                    modal: true,
                    width: 750,
                    height: 410,
                    resizable: true,
                    layout: 'vbox',
                    maximizable: true,
                    //autoScroll: true,
                    items: [{ xtype: 'label', width: '100%', html: '<marquee>Need to jam everything in one page? Export PDF then edit with Adobe Photoshop!</marquee>' }, centerPanel]
                }).show();
                Ext.MessageBox.hide();
            },
            failure: function (response, opts) {
                Ext.Msg.alert('Status', 'POST BAD');
            }
        })
};

function IPCRexportOld(value) {
    processingFunction("Processing data, please wait...");
    Ext.Ajax.request(
        {
            url: "adminservices_gantt_chart/export_IPCRs",
            method: 'POST',
            params: {
                id: value
            },
            success: function (f, opts) {
                var response = Ext.decode(f.responseText);
                var htmldump = '';
                Ext.MessageBox.hide();

                if (response.success == true) {
                    var file_count = response.filenames.length;
                    var i = 0;

                    while (i != (file_count)) {
                        var file = response.filenames[i];
                        htmldump += '<a href="' + '<?php echo base_url(); ?>' + file.filename + '" download>IPCR of ' + file.fileowner + '</a></br></br>';
                        i = i + 1;
                    }
                    infoPanel("Export Completed - Click to Download File (Default A4 Size)", htmldump);
                }
                else
                    errorFunction("Error!", response.data);
            },
            failure: function (response, opts) {
                Ext.Msg.alert('Status', 'POST BAD');
            }
        })
};

function IPCRexport(value) {
    processingFunction("Processing data, please wait...");
    Ext.Ajax.request(
        {
            url: "adminservices_gantt_chart/export_IPCRs",
            method: 'POST',
            params: {
                id: value
            },
            success: function (f, opts) {
                var response = Ext.decode(f.responseText);
                var ipcrStore = new Ext.data.JsonStore({
                    pageSize: setLimit,
                    storeId: 'ipcrStore',
                    data: response.filenames,
                    fields: ['fileowner', 'filename','filedata']
                });                
                var centerPanel = Ext.create('Ext.panel.Panel', {
                    title: '',
                    id: 'win-par-eval',
                    region: 'center',
                    autoScroll: true,
                    buttonAlign: 'center',
                    width: '100%',
                    //html: htmlApprovers.applyTemplate(null),
                    items: [{
                        xtype: 'container', //layout: 'fit',
                        items:
                            [
                                {
                                    xtype: 'grid',
                                    store: ipcrStore,
                                    id: 'parEvalListGrid',
                                    margin: '12px',
                                    //autoScroll: true,
                                    //plugins: [
                                    //    Ext.create('Ext.grid.plugin.RowEditing', {
                                    //        clicksToEdit: 1
                                    //    })
                                    //],
                                    viewConfig: {
                                        listeners: {
                                            itemdblclick: function () {
                                                ViewEval();
                                            },
                                            itemcontextmenu: function (view, record, item, index, e) {
                                                e.stopEvent();
                                                rowMenu2.showAt(e.getXY());
                                            }
                                        }
                                    },
                                    height: sheight - 100,
                                    width: '90%',
                                    columns: [Ext.create('Ext.grid.RowNumberer', { width: '5%' }),
                                    //{ dataIndex: 'id', hidden: true },
                                    //{ text: 'Evaluation ID', dataIndex: 'doc_id', align: 'center', width: '10%', renderer: columnWrap },
                                    { text: 'Staff', dataIndex: 'fileowner', align: 'left', width: '60%', renderer: columnWrap },
                                    { text: 'Rating Period', dataIndex: '', align: 'left', width: '20%', renderer: columnWrap },
                                    //{ text: 'Export', dataIndex: 'filename', align: 'center', width: '10%', renderer: columnWrap },
                                    {
                                        xtype: 'actioncolumn',
                                        header: 'Export',
                                        width: '15%',
                                        align: 'center',
                                        items: [
                                            {
                                                icon: './image/view.png',
                                                tooltip: 'View/Save',
                                                handler: function (grid, rowIndex, colIndex) {
                                                    var rec = grid.getStore().getAt(rowIndex);
                                                    owner = rec.get('fileowner')//record.get('filedata');
                                                    htmlraw = rec.get('filedata')//record.get('filedata')
                                                    Export2Doc(htmlraw,owner);
                                                }
                                            }
                                        ]
                                    }
                                    ]
                                }
                            ]
                    },
                    ],
                    buttons: [
                        {
                            text: 'Close',
                            icon: './image/close.png',
                            handler: () => {
                               // eastPanel.collapse();
                                mainWindow.close();
                            }
                        }]
                });

                mainWindow = Ext.create('Ext.window.Window', {
                    title: 'Section IPCRs',
                    header: { titleAlign: 'center' },
                    closable: true,
                    modal: true,
                    width: 750,
                    height: 410,
                    resizable: false,
                    layout: 'border',
                    maximizable: true,
                    items: [centerPanel]
                }).show();
                Ext.MessageBox.hide();  


            },
            failure: function (response, opts) {
                Ext.Msg.alert('Status', 'POST BAD');
            }
        })
};

//form loading 
Ext.onReady(function () {
    var store = new Ext.data.JsonStore({
        pageSize: setLimit,
        storeId: 'myStore',
        proxy: {
            type: 'ajax',
            url: 'adminservices_gantt_chart/section_activities_list',
            timeout: 1800000,

            remoteSort: false,
            params: { start: 0, limit: setLimit },
            extraParams: { query: query },
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{ name: 'id', type: 'int' },
        { name: 'wk1', mapping: 'schedules.wk1', type: 'auto' },
        { name: 'wk2', mapping: 'schedules.wk2', type: 'auto' },
        { name: 'wk3', mapping: 'schedules.wk3', type: 'auto' },
        { name: 'wk4', mapping: 'schedules.wk4', type: 'auto' },
        { name: 'wk5', mapping: 'schedules.wk5', type: 'auto' },
        { name: 'wk6', mapping: 'schedules.wk6', type: 'auto' },
        { name: 'wk7', mapping: 'schedules.wk7', type: 'auto' },
        { name: 'wk8', mapping: 'schedules.wk8', type: 'auto' },
        { name: 'wk9', mapping: 'schedules.wk9', type: 'auto' },
        { name: 'wk10', mapping: 'schedules.wk10', type: 'auto' },
        { name: 'wk11', mapping: 'schedules.wk11', type: 'auto' },
        { name: 'wk12', mapping: 'schedules.wk12', type: 'auto' },
        { name: 'wk13', mapping: 'schedules.wk13', type: 'auto' },
        { name: 'wk14', mapping: 'schedules.wk14', type: 'auto' },
        { name: 'wk15', mapping: 'schedules.wk15', type: 'auto' },
        { name: 'wk16', mapping: 'schedules.wk16', type: 'auto' },
        { name: 'wk17', mapping: 'schedules.wk17', type: 'auto' },
        { name: 'wk18', mapping: 'schedules.wk18', type: 'auto' },
        { name: 'wk19', mapping: 'schedules.wk19', type: 'auto' },
        { name: 'wk20', mapping: 'schedules.wk20', type: 'auto' },
        { name: 'wk21', mapping: 'schedules.wk21', type: 'auto' },
        { name: 'wk22', mapping: 'schedules.wk22', type: 'auto' },
        { name: 'wk23', mapping: 'schedules.wk23', type: 'auto' },
        { name: 'wk24', mapping: 'schedules.wk24', type: 'auto' },
        { name: 'wk25', mapping: 'schedules.wk25', type: 'auto' },
        { name: 'wk26', mapping: 'schedules.wk26', type: 'auto' },
        { name: 'wk27', mapping: 'schedules.wk27', type: 'auto' },
            'activity', 'staffers', 'schedules', 'activity_points']
    });

    var RefreshGridStore = function () {
        Ext.getCmp("ganttListGrid").store.load({ params: { reset: 1, start: 0 } });
    };

    var grid = Ext.create('Ext.grid.Panel', {
        id: 'ganttListGrid',
        region: 'center',
        store: store,
        // cls     : 'gridCss',
        syncRowHeight: false,
        defaults: {
            align: 'center'
        },
        columns: [
            Ext.create('Ext.grid.RowNumberer', { width: 30 }),
            { dataIndex: 'id', hidden: true },
            { text: 'Section Major Activity', dataIndex: 'activity', align: 'left', width: '20%', renderer: columnWrap },
            //{ text: 'Points Per Cluster of Activities', dataIndex: 'wk1', align: 'center', width:'5%', rendered: columnWrap},
            { text: 'Points Per Activity', dataIndex: 'activity_points', align: 'center',  renderer: columnWrap },
            {
                text: 'January',
                columns: [
                    { text: '1', dataIndex: 'wk1', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '2', dataIndex: 'wk2', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '3', dataIndex: 'wk3', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '4', dataIndex: 'wk4', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '5', dataIndex: 'wk5', align: 'center', width: '2.2%', renderer: weekRenderer }
                ]
            },
            {
                text: 'February',
                columns: [
                    { text: '6', dataIndex: 'wk6', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '7', dataIndex: 'wk7', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '8', dataIndex: 'wk8', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '9', dataIndex: 'wk9', align: 'center', width: '2.2%', renderer: weekRenderer }
                ]
            },
            {
                text: 'March',
                columns: [
                    { text: '10', dataIndex: 'wk10', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '11', dataIndex: 'wk11', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '12', dataIndex: 'wk12', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '13', dataIndex: 'wk13', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '14', dataIndex: 'wk14', align: 'center', width: '2.2%', renderer: weekRenderer }
                ]
            },
            {
                text: 'April',
                columns: [
                    { text: '15', dataIndex: 'wk15', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '16', dataIndex: 'wk16', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '17', dataIndex: 'wk17', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '18', dataIndex: 'wk18', align: 'center', width: '2.2%', renderer: weekRenderer }
                ]
            },
            {
                text: 'May',
                columns: [
                    { text: '19', dataIndex: 'wk19', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '20', dataIndex: 'wk20', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '21', dataIndex: 'wk21', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '22', dataIndex: 'wk22', align: 'center', width: '2.2%', renderer: weekRenderer }
                ]
            },
            {
                text: 'June',
                columns: [
                    { text: '23', dataIndex: 'wk23', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '24', dataIndex: 'wk24', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '25', dataIndex: 'wk25', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '26', dataIndex: 'wk26', align: 'center', width: '2.2%', renderer: weekRenderer },
                    { text: '27', dataIndex: 'wk27', align: 'center', width: '2.2%', renderer: weekRenderer }
                ]
            },
            { text: 'In-Charge', dataIndex: 'staffers', align: 'center', width: '15%', renderer: columnWrap }
        ],
        selType: 'cellmodel',
        columnLines: true,
        height: sheight,
        width: '100%',
        margin: '0 0 10 0',
        viewConfig: {
            listeners: {
                //celldb and itemdbckick becomes one and the same with seltyle cellmodel                
                cellcontextmenu: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    activityID = record.get('id');
                    activityName = record.get('activity');
                    weekNum = (cellIndex - 3);
                    e.stopEvent();
                    rowMenu.showAt(e.getXY(), record);
                },
                celldblclick: function (view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    // if clicked on cell 4, show popup otherwise ignore
                    //if (cellIndex == 3) { // cellIndex starts from 0
                    activityID = record.get('id');
                    activityName = record.get('activity');
                    weekNum = (cellIndex - 3)//record.get('wk'+(cellIndex+2));
                    viewChartEntry(activityID, activityName, weekNum);
                    //RefreshGridStore();
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

    var thisWeekNum = '<?php echo date("W");?>'
    var thisDayNum = '<?php echo date("z") + 1;?>';
    var thisYearNum = '<?php echo date("Y"); ?>'
    var thisWeekText = '<b>Today is day #' + thisDayNum+ ', week #' + thisWeekNum +' of ' + thisYearNum + '</b>'
    var rowMenu = Ext.create('Ext.menu.Menu', {
        items: [
            {
                text: 'Upload Required Document',
                icon: './image/view.png',
                handler: function () {
                    uploadAtachment(activityID, activityName, weekNum);
                }
            }
        ]
    });

    Ext.create('Ext.panel.Panel', {
        title: '<?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?>',
        width: '100%',
        height: sheight,
        renderTo: "innerdiv",
        layout: 'border',
        border: false,
        items: [grid],
        tbar: [
            {
                xtype: 'button', text: 'Pass Slips Tracking', id: 'btnPST2', hidden: true, icon: './image/calendar.png', tooltip: 'Export', handler: function () {
                    viewPassSlips('Tracking');
                }
            },
            {
                xtype: 'combobox', id: 'cmbSection', editable: false, anyMatch: false, allowBlank: false,
                store: section_names,
                displayField: 'description', valueField: 'id', emptyText: 'Section', allowBlank: false,
                width: '30%',
                hidden: true,
                listeners:
                {
                    select: function (combo, record, index) {
                        //status = record[0].data.id;
                        section_id = Ext.getCmp('cmbSection').getValue('id');
                        Ext.getCmp("ganttListGrid").getStore().proxy.extraParams["query"] = section_id;
                        //ganttLogListGrid
                        Ext.getCmp('ganttListGrid').getStore().load();
                    }
                }
            },
            { xtype: 'tbfill' },
            { xtype: 'label', html: thisWeekText },
            { xtype: 'tbfill' },
            {
                xtype: 'button', text: 'Daily Logs', icon: './image/submit.png', tooltip: 'Export', handler: function () {
                    viewDailyLogs();
                }
            },
            {
                xtype: 'button', id: 'btnAssignStaff', text: 'Assign Staff', hidden: true, handler: function(){
                    var userID = "<?php echo $this->session->userdata('user_id');?>";
                    ////var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                    //activityID = record.get('id');

                    sectionID = Ext.getCmp('cmbSection').getValue('id');
                    if(sectionID == null) {
                        sectionID = "<?php echo $this->session->userdata('section_id');?>";
                    }
                    toolAssignStaff(userID, sectionID, activityID);
                }
            },
            {
                xtype: 'button', text: 'Section Pass Slips', icon: './image/submit.png', tooltip: 'Export', handler: function () {
                    viewPassSlips('Official');
                }
            },
            {
                xtype: 'button', text: 'My Pass Slips', icon: './image/submit.png', tooltip: 'Export', handler: function () {
                    viewPassSlips('Personal');
                }
            },
            { xtype: 'button', text: 'Export IPCRs', icon: './image/export.png', tooltip: 'Export', handler: function () { IPCRexport(); } },
            { xtype: 'button', text: 'Export Employee AR', icon: './image/export.png', tooltip: 'Export', handler: function () { ARexport(); } },
        ]

    });

    if ((4 == "<?php echo $this->session->userdata('section_id');?>") || (1 == "<?php echo $this->session->userdata('division_head');?>") || (21 == "<?php echo $this->session->userdata('section_id');?>") )  {       
        displayComponent("cmbSection", "show");
      
    }

    if ((4 == "<?php echo $this->session->userdata('section_id');?>") || (2 == "<?php echo $this->session->userdata('section_id');?>") ||  (21 == "<?php echo $this->session->userdata('section_id');?>" ) ||  (1 == "<?php echo $this->session->userdata('division_head');?>")) {
        displayComponent("btnPST2", "show");
    }
    //strictly IT tools
    if (4 == "<?php echo $this->session->userdata('section_id');?>")  {
        displayComponent("btnAssignStaff", "show");
    }
});