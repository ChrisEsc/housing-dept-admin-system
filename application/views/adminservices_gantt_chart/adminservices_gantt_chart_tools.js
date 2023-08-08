function toolAssignStaff() {
    var section_activities_list_log = new Ext.data.Store({
        proxy: {
            type: 'ajax',
            url: 'commonquery/combolist_activities?section_id='+0,
            //url: 'logbookapi:4002/sectionactivity/getStaffActivityTarget/' + dlSectionID + '/' + '0' + '/' + dlYear,
            timeout: 1800000,
            editable: false,
            //params: {section_id: dlSectionID},
            //extraParams: { query: null, type: 'sections' },
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'sectionactivityID'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'sectionactivityID', type: 'int' }, { name: 'activity' }]
    });
    var staff_list = new Ext.data.Store({
        //id: 'storeStaffList'
        proxy: {
            type: 'ajax',
            url: 'logbookapi:4002/passslip/passSlipStaff/' +0,
            timeout: 1800000,
            reader: {
                type: 'json',
                root: 'data',
                idProperty: 'staffid'
            }
        },
        autoLoad: true,
        params: { start: 0, limit: 10 },
        fields: [{ name: 'staffID', type: 'int' }, { name: 'staffName' }]
    });

    var winSA = Ext.create('Ext.window.Window', {
        id: 'winStaffAssign',
        title: "Assign Staff",
        scrollable: true,
        setAutoScroll: true,
        center: true,
        width: '45%',
        height: '50%',
        items: [{
            xtype: 'container', layout: 'fit', margin: '6px', setAutoScroll: true,
            items:
                [{
                    xtype: 'combobox', id: 'cmbSection2', editable: true, anyMatch: false, allowBlank: false, fieldLabel: 'Section',
                    store: section_names,
                    displayField: 'description', valueField: 'id', emptyText: 'Section', allowBlank: false,
                    width: '30%',
                    margin: '12px',
                    hidden: false,
                    listeners: {
                        select: function (combo, record, index) {
                            //status = record[0].data.id;
                            sectionID = Ext.getCmp('cmbSection2').getValue('id');
                            //Ext.getCmp("cmbSection").getStore().proxy.extraParams["query"] = section_id;
                            //Ext.getCmp('cmbSection').getStore().load();
                            newURL = 'logbookapi:4002/passslip/passSlipStaff/' + sectionID ;
                            Ext.getCmp('cmbStaff').store.proxy.url = newURL;
                            Ext.getCmp('cmbStaff').store.load();
                            //'commonquery/combolist_activities?section_id='+dlSectionID
                            sectionID = Ext.getCmp('cmbSection2').getValue('id');
                            newURL = 'commonquery/combolist_activities?section_id=' + sectionID;
                            Ext.getCmp('cmbSectionActivities').store.proxy.url = newURL;
                            Ext.getCmp('cmbSectionActivities').store.load();
                        }
                    }
                }, {
                    xtype: 'combobox', id: 'cmbSectionActivities', editable: true, anyMatch: false, allowBlank: false,
                    fieldLabel: 'Section Activity:', margin: '12px', store: section_activities_list_log,
                    displayField: 'activity',
                    valueField: 'id',
                    emptyText: 'Section Activities',
                    hidden: false,
                    listeners: {
                        change: function (cb, nv, ov) {
                            if (nv) {
                                
                            }
                        }
                    }
                }, {
                    xtype: 'combobox', id: 'cmbStaff',
                    editable: false, anyMatch: false,
                    allowBlank: false, fieldLabel: 'Name:',
                    margin: '12px', store: staff_list,
                    displayField: 'staffName', valueField: 'staffID', emptyText: 'Staff',
                    multiSelect: true,
                    listeners: {
                        select: function (combo, record, index) {
                        }
                    }
                }]
            }
        ],
        buttons: [
            {
                text: 'Submit',
                handler: function () {
                    staffArray = Ext.getCmp('cmbStaff').getValue();
                    staffArray.forEach((item) => {
                        sectionActivityID = Ext.getCmp('cmbSectionActivities').getValue()
                        staffID = item
                        Ext.Ajax.request({
                            url: 'adminservices_gantt_chart/toolAssignToTask?staff_id=' + staffID + '&activity_id=' + sectionActivityID,
                            method: 'POST',
                            waitTitle: 'Connecting',
                            waitMsg: 'Sending data...',
                            success: function (response, opts) {
                                Ext.Msg.alert('Status', 'Successfully assigned staff to task!');
                                Ext.getCmp('ganttListGrid').getStore().load();
                                winSA.close();
                            },
                            failure: function (response, opts) {
                                Ext.Msg.alert('Status', 'Failed to assign staff to task!');
                            }
                        })
                    })
                }
            },{
                text: 'Close',
                handler: function () {
                    winSA.close();
                }
            }]
    });
    winSA.show();
}