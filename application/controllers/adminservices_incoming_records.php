<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class AdminServices_Incoming_Records extends CI_Controller {
	/**
	*/ 
	private function modulename($type)
	{		
		if($type == 'link')
			return 'adminservices_incoming_records';
		else 
			return 'Incoming Records Tracking';
	} 

	public function index()
	{		
		$this->load->library('session');
		$status = isset($_GET['status']) ? $_GET['status'] : 0;
		$this->session->set_userdata('incoming_communications_status', $status);
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}

	public function incoming_records_list()
	{
		try
		{ 
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			die(json_encode($this->generateincoming_records_list($_GET['record_type_filter'], $_GET['priority'], $_GET['division_filter'], $query, $_GET['status'], $_GET['year'], $_GET['month'], 'Grid')));
		}
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}
 	
	//for printing
	public function incoming_records_printing()
	{
		try
		{ 
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$records_list = json_encode($this->generateincoming_records_list($_GET['record_type_filter'], $_GET['priority'], $_GET['division_filter'], $query, $_GET['status'], $_GET['year'], $_GET['month'],'Grid'));
			$this->testPrinter($records_list);
			die();
		}
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	//updated to filter sections
	public function generateincoming_records_list($record_type_filter, $priority, $division_filter, $query, $status, $year, $month, $transaction_type)
	{
		try
		{
			$this->load->library('session');
			$this->load->library('callable_functions');
			$this->load->helper('text');

			$user_id = $this->session->userdata('user_id');
			//pass filter division
			$user_division_id = $this->session->userdata('division_id');
			$user_section_id = $this->session->userdata('section_id');
			$user_section_head = $this->session->userdata('section_head');
			$limitQuery = "";
			if($transaction_type == 'Grid')
			{
				$limit = $_GET['limit'];
				$start = $_GET['start'];
				$limitQuery = " LIMIT $start, $limit";
			}

			// per division filter (if user is a staff of a division)
			///this is the shit that filters divisions
			$filter = " AND a.division_id LIKE '%$user_division_id%'";//%$query%'
			// record type filter
			if($record_type_filter == 0) $record_type_filter = "";
			else $record_type_filter = " AND a.record_type_id = $record_type_filter";

			// priority filter
			$priority_filter = "AND a.priority = $priority";
			if($priority == 0) $priority_filter = "";
			if($priority == 2) $priority_filter = "AND (a.priority = $priority OR a.priority IS NULL)";
			else if($priority == NULL) $priority_filter = "AND (a.priority = 2 OR a.priority IS NULL)";

			// division filter (if user is comms. encoder, dept. head, and any other user who can see all comms. and who needs division filtering dropdown)
			if($division_filter == 0) 	$division_filter = "";
			else 						$division_filter = " AND a.division_id = $division_filter";

			// status filter
			if($status == 1) $status = " AND a.status LIKE '%Assigning%'";
			else if($status == 2) $status = " AND a.status LIKE '%Acknowledgement%'";
			else if($status == 3) $status = " AND a.status LIKE '%Action Taken%'";
			else if($status == 4) $status = " AND (a.status LIKE '%Closed%' OR a.status LIKE '%Archived%')";
			else if($status == 5) $status = "AND a.status LIKE '%On Process%'";
			else $status = "";

			// year filter
			$year_filter = " AND a.date_logged >= '$year-01-01 00:00:00' AND a.date_logged <= '$year-12-31 11:59:59' ";
			if($year == 0) $year_filter = "";
			else ($year_filter = " AND a.date_logged >= '$year-01-01 00:00:00' AND a.date_logged <= '$year-12-31 11:59:59' ");

			//month_filter
			$month_leading = sprintf("%02s", $month);
			$month_last_day = date("Y-m-t", strtotime($year.'-'.$month_leading.'-'.'01'));
			$month_filter = " AND a.date_logged >='$year-$month_leading-01 00:00:00' AND a.date_logged <= '$month_last_day 00:00:00'";
			if($month == 0) $month_filter = "";
			else ($month_filter = " AND a.date_logged >='$year-$month_leading-01 00:00:00' AND a.date_logged <= '$month_last_day 00:00:00'"); 

			$commandText = "SELECT 
								a.fname,
								a.lname,
								b.description AS division_desc,
								c.description AS section_desc,
								d.description AS position_desc
							FROM staff a
								LEFT JOIN divisions b ON a.division_id = b.id
								LEFT JOIN sections c ON a.section_id = c.id
								LEFT JOIN positions d ON a.position_id = d.id
							WHERE a.id = $user_id";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$data['department_head'] = false;
			$data['division_assigned'] = false;
			$data['is_asst_dept_head'] = false;

			//check if department head
			if ($query_result[0]->position_desc == 'City Government Department Head II')
			{
				$data['department_head'] = true;
				$filter = $division_filter; 	
			} //check if assistant department head
			else if ($query_result[0]->position_desc == 'City Government Assistant Department Head II')
			{
				$data['division_assigned'] = true;
				$data['is_asst_dept_head'] = true;
				$filter = $division_filter; 
			}  //else division_assigned is true
			else
				$data['division_assigned'] = true;
						 
			
			//remove this block if it breaks anything
			if($user_section_head ==1 or ($user_section_id <> 28 and $user_section_id <> 0))
			{
				$sec_filter_1 =$user_section_id.'%'; // e.g. 5 is the first index
				$sec_filter_2 = '%,'.$user_section_id.'%'; // e.g. 5 is the next value				
				$filter = "";
				$filter = " AND a.division_id LIKE '%$user_division_id%' AND 
							(CASE WHEN LENGTH('$user_section_id') = 1 THEN  a.section_id LIKE '$sec_filter_1' OR a.section_id LIKE '$sec_filter_2'
																ELSE a.section_id LIKE '%$user_section_id%' END)
				";
			}
			//division admin assistants
			if($user_section_id == 28)
			{
				$filter = " AND a.division_id LIKE '%$user_division_id%'";
			}	
			//special cases for specific persons
			$fname = $query_result[0]->fname;
			$lname = $query_result[0]->lname;
			if ($fname == "Grizia Marie" or $fname == "Dennis"  or $lname =="Dato" or $lname == "Nolasco")
			{
				$data['division_assigned'] = false;	
				$filter = $division_filter; 
			}

			$commandText = "SELECT 
								a.id,
								a.sequence_number,
								a.communication_number,
								a.date_communication,
								a.date_deadline,
								COALESCE(a.date_deadline, '') as date_deadline,
								b.description AS record_type,
								a.date_logged,
								a.subject,
								COALESCE(a.from_office,'') as from_office,
								c.description AS from_name,
								d.description AS to_name,		
								IF(a.priority = 4, 'Urgent', IF(a.priority = 3, 'High', IF(a.priority = 2, 'Normal','Low') )
								) AS priority,
								
								a.status,
								IF(a.status = 'Pending Division Assigning', '<font color=red><b>PENDING DIVISION ASSIGNING</b></font>',
									IF(a.status = 'Pending Acknowledgement', '<font color=red><b>PENDING ACKNOWLEDGEMENT</b></font>',
										IF(a.status = 'Pending Action Taken', '<font color=red><b>PENDING ACTION TAKEN</b></font>', 
										IF(a.status = 'On Process', '<font color=red><b>ON PROCESS</b></font>', 
											IF(a.status = 'Archived', '<font color=green><b>ARCHIVED</b></font>', '<font color=green><b>CLOSED</b></font>'))))) AS status_style,
								e.description AS division_description,
								
								COALESCE(a.division_id,'') AS division_code,
								COALESCE(a.section_id,'') AS section_code,
								COALESCE(a.side_notes, '') AS side_notes,
								(SELECT COUNT(*) FROM adminservices_records_actions_taken  WHERE record_id = a.id) as action_taken_count,
								f.action_taken,

								COALESCE(
									(SELECT GROUP_CONCAT(CONCAT(date_action_taken,' > ', s2.lname, ' > ',action_taken) SEPARATOR '<br>') FROM adminservices_records_actions_taken a2 
									LEFT JOIN chuddiadb.staff s2 ON a2.staff_id = s2.id 
									WHERE record_id = a.id ORDER BY a2.id DESC),
								'') as actions_taken,  
    

								IF(f.date_action_taken IS NULL, '', DATE_FORMAT(f.date_action_taken, '%e %b %Y')) AS date_action_taken,
								(TIMESTAMPDIFF(DAY, a.date_logged, f.date_action_taken)) AS duration_action_taken,


								COALESCE(g.date_acknowledged, '') as date_acknowledged,
								
								COALESCE(GROUP_CONCAT(
									(SELECT CONCAT(fname, ' ', mname, ' ', lname) FROM chuddiadb.staff where g.staff_id = staff.id)
									SEPARATOR '\n\n'), '') as acknowledger,


								COALESCE(GROUP_CONCAT(
									(SELECT CONCAT(fname, ' ', mname, ' ', lname) FROM chuddiadb.staff where f.staff_id = staff.id)
									SEPARATOR '\n\n'), '') as responder

								FROM adminservices_records_header a
									LEFT JOIN record_types b ON a.record_type_id = b.id
									LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
									LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
									LEFT JOIN divisions e ON a.division_id = e.id
									LEFT JOIN adminservices_records_actions_taken f ON a.action_taken_id = f.id
									LEFT JOIN adminservices_records_acknowledgements g ON a.id = g.record_id
								WHERE (
										b.description LIKE '%$query%'
										OR a.subject LIKE '%$query%'
										OR c.description LIKE '%$query%'
										OR d.description LIKE '%$query%'
										OR e.div_code LIKE '%$query%'
										OR CONCAT(DATE_FORMAT(CURDATE(), '%y'), '-', LPAD(a.sequence_number, 4, '0')) LIKE '%$query%'
										OR f.action_taken LIKE '%$query%'									
									)
								$filter
								$status
								$record_type_filter
								$priority_filter
								$year_filter
								$month_filter
								AND a.communication_type = 'Incoming'
								AND a.active = 1
							GROUP BY a.id
							ORDER BY a.priority DESC, a.status DESC, a.date_communication DESC, a.status DESC
							$limitQuery";
			
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$commandText = "SELECT count(*) as count
							FROM adminservices_records_header a
								LEFT JOIN record_types b ON a.record_type_id = b.id
								LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
								LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
								LEFT JOIN divisions e ON a.division_id = e.id
								LEFT JOIN adminservices_records_actions_taken f ON a.action_taken_id = f.id
							WHERE (
									b.description LIKE '%$query%'
									OR a.subject LIKE '%$query%'
									OR c.description LIKE '%$query%'
									OR d.description LIKE '%$query%'
									OR e.div_code LIKE '%$query%'
									OR CONCAT(DATE_FORMAT(CURDATE(), '%y'), '-', LPAD(a.sequence_number, 4, '0')) LIKE '%$query%'
									OR f.action_taken LIKE '%$query%'
								)
								$filter
								$status
								$record_type_filter
								$priority_filter
								AND a.communication_type = 'Incoming'
								AND a.active = 1
								AND a.status <> 'Archived'
								";

			$result = $this->db->query($commandText);
			$query_count = $result->result();	//LPAD is used to format the sequence number to 3 digits, e.g. '57'->'057'

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
				$control_number = $this->callable_functions->GenerateControlNumber($value->date_communication, $value->date_logged, $value->sequence_number);

				$commandText = "SELECT * FROM adminservices_records_attachments WHERE record_id = $value->id AND active = 1";
				$result = $this->db->query($commandText);
				$attachments_result = $result->result();

				if(count($attachments_result) == 0) 
					$date_uploaded = '';

				//attachments information builder
				$i = 0;
				$attachment_full_names = '';
				$attachment_links = '<ul style="list-style-type:square; padding-left:16px; margin:0"><li>';
				$attachment_descriptions = '<ul style="list-style-type:square; padding-left:16px; margin:0"><li>';

				foreach($attachments_result as $key => $val)
				{
					if($i > 0)
					{
						$attachment_full_names .= ', <br>';
						$attachment_links .= '<li>';
						$attachment_descriptions .=  '<li>';
					}

					$attachment_full_name = $val->attachment_name.".".$val->attachment_extension;
					$attachment_full_names .= $attachment_full_name;
					$attachment_path = './'.getenv('COMMUNICATIONS_TARGET_DIR').$attachment_full_name;
					$attachment_links .= '<a href="'.$attachment_path.'" target=_blank>'.$attachment_full_name.'</a></li>';
					$attachment_descriptions .= $val->description.'</li>';
					$date_uploaded = date('j M Y', strtotime($val->date_uploaded));		//only get the latest date uploaded
					$i++;
				}
				$attachment_links .= '<ul>';

				$details = $this->callable_functions->CommunicationDetailsBuilder($value->record_type, $value->communication_number, $value->subject);
				
				$data['data'][] = array(
					'id' 						=> $value->id,
					'record_type'				=> $value->record_type,
					'control_number' 			=> $control_number,
					'date_communication'		=> date('j M Y', strtotime($value->date_communication)),
					'date_deadline'				=> date('j M Y', strtotime($value->date_deadline)),
					'date_logged'				=> date('j M Y - h:i A', strtotime($value->date_logged)),
					'subject' 					=> stripslashes($details),
					'from_name' 				=> $value->from_name,
					'from_office'				=> $value->from_office,
					'to_name' 					=> $value->to_name,
					'priority'					=> $value->priority,
					'status'					=> $value->status,
					'status_style'				=> $value->status_style,
					'division_description'		=> $value->division_description,
					'division_code'				=> $value->division_code,
					'section_code'				=> $value->section_code,
					'side_notes'				=> mb_strtoupper($value->side_notes),
					'action_taken_count'		=> $value->action_taken_count,
					'action_taken'				=> mb_strtoupper($value->action_taken),
					'date_acknowledged'			=> date('j M Y', strtotime($value->date_acknowledged)), 
					'date_action_taken'			=> $value->date_action_taken,
					'duration_action_taken'		=> $value->duration_action_taken,
					'attachment_full_names' 	=> $attachment_full_names,
					'attachment_links'			=> $attachment_links,
					'date_uploaded'				=> $date_uploaded,
					'attachment_descriptions'	=> $attachment_descriptions,
					'acknowledger'				=> $value->acknowledger,
					'responder'					=>  $value->responder,
					'actions_taken'				=>  $value->actions_taken
				);
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

	public function view()
	{
		try
		{
			die(json_encode($this->generateview($this->input->post('id'))));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generateview($id)
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			$this->load->library('callable_functions');

			#header details
			$commandText = "SELECT 
								a.date_communication,
								a.date_logged,
								a.date_deadline,
								a.from_office,
								a.sequence_number,
								a.communication_number,
								a.subject,
								b.description AS record_type,
								c.description AS from_name,
								d.description AS to_name
							FROM adminservices_records_header a
								LEFT JOIN record_types b ON a.record_type_id = b.id
								LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
								LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
							WHERE a.id = $id AND a.active = 1 AND a.communication_type = 'Incoming'";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			foreach($query_result as $key => $val)
			{
				$control_number = $this->callable_functions->GenerateControlNumber($val->date_communication, $val->date_logged, $val->sequence_number);
				$details = $this->callable_functions->CommunicationDetailsBuilder($val->record_type, $val->communication_number, $val->subject);

				$data['header_details'][] = array(
					'control_number'		=> $control_number,
					'date_communication' 	=> date('m/d/Y', strtotime($val->date_communication)),
					'date_deadline' 		=> date('m/d/Y', strtotime($val->date_deadline)),
					'details' 				=> stripslashes($details),
					'from_name' 			=> $val->from_name,
					'to_name' 				=> $val->to_name,
					'from_office'			=> $val->from_office
				);
			}

			#tracking details
			$commandText = "SELECT 
								a.date_logged,
								a.date_deadline,
								a.status,
								IF(b.description IS NULL, '', b.description) AS assigned_division_name,
								a.side_notes,
								IF(c.action_taken IS NULL, '', c.action_taken) AS action_taken,
								IF(c.date_action_taken IS NULL, '', DATE_FORMAT(c.date_action_taken, '%m/%d/%Y')) AS date_action_taken,
								IF((TIMESTAMPDIFF(DAY, a.date_logged, c.date_action_taken)) IS NULL, '', (TIMESTAMPDIFF(DAY, a.date_logged, c.date_action_taken))) AS duration_action_taken
							FROM adminservices_records_header a
								LEFT JOIN divisions b ON a.division_id = b.id
								LEFT JOIN adminservices_records_actions_taken c ON a.action_taken_id = c.id
							WHERE a.id = $id AND a.active = 1";
			$result = $this->db->query($commandText);
			$tracking_result = $result->result();

			foreach($tracking_result as $key => $val)
			{
				$data['tracking_details'][] = array(
					'date_logged'				=> date('m/d/Y - h:i A', strtotime($val->date_logged)),
					'date_deadline			' 	=> date('m/d/Y', strtotime($val->date_deadline)),
					'status'					=> $val->status,
					'assigned_division_name'	=> $val->assigned_division_name,
					'side_notes'				=> mb_strtoupper($val->side_notes),
					'action_taken'				=> $val->action_taken,
					'action_taken_date'			=> $val->date_action_taken,
					'duration_action_taken'		=> $val->duration_action_taken
				);
			}

			#filed copy details
			$commandText = "SELECT * 
							FROM adminservices_records_attachments 
							WHERE record_id = $id 
								AND active = 1";
			$result = $this->db->query($commandText);
			$attachments_result = $result->result();

			foreach($attachments_result as $key => $val)
			{
				$attachment_full_name = $val->attachment_name.".".$val->attachment_extension;
				$attachment_path = '../'.getenv('COMMUNICATIONS_TARGET_DIR').$attachment_full_name;

				$data['attachments'][] = array(
					'attachment_name' 		=> $val->attachment_name,
					'attachment_full_name' 	=> $attachment_full_name,
					'attachment_path'		=> $attachment_path,
					'date_uploaded'			=> $val->date_uploaded,
					'description'			=> $val->description
				);
			}

			$data["success"] = true;			
			$data["accounts_count"] = count($query_result);
			$data["history_count"] = count($tracking_result);
			$data["attachments_count"] = count($attachments_result);

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

			$id						= $this->input->post('id');
			$record_type_id			= $this->input->post('record_type_id');
			$from_id				= $this->input->post('from_id');
			$from_office	 		= $this->input->post('from_office');
			$to_id					= $this->input->post('to_id');
			$sequence_number		= $this->input->post('sequence_number');
			$communication_number	= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('communication_number'))));
			$date_communication 	= date('Y-m-d',strtotime($this->input->post('date_communication')));
			$date_deadline			= date('Y-m-d',strtotime($this->input->post('date_deadline')));
			$subject				= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('subject'))));
			$from_name				= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('from_name'))));
			$to_name				= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('to_name'))));
			$type 					= $this->input->post('type');

			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);

			if ($type == "Delete")
			{
				$commandText = "UPDATE adminservices_records_header SET active = 0 WHERE id = $id";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_records_header', $type, $this->modulename('label'));
			}
			else
			{
				if ($type == "Add")
				{
					$commandText = "SELECT * FROM adminservices_records_header WHERE active = 1 AND ((sequence_number LIKE '%$sequence_number%' AND YEAR(date_communication) = YEAR(CURDATE())) OR subject LIKE '%$subject%') AND communication_type = 'Incoming'";
					$result = $this->db->query($commandText);
					$query_result = $result->result();

					$this->load->model('adminservices_records_header');
					$this->adminservices_records_header->date_logged		= date('Y-m-d H:i:s');
					$this->adminservices_records_header->status 			= 'Pending Division Assigning';
					$this->adminservices_records_header->date_deadline		= $date_deadline;
					$this->adminservices_records_header->from_office		= $from_office;
					$id = 0;
				}
				else if ($type == "Edit")
				{
					$division_id 		= $this->input->post('division_id');
					$section_id			= $this->input->post('section_id');
					$action_taken_id 	= $this->input->post('action_taken_id');
					$side_notes 		= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('side_notes'))));
					$status 			= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('status'))));

					$commandText = "SELECT * FROM adminservices_records_header WHERE id <> $id AND active = 1 AND ((sequence_number LIKE '%$sequence_number%' AND YEAR(date_communication) = YEAR(CURDATE())) OR subject LIKE '%$subject%')  AND communication_type = 'Incoming'";
					$result = $this->db->query($commandText);
					$query_result = $result->result();

					$commandText = "SELECT date_logged FROM adminservices_records_header WHERE id = $id";
					$result = $this->db->query($commandText);
					$query_result2 = $result->result();

					$this->load->model('adminservices_records_header');
					$this->adminservices_records_header->id 				= $id;
					$this->adminservices_records_header->division_id		= $division_id;
					$this->adminservices_records_header->action_taken_id	= $action_taken_id;
					$this->adminservices_records_header->date_logged		= $query_result2[0]->date_logged;
					$this->adminservices_records_header->side_notes			= $side_notes;
					$this->adminservices_records_header->status 			= $status;
				}

				if (count($query_result) > 0)
				{
					$data = array("success"=> false, "data"=>"Incoming record already exists! Check sequence # and subject.");
					die(json_encode($data));
				}

				$from_id = $this->SaveRetrieveRecordAddressID($from_id, $from_name);
				$to_id = $this->SaveRetrieveRecordAddressID($to_id, $to_name);

				$this->adminservices_records_header->sequence_number 		= $sequence_number;
				$this->adminservices_records_header->communication_number 	= $communication_number;
				$this->adminservices_records_header->record_type_id 		= $record_type_id;
				$this->adminservices_records_header->subject 				= $subject;
				$this->adminservices_records_header->from_id 				= $from_id;
				$this->adminservices_records_header->to_id 					= $to_id;
				$this->adminservices_records_header->date_communication		= $date_communication;
				$this->adminservices_records_header->date_deadline			= $date_deadline;
				$this->adminservices_records_header->communication_type		= 'Incoming';
				$this->adminservices_records_header->active 				= 1;
				$this->adminservices_records_header->save($id);
				
				#if type is add, prepare the actions taken table for the certain record id
				if ($type == "Add")
				{
					$record_id = $this->adminservices_records_header->id;
					$this->load->model('adminservices_records_actions_taken');
					$this->adminservices_records_actions_taken->record_id 	= $record_id;
					$this->adminservices_records_actions_taken->save(0);
					
					$action_taken_id = $this->adminservices_records_actions_taken->id;

					$commandText = "UPDATE adminservices_records_header SET action_taken_id = $action_taken_id WHERE id = $record_id";
					$result = $this->db->query($commandText);
				}
				// else if ($type == "Edit")
				// 	$this->adminservices_records_header->update($id);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_records_header', $type, $this->modulename('label'));
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
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function headerview()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			$this->load->library('callable_functions');
			
			$id = $this->input->post('id');

			$commandText = "SELECT 
								a.*,
								b.description AS record_type,
								c.description AS from_name,
								d.description AS to_name
							FROM adminservices_records_header a
								LEFT JOIN record_types b ON a.record_type_id = b.id
								LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
								LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
							WHERE a.id = $id AND a.active = 1";

			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$data = array();
			$record = array();

			// $details = $this->callable_functions->CommunicationDetailsBuilder($value->record_type, $value->communication_number, $value->subject);

			foreach($query_result as $key => $value) 
			{	
				// $control_number = $this->callable_functions->GenerateControlNumber($value->date_communication, $value->date_logged, $value->sequence_number);

				$record['id'] 					= $value->id;
				$record['record_type_id']		= $value->record_type_id;
				$record['from_id']				= $value->from_id;
				$record['from_office']			= $value->from_office;
				$record['to_id']				= $value->to_id;
				$record['section_id']			= $value->section_id;
				$record['priority']				= $value->priority;
				$record['division_id']			= $value->division_id;
				$record['action_taken_id']		= $value->action_taken_id;
				$record['sequence_number']		= $value->sequence_number;
				$record['communiscation_number']	= $value->communication_number;
				// $record['control_number']		= $value->control_number;
				$record['date_communication']	= date('m/d/Y', strtotime($value->date_communication));
				$record['date_deadline']	= date('m/d/Y', strtotime($value->date_deadline));
				$record['date_logged']			= date('m/d/Y - h:i A', strtotime($value->date_logged));
				//$record['date_deadline']		 = $value->date_deadline;
				
				// $record['details']				= stripslashes($value->details);
				$record['subject']				= stripslashes($value->subject);
				$record['side_notes']			= stripslashes($value->side_notes);
				$record['status']				= $value->status;
				$record['record_type']			= $value->record_type;
				$record['from_name']			= $value->from_name;
				$record['to_name']				= $value->to_name;
				//$this->adminservices_records_header->date_deadline		= $date_deadline;
		
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

	public function divisionassignment_view()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT 
								a.id,
								COALESCE(a.division_id,'') as division_id,
								COALESCE(a.section_id,'') as section_id,
								b.description AS division_description,
								IF(a.priority IS NULL, 2, a.priority) AS priority_id,
								IF(a.priority = 4, 'Urgent', IF(a.priority = 3, 'High', IF(a.priority = 2, 'Normal','Low') )
								) AS priority_description,								
								a.side_notes
							FROM adminservices_records_header a
								LEFT JOIN divisions b ON a.division_id = b.id
							WHERE a.id = $id AND a.active = 1";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 					= $value->id;
				$record['section_id']			= $value->section_id;
				$record['division_id']			= $value->division_id;
				$record['priority_id']			= $value->priority_id;
				$record['division_description']	= $value->division_description;
				$record['priority_description']	= $value->priority_description;
				$record['side_notes']			= $value->side_notes;
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

	public function divisionassignment_crud()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id						= $this->input->post('id');
			$division_id			= $this->input->post('division_id');
			$section_id				= $this->input->post('section_id');
			$priority 				= $this->input->post('priority_id');
			$side_notes				= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('side_notes'))));

			$commandText = "UPDATE adminservices_records_header SET division_id = $division_id, section_id = $section_id, priority = $priority, side_notes = '$side_notes', status = 'Pending Acknowledgement' WHERE id = $id";
			$result = $this->db->query($commandText);

			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_records_header', 'Update Assignment', $this->modulename('label'));
			
			$arr = array();  
			$arr['success'] = true;
			$arr['data'] = "Successfully Updated";
			die(json_encode($arr));
		}
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	//updated to match updates to actiontaken_crud, only displays latest record
	public function actiontaken_view()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT 
								a.id,
								a.action_taken,
								a.date_action_taken
							FROM adminservices_records_actions_taken a 
								LEFT JOIN adminservices_records_header b on a.id = b.action_taken_id
							WHERE a.record_id = $id ORDER BY a.id DESC LIMIT 1"; 
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 					= $value->id;
				$record['action_taken']			= $value->action_taken;
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
	
	//updated to match updates to incoming action taken
	public function actiontaken_crud()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			$id						= $this->input->post('id');
			$user_id				= $this->session->userdata('user_id');
			$action_taken			= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('action_taken'))));
			$status			=  mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('radmod'))));			
			$date_updated			= date('Y-m-d H:i:s');
			
			#Step 1: Always create a new entry per action.
			$record_id = $id; 
			$this->load->model('adminservices_records_actions_taken');
			$this->adminservices_records_actions_taken->record_id 	= $record_id;
			$this->adminservices_records_actions_taken->action_taken = $action_taken;
			$this->adminservices_records_actions_taken->staff_id = $user_id;
			$this->adminservices_records_actions_taken->date_action_taken = $date_updated;
			$this->adminservices_records_actions_taken->save(0);
			$action_taken_id = $this->adminservices_records_actions_taken->id;

			#Step 2: Reflect latest action on record.
			$commandText = "UPDATE adminservices_records_header SET action_taken_id = $action_taken_id WHERE id = $record_id";
			$result = $this->db->query($commandText);	
			#Step 2B: Process
			$commandText = "UPDATE adminservices_records_header SET status = 'On Process' WHERE id = $id";
			$result = $this->db->query($commandText);
			
			#Step 3: Update record based on conditionals from actions
			if(strtoupper($status) == strtoupper('isComplete'))
			{			
				$commandText = "UPDATE adminservices_records_header SET status = 'Closed' WHERE id = $id";
				$result = $this->db->query($commandText);
			}
			else{			
				$commandText = "UPDATE adminservices_records_header SET status = 'On Process' WHERE id = $id";
				$result = $this->db->query($commandText);
			}

			#Step 4: Insert text blast maybe?

			#Final: Post activity to audit log. 
			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_records_header', 'Add Action Taken', $this->modulename('label'));
			
			$arr = array();  
			$arr['success'] = true;
			$arr['data'] = "Successfully Updated";
			die(json_encode($arr));
		}
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function acknowledgecommunication_crud()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id						= $this->input->post('id');
			$commandText 			= "SELECT status FROM adminservices_records_header WHERE id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			if ($query_result[0]->status == "Closed" || $query_result[0]->status == "Pending Action Taken")
			{
				$data = array("success" => false, "data" => "Communication already acknowledged.");
				die(json_encode($data));
			}

			$this->load->model('adminservices_records_acknowledgements');
			$this->adminservices_records_acknowledgements->record_id 			= $id;
			$this->adminservices_records_acknowledgements->staff_id 			= $this->session->userdata('user_id');
			$this->adminservices_records_acknowledgements->date_acknowledged 	= date('Y-m-d H:i:s');
			$this->adminservices_records_acknowledgements->save(0);

			// update status after logging the acknowledgement details
			$commandText = "UPDATE adminservices_records_header SET status = 'Pending Action Taken' WHERE id = $id";
			$result = $this->db->query($commandText);

			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_records_header', 'Acknowledge communication', $this->modulename('label'));

			$arr = array();
			$arr['success'] = true;
			$arr['data'] = "Successfully acknowledged.";
			die(json_encode($arr));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function viewstatistics()
	{
		try
		{
			die(json_encode($this->generateviewstatistics($_GET['calendar_year'], $_GET['division_id'])));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generateviewstatistics($calendar_year, $division_id)
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			if ($division_id == 0) {
				$division_filter = " ";
				$division_filter2 = " "; 
			}
			else {
				$division_filter = "AND a.division_id = " . $division_id;
				$division_filter2 = "AND division_id =  " . $division_id; 
			}


			$commandText = "SELECT calendar_month FROM calendar WHERE calendar_year = $calendar_year";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			foreach($query_result as $key => $val)
			{
				#Answered, unanswered, unassigned, longest, shortest, average MERGED
				$commandText = "SELECT
									COUNT(IF(STATUS = 'Closed' $division_filter2, 1, NULL)) AS answered_communications,
									COUNT(IF(STATUS = 'Pending Action Taken' $division_filter2, 1, NULL)) AS unanswered_communications,
									COUNT(IF(STATUS = 'Pending Division Assigning', 1, NULL)) AS unassigned_communications,
									(
										SELECT (TIMESTAMPDIFF(DAY, a.date_logged, b.date_action_taken)  - (SELECT COUNT(holiday_date) FROM calendar_holidays WHERE holiday_date BETWEEN a.date_logged AND b.date_action_taken)) AS longest_duration 
										FROM adminservices_records_header a 
											LEFT JOIN adminservices_records_actions_taken b ON b.record_id = a.id
										WHERE a.status = 'CLOSED'
											$division_filter
											AND MONTH(a.date_logged) = MONTH(STR_TO_DATE('$val->calendar_month', '%M'))
											AND a.communication_type = 'Incoming' 
											AND YEAR(a.date_logged) = $calendar_year
										ORDER BY longest_duration DESC 
										LIMIT 1 
									) AS longest_duration,
									(
										SELECT (TIMESTAMPDIFF(DAY, a.date_logged, b.date_action_taken) - (SELECT COUNT(holiday_date) FROM calendar_holidays WHERE holiday_date BETWEEN a.date_logged AND b.date_action_taken)) AS shortest_duration
										FROM adminservices_records_header a
											LEFT JOIN adminservices_records_actions_taken b ON b.record_id =	 a.id
										WHERE a.status = 'CLOSED'
											$division_filter
											AND MONTH(a.date_logged) = MONTH(STR_TO_DATE('$val->calendar_month', '%M'))
											AND a.communication_type = 'Incoming'
											AND YEAR(a.date_logged) = $calendar_year
										ORDER BY shortest_duration ASC
										LIMIT 1
									) AS shortest_duration,
									(
										SELECT AVG((TIMESTAMPDIFF(DAY, a.date_logged, b.date_action_taken) - (SELECT COUNT(holiday_date) FROM calendar_holidays WHERE holiday_date BETWEEN a.date_logged AND b.date_action_taken)))
										FROM adminservices_records_header a
											LEFT JOIN adminservices_records_actions_taken b ON b.record_id = a.id
										WHERE a.status = 'CLOSED'
											$division_filter
											AND MONTH(a.date_logged) = MONTH(STR_TO_DATE('$val->calendar_month', '%M'))
											AND a.communication_type = 'Incoming'
											AND YEAR(a.date_logged) = $calendar_year
									) AS average_duration
								FROM adminservices_records_header
								WHERE
									MONTH(date_logged) = MONTH(STR_TO_DATE('$val->calendar_month', '%M'))
									AND YEAR(date_logged) = $calendar_year
									AND communication_type = 'Incoming'";
				$result = $this->db->query($commandText);
				$query_result2 = $result->result();

				$data['statistics_details'][] = array(
					'calendar_month'			=> $val->calendar_month,
					'Answered'	=> $query_result2[0]->answered_communications,
					'Unanswered'	=> $query_result2[0]->unanswered_communications,
					'Unassigned'	=> $query_result2[0]->unassigned_communications,
					'shortest_duration'			=> isset($query_result2[0]->shortest_duration) ? $query_result2[0]->shortest_duration : 0,
					'longest_duration'			=> isset($query_result2[0]->longest_duration) ? $query_result2[0]->longest_duration : 0,
					'average_duration'			=> isset($query_result2[0]->average_duration) ? round($query_result2[0]->average_duration, 2) : 0
				);
			}

			return $data;
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function upload_document()
	{
		try
		{
			$this->load->library('callable_functions');

			#update session
			$this->load->model('Session');$this->Session->Validate();

			$record_id 		= $this->input->post('record_id');
			$com_type 		= $this->input->post('com_type');
			$type 			= $this->input->post('type');

			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);

			if ($type == "Upload")
			{
				$commandText = "SELECT date_communication, date_logged, sequence_number FROM adminservices_records_header WHERE id = $record_id";
				$result = $this->db->query($commandText);
				$query_result = $result->result();

				// $control_number = $this->callable_functions->GenerateControlNumber($query_result[0]->date_communication, $query_result[0]->date_logged, $query_result[0]->sequence_number);

				$name 				= $_FILES['form-file']['name'];
				$source 			= $_FILES['form-file']['tmp_name'];
				$description		= strip_tags(trim($this->input->post('description')));

				$path = getenv('COMMUNICATIONS_TARGET_DIR');
				$valid_formats = array("doc", "docx", "pdf", "xls", "xlsx", "jpg", "png");

				$arr = array();
				list($txt, $ext) = explode(".", $name);

				#identify the file extension, if cant identify set success to false
				$countExt = count(explode(".", $name));
				if ($countExt > 2)
				{
					$arr['success'] = false;
					$arr['data'] = "Unable to determine file system type.";
					die(json_encode($arr));				
				}

				if (in_array($ext, $valid_formats))
				{
					if ($com_type == 'Incoming')
						$name = $query_result[0]->sequence_number.' INCOMING '.$name;
					else
						$name = $query_result[0]->sequence_number.' OUTGOING '.$name;

					if (move_uploaded_file($source,$path.$name))
					{
						list($txt, $ext) = explode(".", $name);

						$this->load->model('adminservices_records_attachments');
						$this->adminservices_records_attachments->active 					= 1;
						$this->adminservices_records_attachments->record_id 				= $record_id;
						$this->adminservices_records_attachments->attachment_name			= $txt;
						$this->adminservices_records_attachments->attachment_extension		= $ext;
						$this->adminservices_records_attachments->description				= $description;
						$this->adminservices_records_attachments->date_uploaded				= date('Y-m-d H:i:s');
						$this->adminservices_records_attachments->save(0);

						$this->load->model('Logs'); $this->Logs->audit_logs($record_id, 'adminservices_records_attachments', $type.' '.$com_type, $this->modulename('label'));

						// set status to closed if the communication type is outgoing
						if ($com_type == 'Outgoing')
						{
							// check if action taken is present
							$commandText = "SELECT date_action_taken FROM adminservices_records_actions_taken WHERE record_id = $record_id";
							$result = $this->db->query($commandText);
							$query_result = $result->result();

							// check if date_action_taken is NULL or not, NULL means no action taken
							if ($query_result[0]->date_action_taken != NULL)
								$commandText = "UPDATE adminservices_records_header SET status = 'Closed' WHERE id = $record_id";
							else
								$commandText = "UPDATE adminservices_records_header SET status = 'Pending Action Taken' WHERE id = $record_id";
							$result = $this->db->query($commandText);
						}
					}
					else
					{
						$arr['success'] = false;
						$arr['data'] = "File upload failed.";
						die(json_encode($arr));
					}
				}
				else
				{
					$arr['success'] = false;
					$arr['data'] = 'File '. $name . ', Invalid format!';
					die(json_encode($arr));	
				}
			}

			$arr['success'] = true;
			if ($type == "Delete")
				$arr['data'] = "Successfully Deleted";
			else
				$arr['data'] = "Successfully Uploaded";
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=>false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	//make this a general function soon (cannot be put on library because there is a db query)
	private function SaveRetrieveRecordAddressID($id, $name)
	{
		try
		{
			$commandText = "SELECT * FROM adminservices_records_from_to WHERE description LIKE '%$name%'";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			if (count($query_result) == 0)
			{
				$this->load->model('adminservices_records_from_to');
				$this->adminservices_records_from_to->description 		= $name;
				$this->adminservices_records_from_to->save(0);

				$address_id = $this->adminservices_records_from_to->id;
			}
			else
			{
				$address_id = $query_result[0]->id; 
			}

			return $address_id;
		}
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	function testPrinter($records_list)
	{
		$store_raw = $records_list;
		$data_store = json_decode($store_raw, true);
		$data_test = $this->input->post('data_test');

		$pdf_title = 'CHUDDIA Incoming Communications';
		$header = array(
			array(
				'header' => '#'
				,'dataIndex' => 'id'
				,'width' => '5'
				),
			array(
				'header' => 'CONTROL NO.'
				,'dataIndex' => 'control_number'
				,'width' => '11'
				),
			array(
				'header' => 'COMM. DATE'
				,'dataIndex' => 'date_communication'
				,'width' => '10'
				),
			array(
				'header' => 'DETAILS'
				,'dataIndex' => 'subject'
				,'width' => '30'
				),
			array(
				'header' => 'FROM'
				,'dataIndex' => 'from_name'
				,'width' => '11'
				),
			array(
				'header' => 'FROM OFFICE'
				,'dataIndex' => 'from_office'
				,'width' => '11'
				),
			array(
				'header' => 'PRIORITY'
				,'dataIndex' => 'priority'
				,'width' => '9'
				),
			array(
				'header' => 'STATUS'
				,'dataIndex' => 'status'
				,'width' => '11'
				)		
			);

		$filter = array(
			array(
				'labelWidth' => 20,
				'valueWidth' => 100
                // ,array(
				// 	'label' => 'Data'
				// 	// ,'value' => $post['projectAreaName']
				// 	// ,'value' => $post['projectAreaName'].' - FRIMP'
				// 	,'value' => 'Barangay 10'
				// )
				// ,array(
				// 	'label' => 'Sort by'
				// 	,'value' => 'Applicant Name' 
				// 	// ,'value' => 'BLK/LOT/HSE' 
				// )
				// ,array(
				// 	'label' => 'Staff'
				// 	,'value' => ( isset($post['staffname']) ? $post['staffname'] : 'All' )
                // )
                	
            ),
		);	
		$array = array(
			 'orientation'=> 'L'
			 //,'file_name'=> 'test' //$post['pdfTitle']
			 ,'file_name'=> $pdf_title
			 ,'folder_name'=> 'reports'
			 ,'records'=> $data_store['data'] 
			 ,'header'=> $header
			 ,'headerFields'=> $filter
			 ,'header_font_size'=>9
			 ,'row_font_size'=>9
			//  ,'withSignatories'=>true
		);

		generateTcpdf($array);
	}
}