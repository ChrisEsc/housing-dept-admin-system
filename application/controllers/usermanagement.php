<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Usermanagement extends CI_Controller {
	/**
	*/
	public function index(){
		$this->load->model('Page');
        $this->Page->set_page('usermanagement');
	}

	public function userslist()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$limit = $_GET['limit'];
			$start = $_GET['start'];

			$commandText = "SELECT 
							    a.id,
							    a.username,
							    a.type,
							    concat(fname, ' ', mname, ' ', lname) AS name,
							    concat('(', a.username,') ', fname, ' ', mname, ' ', lname) AS userslist
							FROM 
								(
									SELECT a.*, b.fname, b.mname, b.lname FROM users a LEFT JOIN staff b ON a.user_id = b.id WHERE a.type = 'Staff' AND a.active = 1 AND b.active = 1
								) a
							WHERE 
								(
									a.username LIKE '%$query%' OR
									CONCAT(a.fname, ' ', if(a.mname = '', '', CONCAT(a.mname, ' ')),a.lname) LIKE '%$query%'
								)								
							ORDER BY a.fname ASC
							LIMIT $start, $limit";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$commandText = "SELECT count(a.id) AS count
							FROM 
								(
									SELECT a.*, b.fname, b.mname, b.lname FROM users a LEFT JOIN staff b ON a.user_id = b.id WHERE a.type = 'Staff' AND a.active = 1
								) a
							WHERE 
								(
									a.username LIKE '%$query%' OR
								    CONCAT(a.fname, ' ', a.mname, ' ',a.lname) LIKE '%$query%'
								)";
			$result = $this->db->query($commandText);
			$query_count = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id' 		=> $value->id,
					'username' 	=> $value->username,
					'type' 		=> $value->type,
					'module_users'=> mb_strtoupper($value->userslist),
					'name' 		=> mb_strtoupper($value->name));
			}

			$data['totalCount'] = $query_count[0]->count;
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

			$id			= $this->input->post('id');
			$user_name	= strip_tags(trim($this->input->post('user_name')));
			$password	= strip_tags(trim($this->input->post('password')));
			$password2	= strip_tags(trim($this->input->post('password2')));
			$user_id	= $this->input->post('staff_id');
			$admin		= $this->input->post('admin');
			$user_type	= $this->input->post('user_type');			
			$type		= $this->input->post('type');

			$commandText = "SELECT * FROM users WHERE id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 
			$email = $query_result[0]->email;

			if (($query_result[0]->admin == 1 & $this->session->userdata('un') != 'admin') & $this->session->userdata('id') != $id)
			{
				$data = array("success"=> false, "data"=>"Cannot alter user.");
				die(json_encode($data));
			}

			if ($type == "Delete")
			{
				$commandText = "UPDATE users SET active = 0 WHERE id = $id";
				$result = $this->db->query($commandText);
			}
			else
			{			
				if($password != $password2)	
				{
					$data = array("success"=> false, "data"=>"Password mismatch!");
					die(json_encode($data));
				}

				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM users WHERE username = '".mysqli_real_escape_string($this->db->conn_id, $user_name)."'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$this->load->model('Users');
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM users a LEFT JOIN staff b ON a.user_id = b.id WHERE a.username = '".mysqli_real_escape_string($this->db->conn_id, $user_name)."' and a.id <> '$id' AND b.active = 1";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$this->load->model('Users');
					$this->Users->id = $id;
				}

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"User name already exist.");
					die(json_encode($data));
				}

				$this->load->model('Cipher');
				$this->Cipher->secretpassphrase();			
				$encryptedtext = $this->Cipher->encrypt($password);

				$this->Users->username 		= $user_name;
				$this->Users->password 		= $encryptedtext;
				$this->Users->user_id 		= $user_id;
				$this->Users->admin 		= $admin;
				$this->Users->type 			= $user_type;
				$this->Users->email			= $email;
				$this->Users->active 		= 1;

				if ($type == "Add") $this->Users->save(0);	
				if ($type == "Edit") $this->Users->save($id);	

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'users', $type, '(User)');
			}

			$arr = array();  
			$arr['success'] = true;
			if ($type == "Add") 
				$arr['data'] = "Successfully Created";
			if ($type == "Edit")
				$arr['data'] = "Successfully Updated";
			if ($type == "Delete")
				$arr['data'] = "Successfully Deleted";
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

			$id = $this->input->post('id');
			// $user_type = $this->input->post('user_type');
			
			$commandText = "SELECT 
							    a.*,
							    concat(fname, ' ', mname, ' ', lname) AS name     
							FROM (
									SELECT a.*, b.fname, b.mname, b.lname FROM users a LEFT JOIN staff b ON a.user_id = b.id WHERE a.type = 'Staff'
								) a
							WHERE a.id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			$this->load->model('Cipher');
			$this->Cipher->secretpassphrase();			

			foreach($query_result as $key => $value) 
			{	
				$decryptedtext = $this->Cipher->decrypt($value->password);
				
				$record['id'] 			= $value->id;					
				$record['user_name']	= $value->username;	
				$record['password']		= $decryptedtext;	
				$record['password2']	= $decryptedtext;	
				$record['staff_id'] 	= $value->user_id;	
				$record['admin'] 		= $value->admin;	
				$record['name']			= mb_strtoupper($value->name);
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

	public function modulelist()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$commandText = "SELECT * FROM modules WHERE type = 'main' order by sno asc";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id' 			=> $value->id,
					'sno' 			=> $value->sno,
					'module_name' 	=> $value->module_name);
			}

			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}	

	public function modulecrud() 
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id			= $this->input->post('id');
			$module_name= strip_tags(trim($this->input->post('module_name')));
			$sno		= $this->input->post('sno');
			$type		= $this->input->post('type');
			
			if ($type == "Delete")
			{
				$commandText = "SELECT * FROM modules WHERE parent_id = '$id'";
				$result = $this->db->query($commandText);
				$query_result = $result->result(); 
				
				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Cannot delete record with dependence.");
					die(json_encode($data));
				}
				
				$commandText = "DELETE FROM modules WHERE id = $id";
				$result = $this->db->query($commandText);
			}
			else
			{				
				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM modules WHERE module_name = '".mysqli_real_escape_string($this->db->conn_id, $module_name)."'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$commandText = "SELECT * FROM modules WHERE sno = '$sno' and type = 'main'";
					$result = $this->db->query($commandText);
					$query_result1 = $result->result(); 

					$this->load->model('Modules');
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM modules WHERE module_name = '".mysqli_real_escape_string($this->db->conn_id, $module_name)."' and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$commandText = "SELECT * FROM modules WHERE sno = '$sno' and type = 'main' and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result1 = $result->result(); 

					$this->load->model('Modules');
					$this->Modules->id = $id;
				}

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Module name already exist.");
					die(json_encode($data));
				}

				if(count($query_result1) > 0) 
				{
					$data = array("success"=> false, "data"=>"Order number already exist.");
					die(json_encode($data));
				}

				$this->Modules->parent_id 	= null;
				$this->Modules->sno 		= $sno;
				$this->Modules->module_name = $module_name;
				$this->Modules->link 		= null;
				$this->Modules->type 		= 'main';

				if ($type == "Add") $this->Modules->save(0);	
				if ($type == "Edit") $this->Modules->save($id);	
	
				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'modules', $type, '(Module)');
			}

			$arr = array();  
			$arr['success'] = true;
			if ($type == "Add") 
				$arr['data'] = "Successfully Created";
			if ($type == "Edit")
				$arr['data'] = "Successfully Updated";
			if ($type == "Delete")
				$arr['data'] = "Successfully Deleted";
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}	

	public function moduleview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT * FROM modules WHERE id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 			= $value->id;					
				$record['sno'] 			= $value->sno;					
				$record['module_name'] 	= $value->module_name;
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

	public function submodulelist()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$module_id = $_GET['module_id'];

			$commandText = "SELECT * FROM modules WHERE parent_id = '$module_id' order by sno asc";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				if ($value->thumbnail == 1) $thumbnail = '<font color="green">Yes</font>';
				else $thumbnail = '<font color="red">No</font>';

				if ($value->menu == 1) $menu = '<font color="green">Yes</font>';
				else $menu = '<font color="red">No</font>';

				$data['data'][] = array(
					'id' 			=> $value->id,
					'sno' 			=> $value->sno,
					'parent_id' 	=> $value->parent_id,
					'module_name' 	=> $value->module_name,
					'link' 			=> $value->link,
					'icon' 			=> $value->icon,
					'thumbnail'		=> $value->thumbnail,
					'menu' 			=> $value->menu);
			}

			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}	

	public function submodulecrud() 
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id			= $this->input->post('id');
			$parent_id	= $this->input->post('parent_id');
			$sno		= $this->input->post('sno');
			$module_name= strip_tags(trim($this->input->post('module_name')));
			$link		= strip_tags(trim($this->input->post('link')));
			$icon		= strip_tags(trim($this->input->post('icon')));
			$menu		= $this->input->post('ckmenu');
			$thumbnail	= $this->input->post('ckthumbnail');
			$type		= $this->input->post('type');
			
			if ($type == "Delete")
			{
				$commandText = "DELETE FROM modules WHERE id = $id";
				$result = $this->db->query($commandText);
			}
			else
			{				
				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM modules WHERE module_name = '".mysqli_real_escape_string($this->db->conn_id, $module_name)."'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$commandText = "SELECT * FROM modules WHERE link = '".mysqli_real_escape_string($this->db->conn_id, $link)."'";
					$result = $this->db->query($commandText);
					$query_result1 = $result->result(); 

					$commandText = "SELECT * FROM modules WHERE sno = $sno and parent_id = $parent_id";
					$result = $this->db->query($commandText);
					$query_result2 = $result->result(); 

					$this->load->model('Modules');
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM modules WHERE module_name = '".mysqli_real_escape_string($this->db->conn_id, $module_name)."' and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$commandText = "SELECT * FROM modules WHERE link = '".mysqli_real_escape_string($this->db->conn_id, $link)."' and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result1 = $result->result(); 

					$commandText = "SELECT * FROM modules WHERE sno = $sno and parent_id = $parent_id and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result2 = $result->result(); 

					$this->load->model('Modules');
					$this->Modules->id = $id;
				}

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Sub module name already exist.");
					die(json_encode($data));
				}

				if(count($query_result1) > 0) 
				{
					$data = array("success"=> false, "data"=>"Link name already exist.");
					die(json_encode($data));
				}

				if(count($query_result2) > 0) 
				{
					$data = array("success"=> false, "data"=>"Order number already exist.");
					die(json_encode($data));
				}

				$this->Modules->parent_id 	= $parent_id;
				$this->Modules->sno 		= $sno;
				$this->Modules->module_name = $module_name;
				$this->Modules->link 		= $link;
				$this->Modules->icon 		= $icon;
				$this->Modules->type 		= 'sub';
				if($menu) $this->Modules->menu 		= $menu;				
				if($thumbnail) $this->Modules->thumbnail	= $thumbnail;				

				if ($type == "Add") $this->Modules->save(0);	
				if ($type == "Edit") $this->Modules->save($id);	

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'modules', $type, '(Sub Module)');
			}

			$arr = array();  
			$arr['success'] = true;
			if ($type == "Add") 
				$arr['data'] = "Successfully Created";
			if ($type == "Edit")
				$arr['data'] = "Successfully Updated";
			if ($type == "Delete")
				$arr['data'] = "Successfully Deleted";
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}	

	public function submoduleview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT * FROM modules WHERE id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 			= $value->id;					
				$record['sno'] 			= $value->sno;
				$record['module_name'] 	= $value->module_name;
				$record['link'] 		= $value->link;
				$record['icon'] 		= $value->icon;
				$record['ckmenu'] 		= $value->menu;
				$record['ckthumbnail']	= $value->thumbnail;
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

	public function moduleuserslist()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$module_id = $_GET['module_id'];

			$limit = $_GET['limit'];
			$start = $_GET['start'];

			$commandText = "SELECT 
							    a.*,
							    b.username,
							    concat(fname, ' ', mname, ' ', lname) AS name
							FROM modules_users a LEFT JOIN 
								(
									SELECT a.*, b.fname, b.mname, b.lname FROM users a LEFT JOIN staff b ON a.user_id = b.id WHERE a.type = 'Staff' AND a.active = 1
								) b ON a.user_id = b.id
							WHERE 
								(
									b.username LIKE '%$query%' OR
									CONCAT(b.fname, ' ', b.mname, ' ',b.lname) LIKE '%$query%'
							    )
							    AND a.module_id = $module_id 
							ORDER BY lname ASC, fname ASC
							LIMIT $start, $limit";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$commandText = "SELECT count(*) as count
							FROM modules_users a LEFT JOIN 
								(
									SELECT a.*, b.fname, b.mname, b.lname FROM users a LEFT JOIN staff b ON a.user_id = b.id WHERE a.type = 'Staff' AND a.active = 1
								) b ON a.user_id = b.id
							WHERE 
								(
									b.username LIKE '%$query%' OR
									CONCAT(b.fname, ' ', b.mname, ' ',b.lname) LIKE '%$query%'
							    )
							    AND a.module_id = $module_id";
			$result = $this->db->query($commandText);
			$query_count = $result->result();

			if(count($query_result) == 0) 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				if($value->uadd) $add = '<font color="green">Yes</font>'; else $add = '<font color="red">No</font>';
				if($value->uedit) $edit = '<font color="green">Yes</font>'; else $edit = '<font color="red">No</font>';
				if($value->udelete) $delete = '<font color="green">Yes</font>'; else $delete = '<font color="red">No</font>';

				$data['data'][] = array(
					'id' 		=> $value->id,
					'username' 	=> $value->username,
					'name' 		=> mb_strtoupper($value->name),
					'add' 		=> $value->uadd,
					'edit' 		=> $value->uedit,
					'delete' 	=> $value->udelete);
			}

			$data['totalCount'] = $query_count[0]->count;
			
			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function moduleusercrud() 
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			
			$id			= $this->input->post('id');
			$module_id	= $this->input->post('module_id');
			$user_id	= $this->input->post('user_id');
			$uadd		= $this->input->post('ckadd');
			$uedit		= $this->input->post('ckedit');
			$udelete	= $this->input->post('ckdelete');
			$type		= $this->input->post('type');

			if ($type == "Delete")
			{
				$commandText = "DELETE FROM modules_users WHERE id = $id";
				$result = $this->db->query($commandText);
			}
			else
			{					
				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM modules_users WHERE module_id = $module_id and user_id = $user_id";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$this->load->model('Modules_Users');
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM modules_users WHERE module_id = $module_id and user_id = $user_id and id <> $id";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$this->load->model('Modules_Users');
					$this->Modules_Users->id = $id;
				}	

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"User already exist.");
					die(json_encode($data));
				}

				$this->Modules_Users->module_id = $module_id;
				$this->Modules_Users->user_id 	= $user_id;
				if($uadd) $this->Modules_Users->uadd 		= $uadd;
				if($uedit) $this->Modules_Users->uedit		= $uedit;
				if($udelete) $this->Modules_Users->udelete 	= $udelete;

				if ($type == "Add") $this->Modules_Users->save(0);	
				if ($type == "Edit") $this->Modules_Users->save($id);	

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'modules_users', $type, '(Module User)');
			}

			$arr = array();  
			$arr['success'] = true;
			if ($type == "Add") 
				$arr['data'] = "Successfully Created";
			if ($type == "Edit")
				$arr['data'] = "Successfully Updated";
			if ($type == "Delete")
				$arr['data'] = "Successfully Deleted";
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}	

	public function moduleuserview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			
			$id = $this->input->post('id');
			
			$commandText = "SELECT 
							    a.*,
							    b.id AS user_primary_id,
							    b.username,
							    b.user_id, 
							    CONCAT(fname, ' ', mname, ' ', lname) AS name							    
							FROM modules_users a 
							    LEFT JOIN 
								(
									SELECT a.*, b.fname, b.mname, b.lname FROM users a LEFT JOIN staff b ON a.user_id = b.id WHERE a.type = 'Staff' AND a.active = 1
								) b ON a.user_id = b.id
							WHERE a.id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['user_id']	= $value->user_primary_id;	
				$record['user_name'] = mb_strtoupper($value->name);	
				$record['ckadd']	= $value->uadd;	
				$record['ckedit']	= $value->uedit;	
				$record['ckdelete']	= $value->udelete;	
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

	public function defaultgroup()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$commandText = "SELECT * FROM modules_group ORDER BY description ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id' 			=> $value->id,
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

	public function defaultmodules()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$group_id = $_GET['group_id'];

			$commandText = "SELECT 
								a.id,
								b.module_name
							FROM modules_default a
								LEFT JOIN modules b ON a.module_id = b.id
							WHERE a.group_id = $group_id
							ORDER BY b.module_name ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id' 			=> $value->id,
					'description' 	=> $value->module_name);
			}

			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function defaultmodulelist()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));

			$commandText = "SELECT a.id, a.module_name FROM modules a WHERE a.type = 'sub' AND a.module_name LIKE '%$query%' ORDER BY a.module_name ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id' 			=> $value->id,
					'description' 	=> $value->module_name);
			}

			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}	

	public function defaultmodulecrud() 
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id			= $this->input->post('id');
			$group_id	= $this->input->post('group_id');
			$module_id	= $this->input->post('module_id');
			$type		= $this->input->post('type');
			
			$commandText = "select id from users where user_id in (SELECT a.id FROM staff a WHERE a.active = 1) and active = 1";
			$result = $this->db->query($commandText);
			$query_result_load = $result->result(); 

			if ($type == "Delete")
			{
				foreach($query_result_load as $key => $value) 
				{
					$user_id = $value->id;
					$commandText = "DELETE FROM modules_users WHERE module_id = (SELECT module_id FROM modules_default WHERE id = $id) AND user_id = $user_id";
					$result = $this->db->query($commandText);
				}
				$commandText = "DELETE FROM modules_default WHERE id = $id";
				$result = $this->db->query($commandText);
			}
			else
			{				
				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM modules_default WHERE group_id = $group_id and module_id = $module_id";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM modules_default WHERE group_id = $group_id and module_id = $module_id and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 
				}
				
				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Module already exist.");
					die(json_encode($data));
				}

				foreach($query_result_load as $key => $value) 
				{	
					$user_id = $value->id;
					if ($type == "Edit") 
					{
						$commandText = "DELETE FROM modules_users WHERE user_id = $user_id AND module_id = (SELECT module_id FROM modules_default WHERE id = $id)";
						$result = $this->db->query($commandText);
					}					
					$this->load->model('Modules_Users');
					$this->Modules_Users->module_id = $module_id;
					$this->Modules_Users->user_id 	= $user_id;
					$this->Modules_Users->uadd 		= 1;
					$this->Modules_Users->uedit		= 1;
					$this->Modules_Users->udelete 	= 1;
					$this->Modules_Users->save(0);	
				}

				#save to modules_default
				$this->load->model('modules_default');
				if ($type == "Add") 
					$id = 0;
				if ($type == "Edit") 				
					$this->modules_default->id = $id;

				$this->modules_default->group_id 	= $group_id;
				$this->modules_default->module_id 	= $module_id;
				$this->modules_default->save($id);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'modules_default', $type, '(Default Module)');
			}			

			$arr = array();  
			$arr['success'] = true;
			if ($type == "Add") 
				$arr['data'] = "Successfully Created";
			if ($type == "Edit")
				$arr['data'] = "Successfully Updated";
			if ($type == "Delete")
				$arr['data'] = "Successfully Deleted";
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}	

	public function defaultmoduleview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT 
								b.id,
								b.module_name
							FROM modules_default a
								LEFT JOIN modules b ON a.module_id = b.id
							WHERE a.id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 			= $value->id;					
				$record['description']	= $value->module_name;
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

	public function staffslist()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));

			$limit = $_GET['limit'];
			$start = $_GET['start'];

			$commandText = "SELECT 
							    id,
							    concat(fname, ' ', mname, ' ', lname) AS name
							FROM 
								staff
							WHERE 
								(
									id LIKE '%$query%' OR
								    CONCAT(fname, ' ',mname, ' ',lname) LIKE '%$query%'
								)							
							ORDER BY name ASC
							LIMIT $start, $limit";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id' 		=> $value->id,
					'module_users'=> mb_strtoupper($value->name));
			}
			
			die(json_encode($data));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}
}