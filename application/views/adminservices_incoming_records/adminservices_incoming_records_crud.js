var incomingRecordWindow, incomingRecordID, incomingRecordForm;
var record_type_id, from_id, to_id, communication_number;
var division_id, action_taken_id, side_notes, status;
var today = new Date();
today.setDate(today.getDate()+15)
var dd = today.getDate();
var mm = today.getMonth() + 1;
var yyyy = today.getFullYear();
var dead_date = mm + '/' + dd + '/' + yyyy;

function incomingRecordCRUD(type)
{
	params 		= new Object();
	params.id	= incomingRecordID;	
	params.type	= type;

	if (type == "Delete")
		deleteFunction('adminservices_incoming_records/crud', params, 'incomingRecordsListGrid', null);
	else
	{
		params.communication_number = communication_number;
		params.from_name = Ext.getCmp("from_name").getRawValue();
		params.from_office = Ext.getCmp("from_office").getRawValue();
		params.to_name 				= Ext.getCmp("to_name").getRawValue();
		params.from_id 				= from_id;
		params.to_id 				= to_id;
		params.record_type_id = record_type_id;
		params.date_deadline = Ext.getCmp("date_deadline").getRawValue();

		if (type == "Edit")
		{
			params.division_id = division_id;
			params.section_id = section_id;
			params.from_office = from_office;
			params.action_taken_id 	= action_taken_id;
			params.side_notes 		= side_notes;
			params.status = status;
			params.date_deadline = Ext.getCmp("date_deadline").getRawValue();
		}

		//this function is in common helper, therefore make the function there
		addeditFunction('adminservices_incoming_records/crud', params, 'incomingRecordsListGrid', null, incomingRecordForm, incomingRecordWindow);
	}
}

