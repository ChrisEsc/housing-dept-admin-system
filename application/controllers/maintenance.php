<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Maintenance extends CI_Controller {
	/**
	*/
	public function index(){
		$this->load->helper('common_helper');
		$this->load->view('maintenance/index');
		$this->load->view('templates/footer');
	}
}