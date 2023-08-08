<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Elogbook_Reports extends CI_Controller {
	/**
	*/
	private function modulename($type)
	{
		if($type == 'link')
			return 'elogbook_reports';
		else
			return 'E-Logbook Reports';
	}

	public function index()
	{
		$this->load->model('Page');
		$this->Page->set_page($this->modulename('link'));
	}	

	public function sectionstree()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$user_id 				= $this->session->userdata('user_id');
			$staff_name 			= $this->session->userdata('name');
			$user_section_id		= $this->session->userdata('section_id');
			$user_division_id 		= $this->session->userdata('division_id');

			$commandText = "SELECT division_head FROM staff WHERE id = $user_id";
			$result = $this->db->query($commandText);
			$division_head_result = $result->result();

			$commandText = "SELECT * FROM chuddiadb.divisions WHERE div_code <> 'DH'";
			$result = $this->db->query($commandText);
			$divisions_result = $result->result();


			foreach($divisions_result as $key => $divisions_value)
			{
				$is_division_tree_expanded = ($divisions_value->id == $user_division_id ? true : false);
				$node_disabled = true;
			
				$division = $divisions_value->div_code;
				$commandText = "SELECT * FROM chuddiadb.sections WHERE division_id = $divisions_value->id";
				$result = $this->db->query($commandText);
				$sections_result = $result->result();

				#select the division head and division admin assistant of the division, use employee id to prevent ID duplication from section id
				$commandText = "SELECT employee_id AS staff_id, CONCAT(fname, ' ', mname, ' ', lname) AS staff_name
								FROM chuddiadb.staff
								WHERE (division_head = 1 OR section_id = 28)
									AND section_head = 0
									AND division_id = $divisions_value->id
								ORDER BY division_head DESC";
				$result = $this->db->query($commandText);
				$division_othernames_result = $result->result();

				// if division_id is the div_id of user and the user is division head or div. asstnt., set default section for viewing of logbook/pass slip entries
				if($divisions_value->id == $user_division_id && ($division_head_result[0]->division_head == 1 || $user_section_id == 28))
				{
					$set_section = true;
					$node_disabled = false;
				}

				// allow ADH, Personnel Head, ASSD Head, and ADH to view all logbook and pass slip entries
				if ($staff_name == 'JOHN DOE')
				{
					$is_division_tree_expanded = true;
					$node_disabled = false;
					$set_section = true;
				}

				if ($staff_name == 'JANE DOE')
				{
					$is_division_tree_expanded = true;
					$set_section = true;
					$node_disabled = false;
				}

				$i = 0;
				// add div. head and div. admin assistant name to sections_array
				foreach($division_othernames_result as $key => $division_othernames_value)
				{
					$sections_array[] = array(
						'id' 					=> $division_othernames_value->staff_id,
						'text'					=> $division_othernames_value->staff_name,
						'leaf'					=> true,
						'disabled'				=> $node_disabled,
						'iconCls'				=> "person",
						'isDivHead' 			=> ($i == 0 ? true : false),
						'isDivAdminAssistant' 	=> ($i > 0 ? true : false)
					);
					$i++;
				}

				foreach($sections_result as $key => $sections_value)
				{
					$qtip = $sections_value->description;

					if ($user_section_id == $sections_value->id)
						$qtip = 'This Section';

					// if division head or div. asstnt., set default view to 1st section on the tree list
					if (isset($set_section) && $set_section == true)
					{
						$qtip = 'This Section';
						$set_section = false;
					}

					$sections_array[] = array(
						'id' 					=> $sections_value->id,
						'text'					=> $sections_value->description,
						'leaf'					=> true,
						'disabled'				=> $node_disabled,
						// 'iconCls'			=> "person",
						'isDivHead'				=> false,
						'isDivAdminAssistant'	=> false,
						'qtip' 					=> $qtip
					);
				}
				
				$divisions_array[] = array(
					'text'		=> $divisions_value->description,
					'expanded' 	=> $is_division_tree_expanded,
					'children'	=> $sections_array
				);

				$sections_array = null;
			}
			$record = array();
			$record['text'] 	= 'Divisions';
			$record['cls']		= 'folder';
			$record['expanded'] = true;
			$record['children'] = $divisions_array;

			$data = array();
			$data[] = $record;
			die(json_encode($data));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function elogbook_reportslist()
	{
		try
		{
			die(json_encode($this->generateelogbook_reportslist()));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generateelogbook_reportslist()
	{
		try
		{
			$section_id 				= $_GET['section_id'];
			$logbook_type 				= $_GET['logbook_type'];
			$month_id 					= $_GET['month_id'];
			$year 						= $_GET['year'];
			$staff_id 					= $_GET['staff_id'];
			$expected_deliverable_id 	= $_GET['expected_deliverable_id'];

			$staff_id_array[] = $staff_id;
			if($staff_id == 0)
			{
				$commandText = "SELECT id
								FROM chuddiadb.staff
								WHERE section_id = $section_id";
				$result = $this->db->query($commandText);
				$query_result = $result->result();

				foreach($query_result as $key => $value) 
				{	
					$staff_id_array[] = array(
						'id' 			=> $value->id
					);
				}
			}

			$staff_filter = " AND a.staffID = $staff_id";
			if($staff_id == 0)
				$staff_filter = " AND a.staffID IN (SELECT id FROM chuddiadb.staff WHERE section_id = $section_id)";

			// if division head or division admin assistant, div. head has section_id = 0 and div. admin assistant section id = 28
			if($section_id == 0 || $section_id == 28)
				$staff_filter = " AND a.staffID IN (SELECT id FROM chuddiadb.staff WHERE employee_id = $staff_id)";

			$expected_deliverable_filter = " AND a.activity_id = $expected_deliverable_id";
			if($expected_deliverable_id == 0)
				$expected_deliverable_filter = " ";

			$passslip_staff_filter = " AND e.staffID = $staff_id";
			if($staff_id == 0)
				$passslip_staff_filter = " AND e.staffID IN (SELECT id FROM chuddiadb.staff WHERE section_id = $section_id)";

			// $passslip_expected_deliverable_filter = " AND a.monthlytarget_id = $expected_deliverable_id";
			// if($expected_deliverable_id == 0)
			// 	$expected_deliverable_filter = " ";

			// logbook = 0, pass slip = 1
			if($logbook_type == 0)
			{
				$commandText = "SELECT a.id,
									b.activityID AS activityID,
									c.id AS monthlyTargetID,
									a.staffID,
									CONCAT(d.fname, ' ', d.mname, ' ', d.lname) AS staff_name,
									IF(b.activityDescription IS NULL, '', b.activityDescription) AS expected_deliverable,
									a.logDate,
									IF(a.logLocation IS NULL, '', a.logLocation) AS logLocation,
									IF(a.logQty IS NULL, '', a.logQty) AS logQty,
									a.logActivity
								FROM staffmonitoring.dailylogs a
									LEFT JOIN staffmonitoring.activity b ON b.activityID = a.activity_id
									LEFT JOIN staffmonitoring.monthlytarget c ON b.monthlytarget_id = c.id
									LEFT JOIN chuddiadb.staff d ON d.id = a.staffID 
								WHERE a.month = $month_id AND YEAR(a.logDate) = $year
									$staff_filter
									$expected_deliverable_filter
								ORDER BY a.logDate DESC, staff_name ASC";
				$result = $this->db->query($commandText);
				$query_result = $result->result();

				// echo $commandText;
				// die();

				$commandText = "SELECT count(*) as count
								FROM staffmonitoring.dailylogs a
									LEFT JOIN staffmonitoring.activity b ON b.activityID = a.activity_id
									LEFT JOIN staffmonitoring.monthlytarget c ON b.monthlytarget_id = c.id
									LEFT JOIN chuddiadb.staff d ON d.id = a.staffID 
								WHERE a.month = $month_id AND YEAR(a.logDate) = $year
									$staff_filter
									$expected_deliverable_filter";
				$result = $this->db->query($commandText);
				$query_count = $result->result();

				if(count($query_result) == 0) 
				{
					$data["totalCount"] = 0;
					$data["data"] 		= array();
					die(json_encode($data));
				}

				//fields
				$data['metaData']['fields'][] = array('name' => 'id', 'type' => 'int');
				$data['metaData']['fields'][] = array('name' => 'activity_id', 'type' => 'int');
				$data['metaData']['fields'][] = array('name' => 'monthlytarget_id', 'type' => 'int');
				$data['metaData']['fields'][] = array('name' => 'staff_id', 'type' => 'int');
				$data['metaData']['fields'][] = array('name' => 'staff_name');
				$data['metaData']['fields'][] = array('name' => 'expected_deliverable');
				$data['metaData']['fields'][] = array('name' => 'log_date');
				$data['metaData']['fields'][] = array('name' => 'log_location');
				$data['metaData']['fields'][] = array('name' => 'log_quantity');
				$data['metaData']['fields'][] = array('name' => 'log_activity');

				foreach ($query_result as $key => $value)
				{
					$data['data'][] = array(
						'id' 					=> $value->id,
						'activity_id' 			=> $value->activityID,
						'monthlytarget_id' 		=> $value->monthlyTargetID,
						'staff_id'				=> $value->staffID,
						'staff_name'			=> $value->staff_name,
						'expected_deliverable' 	=> $value->expected_deliverable,
						'log_date'				=> date('F j', strtotime($value->logDate)),
						'log_location' 			=> $value->logLocation,
						'log_quantity'			=> $value->logQty,
						'log_activity' 			=> $value->logActivity
					);
				}
			}
			else 	// logbook = 0, pass slip = 1
			{
				$commandText = "SELECT a.id,
									b.activityID AS activityID,
									c.id AS monthlyTargetID,
									a.createdAt,
									a.psDateAppliedStart,
									a.psDateAppliedEnd,
									IF(a.psTimeStart IS NULL, '', TIME_FORMAT(a.psTimeStart, '%h:%i%p')) AS psTimeStart,
									IF(a.psTimeEnd IS NULL, '', TIME_FORMAT(a.psTimeEnd, '%h:%i%p')) AS psTimeEnd,
									b.activityDescription,
									a.psPurposeOfFieldWork,
									IF(a.psConfirmation IS NULL, '', a.psConfirmation) AS psConfirmation,
									a.psStatus
								FROM staffmonitoring.passsliprequest a
									LEFT JOIN staffmonitoring.activity b ON b.activityID = a.activity_id
									LEFT JOIN staffmonitoring.monthlytarget c ON c.id = b.monthlytarget_id
									LEFT JOIN chuddiadb.staff d ON d.id = a.staffID
									LEFT JOIN staffmonitoring.passsliprequeststaff e ON e.passsliprequest_id = a.id
								WHERE DATE_FORMAT(a.psDateAppliedStart, '%c') = $month_id AND YEAR(a.psDateAppliedStart) = $year
									$passslip_staff_filter
									$expected_deliverable_filter
									AND a.deletedAt IS NULL
								ORDER BY a.createdAt DESC";
				$result = $this->db->query($commandText);
				$query_result = $result->result();

				$commandText = "SELECT count(*) as count
								FROM staffmonitoring.passsliprequest a
									LEFT JOIN staffmonitoring.activity b ON b.activityID = a.activity_id
									LEFT JOIN staffmonitoring.monthlytarget c ON c.id = b.monthlytarget_id
									LEFT JOIN chuddiadb.staff d ON d.id = a.staffID
									LEFT JOIN staffmonitoring.passsliprequeststaff e ON e.passsliprequest_id = a.id
								WHERE DATE_FORMAT(a.psDateAppliedStart, '%c') = $month_id AND YEAR(a.psDateAppliedStart) = $year
									$passslip_staff_filter
									$expected_deliverable_filter
									AND a.deletedAt IS NULL";
				$result = $this->db->query($commandText);
				$query_count = $result->result();

				if(count($query_result) == 0) 
				{
					$data["totalCount"] = 0;
					$data["data"] 		= array();
					die(json_encode($data));
				}

				//fields
				$data['metaData']['fields'][] = array('name' => 'id', 'type' => 'int');
				$data['metaData']['fields'][] = array('name' => 'activity_id', 'type' => 'int');
				$data['metaData']['fields'][] = array('name' => 'monthlytarget_id', 'type' => 'int');
				$data['metaData']['fields'][] = array('name' => 'staff_ids', 'type' => 'int');
				$data['metaData']['fields'][] = array('name' => 'staff_names');
				$data['metaData']['fields'][] = array('name' => 'date_requested');
				$data['metaData']['fields'][] = array('name' => 'dates_applied');
				$data['metaData']['fields'][] = array('name' => 'expected_deliverable');
				$data['metaData']['fields'][] = array('name' => 'purpose');
				$data['metaData']['fields'][] = array('name' => 'confirmation');
				$data['metaData']['fields'][] = array('name' => 'status');

				foreach ($query_result as $key => $value)
				{
					$commandText = "SELECT c.id, CONCAT(c.fname, ' ', c.mname, ' ', c.lname) AS staff_name
									FROM staffmonitoring.passsliprequeststaff a
										LEFT JOIN staffmonitoring.passsliprequest b ON b.id = a.passsliprequest_id
										LEFT JOIN chuddiadb.staff c ON c.id = a.staffID
									WHERE passsliprequest_id = $value->id";
					$result = $this->db->query($commandText);
					$query_result2 = $result->result();

					//implode ids and names of staff in pass slip
					$staff_ids = $staff_names = "";
					$i = 0;
					foreach ($query_result2 as $key => $val)
					{
						$staff_ids .= $val->id;
						$staff_names .= $val->staff_name;

						if($i < count($query_result2) - 1)
						{
							$staff_ids .= ",";
							$staff_names .= ", ";
						}
						$i++;
					}

					//formatting "Date/s Applied"
					$dates_applied = "";
					if($value->psDateAppliedStart == $value->psDateAppliedEnd)
						$dates_applied .= date('M.j', strtotime($value->psDateAppliedStart));
					else
						$dates_applied .= date('M.j', strtotime($value->psDateAppliedStart)) . " - " . date('M.j', strtotime($value->psDateAppliedEnd));

					$dates_applied .= "<br>";
					if($value->psTimeStart != "")
						$dates_applied .= " " . $value->psTimeStart . " to " . $value->psTimeEnd;


					$data['data'][] = array(
						'id' 					=> $value->id,
						'activity_id' 			=> $value->activityID,
						'monthlytarget_id' 		=> $value->monthlyTargetID,
						'staff_ids'				=> $staff_ids,
						'staff_names'			=> $staff_names,
						'date_requested' 		=> date('F j', strtotime($value->createdAt)),
						'dates_applied'			=> $dates_applied,
						'expected_deliverable' 	=> $value->activityDescription,
						'purpose'				=> $value->psPurposeOfFieldWork,
						'confirmation' 			=> $value->psConfirmation,
						'status'				=> $value->psStatus ? "<font color=green>Approved</font>" : "<font color=red>Pending</font>"
					);
				}
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

	public function section_stafflist()
	{
		try 
		{
			$section_id = $_GET['section_id'];
			
			$commandText = "SELECT id, CONCAT(fname, ' ', mname, ' ', lname) AS staff_name
							FROM chuddiadb.staff
							WHERE section_id = $section_id AND active = 1";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["count"] 	= 0;
				$data["data"] 	= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				$description = $value->staff_name;
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

	// public function monthslist()
	// {
	// 	try 
	// 	{
	// 		#update session
	// 		$this->load->model('Session');$this->Session->Validate();
			
	// 		$commandText = "SELECT id, calendar_month FROM calendar WHERE calendar_year = '2019'";
	// 		$result = $this->db->query($commandText);
	// 		$query_result = $result->result(); 

	// 		if(count($query_result) == 0) 
	// 		{
	// 			$data["count"] 	= 0;
	// 			$data["data"] 	= array();
	// 			die(json_encode($data));
	// 		}

	// 		foreach($query_result as $key => $value) 
	// 		{	
	// 			$description = $value->calendar_month;

	// 			$data['data'][] = array(
	// 				'id' 			=> $value->id,
	// 				'description' 	=> $description);
	// 		}

	// 		die(json_encode($data));
	// 	} 
	// 	catch (Exception $e) 
	// 	{
	// 		print $e->getMessage();
	// 		die();	
	// 	}
	// }

	public function expected_deliverableslist()
	{
		try 
		{
			$section_id 				= $_GET['section_id'];
			$month_id 					= $_GET['month_id'];

			$commandText = "SELECT a.id, b.activityID, b.activityQty, b.activityDescription
							FROM staffmonitoring.monthlytarget a
								LEFT JOIN staffmonitoring.activity b ON b.monthlytarget_id = a.id
							WHERE a.section_id = $section_id
								AND a.month = $month_id
								AND b.deletedAt IS NULL";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data["count"] 	= 0;
				$data["data"] 	= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				$expected_deliverables = $value->activityDescription . " (Qty: " . $value->activityQty . ") ";
				//$expected_deliverables = $value->activityQty . " - " . $value->activityDescription;
				if ($value->activityQty == NULL || $value->activityQty == 0)
					$expected_deliverables = $value->activityDescription;
				
				$data['data'][] = array(
					'id' 					=> $value->id,
					'activity_id'			=> $value->activityID,				
					'activity_qty' 			=> $value->activityQty,
					'activity_description' 	=> $value->activityDescription,
					'expected_deliverables' => $expected_deliverables
					// 'expected_deliverables' => mb_strtoupper($expected_deliverables)
				);
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