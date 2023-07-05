var staffcrudWindow, staffID, staffCRUDForm, tempKey;
//var is_division_head, is_section_head;

function staffCRUD(type, grid) 
{
	params = new Object();
	params.id	= staffID;
	params.type	= type;

	if (type == "Delete")
		deleteFunction('userinformation/crud', params, grid, null);
	else
	{	
		params.department			= Ext.get('department').dom.value;
		params.division 			= Ext.get('division').dom.value;
		params.section 				= Ext.get('section').dom.value;
		params.position				= Ext.get('position').dom.value;
		params.employment_status 	= Ext.get('employment_status').dom.value;
		// params.is_division_head		= Ext.getCmp("is_division_head").getRawValue();
		// params.is_section_head 		= Ext.getCmp("is_section_head").getRawValue();
		params.temp_key				= tempKey;
		addeditFunction('userinformation/crud', params, grid, null, staffCRUDForm, staffcrudWindow);
	}
	Ext.getCmp("pageToolbar").moveFirst();
}

function AddEditDeleteStaff(type, grid)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp(grid).getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select record.");
			return;
		}		
		staffID = sm.selected.items[0].data.id;
		tempKey = sm.selected.items[0].data.security_key;
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
					staffCRUD(type, grid);
			}
		});
	}
	else
	{
		staffCRUDForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 90,
				afterLabelTextTpl: required,
				msgTarget: 'side',
				anchor	: '100%',
				allowBlank: false
	        },
			items: [{
	            xtype: 'radiogroup',
	            fieldLabel: 'Type',
	            items: [
	                {boxLabel: 'Staff', name: 'usertype', inputValue: 1, checked: true},
	                {boxLabel: 'Clients', name: 'usertype', inputValue: 0 }
	            ],
			}, {
				xtype		: 'numberfield',
				id			: 'employee_id',
				name		: 'employee_id',
				fieldLabel	: 'Employee ID'
			}, {
				xtype		: 'textfield',
				id			: 'fname',
				name		: 'fname',
				fieldLabel	: 'First Name'
			}, {
				xtype		: 'textfield',
				id			: 'mname',
				name		: 'mname',
				allowBlank	: true,
				afterLabelTextTpl: null,
				fieldLabel	: 'Middle Initial'
			}, {
				xtype		: 'textfield',
				id			: 'lname',
				name		: 'lname',
				fieldLabel	: 'Last Name'
			}, {
                xtype: 'fieldcontainer',
                labelStyle: 'font-weight:bold;padding:0;',
                layout: 'hbox',
                items: [
                {
		            xtype   		: 'combo',
		            flex			: 1,
		            id				: 'department',
		            fieldLabel		: 'Department',
		            valueField		: 'id',
		            displayField	: 'description',
		            triggerAction	: 'all',
		            minChars    	: 3,
		            enableKeyEvents : true,
		            readOnly    	: false,
		            matchFieldWidth : true,
		            forceSelection	: true,
		            editable 		: false,
		            store: new Ext.data.JsonStore({
				        proxy: {
				            type: 'ajax',
				            url: 'commonquery/combolist',
				            timeout : 1800000, 
				            extraParams: {query:null, type: 'departments'},
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
		                	Ext.get('department').dom.value = record[0].data.id;
		                }
		            }
		        },
		        {
		        	xtype: 'button',
		        	hidden: crudMaintenance,
		        	margins		: '0 0 0 5',
		        	text: '...',
		        	tooltip: 'Add/Edit/Delete Department',
		        	handler: function (){ viewMaintenance('departments'); }
		        }]
            },{
                xtype: 'fieldcontainer',
                labelStyle: 'font-weight:bold;padding:0;',
                layout: 'hbox',
                items: [
                {
		            xtype   		: 'combo',
		            flex			: 1,
		            id				: 'division',
		            fieldLabel		: 'Division',
		            valueField		: 'id',
		            displayField	: 'description',
		            triggerAction	: 'all',
		            minChars    	: 3,
		            enableKeyEvents	: true,
		            readOnly    	: false,
		            matchFieldWidth	: true,
		            forceSelection	: true,
		            afterLabelTextTpl: null,
		            allowBlank		: true,
		            editable		: false,
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
		                	Ext.get('division').dom.value = record[0].data.id;
		                }
		            }
		        },
		        {
                    xtype: 'button',
                    hidden: crudMaintenance,
                    margins     : '0 0 0 5',
                    text: '...',
                    tooltip: 'Add/Edit/Delete Division',
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
		            id				: 'section',
		            fieldLabel		: 'Section',
		            valueField		: 'id',
		            displayField	: 'description',
		            triggerAction	: 'all',
		            minChars    	: 3,
		            enableKeyEvents	: true,
		            readOnly    	: false,
		            matchFieldWidth	: true,
		            forceSelection	: true,
		            afterLabelTextTpl: null,
		            allowBlank: true,
		            store: new Ext.data.JsonStore({
				        proxy: {
				            type: 'ajax',
				            url: 'commonquery/combolist',
				            timeout : 1800000,
				            extraParams: {query:null, type: 'sections'},
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
		                	Ext.get('section').dom.value = record[0].data.id;
		                }
		            }
		        },
		        {
                    xtype: 'button',
                    hidden: crudMaintenance,
                    margins     : '0 0 0 5',
                    text: '...',
                    tooltip: 'Add/Edit/Delete Section',
                    handler: function (){ viewMaintenance('sections'); }
                }]
            },{
                xtype: 'fieldcontainer',
                labelStyle: 'font-weight:bold;padding:0;',
                layout: 'hbox',
                items: [
                {
		            xtype   		: 'combo',
		            flex			: 1,
		            id				: 'position',
		            fieldLabel		: 'Position',
		            valueField		: 'id',
		            displayField	: 'description',
		            triggerAction	: 'all',
		            minChars    	: 3,
		            enableKeyEvents	: true,
		            readOnly    	: false,
		            matchFieldWidth	: true,
		            forceSelection	: true,
		            afterLabelTextTpl: null,
		            allowBlank		: true,
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
		                	Ext.get('position').dom.value = record[0].data.id;
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
                xtype: 'fieldcontainer',
                labelStyle: 'font-weight:bold;padding:0;',
                layout: 'hbox',
                items: [
                {
		            xtype   		: 'combo',
		            flex			: 1,
		            id				: 'employment_status',
		            fieldLabel		: 'Employment Status',
		            valueField		: 'id',
		            displayField	: 'description',
		            triggerAction	: 'all',
		            minChars    	: 3,
		            enableKeyEvents	: true,
		            readOnly    	: false,
		            matchFieldWidth	: true,
		            forceSelection	: true,
		            allowBlank		: true,
		            editable		: false,
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
		                select: function (combo, record, index)
		                {		 
		                	Ext.get('employment_status').dom.value = record[0].data.id;
		                }
		            }
		        }]
            },{
				xtype		: 'textfield',
				name		: 'email',
				fieldLabel	: 'Email',
				emptyText	: 'Used to retrieve username and password...',
				vtype		: 'email',
				hidden		: true,
				disabled	: true
            },{
                xtype: 'fieldcontainer',
                labelStyle: 'font-weight:bold;padding:0;',
                layout: 'hbox',
                items: [{
                	xtype		: 'checkbox',
	                id  		: 'is_division_head',
	                name 		: 'is_division_head',                            
	                inputValue	: 1,   
	                checked 	: false,
	                margin  	: '0 0 0 93',
	                boxLabel 	: 'Division Head'
		        },{
		        	xtype		: 'checkbox',
	                id  		: 'is_section_head',
	                name 		: 'is_section_head',                                    
	                inputValue	: 1,   
	                checked 	: false,
	                margin  	: '0 0 0 60',
	                boxLabel 	: 'Section Head'
		        }]
            },{
                xtype		: 'checkbox',
                id  		: 'status',
                name 		: 'status',                                    
                inputValue	: 1,   
                checked 	: true,
                margin  	: '0 0 0 93',
                boxLabel 	: 'Active',
                hidden 		: true
            }]
		});

		staffcrudWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Staff',
			closable	: true,
			modal		: true,
			width		: 450,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [staffCRUDForm],
			buttons: [
			{
			    text	: 'Save',
			    icon	: '../image/save.png',
			    handler: function ()
			    {
					if (!staffCRUDForm.form.isValid()){
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
								staffCRUD(type, grid);
						}
					});
			    }
			},
			{
			    text	: 'Close',
			    icon	: '../image/close.png',
			    handler: function ()
			    {
			    	staffcrudWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{ 
			staffCRUDForm.getForm().load({
				url: 'userinformation/view',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.staffID, type: type
				},		
				success: function(form, action) {					
					staffcrudWindow.show();
					var data = action.result.data;
					Ext.getCmp("department").setRawValue(data.department_desc);
					Ext.getCmp("division").setRawValue(data.division_desc);
					Ext.getCmp("section").setRawValue(data.section_desc);
					Ext.getCmp("position").setRawValue(data.position_desc);
					Ext.getCmp("employment_status").setRawValue(data.employment_status_desc);
					
					Ext.get('department').dom.value = data.department_id;
					Ext.get('division').dom.value = data.division_id;
					Ext.get('section').dom.value = data.section_id;
					Ext.get('position').dom.value = data.position_id;
					Ext.get('employment_status').dom.value = data.employment_status_id;	

					// Ext.getCmp('is_division_head').setValue(data.is_division_head);	
					// Ext.getCmp('is_section_head').setValue(data.is_section_head);
				},		
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			staffcrudWindow.show();

		Ext.getCmp("fname").focus();
	}
}