var incumbentWindow, incumbentID, incumbentForm;
 
function incumbentCRUD(type)
{ 
	params = new Object();

	params.id					= incumbentID;
	params.plantilla_header_id 	= plantillaID;
	params.type					= type;

	if (type == "Delete")
		deleteFunction('adminservices_plantilla/incumbents_crud', params, 'incumbentsListGrid', 'positionsListGrid');
	else
	{
		params.staff_id		= Ext.get('staff_id').dom.value;

		addeditFunction('adminservices_plantilla/incumbents_crud', params, 'incumbentsListGrid', 'positionsListGrid', incumbentForm, incumbentWindow);
	}
}

function AddEditDeleteIncumbent(type, calendar_year)
{          
	var required = '<span style="color:red;font-weight:bold" data-qtip="Required">*</span>';

	if(type == 'Edit' || type == 'Delete')	
	{
		var sm = Ext.getCmp("incumbentsListGrid").getSelectionModel();
		if (!sm.hasSelection())
		{
			warningFunction("Warning!","Please select a record.");
			return;
		}
		incumbentID = sm.selected.items[0].data.id;
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
					incumbentCRUD(type);
			}
		});
	}
	else
	{
		incumbentForm = Ext.create('Ext.form.Panel', {
			border		: false,
			bodyStyle	: 'padding:15px;',		
			fieldDefaults: {
				labelAlign	: 'right',
				labelWidth: 80,
				afterLabelTextTpl: required,
				msgTarget: 'side',
				anchor	: '100%', 
				allowBlank: false
	        },
			items: [{							
	            xtype   	: 'combo',
	            id 			: 'staff_id',
	            fieldLabel	: 'Staff Name',
	            valueField	: 'id',
	            displayField: 'staff_name',
	            allowBlank	: false,
	            triggerAction: 'all',
	            minChars    : 2,
	            forceSelection: true,
	            enableKeyEvents: true,
	            readOnly    : false,
	            store: new Ext.data.JsonStore({
			        proxy: {
			            type: 'ajax',
			            url: 'adminservices_plantilla/staffslist',
			            timeout : 1800000,
			            extraParams: {query:null},
			            reader: {
			                type: 'json',
			                root: 'data',
			                idProperty: 'id'
			            }
			        },
			        params: {start: 0, limit: 10},
			        fields: [{name: 'id', type: 'int'}, 'staff_name']
	            }),
	            listeners: 
	            {
	                select: function (combo, record, index)
	                {		   
	                	Ext.get('staff_id').dom.value  = record[0].data.id;     		
	                }
	            }
			}, {
				xtype		: 'datefield',
				name		: 'date_appointed',
				fieldLabel	: 'Date of Appointment'
            }, {
                xtype		: 'checkbox',
                id 			: 'status',
                name 		: 'status',                                    
                inputValue	: 1,   
                checked 	: true,
                margin  	: '0 0 0 85',
                boxLabel 	: 'Up to Present',
                listeners 	:
                {
                	change : function(checkbox, newValue, oldValue, eOpts) 
                	{
                		var datevacated_field = checkbox.up('form').down('datefield').next('datefield');
                		
                		if(newValue) {
            				datevacated_field.hide();
            				datevacated_field.disable();
            			}

                		else {
                			datevacated_field.show();
                			datevacated_field.enable();
                		}
                	}
                }
            }, {
				xtype		: 'datefield',
				id 			: 'date_vacated',
				name		: 'date_vacated',
				fieldLabel	: 'Date Vacated',
				hidden 		: true,
				disabled 	: true
            }, {
				xtype		: 'textarea',
				name		: 'remarks',
				fieldLabel	: 'Remarks',
				allowBlank	: true,
				afterLabelTextTpl: null
            }]
		});

		incumbentWindow = Ext.create('Ext.window.Window', {
			title		: type + ' Incumbent',
			closable	: true,
			modal		: true,
			width		: 350,
			autoHeight	: true,
			resizable	: false,
			buttonAlign	: 'center',
			header: {titleAlign: 'center'},
			items: [incumbentForm],
			buttons: [
			{
			    text	: 'Save',
			    icon	: './image/save.png',
			    handler: function ()
			    {
					if (!incumbentForm.form.isValid()){
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
								incumbentCRUD(type);
						}
					});
			    }
			},
			{
			    text	: 'Close',
			    icon	: './image/close.png',
			    handler: function ()
			    {
			    	incumbentWindow.close();
			    }
			}],
		});

		if(type == 'Edit')
		{
			incumbentForm.getForm().load({
				url: 'adminservices_plantilla/incumbentview',
				timeout: 30000,
				waitMsg:'Loading data...',
				params: {
					id: this.incumbentID, 
					type: type
				},
				success: function(form, action) {
					incumbentWindow.show();
					var data = action.result.data;

					Ext.getCmp("staff_id").setRawValue(data.staff_name);
					Ext.get('staff_id').dom.value = data.staff_id;

					if(data.date_vacated != "PRESENT") {
						var datevacated_field = Ext.getCmp("date_vacated");

						datevacated_field.show();
                		datevacated_field.enable();
                		Ext.getCmp('status').setValue(false);
					}
				},
				failure: function(f,action) { errorFunction("Error!",'Please contact system administrator.'); }
			});
		}
		else
			incumbentWindow.show();
	}
}