setTimeout("UpdateSessionData();", 0);
var employee_id;

Ext.onReady(function(){
    Ext.Ajax.request({
        url     :"personalinformation/view",
        method  : 'POST',
        success: function(f,a)
        {
            var response = Ext.decode(f.responseText);     
            employee_id = response.data.employee_id;
            
            if(response.data.type == 'Staff')
                var htmlDetails = 
                    '<br>' +
                    '<table width="30%" style="padding: 2px;background: #ff6666;border: solid 1px white;">' +
                    '<tr style="background: #ff6666;">' +
                    '<td colspan="2" style="padding: 2px;" width="100%"><font color=white size=2><?php echo mysqli_real_escape_string($this->db->conn_id, $module_name);?></font></td>' +
                    '</tr>' +
                    '<tr >' +
                    '<td align="right" style="background: #ffbec2; padding: 2px;" ><font color=black size=2>Name:</td>' +
                    '<td align="left" style="background: #ffd9d9; padding: 2px;" ><font color=black size=2>'+response.data.name+'</td>' +
                    '</tr>' +
                    '<tr >' +
                    '<td align="right" style="background: #ffbec2; padding: 2px;" ><font color=black size=2>Position:</td>' +
                    '<td align="left" style="background: #ffd9d9; padding: 2px;" ><font color=black size=2>'+response.data.position_desc+'</td>' +
                    '</tr>' +
                    '<tr >' +
                    '<td align="right" style="background: #ffbec2; padding: 2px;" ><font color=black size=2>Department:</td>' +
                    '<td align="left" style="background: #ffd9d9; padding: 2px;" ><font color=black size=2>'+response.data.department_desc+'</td>' +
                    '</tr>' +
                    '</table>';

            var htmlInformation = new Ext.XTemplate(htmlDetails);
            
            Ext.create('Ext.panel.Panel', {                
                width: '100%',
                border: false,
                renderTo: "innerdiv",
                bodyStyle: 'background:transparent;',
                html: htmlInformation.applyTemplate(null),
                tbar: [{
                    text    : 'View DTR',      
                    icon: './image/details.png',   
                    handler: function ()
                    {
                        ViewDTR(0);
                    }
                },{
                    text    : 'Change Account Details',      
                    icon: './image/password.png',   
                    handler: function ()
                    {
                        ChangePassword();
                    }
                }]
            });
        }
    });
});
