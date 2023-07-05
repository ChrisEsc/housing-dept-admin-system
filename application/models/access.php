<?php

require_once "my_model.php";
class Access extends My_Model {
    /**
    */
    function rights($link, $crudtype, $type) {
        try 
        {
            $this->load->library('session'); 
            $user_id = $this->session->userdata('id');

            if(!$user_id){
                header("Location:".base_url().'index.php/login');
                exit();
            }

            #access right to Maintenance(...) ADD / EDIT / DELETE
            if($type == 'Maintenance')
            {
                $commandText = "SELECT * FROM modules_users WHERE module_id = (SELECT id FROM modules WHERE module_name = 'Maintenance Module') AND user_id = $user_id";
                $result = $this->db->query($commandText);
                $query_result = $result->result();
            }
            else
            {
                $commandText = "SELECT * FROM modules_users WHERE module_id = (SELECT id FROM modules WHERE link = '$link') AND user_id = $user_id";
                $result = $this->db->query($commandText);
                $query_result = $result->result(); 
            }

            if ($crudtype == "Add" & $query_result[0]->uadd == 0)
            {
                $data = array("success"=> false, "data"=>"Not Allowed to ADD. Please contact System Administrator for access rights.");
                die(json_encode($data));
            }
            if ($crudtype == "Edit" & $query_result[0]->uedit == 0)
            {
                $data = array("success"=> false, "data"=>"Not Allowed to EDIT. Please contact System Administrator for access rights.");
                die(json_encode($data));
            }
            if ($crudtype == "Delete" & $query_result[0]->udelete == 0)
            {
                $data = array("success"=> false, "data"=>"Not Allowed to DELETE. Please contact System Administrator for access rights.");
                die(json_encode($data));
            }    
        }
        catch (Exception $e) 
        {
            print $e->getMessage();
            die();  
        }
    }
}