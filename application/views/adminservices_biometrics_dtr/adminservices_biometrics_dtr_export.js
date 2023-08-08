//var id;
var employee_ids, dtr_classification;

function export_dtr(type) {
    params = new Object();
    params.type      			= type;		// excel or pdf, currently implemented in excel ONLY
    params.dtr_classification 	= dtr_classification;
    params.calendar_id      	= calendar_id;
    params.employee_ids 		= employee_ids.toString();
    params.employee_ids_count 	= employee_ids.length;
    ExportDocument('adminservices_biometrics_dtr/export_dtr', params, type);
}

function ExportDTR(type, period)
{
	if (type == 'Individual')
	{
		var sm = Ext.getCmp("biometricsRecordsListGrid").getSelectionModel();
	    if (!sm.hasSelection())
	    {
	        warningFunction("Warning","Please select a record!");
	        return;
	    }
	    employee_ids = new Array();
	    employee_ids.push(sm.selected.items[0].data.employee_id);
	    dtr_classification = "Individual";
	    export_dtr('Excel');
	}
	else
	{
		var dtrNamesStore = new Ext.data.JsonStore({
			pageSize: 10,
			proxy: {
	            type: 'ajax',
	            url: 'adminservices_biometrics_dtr/dtr_names_list',
	            timeout : 1800000,
	            extraParams: {employment_status: employment_status, calendar_id: calendar_id},
	            remoteSort: false,
	            params: {start: 0, limit: 10},
	            reader: {
	                type: 'json',
	                root: 'data',
	                idProperty: 'id',
	                totalProperty: 'totalCount'
	            }
	        },
	        listeners: {
	            load: function (store, records, successful, eOpts) {
	            	if (employment_status == 1)
	            		dtr_classification = "Regular";
	            	else if (employment_status == 2)
	            		dtr_classification = "Casual";
	            	else
	            		dtr_classification = "JO";
	            }
	        },
	        fields: [{name: 'id', type: 'int'}, {name: 'employee_id', type: 'int'}, 'employee_name', 'selected']
		});

		var RefreshDtrNamesStore = function () {
	        Ext.getCmp("dtrNamesGrid").getStore().reload({params:{start:0 }, timeout: 300000});      
	    };

		var dtrNamesGrid = Ext.create('Ext.grid.Panel', {
			id: 'dtrNamesGrid',
	        store:dtrNamesStore,
	        border:false,
	        columns: [
	        	Ext.create('Ext.grid.RowNumberer', {width: 35}),
	            { dataIndex: 'id', hidden: true},
	            { text: 'Emp. ID', dataIndex: 'employee_id', align:'center', width: '15%'},
	            { text: 'Employee Name', dataIndex: 'employee_name', width: '60%'},    
	            { xtype: 'checkcolumn', text: 'Selected', dataIndex: 'selected', align:'center', width: '20%'}
	        ],
	        columnLines: true,
	        width: '100%',
	        height: 360,
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
	        }
		});
		RefreshDtrNamesStore();

		dtrNamesWindow = Ext.create('Ext.window.Window', {
			title		: type + ' DTR Generation',
			closable	: true,
			modal		: true,
			width		: 600,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [dtrNamesGrid],
			buttons: [{
			    text	: 'Generate',
			    icon	: './image/excel.png',
			    handler: function ()
			    {
			    	var store = Ext.getCmp("dtrNamesGrid").getStore().data;
			    	employee_ids = new Array();
			    	for (var i = 0; i < store.length; i++) 
			    	{
			            if (store.items[i].data.selected == true)
				        {
				            employee_ids.push(store.items[i].data.employee_id);
				        }
			    	}

			    	export_dtr('Excel');
			    }
			},{
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	dtrNamesWindow.close();
			    }
			}],
		}).show();
	}
}