var moduleusersWindow, moduleID;

function AddEditDeleteModuleUsers(type)
{          
	if(type == 'Main')	
		var sm = Ext.getCmp("moduleGrid").getSelectionModel();
	else 
		var sm = Ext.getCmp("submoduleGrid").getSelectionModel();

	if (!sm.hasSelection())
	{
		warningFunction("Warning!","Please select a record.");
		return;
	}
	moduleID = sm.selected.items[0].data.id;		

    var moduleusersStore = new Ext.data.JsonStore({
        pageSize: 10,
        proxy: {
            type: 'ajax',
            url: 'usermanagement/moduleuserslist',
            timeout : 1800000,
            extraParams: {module_id: moduleID, query:null},
            remoteSort: false,
            params: {start: 0, limit: 10},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'username', 'name', 'add', 'edit', 'delete']
    });

    var RefreshModuleUsersGridStore = function () {
        Ext.getCmp("moduleusersGrid").getStore().reload({params:{start:0 }, timeout: 300000});      
    };

    var ModuleUsersGrid = Ext.create('Ext.grid.Panel', {
        id: 'moduleusersGrid',
        store:moduleusersStore,
        border:false,
        columns: [
            { dataIndex: 'id', hidden: true},
            { text: 'Name', dataIndex: 'name', width: '42%'},
            { text: 'User Name', dataIndex: 'username', width: '20%'},            
            { xtype: 'checkcolumn', text: 'Add', dataIndex: 'add', width: '12%', align:'center', listeners:{beforecheckchange: function() {return false}}},
            { xtype: 'checkcolumn', text: 'Edit', dataIndex: 'edit', width: '12%', align:'center', listeners:{beforecheckchange: function() {return false}}},
            { xtype: 'checkcolumn', text: 'Delete', dataIndex: 'delete', width: '12%', align:'center', listeners:{beforecheckchange: function() {return false}}}
        ],
        columnLines: true,
        width: '100%',
        height: 360,        
        tbar: [
        {
            xtype   : 'textfield',
            id      : 'searchId1',
            emptyText: 'Search here...',
            width   : '60%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("moduleusersGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId1").getValue();
                        RefreshModuleUsersGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'},
        { xtype: 'button', text: 'ADD', icon: './image/add.png', handler: function (){ AddEditDeleteModUser('Add');}},
        '-',
        { xtype: 'button', text: 'EDIT', icon: './image/edit.png', handler: function (){ AddEditDeleteModUser('Edit');}},
        '-',
        { xtype: 'button', text: 'DELETE', icon: './image/delete.png', handler: function (){ AddEditDeleteModUser('Delete');}}
        ],        
        viewConfig: {
            listeners: {
                itemdblclick: function(view,rec,item,index,eventObj) {                    
                    AddEditDeleteModUser('Edit');
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    moduleusersMenu.showAt(e.getXY());
                }
            }
        },
        bbar: Ext.create('Ext.PagingToolbar', {
            store: moduleusersStore,
            pageSize: 10,
            displayInfo: true,
            displayMsg: 'Displaying {0} - {1} of {2}',
            emptyMsg: "No record/s to display"
        })
    });
    RefreshModuleUsersGridStore();

    var moduleusersMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteModUser('Add'); }
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteModUser('Edit'); }
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteModUser('Delete'); }
        }]
    });

	moduleusersWindow = Ext.create('Ext.window.Window', {
		title		: type + ' Module Users',
		closable	: true,
		modal		: true,
		width		: 600,
		autoHeight	: true,
		resizable	: false,
		buttonAlign	: 'center',
		header: {titleAlign: 'center'},
		items: [ModuleUsersGrid],
		buttons: [{
		    text	: 'Close',
		    icon	: './image/close.png',
		    handler: function ()
		    {
		    	moduleusersWindow.close();
		    }
		}],
	}).show();
}