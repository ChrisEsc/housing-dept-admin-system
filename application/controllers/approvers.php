<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Approvers extends CI_Controller {
	/**
	*/ 
	private function modulename($type)
	{		
		if($type == 'link')
			return 'approvers';
		else 
			return 'Approvers';
	} 

	public function index(){		
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}

	public function transactionlist()
	{ 
		try 
		{			
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));

			die(json_encode($this->generatetransactionlist($query, 'Grid')));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function generatetransactionlist($query, $transaction_type)
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$commandText = "SELECT * FROM approver_transactions
							WHERE (code LIKE '%$query%' OR description LIKE '%$query%')
								AND active = 1
							ORDER BY description DESC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0 & $transaction_type == 'Report') 
			{
				$data = array("success"=> false, "data"=>'No records found!');
				die(json_encode($data));
			}	
			if(count($query_result) == 0 & $transaction_type == 'Grid') 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id'			=> $value->id,
					'code'			=> $value->code,
					'transaction'	=> $value->description);
			}

			$data['count'] = count($query_result);
			return $data;
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function transactioncrud() 
	{
		try 
		{ 
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id				= $this->input->post('id');
			$code			= strip_tags(trim($this->input->post('code')));
			$description 	= strip_tags(trim($this->input->post('transaction')));
			$type			= $this->input->post('type');
			
			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);		
			if ($type == "Delete")
			{
				$commandText = "UPDATE approver_transactions set active = 0 WHERE id = $id";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'approver_transactions', $type, $this->modulename('label'). ' - Transaction');
			}
			else
			{								
				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM approver_transactions WHERE code = '".mysqli_real_escape_string($this->db->conn_id, $code)."'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$this->load->model('approver_transactions');
					$id = 0;
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM approver_transactions WHERE code = '".mysqli_real_escape_string($this->db->conn_id, $code)."'and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$this->load->model('approver_transactions');
					$this->approver_transactions->id = $id;
				}

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Code already exist.");
					die(json_encode($data));
				}

				$this->approver_transactions->code			= $code;
				$this->approver_transactions->description	= $description;
				$this->approver_transactions->active 		= 1;
				$this->approver_transactions->save($id);	

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'approver_transactions', $type, $this->modulename('label'). ' - Transaction');
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

	public function transactionview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT * FROM approver_transactions WHERE id = $id";

			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['code'] 		= $value->code;					
				$record['transaction']	= $value->description;
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

	public function hierarchylist()
	{ 
		try 
		{			
			die(json_encode($this->generatehierarchylist($_GET['transaction_id'], 'Grid')));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function generatehierarchylist($transaction_id, $transaction_type)
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$commandText = "SELECT * FROM approver_hierarchies WHERE approver_transaction_id = $transaction_id ORDER BY sno ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0 & $transaction_type == 'Report') 
			{
				$data = array("success"=> false, "data"=>'No records found!');
				die(json_encode($data));
			}	
			if(count($query_result) == 0 & $transaction_type == 'Grid') 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id'			=> $value->id,
					'description'	=> $value->description,
					'sno'			=> $value->sno);
			}

			$data['count'] = count($query_result);
			return $data;
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function hierarchycrud() 
	{
		try 
		{ 
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id				= $this->input->post('id');
			$transaction_id	= $this->input->post('transaction_id');
			$description	= strip_tags(trim($this->input->post('hierarchy')));
			$remarks		= strip_tags(trim($this->input->post('remarks')));
			$sno 			= strip_tags(trim($this->input->post('sno')));
			$type			= $this->input->post('type');
			
			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);		
			if ($type == "Delete")
			{
				$commandText = "SELECT id FROM approver_list WHERE approver_hierarchy_id = $id";
				$result = $this->db->query($commandText);
				$query_result = $result->result(); 
				
				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Cannot delete record with dependence.");
					die(json_encode($data));
				}

				$commandText = "DELETE FROM approver_hierarchies WHERE id = $id";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'approver_hierarchies', $type, $this->modulename('label'). ' - hierarchy');
			}
			else
			{								
				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM approver_hierarchies WHERE description = '".mysqli_real_escape_string($this->db->conn_id, $description)."' and approver_transaction_id = $transaction_id";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$commandText = "SELECT * FROM approver_hierarchies WHERE sno = '$sno' and approver_transaction_id = $transaction_id";
					$result = $this->db->query($commandText);
					$sno_order = $result->result(); 

					$this->load->model('approver_hierarchies');
					$id = 0;
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM approver_hierarchies WHERE description = '".mysqli_real_escape_string($this->db->conn_id, $description)."' and approver_transaction_id = $transaction_id and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$commandText = "SELECT * FROM approver_hierarchies WHERE sno = '$sno' and approver_transaction_id = $transaction_id and id <> '$id'";
					$result = $this->db->query($commandText);
					$sno_order = $result->result();

					$this->load->model('approver_hierarchies');
					$this->approver_hierarchies->id = $id;
				}

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Hierarchy already exist.");
					die(json_encode($data));
				}
				if(count($sno_order) > 0) 
				{
					$data = array("success"=> false, "data"=>"Order number already exist.");
					die(json_encode($data));
				}

				$this->approver_hierarchies->approver_transaction_id = $transaction_id;
				$this->approver_hierarchies->description	= $description;
				$this->approver_hierarchies->remarks		= $remarks;
				$this->approver_hierarchies->sno 			= $sno;
				$this->approver_hierarchies->save($id);	

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'approver_hierarchies', $type, $this->modulename('label'). ' - Transaction');
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

	public function hierarchyview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT * FROM approver_hierarchies WHERE id = $id";

			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['hierarchy'] 	= $value->description;					
				$record['remarks'] 		= $value->remarks;	
				$record['sno']			= $value->sno;
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

	public function approverslist()
	{ 
		try 
		{			
			die(json_encode($this->generateapproverslist($_GET['hierarchy_id'], 'Grid')));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function generateapproverslist($hierarchy_id, $transaction_type)
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$commandText = "SELECT 
								a.id,
								CONCAT(fname, ' ', mname, ' ', lname) AS approver_names,
								GROUP_CONCAT(d.description SEPARATOR ', ') AS approver_departments
							FROM approver_list a
								LEFT JOIN staff b ON a.approver_id = b.id
								LEFT JOIN approver_departments c ON c.approver_id = a.id
								LEFT JOIN departments d ON d.id = c.department_id
							WHERE a.approver_hierarchy_id = $hierarchy_id
							GROUP BY a.approver_id
							ORDER BY fname ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0 & $transaction_type == 'Report') 
			{
				$data = array("success"=> false, "data"=>'No records found!');
				die(json_encode($data));
			}	
			if(count($query_result) == 0 & $transaction_type == 'Grid') 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id'			=> $value->id,
					'approvers' 	=> mb_strtoupper($value->approver_names),
					'departments'	=> $value->approver_departments);
			}

			$data['count'] = count($query_result);
			return $data;
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function approverscrud() 
	{
		try 
		{ 
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id				= $this->input->post('id');
			$code			= $this->input->post('code');
			$hierarchy_id	= $this->input->post('hierarchy_id');
			$approver_id	= $this->input->post('approver_id');
			$type			= $this->input->post('type');
			
			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);		
			
			if($code == 'STDCRA')
				$module_id = 99;
			if($code == 'STDGSA')
				$module_id = 100;
			if($code == 'FTYCGA')
				$module_id = 107;
			if($code == 'STDCAD')
				$module_id = 106;
			if($code == 'STDRWF' || 
			   $code == 'STDSCA' || 
			   $code == 'STDREA' || 
			   $code == 'STDRWT' || 
			   $code == 'STDCRG' || 
			   $code == 'STDNWF' || 
			   $code == 'STDSCI' || 
			   $code == 'STDNEA' || 
			   $code == 'STDNWT' || 
			   $code == 'STDCNG')
				$module_id = 101;
			if($code == 'STDSRA')
				$module_id = 108;
			if($code == 'STDRAD')
				$module_id = 119;
			if($code == 'STDREM')
				$module_id = 120;
			if($code == 'STDMUE')
				$module_id = 116;
			if($code == 'STDPRV')
				$module_id = 127;
			if($code == 'STFCLR')
				$module_id = 131;
			if($code == 'STRERE')
				$module_id = 141;
			if($code == 'STMARE')
				$module_id = 142;
			if($code == 'FATREQ')
				$module_id = 143;
			if($code == 'PURREQ')
				$module_id = 144;
			if($code == 'TMSREQ')
				$module_id = 158;
			if($code == 'TPPREQ')
				$module_id = 162;
			if($code == 'TFOREQ')
				$module_id = 161;
			if($code == 'TCPREQ')
				$module_id = 163;
			if($code == 'TVIREQ')
				$module_id = 159;
			if($code == 'TVRREQ')
				$module_id = 160;

			

			if ($type == "Delete")
			{
				#delete module access rights
				$commandText = "SELECT 
									COUNT(c.approver_id) AS count_record
								FROM approver_transactions a
									LEFT JOIN approver_hierarchies b ON a.id = b.approver_transaction_id
									LEFT JOIN approver_list c ON b.id = c.approver_hierarchy_id
								WHERE a.code = '$code' AND c.approver_id = (SELECT approver_id FROM approver_list WHERE id = $id)";
				$result = $this->db->query($commandText);
				$query_count = $result->result(); 

				if($query_count[0]->count_record == 1)
				{
					$commandText = "DELETE FROM modules_users WHERE user_id IN (SELECT id FROM users WHERE user_id = (SELECT approver_id FROM approver_list WHERE id = $id)) AND module_id = $module_id";
					$result = $this->db->query($commandText);

				}

				#delete record
				$commandText = "DELETE FROM approver_list WHERE id = $id";
				$result = $this->db->query($commandText);

				$commandText = "DELETE FROM approver_departments WHERE approver_id = $id";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'approver_list', $type, $this->modulename('label'). ' - Approver');
			}
			else
			{								
				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM approver_list WHERE approver_id = $approver_id and approver_hierarchy_id = $hierarchy_id";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM approver_list WHERE approver_id = $approver_id and approver_hierarchy_id = $hierarchy_id and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 
				}

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Approver already exist.");
					die(json_encode($data));
				}

				if ($type == "Edit") 
				{
					$commandText = "DELETE FROM modules_users WHERE user_id = (SELECT approver_id FROM approver_list WHERE id = $id) AND module_id = $module_id";
					$result = $this->db->query($commandText);
				}				

				#add module access rights
				$commandText = "SELECT id FROM users WHERE user_id = $approver_id AND type = 'Staff'";
				$result = $this->db->query($commandText);
				$query_result = $result->result(); 
				$user_id = $query_result[0]->id;

				$commandText = "SELECT COUNT(*) AS count_record FROM modules_users WHERE user_id = $user_id AND module_id = $module_id";
				$result = $this->db->query($commandText);
				$query_count = $result->result(); 

				if($query_count[0]->count_record == 0)
				{	
					$this->load->model('Modules_Users');
					$this->Modules_Users->module_id = $module_id;
					$this->Modules_Users->user_id 	= $user_id;
					$this->Modules_Users->uadd 		= 1;
					$this->Modules_Users->uedit		= 1;
					$this->Modules_Users->udelete 	= 1;
					$this->Modules_Users->save(0);	
				}
				
				$this->load->model('approver_list');
				if ($type == "Add") 
					$id = 0;
				if ($type == "Edit") 				
					$this->approver_list->id = $id;

				$this->approver_list->approver_hierarchy_id = $hierarchy_id;
				$this->approver_list->approver_id			= $approver_id;
				$this->approver_list->save($id);	

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'approver_list', $type, $this->modulename('label'). ' - Approver');
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

	public function approversview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT 
								a.approver_id, 
								CONCAT(fname, ' ', mname, ' ', lname) AS approver_name 
							FROM approver_list a 
								JOIN staff b ON a.approver_id = b.id
							WHERE a.id = $id";

			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['approver_id'] 		= $value->approver_id;					
				$record['approver_name'] 	= mb_strtoupper($value->approver_name);	
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

	public function departmentlist()
	{ 
		try 
		{			
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));

			die(json_encode($this->generatedepartmentlist($_GET['approver_id'], $query, 'Grid')));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function generatedepartmentlist($approver_id, $query, $transaction_type)
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$commandText = "SELECT 
								a.id,
								b.description
							FROM approver_departments a
								JOIN departments b ON a.department_id = b.id
							WHERE b.description LIKE '%$query%' AND a.approver_id = $approver_id
							ORDER BY b.description ";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0 & $transaction_type == 'Report') 
			{
				$data = array("success"=> false, "data"=>'No records found!');
				die(json_encode($data));
			}	
			if(count($query_result) == 0 & $transaction_type == 'Grid') 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}	

			foreach($query_result as $key => $value) 
			{	
				$data['data'][] = array(
					'id'			=> $value->id,
					'description'	=> $value->description);
			}

			$data['count'] = count($query_result);
			return $data;
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function departmentcrud() 
	{
		try 
		{ 
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id				= $this->input->post('id');
			$department_id	= $this->input->post('department_id');
			$approver_id	= $this->input->post('approver_id');
			$type			= $this->input->post('type');
			
			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);		
			if ($type == "Delete")
			{
				$commandText = "DELETE FROM approver_departments WHERE id = $id";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'approver_departments', $type, $this->modulename('label'). ' - Department');
			}
			else
			{								
				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM approver_departments WHERE approver_id = $approver_id and department_id = $department_id";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$this->load->model('approver_departments');
					$id = 0;
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM approver_departments WHERE approver_id = $approver_id and department_id = $department_id and id <> '$id'";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					$this->load->model('approver_departments');
					$this->approver_departments->id = $id;
				}

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Department already exist.");
					die(json_encode($data));
				}

				$this->approver_departments->approver_id	= $approver_id;
				$this->approver_departments->department_id 	= $department_id;
				$this->approver_departments->save($id);	

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'approver_departments', $type, $this->modulename('label'). ' - Department');
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

	public function departmentview()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT 
								a.department_id,
								b.description
							FROM approver_departments a
								LEFT JOIN departments b ON a.department_id = b.id
							WHERE a.id = $id";

			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['department_id'] 	= $value->department_id;					
				$record['department_desc'] 	= $value->description;	
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