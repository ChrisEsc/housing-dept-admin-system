<?php

require_once "my_model.php";
class Session extends My_Model {
    /**
    */
    function Update() {
        try 
        {
            $arr = array();  
			$this->load->library('session');
			$time = strtotime($this->session->userdata('time'));
			$timenow = strtotime(date('Y-m-d H:i:s'));

			$arr['success'] = false;
            //greater than or equal to 30 minutes
			if(round(abs($timenow - $time) / 60, 0) >= 30 || !$this->session->userdata('logged_in'))
			{
				$this->session->sess_destroy();	
				$arr['success'] = true;
			}

			$arr['data'] = $this->session->userdata('id');

			die(json_encode($arr));
        }
        catch (Exception $e) 
        {
            print $e->getMessage();
            die();  
        }
    }

    function Validate() {
        try 
        {
            $this->load->library('session');
            $user_id = $this->session->userdata('id');
        	$this->session->set_userdata(array('time' => date('Y-m-d H:i:s')));

            if(!$user_id){
                $data = array("success"=> false, "data"=>"expired_session");
                $this->session->set_userdata(array('logged_in' => false));
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