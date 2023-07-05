<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Logout extends CI_Controller {
	/**
	*/
	public function index(){
		$this->load->library('session');
		$this->logs();		
		$this->session->sess_destroy();		
		header("Location:".base_url());
        exit();
	}

	public function terminateSession()
	{		
		$this->logs();
		$data = array("success"=> true);
		die(json_encode($data));
	}

	public function logs()
	{
		$this->load->model('Logs'); $this->Logs->audit_logs(0, 'logout', 'Logout', 'Session Terminated!');	
	}
}