<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Commonquery extends CI_Controller {
	/**
	*/
	public function updateSession() 
	{
		try 
		{ 						
			$this->load->model('Session');		
        	$this->Session->Update();
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}	
	
	public function maintenancecrud() 
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id				= $this->input->post('id');
			$description	= strip_tags(trim($this->input->post('description')));
			$crudtype		= $this->input->post('crudtype');
			$div_code		= $this->input->post('div_code');	
			$dept_code		= $this->input->post('dept_code');			
			$fname 			= mysqli_real_escape_string($this->db->conn_id, $this->input->post('new_fname'));
			$mname 			= mysqli_real_escape_string($this->db->conn_id, $this->input->post('new_mname'));
			$lname 			= mysqli_real_escape_string($this->db->conn_id, $this->input->post('new_lname'));

			$type		= $this->input->post('type');
			
			$this->load->model('Access'); $this->Access->rights(null, $crudtype, 'Maintenance');
			if ($crudtype == "Delete")
			{
				$commandText = "DELETE FROM $type WHERE id = $id";
				$result = $this->db->query($commandText);
			}
			else
			{			
				if ($crudtype == "Add") 
				{					
					$commandText = "SELECT * FROM $type WHERE description = '".mysqli_real_escape_string($this->db->conn_id, $description)."'";

					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					if ($type == 'divisions') $this->load->model('divisions'); 
					else if ($type == 'departments') $this->load->model('departments');
					else if ($type == 'sections') $this->load->model('sections');
					else if ($type == 'positions') $this->load->model('positions');
					else if ($type == 'record_types') $this->load->model('record_types');
					$id = 0;
				}

				if ($crudtype == "Edit") 				
				{
					$commandText = "SELECT * FROM $type WHERE description = '".mysqli_real_escape_string($this->db->conn_id, $description)."' and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 
			
					if ($type == 'departments') { $this->load->model('departments'); $this->departments->id = $id;}
					else if ($type == 'divisions') { $this->load->model('divisions'); $this->divisions->id = $id;}	
					else if ($type == 'sections') { $this->load->model('sections'); $this->sections->id = $id;}
					else if ($type == 'positions') { $this->load->model('positions'); $this->positions->id = $id;}
					else if ($type == 'record_types') { $this->load->model('record_types'); $this->record_types->id = $id;}
				}

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"$type description already exist.");
					die(json_encode($data));
				}

				
				if ($type == 'departments') { $this->departments->dept_code = $dept_code; $this->departments->description = $description; $this->departments->save($id);}
				else if ($type == 'divisions') { $this->divisions->div_code = $div_code; $this->divisions->description = $description; $this->divisions->save($id); }
				else if ($type == 'sections') { $this->sections->description = $description; $this->sections->save($id); }
				else if ($type == 'positions') { $this->positions->description = $description; $this->positions->save($id); }
				else if ($type == 'record_types') { $this->record_types->description = $description; $this->record_types->save($id); }				
			}
			
			$arr = array();  
			$arr['success'] = true;
			if ($crudtype == "Add") 
				$arr['data'] = "Successfully Created";
			if ($crudtype == "Edit")
				$arr['data'] = "Successfully Updated";
			if ($crudtype == "Delete")
				$arr['data'] = "Successfully Deleted";
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}	

	public function maintenanceview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id 		= $this->input->post('id');
			$type 		= $this->input->post('type');
			$category 	= $this->input->post('category');
			
			$commandText = "SELECT * FROM $type WHERE id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$record = array();
			foreach($query_result as $key => $value) 
			{	
				$record['id'] 			= $value->id;					
				$record['description']	= $value->description;	

				if($type == 'departments') 	$record['dept_code']	= $value->dept_code;
				else if($type == 'divisions')	$record['div_code'] 	= $value->div_code;
				
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

	public function maintenancelist(){
		try 
		{
			$query 	= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$type 	= $_GET['type'];

			$commandText = "SELECT * FROM $type WHERE description like '%$query%' order by description asc";
			$result = $this->db->query($commandText);
			$query_result = $result->result();  

			if(count($query_result) == 0) 
			{
				$data["count"] 	= 0;
				$data["data"]	= array();
				die(json_encode($data));
			}	

			//columns
			$data['metaData']['columns'][] = array('dataIndex' => 'id', 'hidden' => true);
			$data['metaData']['columns'][] = array('text' => mb_strtoupper($type), 'dataIndex' => 'description', 'flex' => 1);
			//fields
			$data['metaData']['fields'][] = array('name' => 'id', 'type' => 'int');
			$data['metaData']['fields'][] = array('name' => 'description');			

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id' 			=> $value->id,
					'description' 	=> $value->description);
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


	public function combolist()
	{
		try 
		{
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$type = $_GET['type'];

			$commandText = "SELECT * FROM $type WHERE description LIKE '%$query%' ORDER BY id asc";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 
			if(count($query_result) == 0) 
			{
				$data["count"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			foreach($query_result as $key => $value) 
			{	
				$description = $value->description;

				$data['data'][] = array(
					'id' 			=> $value->id,				
					'description' 	=> $description);
			}

			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function combolist_withcodes()
	{
		try 
		{
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$type = $_GET['type'];
			$commandText = "SELECT * FROM $type WHERE description LIKE '%$query%' ORDER BY id asc";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 
			if(count($query_result) == 0) 
			{
				$data["count"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			foreach($query_result as $key => $value) 
			{	
				if($type == 'divisions')
				{
					$data['data'][] = array(
					'id' 			=> $value->id,
					'code' 			=> $value->div_code,						
					'description' 	=> $value->description);
				}
			}

			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function combolistfilter()
	{
		try 
		{
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$type = $_GET['type'];
			$filter = $_GET['filter'];

			$commandText = "SELECT * FROM $type WHERE $filter AND description LIKE '%$query%' ORDER BY description asc";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["count"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id' 			=> $value->id,						
					'description' 	=> $value->description,
					'count'			=> count($query_result));
			}
			
			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function combolist_divisions()
	{
		try
		{
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));

			$commandText = "SELECT * FROM divisions ORDER BY description ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["count"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			// add "All" in the choices
			$data['data'][] = array(
				'id' 			=> 0,
				'div_code'		=> "ALL",			
				'description' 	=> "All");

			foreach($query_result as $key => $value) 
			{	
				if ($value->div_code == 'DH') continue;

				$data['data'][] = array(
					'id' 			=> $value->id,
					'div_code'		=> $value->div_code,			
					'description' 	=> $value->description);
			}
			die(json_encode($data));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function combolist_staff()
	{
		try
		{
			$commandText = "SELECT id as staffID, CONCAT (fname, ' ', mname, ' ', lname) as staffName FROM chuddiadb.staff 
							WHERE active = 1
							ORDER BY staffName ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["count"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			// add "All" in the choices
			$data['data'][] = array(
				'staffID' 		=> 0,
				'staffName'		=> "ALL");

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'staffID' 		=> $value->staffID,
					'staffName'		=> $value->staffName);
			}
			die(json_encode($data));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function combolist_activities()
	{
		try
		{	$section_id =$_GET["section_id"];
			$commandText = "SELECT sectionactivityID, activity FROM staffmonitoring.sectionactivity WHERE section_id=$section_id AND createdAt > '2021-01-01 00:00:00' AND deletedAt IS null ORDER BY sectionactivityID ASC, section_id DESC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["count"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			// add "All" in the choices
			$data['data'][] = array(
				'sectionactivityID'=> 0,
				'activity'=> "ALL");

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'sectionactivityID' => $value->sectionactivityID,
					'activity'	=> $value->activity);
			}

			die(json_encode($data));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function combolist_activities2()
	{
		try
		{
			//$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$commandText = "SELECT sectionactivityID, activity FROM staffmonitoring.sectionactivity WHERE createdAt > '2021-01-01 00:00:00' AND deletedAt IS null ORDER BY sectionactivityID ASC, section_id DESC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["count"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			// add "All" in the choices
			$data['data'][] = array(
				'sectionactivityID'=> 0,
				'activity'=> "ALL");

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'sectionactivityID' => $value->sectionactivityID,
					'activity'	=> $value->activity);
			}

			die(json_encode($data));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function combolist_sections()
	{
		try
		{
			//$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$commandText = "SELECT * FROM sections ORDER BY division_id ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["count"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			// add "All" in the choices
			$data['data'][] = array(
				'id' 			=> 0,
				'division_id'		=> "ALL",			
				'description'		=> "ALL",			
				'code' 	=> "All");

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id' 			=> $value->id,
					'division_id'		=> $value->division_id,			
					'description' 	=> $value->description,
					'code'			=> $value->code);
			}
			die(json_encode($data));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}


	public function text_blast()
	{
		//$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
		$sec_contacts = array (
			Array('2', '1', 'FSM', '09XXXXXXXXX')
		);

		//move CC to front end?
		$div_contacts = Array(
			Array('2', 'Doe J.', '09XXXXXXXXX')
		);

		if ( is_null($this->input->post('sent_to')) OR $this->input->post('sent_to') == ''){
			$arr = array();  
			$arr['success'] = true;
			$arr['data'] = "Empty string";
			die(json_encode($arr));
		}

		try
		{
			$this->load->library('session');
			$tb_id = 0;
			$sent_to_sec  = $this->input->post('sent_to');
			$sent_to = '';
			$sent_to_div = '';
			$sent_by = '09550880297';
			$sent_from_module = $this->input->post('sent_from_module');
			$txt_message= $this->input->post('txt_message');
			$sender_user_id = $this->session->userdata('user_id');
			$rstr ='';
			if(strlen($sent_to_sec) == 11){
				$sent_to = $sent_to_sec;
			}else{
				foreach ($sec_contacts as $value) 
				{
					if ($sent_to_sec == $value[0]){
						$sent_to = $value[3];
						foreach ($div_contacts as $value2)
						{
							if ($value[1] == $value2[0])
							{
								$sent_to_div = $value2[2];
							}
						}
						break;
					}
				}
			}

			//send to section head
			$this->load->model('text_blast');
			$this->text_blast->sent_to = $sent_to;
			$this->text_blast->sent_by = $sent_by;
			$this->text_blast->sent_from_module = $sent_from_module;
			$this->text_blast->txt_message = $txt_message;
			$this->text_blast->sender_user_id=$sender_user_id;
			$this->text_blast->save(0);
			$tb_id = $this->text_blast->id;

			//send to division head, do not message division heads if specific number is provided
			if(strlen($sent_to_sec) != 11){
				$this->load->model('text_blast');
				$this->text_blast->sent_to = $sent_to_div;
				$this->text_blast->sent_by = $sent_by;
				$this->text_blast->sent_from_module = $sent_from_module;
				$this->text_blast->txt_message = $txt_message;
				$this->text_blast->sender_user_id=$sender_user_id;
				$this->text_blast->save(0);
				$tb_id = $this->text_blast->id;
			}

			$arr = array();  
			$arr['success'] = true;
			$arr['data'] = "Successfully Uploaded #".$tb_id."<>".$sent_to."<>".$sent_to_div;
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function imageupload() 
	{
		try 
		{ 
			#update session
			$this->load->model('Session');$this->Session->Validate();
			$profile_id = $this->input->post('profile_id');
			$type		= $this->input->post('type');

			$name 	= $_FILES['form-file']['name'];       
	        $source = $_FILES['form-file']['tmp_name'];    
	        $size 	= $_FILES['form-file']['size'];

	        $path = "profile_pic/";
	        $valid_formats = array("jpg", "png", "gif", "bmp");

	        $commandText = "SELECT fname, lname FROM staff WHERE id = $profile_id";
			$result = $this->db->query($commandText);
			$query_result = $result->result();  

	        $arr = array();  
			list($txt, $ext) = explode(".", $name);

			$fDate = date("Ymd"); 
	        $filename = $query_result[0]->fname.'_'.$query_result[0]->lname.'_'.$fDate.'.'.$ext;

			if(in_array($ext,$valid_formats))
			{
				if($size<(250*1024))
				{
					if( file_exists ($path.$name))
						unlink($path.$name);
					
					$commandText = "DELETE FROM profile_images WHERE src='$filename' AND profile_id = $profile_id AND type = '$type'";
					$result = $this->db->query($commandText);						

					$this->load->model('profile_images');
					$this->profile_images->profile_id 	= $profile_id;
					$this->profile_images->src 			= $filename;
					$this->profile_images->type 		= $type;
					$this->profile_images->save(0);

					$arr['success'] = true;
					$arr['imagename'] = $filename;
					$arr['data'] = $name .' : Upload Successful!';
					move_uploaded_file($source,$path.$filename);
				}
				else
				{
					$arr['success'] = false;
					$arr['data'] = $name . ' : File Size exceeded!. Not more than 256kb.';
				}
			}
			else
			{
				$arr['success'] = false;
				$arr['data'] = $name . ' : Invalid format!';
			}	

			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}
}