<?php
	class Redirect extends CI_Controller {

		public function index() {
			// load the URL helper
			$this->load->helper('url');

			// redirect the user to the new server ip address
			redirect(getenv('SERVER_ADDRESS').'chuddia');
		}
	}
?>