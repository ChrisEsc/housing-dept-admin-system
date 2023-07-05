<?php

require_once "my_model.php";
class Menu extends My_Model {
    /**
    */
    function set_userid($id) {
        try 
        {
            $this->load->library('session');
            $user_id = $this->session->userdata('id');
            
            if(!$user_id){
                header("Location:".base_url().'index.php/login');
                exit();
            }
            
            $commandText = "SELECT 
                                id AS parent_id, 
                                module_name AS main_module 
                            FROM modules
                            WHERE id IN (
                                SELECT 
                                    distinct b.parent_id 
                                FROM 
                                    modules_users a join modules b on a.module_id = b.id 
                                WHERE a.user_id = $id AND menu = 1)                                    
                            ORDER BY sno";    
            $result = $this->db->query($commandText);
            $queryModule = $result->result();

            foreach($queryModule as $key => $valueModule) 
            {   
                $parent_id = $valueModule->parent_id;
                $commandText = "SELECT 
                                    b.module_name,
                                    b.link 
                                FROM modules_users a join modules b ON a.module_id = b.id
                                WHERE a.user_id = $id 
                                    AND b.parent_id = $parent_id 
                                    AND b.menu = 1
                                GROUP BY b.module_name
                                ORDER BY b.sno ASC";    
                $result = $this->db->query($commandText);
                $query_result = $result->result();

                $data['Main'][] = array('main_module' => $valueModule->main_module);

                foreach($query_result as $key => $value) 
                {   
                    $data[$valueModule->main_module][] = array(
                        'module_name'   => $value->module_name,
                        'link'          => $value->link);
                }               
            }        
                 
            return $data; 
        }
        catch (Exception $e) 
        {
            print $e->getMessage();
            die();  
        }
    }
}