function AddEditDeleteIncomingRecord(type)
{
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';
	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("incomingRecordsListGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select record.");
			return;
		}

		if(sm.selected.items[0].data.status == 'Pending' || sm.selected.items[0].data.status == 'Approved' || sm.selected.items[0].data.status == 'Denied')
		{
			errorFunction("Error!","Cannot "+type+" "+sm.selected.items[0].data.status+" record.");
			return;
		}

		incomingRecordID = sm.selected.items[0].data.id;
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
					incomingRecordCRUD(type);
			}
		});
	}
	else
	{	
		incomingRecordForm = Ext.create('Ext.form.Panel', {
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
				xtype		: 'numberfield',	
				id			: 'sequence_number',
				name		: 'sequence_number',
				fieldLabel	: 'Sequence #',
				emptyText	: '399'
			},{
                xtype   : 'fieldcontainer',
                flex    : 1,
                labelStyle: 'font-weight:bold;padding:0',
                layout: { type: 'hbox', align: 'middle'},
					items: [
					{
                    xtype       	: 'combo',
                    flex        	: 1,
                    labelAlign  	: 'right',
                    id          	: 'record_type',
                    fieldLabel  	: 'Com. Type',
                    valueField  	: 'id',
                    displayField	: 'description',
                    emptyText		: 'Letter',
                    triggerAction 	: 'all',
                    value 			: 1,	//defaults to 'letter'
                    minChars    	: 3,
                    enableKeyEvents	: true,
                    matchFieldWidth : true,
                    forceSelection  : true,
                    editable 		: false,
                    store: new Ext.data.JsonStore({
                        proxy: {
                            type 	: 'ajax',
                            url 	: 'commonquery/combolist',
                            timeout : 1800000,
                            extraParams: {query:null, type: 'record_types'},
                            reader 	: {
                                type 	: 'json',
                                root 	: 'data',
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
                            Ext.get('record_type').dom.value = record[0].data.id;
                            Ext.getCmp("record_type").setRawValue(record[0].data.description);

                            if(record[0].data.description == 'Directive' || record[0].data.description == 'Memo' || record[0].data.description == 'Ordinance' || record[0].data.description == 'Resolution')
                            {
                            	displayComponent ("communication_number", "show");
                            	displayComponent ("endorsement_number", "hide");
                            }
                            else if (record[0].data.description == 'Endorsement')
                            {
                            	displayComponent ("endorsement_number", "show");
                            	displayComponent ("communication_number", "hide");
                            }
                            else 
                            {
                            	displayComponent ("endorsement_number", "hide");
                            	displayComponent ("communication_number", "hide");
                            }
                        }
                    }
                },{
                    xtype: 'button',
                    hidden: crudMaintenance,
                    margins     : '0 0 0 5',
                    text: '...',
                    tooltip: 'Add/Edit/Delete Communication Type',
                    handler: function (){ viewMaintenance('record_types', null); }
                }]
            },{
            	xtype	: 'textfield',	
				id		: 'communication_number',
				name	: 'communication_number',
				hidden	: true,
				disabled: true,
				fieldLabel: '#',
           	},{
				xtype		:'combo',
				id			: 'endorsement_number',
				name		: 'endorsement_number',
				fieldLabel 	: '#',
				mode		: 'local',
				triggerAction: 'all',
				editable	: false,
				hidden	: true,
				disabled: true,
				store	: new Ext.data.ArrayStore({
					fields: ['id', 'number'],
					data: [[1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th']]
				}),
				listeners:
	            {
	                select: function (combo, record, index)
	                {
	                	communication_number = record[0].data.number;
	                }
	            },
				valueField 	: 'number',
				displayField: 'number'
			},{
				xtype	: 'textarea',	
				id		: 'subject',
				name	: 'subject',
				fieldLabel: 'Subject',
				emptyText: 'MEMO NO. 0242-18 POSTING OF WEEKLY QUOTATION: IT IS BY ACTS AND NOT BY IDEAS THAT PEOPLE LIVE---ANATOLE FRANCE'
			},{
                xtype       : 'combo',
                flex        : 1,
                labelAlign  : 'right',
                id          : 'from_name',
                fieldLabel  : 'From',
                valueField  : 'id',
                displayField: 'description',
                emptyText	: 'John Doe',
                triggerAction: 'all',
                minChars    : 3,
                enableKeyEvents: true,
                matchFieldWidth: true,
                store: new Ext.data.JsonStore({
                    proxy: {
                        type: 'ajax',
                        url: 'commonquery/combolist',
                        timeout : 1800000,
                        extraParams: {query:null, type: 'adminservices_records_from_to'},
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
                        Ext.get('from_name').dom.value = record[0].data.id;
                        Ext.getCmp("from_name").setRawValue(record[0].data.description);
                    }
                }
			}, {
					xtype: 'textfield',
					fieldLabel: 'From Office',
					id: "from_office",
					emptyText: "From what office?"
				
			},{
                xtype       : 'combo',
                flex        : 1,
                labelAlign  : 'right',
                id          : 'to_name',
                fieldLabel  : 'For (To)',
                valueField  : 'id',
                displayField: 'description',
                emptyText	: 'Jane Doe',
                triggerAction: 'all',
                minChars    : 3,
                enableKeyEvents: true,
                matchFieldWidth: true,
                store: new Ext.data.JsonStore({
                    proxy: {
                        type: 'ajax',
                        url: 'commonquery/combolist',
                        timeout : 1800000,
                        extraParams: {query:null, type: 'adminservices_records_from_to'},
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
                        Ext.get('to_name').dom.value = record[0].data.id;
                        Ext.getCmp("to_name").setRawValue(record[0].data.description);
                    }
                }
            },{
            	xtype		: 'datefield',
            	id 			: 'date_communication',
            	name 		: 'date_communication',
            	fieldLabel	: 'Com. Date',
            	emptyText	: '03/06/2018'
				},

				{	
				xtype: 'datefield',
				id: 'date_deadline',
				name: 'date_deadline',
				fieldLabel: 'Deadline',
				emptyText: dead_date,
				value: dead_date
                }



			]
		});

		incomingRecordWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Incoming Record',
			closable	: true,
			modal		: true,
			width		: 400,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [incomingRecordForm],
			buttons: [
			{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!incomingRecordForm.form.isValid()){
						errorFunction("Error!",'Please fill-in the required fields (Marked red).');
					    return;
			        }
					Ext.Msg.show({
						title	: 'Confirmation',
						msg		: 'Are you sure you want to save?',
						width	: '100%',
						icon	: Ext.Msg.QUESTION,
						buttons	: Ext.Msg.YESNO,
						fn: function(btn){
							if (btn == 'yes')
							{
								record_type_id = Ext.get('record_type').dom.value;
								from_id 	= Ext.get('from_name').dom.value;
								to_id		= Ext.get('to_name').dom.value;
								incomingRecordCRUD(type);
							}
						}
					});
			    }
			},
			{
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	incomingRecordWindow.close();
			    }
			}]
		});

		if(type == 'Edit')
		{
			incomingRecordForm.getForm().load({
				url: 'adminservices_incoming_records/headerview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: { id: this.incomingRecordID },		
				success: function(form, action) {
					incomingRecordWindow.show();
					var data = action.result.data;

					if(data.record_type == 'Directive' || data.record_type == 'Memo' || data.record_type == 'Ordinance')
                    {
                    	displayComponent ("communication_number", "show");
                    	displayComponent ("endorsement_number", "hide");
                    }
                    else if (data.record_type == 'Endorsement')
                    {
                    	Ext.getCmp("endorsement_number").setRawValue(data.communication_number);
                    	displayComponent ("endorsement_number", "show");
                    	displayComponent ("communication_number", "hide");
                    }

					Ext.get('record_type').dom.value = data.record_type_id;
            		Ext.getCmp("record_type").setRawValue(data.record_type);
					Ext.get('from_name').dom.value = data.from_id;
					Ext.getCmp("from_office").setRawValue(data.from_office);
            		Ext.getCmp("from_name").setRawValue(data.from_name);
            		Ext.get('to_name').dom.value = data.to_id;
            		Ext.getCmp("to_name").setRawValue(data.to_name);

					division_id = data.division_id;
					section_id = data.section_id;
					action_taken_id 	= data.action_taken_id;
					side_notes 			= data.side_notes;
					status 				= data.status;
				},		
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			incomingRecordWindow.show();
	}
}