<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Personalinformation extends CI_Controller {
	/**
	*/
	private function modulename()
	{
		return 'personalinformation';
	}

	public function index(){
		$this->load->model('Page');
        $this->Page->set_page($this->modulename());
	}

	public function view()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			
        	$user_id = $this->session->userdata('user_id');

			$commandText = "SELECT 
								a.*,	
								a.department_id,
								a.position_id,
								b.description AS department_desc,
								c.description AS position_desc	
							FROM staff a
								LEFT JOIN departments b ON a.department_id = b.id
								LEFT JOIN positions c ON a.position_id = c.id
							WHERE a.id = $user_id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id']				= $value->id;
				$record['employee_id']		= $value->employee_id;
				$record['department_id']	= $value->department_id;
				$record['position_id'] 		= $value->position_id;
				$record['department_desc']	= $value->department_desc;
				$record['position_desc'] 	= $value->position_desc;
				$record['name'] 			= mb_strtoupper($value->fname)." ".mb_strtoupper($value->mname)." ".mb_strtoupper($value->lname);
				$record['type'] 			= 'Staff';
			}

			$data['data'] = $record;
			$data['success'] = true;
			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}	

	public function usercrud() 
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			
			$id = $this->session->userdata('id');
			$user_id = $this->session->userdata('user_id');

			$user_name	= strip_tags(trim($this->input->post('user_name')));
			$currpass	= strip_tags(trim($this->input->post('current_password')));
			$password	= strip_tags(trim($this->input->post('password')));
			$password2	= strip_tags(trim($this->input->post('password2')));
			
			if($password != $password2)	
			{
				$data = array("success"=> false, "data"=>"Password mismatch!");
				die(json_encode($data));
			}

			$commandText = "SELECT * FROM users WHERE username = '".mysqli_real_escape_string($this->db->conn_id, $user_name)."' and id <> '$id'";				
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) > 0)	
			{
				$data = array("success"=> false, "data"=>"User Name exist.");
				die(json_encode($data));
			}

			$this->load->model('Cipher');
			$this->Cipher->secretpassphrase();			
			$currpassencryptedtext = $this->Cipher->encrypt($currpass);
			$encryptedtext = $this->Cipher->encrypt($password);

			$commandText = "SELECT * FROM users WHERE password = '$currpassencryptedtext' AND id = $id";							
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data = array("success"=> false, "data"=>'Incorrect current password!');
				die(json_encode($data));
			}	

			$commandText = "UPDATE users SET username = '".mysqli_real_escape_string($this->db->conn_id, $user_name)."', password = '$encryptedtext' WHERE id = $id";
			$result = $this->db->query($commandText);

			$commandText = "UPDATE staff SET temp_key = 'Encrypted' WHERE id = $user_id";
			$result = $this->db->query($commandText);					
			
			$arr = array();  
			$arr['success'] = true;
			$arr['data'] = "Successfully Updated, Username: ".mysqli_real_escape_string($this->db->conn_id, $user_name);
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}	

	public function userview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->session->userdata('id');
		
			$commandText = "SELECT a.id, a.username, a.password, a.email FROM users a WHERE a.id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			$this->load->model('Cipher');
			$this->Cipher->secretpassphrase();			

			foreach($query_result as $key => $value) 
			{	
				$decryptedtext = $this->Cipher->decrypt($value->password);
				
				$record['id'] 				= $value->id;					
				$record['user_name']		= $value->username;	
				$record['current_password']	= $decryptedtext;	
				$record['email']			= $value->email;	
			}

			$data['data'] = $record;
			$data['success'] = true;
			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}		
}