<?php

class Module_Validation extends My_Model {
    /**
    */
    function module_name($id, $link) {
        try 
        {
            $this->load->library('session');            
            $flag = false;

            $commandText = "select b.*                                   
                            from modules_users a join modules b on a.module_id = b.id
                            where a.user_id = $id and b.link = '$link'
                            order by b.id asc";    
            $result = $this->db->query($commandText);
            $query_result = $result->result();
            if(count($query_result) == 0) 
                $flag = true;

            if($flag) 
            {
                $this->load->library('session');
                $this->session->sess_destroy();
                header("Location:".base_url());
                exit();
            }
        }
        catch (Exception $e) 
        {
            print $e->getMessage();
            die();  
        }
    }
}