var positionWindow, plantillaID, positionForm, itemNumberHistoryID, itemNumberHistoryYear;
var position_id = null;

function positionsCRUD(type)
{
	params 						= new Object();
	params.id					= plantillaID;
	params.type					= type;

	if (type == "Delete")
		deleteFunction('adminservices_plantilla/crud', params, 'positionsListGrid', null);
	else
	{
		params.employment_status_id = Ext.get('employment_status').dom.value;
		params.division_id 			= Ext.get('division_id').dom.value;
		params.position_id 			= Ext.get('position_id').dom.value;
		params.itemnumber_history_id= itemNumberHistoryID;
		params.year 				= itemNumberHistoryYear;
		
		addeditFunction('adminservices_plantilla/crud', params, 'positionsListGrid', null, positionForm, positionWindow);
	}
	// Ext.getCmp("pageToolbar").moveFirst();
}

function AddEditDeletePosition(type)
{
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("positionsListGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select record.");
			return;
		}

		plantillaID = sm.selected.items[0].data.id;
	}

	if (type == "Delete")
	{
		Ext.Msg.show({
			title	: 'Confirmation',
			msg		: 'Are you sure you want to ' + type + ' record?',
			width	: '100%',
			icon	: Ext.Msg.QUESTION,
			buttons	: Ext.Msg.YESNO,
			fn: function(btn){
				if (btn == 'yes')
					positionsCRUD(type);
			}
		});
	}
	else
	{		
		positionForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',
			autoScroll : true,		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 90,
				msgTarget: 'side',
				afterLabelTextTpl: required,
				anchor	: '100%',
				allowBlank: false
	        },
			items: [{
                xtype: 'fieldcontainer',
                labelStyle: 'font-weight:bold;padding:0;',
                layout: 'hbox',
                items: [
                {
		            xtype   		: 'combo',
		            flex			: 1,
		            id				: 'employment_status',
		            name 			: 'employment_status',
		            displayField	: 'description',
		            valueField		: 'id',
		            fieldLabel		: 'Employment Status',
		            emptyText		: 'Permanent',
		            triggerAction	: 'all',
		            enableKeyEvents	: true,
		            matchFieldWidth	: true,
		            editable		: false,
		            readOnly    	: false,
		            store: new Ext.data.JsonStore({
				        proxy: {
				            type: 'ajax',
				            url: 'commonquery/combolist',
				            timeout : 1800000,
				            extraParams: {query:null, type: 'employment_statuses'},
				            reader: {
				                type: 'json',
				                root: 'data',
				                idProperty: 'id'
				            }
				        },
				        params: {start: 0, limit: 10},
				        fields: [{name: 'id', type: 'int'}, 'description']
		            }),
		            listeners: 
		            {
		            	// load: function()
		            	// {
		            	// 	this.setValue('Permanent');
		            	// },
		                select: function (combo, record, index)
		                {
		                	var item_number = Ext.getCmp("item_number");
		                	var division_id_container = Ext.getCmp("division_id_container");

		                	Ext.get('employment_status').dom.value = record[0].data.id;
		                	Ext.getCmp("employment_status").setRawValue(record[0].data.description);

		                	if(record[0].data.description == "Permanent") {
		                		item_number.show();
		                		item_number.enable();
		                		division_id_container.show();
		                		division_id_container.enable();
		                	}
		                	else {
		                		item_number.hide();
		                		item_number.disable();
		                		division_id_container.hide();
		                		division_id_container.disable();
		                	}
		                }
		            }
		        }]
            },{
				xtype		: 'numberfield',	
				id			: 'item_number',
				name		: 'item_number',
				fieldLabel	: 'Item No.',
				emptyText	: '19'
			},{
				xtype 		: 'fieldcontainer',
				labelStyle 	: 'font-weight:bold;padding:0;',
                layout 		: 'hbox',
                id 			: 'division_id_container',
                items: [
                {
                	xtype       	: 'combo',
                	flex			: 1,
		            id          	: 'division_id',
		            fieldLabel  	: 'Division',
		            valueField  	: 'id',
		            displayField	: 'description',
		            emptyText		: 'Urban Development Division',
		            triggerAction	: 'all',
		            minChars    	: 3,
		            enableKeyEvents	: true,
		            readOnly    	: false,
		            matchFieldWidth	: true,
		            forceSelection	: true,
		            editable 		: false,
		            store: new Ext.data.JsonStore({
		                proxy: {
		                    type: 'ajax',
		                    url: 'commonquery/combolist',
		                    timeout : 1800000,
		                    extraParams: {query:null, type: 'divisions'},
		                    reader: {
		                        type: 'json',
		                        root: 'data',
		                        idProperty: 'id'
		                    }
		                },
		                params: {start: 0, limit: 10},
		                fields: [{name: 'id', type: 'int'}, 'description']
		            }),
		            listeners: 
		            {
		                select: function (combo, record, index)
		                {        
		                    Ext.get('division_id').dom.value = record[0].data.id;
	                    	Ext.getCmp("division_id").setRawValue(record[0].data.description);
		                }
		            }
                },{
                    xtype: 'button',
                    hidden: crudMaintenance,
                    margins     : '0 0 0 5',
                    text: '...',
                    tooltip: 'Add/Edit/Delete Position',
                    handler: function (){ viewMaintenance('divisions'); }
		        }]
	            
	        },{
                xtype: 'fieldcontainer',
                labelStyle: 'font-weight:bold;padding:0;',
                layout: 'hbox',
                items: [
                {
		            xtype   		: 'combo',
		            flex			: 1,
		            id				: 'position_id',
		            fieldLabel		: 'Position',
		            valueField		: 'id',
		            displayField	: 'description',
		            emptyText		: 'Computer Programmer I',
		            triggerAction	: 'all',
		            minChars    	: 3,
		            enableKeyEvents	: true,
		            readOnly    	: false,
		            matchFieldWidth	: true,
		            forceSelection	: true,
		            store: new Ext.data.JsonStore({
				        proxy: {
				            type: 'ajax',
				            url: 'commonquery/combolist',
				            timeout : 1800000,
				            extraParams: {query:null, type: 'positions'},
				            reader: {
				                type: 'json',
				                root: 'data',
				                idProperty: 'id'
				            }
				        },
				        params: {start: 0, limit: 10},
				        fields: [{name: 'id', type: 'int'}, 'description']
		            }),
		            listeners: 
		            {
		                select: function (combo, record, index)
		                {		 
		                	Ext.get('position_id').dom.value = record[0].data.id;
		                	Ext.getCmp("position_id").setRawValue(record[0].data.description);
		                }
		            }
		        },
		        {
                    xtype: 'button',
                    hidden: crudMaintenance,
                    margins     : '0 0 0 5',
                    text: '...',
                    tooltip: 'Add/Edit/Delete Position',
                    handler: function (){ viewMaintenance('positions'); }
		        }]
            },{
				xtype	: 'numberfield',	
				id		: 'salary_grade',
				name	: 'salary_grade',
				fieldLabel: 'Salary Grade',
				emptyText: '11'
			}]
		});

		positionWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Position Details',
			closable	: true,
			modal		: true,
			width		: 360,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [positionForm],
			buttons: [{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!positionForm.form.isValid()){
						errorFunction("Error!",'Please fill-in the required fields (Marked red).');
					    return;
			        }
					Ext.Msg.show({
						title	: 'Confirmation',
						msg		: 'Are you sure you want to Save?',
						width	: '100%',
						icon	: Ext.Msg.QUESTION,
						buttons	: Ext.Msg.YESNO,
						fn: function(btn){
							if (btn == 'yes')
								positionsCRUD(type);
						}
					});
			    }
			}, {
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	positionWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			positionForm.getForm().load({
				url: 'adminservices_plantilla/view',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: { id: this.plantillaID },		
				success: function(form, action) {
					positionWindow.show();
					var data = action.result.data;

					Ext.getCmp("employment_status").setRawValue(data.employment_status_description);
					Ext.get('employment_status').dom.value = data.employment_status_id;
					Ext.getCmp("position_id").setRawValue(data.position_description);
					Ext.get('position_id').dom.value = data.position_id;
					Ext.getCmp("division_id").setRawValue(data.division_description);
					Ext.get('division_id').dom.value = data.division_id;
					itemNumberHistoryID = data.itemnumber_history_id;
					itemNumberHistoryYear = data.year;
					Ext.getCmp('item_number').setReadOnly(true);
				},		
				failure: function(f,action) { errorFunction("Error!",action.result.data); }
			});
		}
		else
			positionWindow.show();
	}
}