var transactionID, transactionTable, transactionType; function ExportDocs(type) {params = new Object(); params.id                 = transactionID; params.auditlog_id        = auditlogID; params.table              = transactionTable; params.transaction_type   = transactionType; params.reporttype = 'Record'; ExportDocument('audit_logs/exportdocument', params, type); } function ViewDetails() {var sm = Ext.getCmp("audit_logsGrid").getSelectionModel(); if (!sm.hasSelection()) {warningFunction("Warning!","Please select record."); return; } if (sm.selected.items[0].data.transaction_id == 0) {warningFunction(sm.selected.items[0].data.query_type,"Cannot load specific transaction"); return; } if (sm.selected.items[0].data.table == 'modules_users') {warningFunction(sm.selected.items[0].data.query_type,"Administrator's view only."); return; } auditlogID        = sm.selected.items[0].data.id; transactionID     = sm.selected.items[0].data.transaction_id; transactionTable  = sm.selected.items[0].data.table; transactionType   = sm.selected.items[0].data.transaction_type; Ext.MessageBox.wait('Loading...'); Ext.Ajax.request({url     :"audit_logs/view", method  : 'POST', params: {id                : transactionID, table             : transactionTable, transaction_type  : transactionType }, success: function(f,a) {var response = Ext.decode(f.responseText); var htmlData = '<table width="100%" style="background: #5aa865;border: solid 1px white;">' + '<tr style="background: #5aa865;">' + '<td colspan="2" style="padding: 2px;" width="100%"><font color=white size=2></font></td>' + '</tr>'; htmlData += '<tr >' + '<td valign="top" align="left" style="background: #c1e1c6; padding: 2px;" width="30%"><font color=black size=2><b>Field</b></td>' + '<td valign="top" align="left" style="background: #c1e1c6; padding: 2px;" width="70%"><font color=black size=2><b>Data</b></td>' + '</tr>'; for (var i = 0; i < response.count; i++) {htmlData += '<tr>' + '<td valign="top" align="left" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+response.label[i]+'</td>' + '<td valign="top" align="left" style="background: #d8f1dc; padding: 2px;" ><font color=black size=2>'+response.value[i]+'</td>' + '</tr>'; }; htmlData +='</table><font color="red"></font>'; var html = new Ext.XTemplate(htmlData); var panel = Ext.create('Ext.panel.Panel', {region  : 'center', width     : '100%', autoScroll      : true, html: html.applyTemplate(null), minWidth: 200 }); mainWindow = Ext.create('Ext.window.Window', {title       : 'Transaction Details', closable      : true, modal         : true, width         : 500, height        : 270, resizable   : false, plain: true, buttonAlign : 'center', header            : {titleAlign: 'center'}, layout            : 'border', items         : [panel], buttons: [{text: 'Download', tooltip: 'Extract Data to PDF File Format', icon: './image/pdf.png', handler: function () {ExportDocs('PDF'); } }, {text      : 'Close', icon: './image/close.png', handler: function () {mainWindow.close(); } }], }).show(); Ext.MessageBox.hide(); } }); }