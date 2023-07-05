<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Help extends CI_Controller {
	/**
	*/
	public function index(){
		$this->load->model('Page');
        $this->Page->set_page('help');
	}
}