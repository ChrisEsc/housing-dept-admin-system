<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class ThumbnailMenu extends CI_Controller {
	/**
	*/
	public function index(){
		$this->load->model('Page');
        $this->Page->set_page('thumbnailmenu');
	}

	public function modulelist()
	{ 
		try 
		{			
			$this->load->library('session');
			$user_id = $this->session->userdata('id');

			$commandText = "SELECT module_name, link, icon FROM modules WHERE thumbnail = 1 AND id IN (SELECT module_id FROM modules_users WHERE user_id = $user_id) ORDER BY parent_id ASC, sno ASC";							
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'module_name' 	=> $value->module_name,
					'link'			=> $value->link,
					'icon'			=> $value->icon);
			}

			$data['count'] = count($query_result);
			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}
}