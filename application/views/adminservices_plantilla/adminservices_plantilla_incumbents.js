var incumbentsListWindow;
var query2 = null, itemStatus = null;

function UpdateIncumbent()
{
    var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
	var sm = Ext.getCmp("positionsListGrid").getSelectionModel();
    if (!sm.hasSelection())
    {
        warningFunction("Warning!","Please select record.");
        return;
    }
    plantillaID = sm.selected.items[0].data.id;

    var incumbentsListStore = new Ext.data.JsonStore({
        pageSize: setLimit,
        proxy: {
            type: 'ajax',
            url: 'adminservices_plantilla/incumbentslist',
            timeout : 1800000,
            extraParams: {query2:query2, plantilla_header_id: plantillaID},
            remoteSort: false,
            params: {start: 0, limit: setLimit},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{name: 'id', type: 'int'}, {name: 'plantilla_header_id', type: 'int'}, 'staff_name', 'date_appointed', 'date_vacated', 'remarks']
    });

    var RefreshIncumbentsListGridStore = function () {
        Ext.getCmp("incumbentsListGrid").getStore().reload({params:{start:0 }, timeout: 300000});      
    };

    var incumbentsListGrid = Ext.create('Ext.grid.Panel', {
        id: 'incumbentsListGrid',
        store:incumbentsListStore,
        forceFit:true,
        columns: [
            Ext.create('Ext.grid.RowNumberer', {width: 35}),
            { dataIndex: 'id', hidden: true},
            { text: 'Name of Incumbent', dataIndex: 'staff_name', width: '50%'},
            {
                text: 'Date of Appointment',
                columns: [{
                    text: 'From', 
                    dataIndex: 'date_appointed', 
                    width: 150,
                    renderer:addTooltip
                },{
                    text: 'To', 
                    dataIndex: 'date_vacated', 
                    width: 150,
                    renderer:addTooltip
                }]
            },
            { text: 'Remarks', dataIndex: 'remarks', width: '30%'}
        ],
        columnLines: true,
        width: '100%',
        height: 360,        
        tbar: [{
            xtype   : 'textfield',
            id      : 'searchId1',
            emptyText: 'Search here...',
            width   : '60%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("incumbentsListGrid").getStore().proxy.extraParams["query2"] = Ext.getCmp("searchId1").getValue();
                        RefreshIncumbentsListGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'},
        { xtype: 'button', text: 'ADD', icon: './image/add.png', handler: function (){ AddEditDeleteIncumbent('Add');}},
        '-',
        { xtype: 'button', text: 'EDIT', icon: './image/edit.png', handler: function (){ AddEditDeleteIncumbent('Edit');}},
        '-',
        { xtype: 'button', text: 'DELETE', icon: './image/delete.png', handler: function (){ AddEditDeleteIncumbent('Delete');}}
        ],        
        viewConfig: {
            listeners: {
                itemdblclick: function(view,rec,item,index,eventObj) {
                    AddEditDeleteIncumbent('Edit');
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    incumbentsListMenu.showAt(e.getXY());
                }
            }
        },
        // bbar: Ext.create('Ext.PagingToolbar', {
        //     id: 'innerPageToobar',
        //     store: incumbentsListStore,
        //     pageSize: 10,
        //     displayInfo: true,
        //     displayMsg: 'Displaying {0} - {1} of {2}',
        //     emptyMsg: "No record/s to display"
        // })
    });
    RefreshIncumbentsListGridStore();

    var incumbentsListMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteIncumbent('Add'); }
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteIncumbent('Edit'); }
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteIncumbent('Delete'); }
        }]
    });

    var headerPanel = Ext.create('Ext.form.Panel', {
 
        region  : 'north',
        height  : '100%',
        width   : '100%',
        bodyStyle : 'padding:10px;',
        autoScroll : true,
        fieldDefaults: {
            labelWidth: 100,
            anchor  : '100%',
            msgTarget: 'side',
        },
        items   :[{
            xtype   : 'fieldcontainer',
            labelStyle: 'font-weight:bold;padding:0',
            layout: 'hbox',
            items: [{
                xtype       : 'textfield',
                flex        : 1.5,
                name        : 'position_description',
                fieldLabel  : 'Position Title',
                readOnly    : true
            },{
                xtype       : 'textfield',
                flex        : 0.5,
                labelAlign  : 'right',
                name        : 'salary_grade',
                fieldLabel  : 'SG',
                readOnly    : true,
            }]
        }]
    });

	incumbentsListWindow = Ext.create('Ext.window.Window', {
    	title		: 'Position Incumbent/s',
    	closable	: true,
    	modal		: true,
    	width		: 800,
    	autoHeight	: true,
    	resizable	: false,
    	buttonAlign	: 'center',
    	header: {titleAlign: 'center'},
    	items: [headerPanel, incumbentsListGrid],
    	buttons: [
        {
    	    text	: 'Close',
    	    icon	: './image/close.png',
    	    handler: function ()
    	    {
    	    	incumbentsListWindow.close();
    	    }
    	}],
	}).show();

    headerPanel.getForm().load({
        url: 'adminservices_plantilla/headerview',
        timeout: 30000,
        waitMsg:'Loading data...',
        params: {id: plantillaID},
        success: function(form, action) {
            incumbentsListWindow.show();
            var data = action.result.data;
        },      
        failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
    });
}