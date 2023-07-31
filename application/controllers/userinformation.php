<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Userinformation extends CI_Controller {
	/**
	*/
	private function modulename($type)
	{		
		if($type == 'link')
			return 'userinformation';
		else 
			return 'User Information';
	} 

	public function index(){		
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}

	public function stafflist()
	{ 
		try 
		{
			$query 	= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));

			die(json_encode($this->generatestafflist($query, $_GET['status'], 'Grid')));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function generatestafflist($query, $status, $transaction_type)
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			
			$limitQuery = "";
			if($transaction_type == 'Grid')
			{
				$limit = $_GET['limit'];
				$start = $_GET['start'];
				$limitQuery = " LIMIT $start, $limit";
			}

			if($status == 2) $status = " a.active = 1 AND ";
			else if($status == 3) $status = " a.active = 0 AND ";
			else $status = "";

			$commandText = "SELECT 
								a.id,
								a.employee_id,
								a.employment_status_id,
								CONCAT(fname, ' ', mname, ' ', lname) AS name,
								b.description AS department_desc,
								c.div_code AS division_code,
								c.description AS division_desc,
								d.description AS section_desc,
								e.description AS position_desc,
								g.description AS employment_status_desc,
								IF(a.temp_key = 'Encrypted', '<font color=red>Encrypted</font>', a.temp_key) AS temp_key,
								a.temp_key AS security_key,
								f.username
							FROM staff a
								LEFT JOIN departments b ON a.department_id = b.id
								LEFT JOIN divisions c ON a.division_id = c.id
								LEFT JOIN sections d ON a.section_id = d.id
								LEFT JOIN positions e ON a.position_id = e.id
								LEFT JOIN (SELECT * FROM users WHERE type = 'Staff') f ON a.id = f.user_id
								LEFT JOIN employment_statuses g ON a.employment_status_id = g.id
							WHERE $status
							(
								a.employee_id LIKE '%$query%' OR
								b.description LIKE '%$query%' OR
								b.dept_code LIKE '%$query%' OR
								c.description LIKE '%$query%' OR
								c.div_code LIKE '%$query%' OR
								d.description LIKE '%$query%' OR
								e.description LIKE '%$query%' OR
								a.fname LIKE '%$query%' OR
								a.mname LIKE '%$query%' OR
								a.lname LIKE '%$query%' OR
								CONCAT(a.fname, ' ', if(a.mname = '', '', CONCAT(a.mname, ' ')), a.lname) LIKE '%$query%'
							)
							ORDER BY fname ASC, mname ASC, lname ASC
							$limitQuery";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$commandText = "SELECT count(a.id) as count
							FROM staff a
								LEFT JOIN departments b ON a.department_id = b.id
								LEFT JOIN divisions c ON a.division_id = c.id
								LEFT JOIN sections d ON a.section_id = d.id
								LEFT JOIN positions e ON a.position_id = e.id
								LEFT JOIN (SELECT * FROM users WHERE type = 'Staff') f ON a.id = f.user_id
								LEFT JOIN employment_statuses g ON a.employment_status_id = g.id
							WHERE $status
							(
								a.employee_id LIKE '%$query%' OR
								b.description LIKE '%$query%' OR
								b.dept_code LIKE '%$query%' OR
								c.description LIKE '%$query%' OR
								c.div_code LIKE '%$query%' OR
								d.description LIKE '%$query%' OR
								e.description LIKE '%$query%' OR
								a.fname LIKE '%$query%' OR
								a.mname LIKE '%$query%' OR
								a.lname LIKE '%$query%' OR
								CONCAT(a.fname, ' ', if(a.mname = '', '', CONCAT(a.mname, ' ')),a.lname) LIKE '%$query%'
							)";
			$result = $this->db->query($commandText);
			$query_count = $result->result(); 

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
				$employment_status_abv = '';
				if ($value->employment_status_id == 1)
					$employment_status_abv = '(Reg) ';
				else if ($value->employment_status_id == 2)
					$employment_status_abv = '(Cas) ';
				else if ($value->employment_status_id == 3)
					$employment_status_abv = '(JO) ';

				$position_desc = $employment_status_abv . $value->position_desc;
				//echo $employment_status_abv;

				$data['data'][] = array(
					'id' 				=> $value->id,
					'name'				=> mb_strtoupper($value->name),
					'employee_id'		=> $value->employee_id,
					'department_desc'	=> $value->department_desc,
					'division_code'		=> $value->division_code,
					'division_desc'		=> $value->division_desc,
					'section_desc'		=> $value->section_desc,
					'position_desc' 	=> $position_desc,
					'stype'				=> 'Staff',
					'temp_key'			=> $value->temp_key,
					'username'			=> $value->username,
					'security_key'		=> $value->security_key);
			}

			$data['totalCount'] = $query_count[0]->count;
			return $data;

		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}	

	public function crud() 
	{
		try 
		{ 
			#update session
			$this->load->model('Session');$this->Session->Validate();
			
			$id					= $this->input->post('id');
			$employee_id		= $this->input->post('employee_id');
			$usertype			= $this->input->post('usertype');		//not used yet, will be used when users aside from staffs are needed for the system
			$fname				= strip_tags(trim($this->input->post('fname')));
			$mname 				= strip_tags(trim($this->input->post('mname')));
			$lname				= strip_tags(trim($this->input->post('lname')));
			$department_id 		= $this->input->post('department');
			$division_id		= $this->input->post('division');
			$section_id			= $this->input->post('section');
			$position_id 		= $this->input->post('position');
			$employment_status_id = $this->input->post('employment_status');
			$temp_key 			= $this->input->post('temp_key');	
			//$email			= strip_tags(trim($this->input->post('email')));
			$is_division_head 	= $this->input->post('is_division_head');
			$is_section_head 	= $this->input->post('is_section_head');
			$status				= $this->input->post('status');
			$type				= $this->input->post('type');
			

			$is_division_head 	= isset($is_division_head) ? $is_division_head : 0;
			$is_section_head 	= isset($is_section_head) ? $is_section_head : 0;

			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);		
			if ($type == "Delete")
			{
				$commandText = "UPDATE staff set active = 0 WHERE id = $id";
				$result = $this->db->query($commandText);

				$commandText = "UPDATE users SET active = 0 WHERE user_id = $id";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'staff', $type, $this->modulename('label'));
			}
			else
			{		
				if ($type == "Add") 
				{
					$commandText = "SELECT * FROM staff WHERE ((employee_id = $employee_id) OR (fname = '".mysqli_real_escape_string($this->db->conn_id, $fname)."' and lname = '".mysqli_real_escape_string($this->db->conn_id, $lname)."')) and active = 1";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					// no email address yet
					// $commandText = "SELECT * FROM users WHERE email = '$email'";							
					// $result = $this->db->query($commandText);
					// $query_email = $result->result(); 

					$this->load->model('staff');
					$id = 0;
				}
				if ($type == "Edit") 				
				{
					$commandText = "SELECT * FROM staff WHERE ((employee_id = $employee_id) OR (fname = '".mysqli_real_escape_string($this->db->conn_id, $fname)."' and lname = '".mysqli_real_escape_string($this->db->conn_id, $lname)."')) and id <> '$id'  and active = 1";
					$result = $this->db->query($commandText);
					$query_result = $result->result(); 

					// $commandText = "SELECT * FROM users WHERE email = '$email' AND user_id <> $id";							
					// $result = $this->db->query($commandText);
					// $query_email = $result->result(); 

					$this->load->model('staff');
					$this->staff->id = $id;
				}

				if(count($query_result) > 0) 
				{
					$data = array("success"=> false, "data"=>"Staff already exists.");
					die(json_encode($data));
				}

				// if(count($query_email) > 0) 
				// {
				// 	$data = array("success"=> false, "data"=>'Email Address Already in Use!');
				// 	die(json_encode($data));
				// }

				if(!$status) $status = 0;
				if ($type == "Add") $temp_key = substr(str_shuffle("23456789ABCDEFGHJKLMNPQRSTUVWXYZ"), 0, 6);

				$this->staff->employee_id 			= $employee_id;
				$this->staff->department_id 		= $department_id;
				$this->staff->division_id 			= $division_id;
				$this->staff->section_id 			= $section_id;
				$this->staff->position_id 			= $position_id;
				$this->staff->position_id 			= $position_id;
				$this->staff->employment_status_id 	= $employment_status_id;
				$this->staff->division_head 		= $is_division_head;
				$this->staff->section_head 			= $is_section_head;
				$this->staff->fname 				= $fname;
				$this->staff->mname					= $mname;
				$this->staff->lname					= $lname;
				$this->staff->temp_key 				= $temp_key;
				$this->staff->active 				= $status;
				$this->staff->save($id);	

				if ($type == "Add") 
				{
					#creating user account
					$this->load->model('Cipher');
					$this->Cipher->secretpassphrase();			
					$encryptedtext = $this->Cipher->encrypt($temp_key);

					$this->load->model('Users');
					$this->Users->username 		= mb_strtolower($fname).'.'.mb_strtolower($lname);
					$this->Users->password 		= $encryptedtext;
					$this->Users->user_id 		= $this->staff->id;
					$this->Users->admin 		= 0;
					$this->Users->type 			= 'Staff';
					//$this->Users->email 		= $email;
					$this->Users->active 		= 1;
					$this->Users->save(0);	

					#load default modules
					if($usertype == 1) $commandText = "SELECT module_id FROM modules_default WHERE group_id = 1";

					//for quests or clients - implement soon
					else $commandText = "SELECT module_id FROM modules_default WHERE group_id = 2";
					$result = $this->db->query($commandText);
					$query_result_modules = $result->result(); 

					foreach($query_result_modules as $key => $value) 
					{
						$this->load->model('Modules_Users');
						$this->Modules_Users->module_id = $value->module_id;
						$this->Modules_Users->user_id 	= $this->Users->id;
						$this->Modules_Users->uadd 		= 1;
						$this->Modules_Users->uedit		= 1;
						$this->Modules_Users->udelete 	= 1;
						$this->Modules_Users->save(0);	
					}					
				}
				// else
				// {
				// 	$commandText = "UPDATE users SET email = '$email' WHERE type = 'Staff' AND user_id = $id";
				// 	$result = $this->db->query($commandText);
				// }

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'staff', $type, $this->modulename('label'));
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

	public function view()
	{
		try 
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			
			$id = $this->input->post('id');
			$commandText = "SELECT 
								a.*,
								b.description AS department_desc,
								c.description AS division_desc,
								d.description AS section_desc,
								e.description AS position_desc,
								f.description AS employment_status_desc
							FROM staff a 
								LEFT JOIN departments b ON a.department_id = b.id
								LEFT JOIN divisions c ON a.division_id = c.id
								LEFT JOIN sections d ON a.section_id = d.id
								LEFT JOIN positions e ON a.position_id = e.id
								LEFT JOIN employment_statuses f ON a.employment_status_id = f.id
							WHERE a.id = $id";

			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 						= $value->id;					
				$record['usertype'] 				= 'Staff';
				$record['employee_id'] 				= $value->employee_id;
				$record['fname'] 					= $value->fname;
				$record['mname'] 					= $value->mname;
				$record['lname']					= $value->lname;
				$record['department_id'] 			= $value->department_id;
				$record['department_desc'] 			= $value->department_desc;
				$record['division_id'] 				= $value->division_id;
				$record['division_desc'] 			= $value->division_desc;
				$record['section_id'] 				= $value->section_id;
				$record['section_desc'] 			= $value->section_desc;
				$record['position_id'] 				= $value->position_id;
				$record['position_desc'] 			= $value->position_desc;
				$record['employment_status_id'] 	= $value->employment_status_id;
				$record['employment_status_desc'] 	= $value->employment_status_desc;
				$record['is_division_head'] 		= $value->division_head;
				$record['is_section_head'] 			= $value->section_head;
				//$record['email'] 					= $value->email;
				$record['status'] 					= $value->active;
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

	public function exportdocument()
	{
		$query 	= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('query'))));
		$type 	=  $this->input->post('filetype');
		$status	=  $this->input->post('status');
		
		$response = array();
        $response['success'] = true;
        if($type == "PDF")
        	$response['filename'] = $this->exportpdfStaffList($this->generatestafflist($query, $status, 'Report'));
        else         	
			$response['filename'] = $this->exportexcelStaffList($this->generatestafflist($query, $status, 'Report'));
		$this->load->model('Logs'); $this->Logs->audit_logs(0, 'staff', 'Report-'.$type, 'Staff List');        	
		die(json_encode($response));
	}
	
	public function exportpdfStaffList($data)
	{

		try 
		{

			$this->load->library('PHPExcel/PHPExcel/Shared/PDF/tcpdf');
			$pdf = new TCPDF();
			$fDate = date("Ymd_His"); 
			$filename = "StaffList".$fDate.".pdf";
			
			// set document information
			$pdf->SetCreator(getenv('REPORT_CREATOR'));
			$pdf->SetAuthor(getenv('REPORT_AUTHOR'));
			$pdf->SetTitle('StaffList');
			$pdf->SetSubject('StaffList');
			$pdf->SetKeywords(getenv('REPORT_KEYWORDS'));
			
			//set margins
			$pdf->SetPrintHeader(false);
			$pdf->SetPrintFooter(false);
			
			// add a page
			$pdf->AddPage('P', 'LETTER');
		
			$pdf->Image('image/logo-chudd.png', 10, 8, 20, 20, 'PNG', null, '', true, 300, '', false, false, 0, false, false, false);

			$html  = '
			<table border=1>
				<tr style="font-weight:bold;font-size:45px;">
				  <td width="60"></td>
				  <td style="background: black; padding: 10px;" align="left"><font face="Arial" >'.getenv('DEPARTMENT_NAME_ALL_CAPS').'</font></td>
				</tr>
				<tr style="font-weight:bold;font-size:30px;">
				  <td></td>
				  <td style="background: black; padding: 10px;" align="left"><font face="Arial" >Staff List</font></td>
				</tr>
				<tr style="font-size:15px;">
				  <td></td>
				  <td style="background: black; padding: 10px;" align="left"><font face="Arial" >'.getenv('DEPARTMENT_ADDRESS').'</font></td>
				</tr>
				<tr style="font-size:15px;">
				  <td></td>
				  <td style="background: black; padding: 10px;" align="left"><font face="Arial" >Contact No.: '.getenv('DEPARTMENT_CONTACT_NOS').'</font></td>
				</tr>
			</table>
			<br><br>
			<table border=1>
				<tr style="font-weight:bold;font-size:24px;">
				  <td width="5%"  style="background: black; padding: 10px;" align="center"><font face="Arial" >No.</font></td>
				  <td width="28%"  style="background: black; padding: 10px;" align="left"><font face="Arial" >Name</font></td>
				  <td width="28%"  style="background: black; padding: 10px;" align="left"><font face="Arial" >Department</font></td>
				  <td width="28%"  style="background: black; padding: 10px;" align="left"><font face="Arial" >Division</font></td>
				  <td width="28%"  style="background: black; padding: 10px;" align="left"><font face="Arial" >Section</font></td>
				  <td width="18%"  style="background: black; padding: 10px;" align="left"><font face="Arial" >Position</font></td>
				  <td width="10%"  style="background: black; padding: 10px;" align="left"><font face="Arial" >Type</font></td>
				  <td width="10%"  style="background: black; padding: 10px;" align="left"><font face="Arial" >User Name</font></td>
				  <td width="11%"  style="background: black; padding: 10px;" align="left"><font face="Arial" >Security Key</font></td>
				</tr>';

			for ($i = 0; $i<$data['totalCount'];$i++)
			{
				if($i%2 == 0)
				{
					$html .= '<tr style="background-color:#f7f6f6;font-size:24px;">
					  <td align="center"><font face="Arial" >'.($i+1).'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['name'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['department_desc'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['division_code'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['section_desc'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['position_desc'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['stype'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['username'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['temp_key'].'</font></td>
					</tr>';
				}
				else
				{
					$html .= '<tr style="font-size:24px;">
					  <td align="center"><font face="Arial" >'.($i+1).'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['name'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['department_desc'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['division_code'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['section_desc'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['position_desc'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['stype'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['username'].'</font></td>
					  <td align="left"><font face="Arial" >'.$data['data'][$i]['temp_key'].'</font></td>
					</tr>';
				}
			}

			$html .= '</table><br><br><br>';

			$this->load->library('session');
			$html .= '<div style="font-size:14px;">Printed by:'.$this->session->userdata('name').'
	       			 <br>Date Printed: '.date('m/d/Y h:i:sa').'<br>Print Code: '.$filename.'</div>';
			// output the HTML content
			$pdf->writeHTML($html, true, false, true, false, '');
			$path = "documents";
			$pdf->Output("$path/$filename", 'F');

			return "$path/$filename";
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function exportexcelStaffList($data)
	{
		try 
		{
		 	// Starting the PHPExcel library
	        $this->load->library('PHPExcel');
	 
	        $objPHPExcel = new PHPExcel();
			$objPHPExcel->getActiveSheet()->setShowGridlines(true);
			$objPHPExcel->getActiveSheet()->getDefaultStyle()->getFont()->setName('Arial');
			$objPHPExcel->getActiveSheet()->getDefaultStyle()->getFont()->setSize(10);
			$objPHPExcel->getActiveSheet()->getColumnDimension("A")->setWidth(3);

			$fDate = date("Ymd_His");
			$filename = "StaffList".$fDate.".xls";

			$objPHPExcel->getProperties()->setCreator(getenv('REPORT_CREATOR'))
					      ->setLastModifiedBy(getenv('REPORT_CREATOR'))
					      ->setTitle("StaffList")
					      ->setSubject("Report")
					      ->setDescription("Generating StaffList")
					      ->setKeywords(getenv('REPORT_KEYWORDS'))
					      ->setCategory("Reports");

			#Dimensions
			$objPHPExcel->getActiveSheet()->getColumnDimension('B')->setWidth(10);
			$objPHPExcel->getActiveSheet()->getColumnDimension('C')->setWidth(40);
			$objPHPExcel->getActiveSheet()->getColumnDimension('D')->setWidth(40);
			$objPHPExcel->getActiveSheet()->getColumnDimension('E')->setWidth(10);
			$objPHPExcel->getActiveSheet()->getColumnDimension('F')->setWidth(40);
			$objPHPExcel->getActiveSheet()->getColumnDimension('G')->setWidth(30);
			$objPHPExcel->getActiveSheet()->getColumnDimension('H')->setWidth(15);
			$objPHPExcel->getActiveSheet()->getColumnDimension('I')->setWidth(15);
			$objPHPExcel->getActiveSheet()->getColumnDimension('J')->setWidth(15);			

			#Font & Alignment
			$objPHPExcel->getActiveSheet()->getStyle('B5')->getFont()->setBold(true);
			$objPHPExcel->getActiveSheet()->getStyle('B7:I7')->getFont()->setBold(true);
			$objPHPExcel->getActiveSheet()->getStyle('B7:I7')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
			$objPHPExcel->getActiveSheet()->getStyle('B8')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);

			#Duplicate Cell Styles
			$objPHPExcel->getActiveSheet()->duplicateStyle( $objPHPExcel->getActiveSheet()->getStyle('B8'), 'B9:B'.($data['totalCount']+7));

			### Title
			$objPHPExcel->setActiveSheetIndex(0)->setCellValue("B5", 'Staff List');
			
			###DATE
			$objPHPExcel->setActiveSheetIndex(0)
					      ->setCellValue("B7", "No.")		
					      ->setCellValue("C7", "Name")
					      ->setCellValue("D7", "Department")
					      ->setCellValue("E7", "Division")
					      ->setCellValue("F7", "Section")
					      ->setCellValue("G7", "Position")
					      ->setCellValue("H7", "Type")
					      ->setCellValue("I7", "Username")
					      ->setCellValue("J7", "Password");
	

			for ($i = 0; $i<$data['totalCount'];$i++)
			{
				$objPHPExcel->setActiveSheetIndex(0)
						      ->setCellValue("B".($i+8), ($i+1))		
						      ->setCellValue("C".($i+8), $data['data'][$i]['name'])
						      ->setCellValue("D".($i+8), $data['data'][$i]['department_desc'])
						      ->setCellValue("E".($i+8), $data['data'][$i]['division_code'])
						      ->setCellValue("F".($i+8), $data['data'][$i]['section_desc'])
						      ->setCellValue("G".($i+8), $data['data'][$i]['position_desc'])
						      ->setCellValue("H".($i+8), $data['data'][$i]['stype'])
						      ->setCellValue("I".($i+8), $data['data'][$i]['username'])
						      ->setCellValue("J".($i+8), $data['data'][$i]['security_key']);
		   	}					      
	      	
			$this->load->library('session');
			$objPHPExcel->setActiveSheetIndex(0)->setCellValue("B".($i+15), 'Printed by: '.$this->session->userdata('name'));
			$objPHPExcel->setActiveSheetIndex(0)->setCellValue("B".($i+16), 'Date Printed: '.date('m/d/Y h:i:sa'));
			$objPHPExcel->setActiveSheetIndex(0)->setCellValue("B".($i+17), 'Print Code: '.$filename);
			
			$objPHPExcel->setActiveSheetIndex(0);				
			$objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
			$path = "documents";
			$objWriter->save("$path/$filename");
			return "$path/$filename";

		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}
}