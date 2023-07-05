<?php

require_once "my_model.php";
class Logs extends My_Model {
    /**
    */
    function audit_logs($transaction_id, $table, $query_type, $transaction_type) {
        try 
        {
            $this->load->library('session');
            $user_id = $this->session->userdata('id');
            
            if(!$user_id){
                header("Location:".base_url().'index.php/login');
                exit();
            }

            if($query_type == 'Add')
            {
                $commandText = "select id from $table order by id desc limit 1";
                $result = $this->db->query($commandText);
                $query_result = $result->result(); 
                $transaction_id = $query_result[0]->id;
            }

            $this->load->model('audit_logs');
            $this->audit_logs->transaction_type = $transaction_type;
            $this->audit_logs->transaction_id   = $transaction_id;
            $this->audit_logs->entity           = $table;
            $this->audit_logs->query_type       = $query_type;
            $this->audit_logs->created_by       = $user_id;
            $this->audit_logs->date_created     = date('Y-m-d');
            $this->audit_logs->time_created     = date('H:i:s');
            $this->audit_logs->save(0); 
        }
        catch (Exception $e) 
        {
            print $e->getMessage();
            die();  
        }
    }
}