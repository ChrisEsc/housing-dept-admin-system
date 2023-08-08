var query = null;

function PARdocs(value) {
    new_folder_path = '/new/folder/path/Post Activity Reports/' + value;
    return '<a href="' + new_folder_path + '" target=_blank>' + value + '</a></li>'
}

function PARexport(value) {
    processingFunction("Processing data, please wait...");
    Ext.Ajax.request({
        url: "adminservices_gantt_chart/export_post_activity_report",
        method: 'POST',
        params: {
            doc_id:value
        },
        success: function (f, opts) {
            var response = Ext.decode(f.responseText);
            var htmldump = '';                
            Ext.MessageBox.hide();

            if (response.success == true) {
                var file = response.filename;                   
                htmldump += '<a href="' + '<?php echo base_url(); ?>' + file + '" download>' + file + '</a></br></br>';
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

function PARnotExport(value) {
    return '<button type="button" onclick="PARexport('+value+')">Export</button>'
}

function viewChartEntry(activityID, activityName, weekNum) {
    Ext.MessageBox.wait('Loading...');
    Ext.Ajax.request({
            url: 'adminservices_gantt_chart/activity_logs_list',
            method: 'POST',
            params: { id: activityID, week_num:weekNum },
            extraParams: { query: query },
            success: function (f, a)
            {
                var passSlipMonth = "<?php echo date('m');?>";
                var passSlipYear = "<?php echo date('Y');?>";
                var userID = "<?php echo $this->session->userdata('user_id');?>";
                var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                var divisionID = "<?php echo $this->session->userdata('division_id');?>";

                var response = Ext.decode(f.responseText);
                var parStore = new Ext.data.JsonStore({
                    pageSize: setLimit,
                    storeId: 'parStore',
                    data: response.data ,
                    fields: [{ name: 'id', type: 'int' }, 'documented_date', 'documented_by',
                            'activity', 'chudd_participants', 'prepared_date', 'prepared_name', 'documentation']
                });
                var logStore = new Ext.data.JsonStore({
                    pageSize: setLimit,
                    storeId: 'logStore',
                    data: response.data2,
                    fields: [{ name: 'id', type: 'int' }, 'log_date', 'log_location', 'log_activity', 'prepared_name']
                });
                var passSlipStore = new Ext.data.Store({
                    proxy: {
                        type: 'ajax',
                        url: 'logbookapi:4002/passslip/getSectionActivityPassSlipRequested/' + activityID+'/'+weekNum,
                        timeout: 1800000,
                        useDefaultXhrHeader: false,
                        reader: {
                            type: 'json',
                            root: 'data',
                            idProperty: 'id'
                        }
                    },
                    autoLoad: true,
                    params: { start: 0, limit: 10 },
                    fields: [{ name: 'id', type: 'int' },
                        'activity',
                        'psDateAppliedStart',
                        'psLocation',
                        'psPurposeOfFieldWork',                        
                        'purpose',
                        'sectionactivity.activity'
                    ]
                });

                var htmlData = '';
                var htmlLoad = new Ext.XTemplate(htmlData);

                var rowMenu = Ext.create('Ext.menu.Menu', {
                    items: [{
                        text: 'Evaluate Report',
                        icon: './image/evaluation.png',
                        handler: function () { View(); }
                    }, {
                        text: 'Delete',
                        icon: './image/delete.png',
                        handler: function () { DeletePAR(); }
                    }, {
                        text: 'View Report',
                        icon: './image/view.png',
                        handler: function () { View(); }
                    }]
                });

                var elogPanel = Ext.create('Ext.panel.Panel', {
                    //title: 'E-Log Entries for Section Activity #' + activityID + ": " + activityName,
                    title: 'E-Log Entries',
                    width: '55%',
                    height: '100%',                    
                    id: 'panel-elogs',
                    //split: false,
                    //collapsed: false,
                    //collapsible: false,
                    region: 'west',
                    autoScroll: true,
                    viewConfig: {
                    listeners: {
                        itemcontextmenu: function (view, record, item, index, e) {
                            e.stopEvent();
                            rowMenu.showAt(e.getXY());
                        }
                    }
                    },
                    tbar: [
                        {
                            xtype: 'button', text: 'Delete Daily Log', icon: './image/delete.png', tooltip: 'Export daily log',
                            handler: function () {
                                var sm = Ext.getCmp("ganttLogListGrid").getSelectionModel();
                                dlID = sm.selected.items[0].data.id;
                                dlLogDate = sm.selected.items[0].data.logDate
                                userID = "<?php echo $this->session->userdata('user_id');?>";
                                Ext.Msg.show({
                                    title: 'Confirmation',
                                    msg: 'Are you sure you want to delete Pass Slip #' + dlID + '?',
                                    width: '100%',
                                    icon: Ext.Msg.QUESTION,
                                    buttons: Ext.Msg.YESNO,
                                    fn: function (btn) {
                                        if (btn == 'yes')
                                            Ext.Ajax.request(
                                                {
                                                    url: 'logbookapi:4002/dailylog/delete/' + dlID,
                                                    method: 'DELETE',
                                                    success: function (response, opts) {
                                                        //RefreshGridStore();
                                                        Ext.getCmp('ganttLogListGrid').getStore().load();                                                       
                                                        Ext.Msg.alert('Status', 'Deleted Daily Log #' + dlID);
                                                    },
                                                    failure: function (response, opts) {
                                                        Ext.Msg.alert('Status', 'Failed to delete Daily Log!');
                                                    }
                                                });
                                    }
                                });
                            }
                        },
                        {   xtype: 'tbfill' },
                        {   xtype: 'button', text: 'New Daily Log', icon: './image/submit.png', tooltip: 'Create new daily log',
                            handler: function () {
                                var userID = "<?php echo $this->session->userdata('user_id');?>";
                                var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                                addDailyLog(userID, sectionID);
                                Ext.getCmp('ganttLogListGrid').getStore().load();                                                       
                            }
                        },
                        {   xtype: 'button', text: 'Edit Daily Log', icon: './image/edit.png', tooltip: 'Export daily log',
                            handler: function () {                                              
                                var sm = Ext.getCmp("ganttLogListGrid").getSelectionModel();
                                var userID = "<?php echo $this->session->userdata('user_id');?>";
                                var userName = "<?php echo $this->session->userdata('name');?>";
                                var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                                var loggerName = sm.selected.items[0].data.prepared_name                                                    
                                if (!sm.hasSelection()) {
                                    warningFunction("Warning", "Please select a record!");
                                    return;
                                }
                                if (userName.toUpperCase() !== loggerName.toUpperCase()) {
                                    warningFunction("Warning", "Cannot edit this record!");
                                    return;
                                }
                                var userID = "<?php echo $this->session->userdata('user_id');?>";
                                var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                                id = sm.selected.items[0].data.id;
                                editDailyLog(userID, sectionID, id);
                                Ext.getCmp('ganttLogListGrid').getStore().load();                                                       
                            }
                        }
                        //{ xtype: 'button', text: 'Export JO Accomplishment Reports', icon: './image/submit.png', tooltip: 'Export', handler: function () { ARexport(); } },
                    ],
                    items: [{
                        xtype: 'container',
                        layout: 'fit',
                        items: [{
                            xtype: 'grid',
                            store: logStore,
                            id: 'ganttLogListGrid',
                            margin: '12px',
                            height:  650, //sheight - 100,
                            columns: [Ext.create('Ext.grid.RowNumberer', { width: '5%' }),
                                { dataIndex: 'id', hidden: true },
                                { text: 'Logged By', dataIndex: 'prepared_name', align: 'left', width: '25%', renderer: columnWrap },
                                { text: 'Logged Date', dataIndex: 'log_date', align: 'center', width: '10%', renderer: columnWrap },
                                { text: 'Location', dataIndex: 'log_location', align: 'center', width: '20%', renderer: columnWrap },
                                { text: 'Activity', dataIndex: 'log_activity', align: 'left', width: '40%', renderer: columnWrap },
                            ]
                        }]
                    }]
                });

                var activityPanel = Ext.create('Ext.panel.Panel', {
                    //region: 'center',                      
                    //title: 'Post-Activity Report for Section Activity #' + activityID + ": " + activityName,
                    title: 'Post-Activity Reports',
                    width: '100%',
                    //height: '205',
                    autoScroll: true,
                    buttonAlign: 'center',
                    html: htmlLoad.applyTemplate(null),
                    items: [{
                        xtype: 'container',
                        layout: 'fit',
                        items: [{
                            xtype: 'grid',
                            store: parStore,
                            id: 'ganttPARListGrid',
                            margin: '12px',
                            height: 325,
                            columns: [Ext.create('Ext.grid.RowNumberer', { width: '5%' }),
                                { dataIndex: 'id', hidden: true },
                                { text: 'Documented By', dataIndex: 'prepared_name', align: 'left', width: '15%', renderer: columnWrap },
                                { text: 'Documented Date', dataIndex: 'documented_date', align: 'center', width: '20%', renderer: columnWrap },
                                { text: 'Activity', dataIndex: 'activity', align: 'left', width: '35%', renderer: columnWrap },
                                { text: 'Document', dataIndex: 'documentation', align: 'left', width: '15%', renderer: PARdocs },
                                { text: 'Export', dataIndex: 'id', align: 'left', width: '10%', renderer: PARnotExport }
                            ]
                        }]
                    }]
                });

                var passlipPanel = Ext.create('Ext.panel.Panel', {                    
                    title: 'Pass Slips',
                    id: 'panel-passlips',
                    split: false,
                    collapsed: false,
                    collapsible: false,                    
                    autoScroll: true,
                    width: '100%',     
                    viewConfig: {
                        listeners: {
                            itemcontextmenu: function (view, record, item, index, e) {
                                e.stopEvent();
                                rowMenu.showAt(e.getXY());
                            }
                        }
                    },
                    tbar: [{
                        xtype: 'button', text: 'New Pass Slip', icon: './image/submit.png', tooltip: 'Create new daily log',
                        handler: function () {
                            var userID = "<?php echo $this->session->userdata('user_id');?>";
                            var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                            addPassSlip(userID, sectionID);
                        }
                    }, {
                        xtype: 'button', text: 'Edit Pass Slip', icon: './image/edit.png', tooltip: 'Export daily log',
                        handler: function () {
                            var sm = Ext.getCmp("PassSlipListGrid").getSelectionModel();
                            var userID = "<?php echo $this->session->userdata('user_id');?>";
                            var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                            if (!sm.hasSelection()) {
                                warningFunction("Warning", "Please select a record!");
                                return;
                            }                                
                            id = sm.selected.items[0].data.id;
                            editPassSlip(userID, sectionID, id);
                        }
                    }, {
                        xtype: 'button', text: 'Print Pass Slip', icon: './image/printall.png', tooltip: 'Create new daily log',
                        handler: function () {
                            var userID = "<?php echo $this->session->userdata('user_id');?>";
                            var sectionID = "<?php echo $this->session->userdata('section_id');?>";
                            var sm = Ext.getCmp("PassSlipListGrid").getSelectionModel();
                            if (!sm.hasSelection()) {
                                warningFunction("Warning", "Please select a record!");
                                return;
                            }
                            id = sm.selected.items[0].data.id;
                            printPassSlip(id);
                        }
                    }, { xtype: 'tbfill' }, {
                            xtype: 'button', text: 'Delete Pass Slip', icon: './image/delete.png', tooltip: 'Export daily log',
                            handler: function () {
                                var sm = Ext.getCmp("PassSlipListGrid").getSelectionModel();
                                psID = sm.selected.items[0].data.id;
                                Ext.Msg.show({
                                    title: 'Confirmation',
                                    msg: 'Are you sure you want to delete Pass Slip #'+psID +'?',
                                    width: '100%',
                                    icon: Ext.Msg.QUESTION,
                                    buttons: Ext.Msg.YESNO,
                                    fn: function (btn) {
                                        if (btn == 'yes')
                                            Ext.Ajax.request({
                                                url: 'logbookapi:4002/passslip/deletePassSlip/' + psID,
                                                method: 'DELETE',
                                                success: function (response, opts) {
                                                    Ext.getCmp('PassSlipListGrid').getStore().load();
                                                    Ext.Msg.alert('Status', 'Deleted Pass Slip #' + psID);
                                                },
                                                failure: function (response, opts) {
                                                    Ext.Msg.alert('Status', 'Failed to delete Pass Slip Request!');
                                                }
                                            });                                            
                                    }
                                });
                            }
                        }                        
                    ],
                    items: [{
                        xtype: 'container',
                        layout: 'fit',
                        items: [{
                            xtype: 'grid',
                            store: passSlipStore,
                            id: 'PassSlipListGrid',
                            margin: '12px',
                            height: 325,
                            columns: [Ext.create('Ext.grid.RowNumberer', { width: '5%' }),
                                { dataIndex: 'id', hidden: true },
                                { text: 'Date Start', dataIndex: 'psDateAppliedStart', align: 'left', width: '15%', renderer: columnWrap },
                                // { text: 'Location', dataIndex: 'psLocation', align: 'left', width: '15%', renderer: columnWrap },                                    
                                { text: 'Location', dataIndex: 'psLocation', align: 'left', width: '20%', renderer: columnWrap },
                                { text: 'Purpose of Fieldwork', dataIndex: 'psPurposeOfFieldWork', align: 'left', width: '70%', renderer: columnWrap }
                            ]
                        }]
                    }]
                });

                var eastPanel = Ext.create('Ext.panel.Panel', {
                    //bodyPadding: 5,  // Don't want content to crunch against the borders
                    width: '45%',
                    //height: '400',
                    layout: {
                        type: 'vbox',
                        alight: 'left'
                    },
                    //title: 'Filters',
                    autoScroll: true,
                    items: [activityPanel, passlipPanel]//,
                    //renderTo: Ext.getBody()
                });
                var mainWindow = Ext.create('Ext.window.Window', {
                    title: 'Week #' + weekNum + ' of Section Activity #' + activityID + ': ' + activityName,
                    header: { titleAlign: 'center' },
                    closable: true,
                    modal: true,
                    //width: 750,
                    //height: 410,
                    resizable: false,
                    layout: {
                        type: 'hbox',
                        align: 'left'
                    },
                    //maximizable: true,
                    maximized: true,

                    items: [elogPanel, eastPanel],
                    buttons: [{
                        text: 'Close',
                        icon: './image/close.png',
                        handler: () => {
                            mainWindow.close();
                        }
                    }]
                }).show();
                Ext.MessageBox.hide();  
            }
        }
    )   
}

function uploadAtachment(activityID, activityName, weekNum)
{
    var d = new Date();
    var yearNum = d.getFullYear();
    uploadForm = Ext.create('Ext.form.Panel', {
        border: false,
        bodyStyle: 'padding:15px;',
        fieldDefaults: {
            labelAlign: 'right',
            labelWidth: 80,            
            msgTarget: 'side',
            anchor: '100%',
            allowBlank: false
        },
        items: [{
            xtype: 'fileuploadfield',
            buttonText: 'Browse File',
            name: 'form-file',
            id: 'form-file',
            emptyText: 'Select File to Attach..',
            fieldLabel: 'File',
            fileInputAttributes: {
                accept: 'application/xml',
                multiple: ''
            }
        }, {
            xtype: 'textarea',
            id: 'description',
            name: 'description',
            fieldLabel: 'Description',
            afterLabelTextTpl: null,
            allowBlank: true
        }]
    });

    uploadWindow = Ext.create('Ext.window.Window', {
        title: 'Upload Required Document for ' + activityName,
        closable: true,
        modal: true,
        width: 450,
        autoHeight: true,
        resizable: false,
        buttonAlign: 'center',
        header: { titleAlign: 'center' },
        items: [uploadForm],
        buttons: [{
            text: 'Upload',
            icon: './image/save.png',
            handler: function () {
                if (!uploadForm.form.isValid()) {
                    errorFunction("Error!", 'Please fill-in the required fields (Marked red).');
                    return;
                }
                Ext.Msg.show({
                    title: 'Confirmation',
                    msg: 'Are you sure you want to Save?',
                    width: '100%',
                    icon: Ext.Msg.QUESTION,
                    buttons: Ext.Msg.YESNO,
                    fn: function (btn) {
                        if (btn == 'yes') {
                            uploadForm.submit({
                                //incorrect controller
                                url: 'adminservices_gantt_chart/upload_document',
                                waitMsg: 'Uploading document',
                                method: "POST",
                                params: {                                        
                                    activity_id: activityID,
                                    year: yearNum,
                                    week_num: weekNum
                                },
                                timeout: 1800000,
                                success: function (form, action) {
                                    try {                                         
                                        infoFunction('Status', action.result.data);                                            
                                        uploadWindow.close();
                                    }
                                    catch (err) {                                            
                                        errorFunction("Error!", err);
                                    }
                                },
                                failure: function (form, action) {                                        
                                    errorFunction('Error!', action.result.data);
                                }
                            });
                        }
                    }
                });
            }
        }, {
            text: 'Close',
            icon: './image/close.png',
            handler: function () {
                uploadWindow.close();
            }
        }],
    }).show();
    Ext.getCmp("form-file").focus();
}

function Export2Doc(xdivID, filename, type='IPCR') {
    //var css = '<style>@page {size: 21cm 29.7cm ;margin: 30mm 45mm 30mm 45mm; /* change the margins as you want them to be. */}</style>'
    var html = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title>";
    var footer = "</body></html>";
    //var htmldata = document.getElementById(xdivID).innerHTML;
    var htmldata = xdivID;
    html = html +  htmldata + footer;

    //link url
    var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);

    //file name
    filename = type + ' of ' +  filename + '.doc';

    // Creates the  download link element dynamically
    var downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);

    //Link to the file
    downloadLink.href = url;

    //Setting up file name
    downloadLink.download = filename;

    //triggering the function
    downloadLink.click();
    //Remove the a tag after donwload starts.
    document.body.removeChild(downloadLink);
}


function Export2PDF(filepath) {
    //htmldump += '<a href="' + '<?php echo base_url(); ?>' + file + '" download>' + file + '</a></br></br>';
    var downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    downloadLink.href = '<?php echo base_url();?>' + '/' + filepath;
    downloadLink.download =  filepath;

    //triggering the function
    downloadLink.click();
    //Remove the a tag after donwload starts.
    document.body.removeChild(downloadLink);
}

function getDateOfWeek(w, y) {
    var d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week
    return new Date(y, 0, d);
}