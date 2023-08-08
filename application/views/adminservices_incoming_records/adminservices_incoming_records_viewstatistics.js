function ViewStatistics()
{
    var selectedBar = 0;

    // prepare data for year store
    var division_id = 0;
    var calendar_year = new Date().getFullYear();
    var years = [];
    for(var i=(calendar_year-2); i<=(calendar_year); i++) years.push([i]);
    var yearsStore = new Ext.data.SimpleStore
    ({
          fields : ['years'],
          data : years
    });

    var store = new Ext.data.JsonStore({
        pageSize    : 12,
        storeId     : 'myStore',
        proxy : {
            type        : 'ajax',
            url         : 'adminservices_incoming_records/viewstatistics',
            timeout     : 1800000,
            extraParams : {calendar_year: calendar_year, division_id: division_id},
            remoteSort  : false,
            params      : {start:0, limit: 11},
            reader      : {
                type        : 'json',
                root        : 'statistics_details',
                idProperty  : 'id',
                totalProperty: 'totalCount'
            }
        },
        listeners   : {
            beforesort: function() {
                if (barChart) {
                    var a = barChart.animate;
                    barChart.animate = false;
                    barChart.series.get(0).unHighlightItem();
                    barChart.animate = a;
                }
            },
            //add listener to (re)select bar item after sorting or refreshing the dataset.
            refresh: {
                fn: function() {
                    if (selectedRec) {
                        highlightBar(selectedRec);
                    }
                },
                // Jump over the chart's refresh listener
                delay: 1
            }
        },
        fields: ['calendar_month', {name: 'Answered', type: 'int'}, {name: 'Unanswered', type: 'int'}, {name: 'Unassigned', type: 'int'}, {name: 'shortest_duration', type: 'int'}, {name: 'longest_duration', type: 'int'}, 'average_duration']
    });

    // initial values for radar 1
    var radarDaysStore = Ext.create('Ext.data.JsonStore', {
        fields: ['name', 'data'],
        data: [{
            'name': 'Shortest',
            'data': 30
        }, {
            'name': 'Longest',
            'data': 30
        }, {
            'name': 'Average',
            'data': 30
        }]
    });

    // initial values for radar 2
    var radarQuantityStore = Ext.create('Ext.data.JsonStore', {
        fields: ['name', 'data'],
        data: [{
            'name': 'Answered',
            'data': 100
        }, {
            'name': 'Unanswered',
            'data': 100
        }, {
            'name': 'Unassigned',
            'data': 100
        }]
    });

    var form = false,
        selectedRec = false,
        //performs the highlight of an item in the bar series
        highlightBar = function(storeItem) {
            var name = storeItem.get('calendar_month'),
                series = barChart.series.get(0),
                i, items, l;
            
            series.highlight = true;
            series.unHighlightItem();
            series.cleanHighlights();
            for (i = 0, items = series.items, l = items.length; i < l; i++) {
                if (name == items[i].storeItem.get('calendar_month')) {
                    series.highlightItem(items[i+selectedBar]);
                    break;
                }
            }
            selectedBar = 0;
            series.highlight = false;
        },
        // Loads fresh records into the radar store
        updateRadarChartDays = function(rec) {
            radarDaysStore.loadData([{
                'name': 'Shortest',
                'data': rec.get('shortest_duration')
            }, {
                'name': 'Longest',
                'data': rec.get('longest_duration')
            }, {
                'name': 'Average',
                'data': rec.get('average_duration')
            }]);
        },
        // Loads fresh records into the radar store 
        updateRadarChartQuantity = function(rec) {
            radarQuantityStore.loadData([{
                'name': 'Answered',
                'data': rec.get('Answered')
            }, {
                'name': 'Unanswered',
                'data': rec.get('Unanswered')
            }, {
                'name': 'Unassigned',
                'data': rec.get('Unanswered')
            }]);
        };;
    
    //bar chart
    var barChart = Ext.create('Ext.chart.Chart', {
        id      : 'barChart',
        margin  : '0 0 3 0',
        cls     : 'x-panel-body-default',
        flex    : 3,
        shadow  : true,
        animate : true,
        store   : store,
        mask    : 'horizontal',
        legend  : {
            position : 'right'
        },
        listeners: {
            select: {
                fn  : function(me, selection) {
                    selection.x += 50;  // x axis offset to resolve ext charts bug
                    me.setZoom(selection);
                    me.mask.hide();
                }
            },

        },
        axes: [{
            type    : 'Numeric',
            position: 'left',
            title : 'Num. of Comms.',
            fields  : ['Answered', 'Unanswered', 'Unassigned'],
            minimum : 0,
            // maximum : 120,
            // hidden  : true
        }, {
            type    : 'Category',
            position: 'bottom',
            title: 'Months',
            fields  : ['calendar_month'],
            label   : {
                renderer: function(v) {
                    return Ext.String.ellipsis(v, 15, false);
                },
                font    : '9px Arial',
                rotate  : {
                    degrees: 360
                }
            }
        }],
        series: [{
            type    : 'column',
            axis    : 'left',
            // style   : {
            //     fill    : '#456d9f'
            // },
            // highlightCfg: {
            //     fill    : '#a2b5ca'
            // },
            label   : {
                contrast: true,
                display : 'insideEnd',
                field   : ['Answered', 'Unanswered', 'Unassigned'],
                //color   : '#000',
                orientation: 'vertical',
                'text-anchor': 'middle'
            },
            listeners: {
                itemmouseup: function(item) {
                    var series = barChart.series.get(0);
                    var index = Ext.Array.indexOf(series.items, item);

                    gridPanel.getSelectionModel().select(0);    // workaround for selectionchange not firing

                    i = index;
                    while (i > 2) i -= 3;
                    selectedBar = i;

                    index = Math.floor(index/3);
                    gridPanel.getSelectionModel().select(index);
                }
            },
            xField  : 'calendar_month',
            yField  : ['Answered', 'Unanswered', 'Unassigned']
        }],
        tbar: [{
            text: 'Save Chart',
            handler: function() {
                Ext.MessageBox.confirm('Confirm Download', 'Would you like to download the chart as an image?', function(choice){
                    if(choice == 'yes'){
                        chart.save({
                            type: 'image/png'
                        });
                    }
                });
            }
        }, {
            text: 'Reload Data',
            handler: function() {
                // Add a short delay to prevent fast sequential clicks
                window.loadTask.delay(100, function() {
                    store1.loadData(generateData());
                });
            }
        }],

    });

    var formPanel = Ext.create('Ext.form.FormPanel', {
        id      : 'formPanel',
        flex    : 1,
        layout  : {
            type    : 'vbox',
            align   :'stretch'
        },
        margin  : '0 0 0 5',
        title   : 'Monthly Summary',
        items   : [{
            margin  : '5',
            xtype   : 'fieldset',
            title   :'Details',
            defaults: {
                width       : 200,
                labelWidth  : 100,
                minValue    : 0,
                readOnly    : true,
                bubbleEvents: ['change']
            },
            defaultType     : 'numberfield',
            items: [{
                xtype       : 'combo',
                id          : 'calendar_year',
                name        : 'calendar_year',
                store       : yearsStore,
                mode        : 'local',
                displayField: 'years',
                valueField  : 'years',
                value       : new Date().getFullYear(),
                allowBlank  : false,
                editable    : false,
                fieldLabel  : 'Year',
                readOnly    : false,
                listeners   :
                {
                    select: function (combo, record, index)
                    {
                        calendar_year = Ext.getCmp("calendar_year").getRawValue();
                        Ext.getCmp("gridPanel").getStore().proxy.extraParams["calendar_year"] = calendar_year;
                        RefreshStatisticsGridStore();
                    }
                }
            }, {
                xtype       : 'combo',
                id          : 'division_description',
                name        : 'division_description',
                displayField: 'div_code',
                valueField  : 'id',
                fieldLabel  : 'Division',
                value       : 'ALL',
                triggerAction: 'all',
                enableKeyEvents: true,
                matchFieldWidth: true,
                editable    : false,
                readOnly    : false,
                store: new Ext.data.JsonStore({
                    proxy: {
                        type: 'ajax',
                        url: 'commonquery/combolist_divisions',
                        timeout : 1800000,
                        reader: {
                            type: 'json',
                            root: 'data',
                            idProperty: 'id'
                        }
                    },
                    params: {start: 0, limit: 10},
                    fields: [{name: 'id', type: 'int'}, 'div_code', 'description']
                }),
                listeners: 
                {
                    select: function (combo, record, index)
                    {        
                        Ext.get('division_description').dom.value = record[0].data.id;
                        Ext.getCmp("division_description").setRawValue(record[0].data.div_code);

                        division_id = Ext.getCmp("division_description").getValue();
                        Ext.getCmp("gridPanel").getStore().proxy.extraParams["division_id"] = division_id;
                        RefreshStatisticsGridStore();
                    }
                }
            }, {
                fieldLabel  : 'Month',
                name        : 'calendar_month',
                xtype       : 'textfield'
            }, {
                fieldLabel  : 'Answered',
                name        : 'Answered'
            }, {
                fieldLabel  : 'Unanswered',
                name        : 'Unanswered'
            }, {
                fieldLabel  : 'Unassigned',
                name        : 'Unassigned'
            }, {
                fieldLabel  : 'Shortest Dur.',
                name        : 'shortest_duration'
            }, {
                fieldLabel  : 'Longest Dur.',
                name        : 'longest_duration'
            }, {
                fieldLabel  : 'Ave. Dur.',
                name        : 'average_duration'
            }]
        }],
        listeners: {
            // buffer so we don't refire while the user is still typing
            buffer: 200,
            change: function(field, newValue, oldValue, listener) {
                if (selectedRec && form) {
                    if (newValue > field.maxValue) {
                        field.setValue(field.maxValue);
                    } else {
                        if (form.isValid()) {
                            form.updateRecord(selectedRec);
                            updateRadarChartDays(selectedRec);
                            updateRadarChartQuantity(selectedRec);
                        }
                    }
                }
            }
        }
    });

    var RefreshStatisticsGridStore = function () {
        Ext.getCmp("gridPanel").getStore().reload({params:{reset:1, start:0 }, timeout: 300000});      
    }

    //yearly summary
    var gridPanel = Ext.create('Ext.grid.Panel', {
        id      : 'gridPanel',
        flex    : 3,
        store   : store,
        title   : 'Yearly Summary',
        columns: [
            {
                text        : 'Month',
                flex        : 1,
                sortable    : true,
                dataIndex   : 'calendar_month'
            }, {
                text        : 'Answered',
                width       : 90,
                sortable    : true,
                dataIndex   : 'Answered',
                align       : 'right'
            }, {
                text        : 'Unanswered',
                width       : 110,
                sortable    : true,
                align       : 'right',
                dataIndex   : 'Unanswered'
            }, {
                text        : 'Unassigned',
                width       : 110,
                sortable    : true,
                align       : 'right',
                dataIndex   : 'Unassigned'
            }, {
                text        : 'Shortest Duration of Action Taken',
                width       : 100,
                sortable    : true,
                align       : 'right',
                dataIndex   : 'shortest_duration'
            }, {
                text        : 'Longest Duration of Action Taken',
                width       : 110,
                sortable    : true,
                align       : 'right',
                dataIndex   : 'longest_duration'
            }, {
                text        : 'Ave. Duration of Action Taken',
                width       : 100,
                sortable    : true,
                align       : 'right',
                dataIndex   : 'average_duration'
            }
        ],
        columnLines: true,
        listeners: {
            selectionchange: function(model, records) {
                var fields;
                if (records[0]) {
                    selectedRec = records[0];
                    if (!form) {
                        form = this.up('panel').up('panel').down('form').getForm();
                        fields = form.getFields();
                        fields.each(function(field){
                            if (field.name != 'calendar_month') {
                                field.setDisabled(false);
                            }
                        });
                    } else {
                        fields = form.getFields();
                    }
                    
                    // prevent change events from firing
                    form.suspendEvents();
                    form.loadRecord(selectedRec);
                    form.resumeEvents();
                    highlightBar(selectedRec);
                }
            }
        }
    });
    RefreshStatisticsGridStore();

    // radar chart 1
    var radarChartDays = Ext.create('Ext.chart.Chart', {
        margin      : '0 0 0 -10',
        insetPadding: 30,
        animate     : true,
        flex        : 1,
        store       : radarDaysStore,
        theme       : 'Blue',
        axes : [{
            steps       : 5,
            type        : 'Radial',
            position    : 'radial',
            maximum     : 30
        }],
        series: [{
            type        : 'radar',
            xField      : 'name',
            yField      : 'data',
            showInLegend: false,
            showMarkers : true,
            markerConfig: {
                radius  : 4,
                size    : 4,
                fill    : 'rgb(69,109,159)'

            },
            style: {
                fill    : 'rgb(194,214,240)',
                opacity : 0.5,
                'stroke-width': 0.5
            }
        }]
    });

    // radar chart 2
    var radarChartQuantity = Ext.create('Ext.chart.Chart', {
        margin      : '0 0 0 -10',
        insetPadding: 30,
        animate     : true,
        flex        : 1,
        store       : radarQuantityStore,
        theme       : 'Blue',
        axes : [{
            steps       : 5,
            type        : 'Radial',
            position    : 'radial'
            //maximum     : 100
        }],
        series: [{
            type        : 'radar',
            xField      : 'name',
            yField      : 'data',
            showInLegend: false,
            showMarkers : true,
            markerConfig: {
                radius  : 4,
                size    : 4,
                fill    : 'rgb(69,109,159)'
            },
            style: {
                fill    : 'rgb(194,214,240)',
                opacity : 0.5,
                'stroke-width': 0.5
            }
        }]
    });
    
    var bottomRightPanel = Ext.create('Ext.panel.Panel', {
        frame       : true, 
        flex        : 1,
        //bodyPadding : 5,
        layout: {
            type        : 'vbox',
            align       : 'stretch'
        },
        items: [radarChartDays, radarChartQuantity]
    });

    var topPanel = Ext.create('Ext.panel.Panel', {
        bodyPadding : 5,
        fieldDefaults: {
            labelAlign  : 'left',
            msgTarget   : 'side'
        },
        layout: {
            type        : 'hbox',
            align       : 'stretch'
        },
        items: [barChart, formPanel]
    });

    var bottomPanel = Ext.create('Ext.panel.Panel', {
        frame       : false, 
        bodyPadding : 5,
        fieldDefaults: {
            labelAlign  : 'left',
            msgTarget   : 'side'
        },
        layout: {
            type        : 'hbox',
            align       : 'stretch'
        },
        items: [gridPanel, bottomRightPanel]
    });

    var mainPanel = Ext.create('Ext.panel.Panel', {
        frame       : false,
        bodyPadding : 5,
        width       : 1050,
        height      : 770,
        // height      : 1000,
        fieldDefaults: {
            labelAlign  : 'left',
            msgTarget   : 'side'
        },
        layout: {
            type        : 'vbox',
            align       : 'stretch'
        },
        items: [topPanel, bottomPanel]
    });

    mainWindow = Ext.create('Ext.window.Window', {
        title       : 'Communications Statistics',
        header      : {titleAlign: 'center'},
        closable    : true,
        modal       : true,
        width       : 1060,
        height      : 770,
        // height      : 1000,
        resizable   : false,        
        layout      : 'border',
        items       : [mainPanel]
    }).show();
}