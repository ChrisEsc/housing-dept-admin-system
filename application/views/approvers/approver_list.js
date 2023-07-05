setTimeout("UpdateSessionData();", 0);

Ext.onReady(function(){

    var transactionStore = new Ext.data.JsonStore({
        storeId: 'transactionStore',
        proxy: {
            type: 'ajax',
            url: 'approvers/transactionlist',
            timeout : 1800000,
            extraParams: {start: 0, limit: 20, query:null},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'code', 'transaction']
    });

    var hierarchyStore = new Ext.data.JsonStore({
        storeId: 'hierarchyStore',
        proxy: {
            type: 'ajax',
            url: 'approvers/hierarchylist',
            timeout : 1800000,
            extraParams: {start: 0, limit: 20, transaction_id:0},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id',
                totalProperty: 'totalCount'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'description', 'sno']
    });

    var approversStore = new Ext.data.JsonStore({
        storeId: 'approversStore',
        proxy: {
            type: 'ajax',
            url: 'approvers/approverslist',
            timeout : 1800000,
            extraParams: {start: 0, limit: 20, hierarchy_id:0},
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'id'
            }
        },
        fields: [{name: 'id', type: 'int'}, 'approvers', 'departments']
    });

    var RefreshTransactionGridStore = function () {
        Ext.getCmp("transactionsGrid").getStore().reload({params:{reset:1 }, timeout: 300000});      
    };

    var RefreshhierarchyGridStore = function () {
        Ext.getCmp("hierarchyGrid").getStore().reload({params:{reset:1 }, timeout: 300000});      
    };

    var RefreshApproversGridStore = function () {
        Ext.getCmp("approversGrid").getStore().reload({params:{reset:1 }, timeout: 300000});      
    };

    var grid1 = Ext.create('Ext.grid.Panel', {
        title: 'Transactions',
        id: 'transactionsGrid',
        store:transactionStore,
    	split	: true,
        collapsible: true,
        region	: 'west',
        columns: [
            { dataIndex: 'id', hidden: true},
            { text: 'Code', dataIndex: 'code', width: '29%'},
            { text: 'Transaction', dataIndex: 'transaction', width: '70%', renderer:addTooltip}
        ],
        columnLines: true,
        width: '25%',
        height: 400,        
        margin: '0 0 10 0',
        tbar: [
        {
            xtype   : 'textfield',
            id      : 'searchId',
            emptyText: 'Search here...',
            width   : '60%',
            listeners:
            {
                specialKey : function(field, e) {
                    if(e.getKey() == e.ENTER) {
                        Ext.getCmp("transactionsGrid").getStore().proxy.extraParams["query"] = Ext.getCmp("searchId").getValue();
                        RefreshTransactionGridStore();
                    }
                }
            }
        },
        { xtype: 'tbfill'},
        { xtype: 'button', icon: './image/edit.png', tooltip: 'Edit Transaction', handler: function (){ AddEditDeleteTransaction('Edit');}}
        ],
        viewConfig: {
            listeners: {
                itemclick: function(view,rec,item,index,eventObj) {                    
                    Ext.getCmp("hierarchyGrid").getStore().proxy.extraParams["transaction_id"] = rec.get('id');
                    RefreshhierarchyGridStore();
                    Ext.getCmp("approversGrid").getStore().proxy.extraParams["hierarchy_id"] = 0;
                    RefreshApproversGridStore();
                },
                itemdblclick: function() {
                    AddEditDeleteTransaction('Edit');
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    transactionMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshTransactionGridStore();

    var transactionMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteTransaction('Edit');}
        }]
    });

    var grid2 = Ext.create('Ext.grid.Panel', {
        title: 'Hierarchy',
        id: 'hierarchyGrid',
        store:hierarchyStore,
        split   : true,
        collapsible: true,
        region  : 'west',
        columns: [
            { dataIndex: 'id', hidden: true},
            { text: 'Hierarchy', dataIndex: 'description', width: '72%', renderer:addTooltip},
            { text: 'Order', dataIndex: 'sno', width: '24%', align: 'center'}
        ],
        columnLines: true,
        width: '30%',
        height: 400,        
        margin: '0 0 10 0',
        tbar: [
        { xtype: 'tbfill'},
        { xtype: 'button', icon: './image/add.png', tooltip: 'Add Hierarchy', handler: function (){ AddEditDeleteHierarchy('Add');}},
        '-',
        { xtype: 'button', icon: './image/edit.png', tooltip: 'Edit Hierarchy', handler: function (){ AddEditDeleteHierarchy('Edit');}},
        '-',
        { xtype: 'button', icon: './image/delete.png', tooltip: 'Delete Hierarchy', handler: function (){ AddEditDeleteHierarchy('Delete');}}
        ],
        viewConfig: {
            listeners: {
                itemclick: function(view,rec,item,index,eventObj) {                    
                    Ext.getCmp("approversGrid").getStore().proxy.extraParams["hierarchy_id"] = rec.get('id');
                    RefreshApproversGridStore();
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    hierarchyMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshhierarchyGridStore();

    var hierarchyMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteHierarchy('Add');}
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteHierarchy('Edit');}
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteHierarchy('Delete');}
        }]
    });

	var grid3 = Ext.create('Ext.grid.Panel', {
        title: 'Approvers',
        id: 'approversGrid',
        store:approversStore,
		region	: 'center',
        columns: [
            { dataIndex: 'id', hidden: true},
            { dataIndex: 'parent_id', hidden: true},
            { text: 'Approver', dataIndex: 'approvers', width: '30%', renderer:addTooltip},
            { text: 'Departments', dataIndex: 'departments', width: '69%', renderer:addTooltip}
        ],
        columnLines: true,
        width: '70%',
        height: 400,        
        loadMask: true,
        margin: '0 0 10 0',
        tbar: [
        { xtype: 'tbfill'},
        { xtype: 'button', text: 'Departments', icon: './image/folder.png', handler: function (){ ApproverDepartments();}},
        '-',
        { xtype: 'button', icon: './image/add.png', tooltip: 'Add Approver', handler: function (){ AddEditDeleteApprover('Add');}},
        '-',
        { xtype: 'button', icon: './image/edit.png', tooltip: 'Edit Approver', handler: function (){ AddEditDeleteApprover('Edit');}},
        '-',
        { xtype: 'button', icon: './image/delete.png', tooltip: 'Delete Approver', handler: function (){ AddEditDeleteApprover('Delete');}}
        ],
        viewConfig: {
            listeners: {
                itemdblclick: function() {
                    AddEditDeleteApprover('Edit');
                },
                itemcontextmenu: function(view, record, item, index, e){
                    e.stopEvent();
                    approverMenu.showAt(e.getXY());
                }
            }
        }
    });
    RefreshApproversGridStore();

    var approverMenu = Ext.create('Ext.menu.Menu', {
        items: [{
            text: 'Departments',
            icon: './image/folder.png',
            handler: function (){ ApproverDepartments();}
        }, {
            text: 'Add',
            icon: './image/add.png',
            handler: function (){ AddEditDeleteApprover('Add');}
        }, {
            text: 'Edit',
            icon: './image/edit.png',
            handler: function (){ AddEditDeleteApprover('Edit');}
        }, {
            text: 'Delete',
            icon: './image/delete.png',
            handler: function (){ AddEditDeleteApprover('Delete');}
        }]
    });

    var panel1 = Ext.create('Ext.panel.Panel', {
        region  : 'center',
        border  : false,
        width: '75%',
        height: '100%',
        layout: 'border',
        items   : [grid2, grid3]
    });

	Ext.create('Ext.panel.Panel', {
        title: '<?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?>',
	    width: '100%',
	    height: sheight,
	    renderTo: "innerdiv",
	    layout: 'border',
        border: false,
	    items	: [grid1, panel1]
	});
});
