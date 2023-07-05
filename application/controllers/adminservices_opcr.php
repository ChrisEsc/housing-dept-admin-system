<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class AdminServices_OPCR extends CI_Controller {
	/**
	*/ 
	private function modulename($type)
	{		
		if($type == 'link')
			return 'adminservices_opcr';
		else 
			return 'Office Performance Commitment and Review';
	} 

	public function index()
	{		
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}
}
