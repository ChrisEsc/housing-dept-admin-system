var departmentsWindow, approversID;

function ApproverDepartments()
{          
	var sm = Ext.getCmp("approversGrid").getSelectionModel();
	if (!sm.hasSelection())
	{
		warningFunction("Warning!","Please select a record.");
		return;
	}
	approversID = sm.selected.items[0].data.id;		
    approverName = sm.selected.items[0].data.approvers;     

    var moduleusersStore = new Ext.data.JsonStore({
        proxy: {
            type: 'ajax',
            url: 'approvers/departmentlist',
            timeout : 1800000,
            extraParams: {start: 0, limit: 20, approver_id: approversID, query:null},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'description']
    });

    var RefreshDepartmentGridStore = function () {
        Ext.getCmp("departmentsGrid").getStore().reload({params:{reset:1 }, timeout: 300000});      
    };

    var departmentsGrid = Ext.create('Ext.grid.Panel', {
        id: 'departmentsGrid',
        store:moduleusersStore,
        border:false,
        columns: [
            { dataIndex: 'id', hidden: true},
            { text: 'Department', dataIndex: 'description', width: '99%'}
        ],
        columnLines: true,
        width: '100%',
        height: 200,        
        margin: '0 0 10 0',
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
                        Ext.getCmp("departmentsGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId1").getValue();
                        RefreshDepartmentGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'},
        { xtype: 'button', icon: './image/add.png', tooltip: 'Add Department', handler: function (){ AddEditDeleteDepartment('Add');}},
        '-',
        { xtype: 'button', icon: './image/edit.png', tooltip: 'Edit Department', handler: function (){ AddEditDeleteDepartment('Edit');}},
        '-',
        { xtype: 'button', icon: './image/delete.png', tooltip: 'Delete Department', handler: function (){ AddEditDeleteDepartment('Delete');}}
        ],        
        viewConfig: {
            listeners: {
                itemdblclick: function(view,rec,item,index,eventObj) {                    
                    AddEditDeleteDepartment('Edit');
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    departmentMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshDepartmentGridStore();

    var departmentMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteDepartment('Add'); }
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteDepartment('Edit'); }
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteDepartment('Delete'); }
        }]
    });

		departmentsWindow = Ext.create('Ext.window.Window', {
		title		: approverName + ' Department/s',
		closable	: true,
		modal		: true,
		width		: 400,
		autoHeight	: true,
		resizable	: false,
		buttonAlign	: 'center',
		header: {titleAlign: 'center'},
		items: [departmentsGrid],
		buttons: [
		{
		    text	: 'Close',
		    icon	: './image/close.png',
		    handler: function ()
		    {
		    	departmentsWindow.close();
		    }
		}],
	}).show();
}
