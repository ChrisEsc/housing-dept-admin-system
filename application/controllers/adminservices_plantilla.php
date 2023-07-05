<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class AdminServices_Plantilla extends CI_Controller {
	/**
	*/ 
	private function modulename($type)
	{		
		if($type == 'link')
			return 'adminservices_plantilla';
		else 
			return 'Plantilla';
	}

	public function index(){
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}

	public function positions_list()
	{
		try
		{
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$employment_status = $_GET['employment_status'];

			die(json_encode($this->generate_positions_list($query, $employment_status, 'Grid')));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generate_positions_list($query, $employment_status, $transaction_type)
	{
		try
		{
			$employment_status_filter = "AND a.employment_status_id = $employment_status";

			$commandText = "SELECT year FROM adminservices_plantilla_salary_grades WHERE active = 1 GROUP BY year";
			$result = $this->db->query($commandText);
			$query_result = $result->result();
			$active_year = $query_result[0]->year;
			$prev_year = $active_year-1;
			
			$commandText = "SELECT 
								a.id,
								e.id AS plantilla_details_id,
								b.item_number AS old_item_number,
    							c.item_number AS new_item_number, 
								a.salary_grade,
								d.description AS position_description,
								IF(f.fname IS NULL, '(Vacant)', CONCAT(f.fname, ' ', f.mname, ' ', f.lname)) AS staff_name,
								DATE_FORMAT(e.date_appointed, '%m/%d/%Y') AS date_appointed,
								DATE_FORMAT(e.date_vacated, '%m/%d/%Y') AS date_vacated,
								TIMESTAMPDIFF(YEAR, date_appointed, CURDATE()) DIV 3 AS step_increment,
								e.remarks
							FROM adminservices_plantilla_header a
								LEFT JOIN adminservices_plantilla_itemnumbers_history b ON b.plantilla_header_id = a.id AND b.year = $prev_year
								LEFT JOIN adminservices_plantilla_itemnumbers_history c ON c.plantilla_header_id = a.id AND c.year = $active_year
								LEFT JOIN positions d ON d.id = a.position_id
								LEFT JOIN adminservices_plantilla_details e ON e.plantilla_header_id = a.id
								LEFT JOIN staff f ON f.id = e.staff_id
							WHERE (
									c.item_number = '$query'
									OR d.description LIKE '%$query%'
									OR CONCAT(f.fname, ' ', if(f.mname = '', '', CONCAT(f.mname, ' ')), f.lname) LIKE '%$query%'
									OR DATE_FORMAT(e.date_appointed, '%m/%d/%Y') LIKE '%$query%'
									OR e.remarks LIKE '%$query%'
								)
							$employment_status_filter
							AND (e.id IS NULL OR e.id IN (
								SELECT MAX(id)
						        FROM adminservices_plantilla_details
						        GROUP BY plantilla_header_id
						    ))
						    AND a.active = 1
							ORDER BY -c.item_number DESC, b.item_number ASC";
							// ORDER BY -c.item_number DESC -> syntax for ordering item number in ASCENDING ORDER but NULL on last not first part
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			// echo $commandText;
			// die();

			$commandText = "SELECT count(*) as count
							FROM adminservices_plantilla_header a
								LEFT JOIN adminservices_plantilla_itemnumbers_history b ON b.plantilla_header_id = a.id AND b.year = $prev_year
								LEFT JOIN adminservices_plantilla_itemnumbers_history c ON c.plantilla_header_id = a.id AND c.year = $active_year
								LEFT JOIN positions d ON d.id = a.position_id
								LEFT JOIN adminservices_plantilla_details e ON e.plantilla_header_id = a.id
								LEFT JOIN staff f ON f.id = e.staff_id
							WHERE (
									c.item_number = '$query'
									OR d.description LIKE '%$query%'
									OR CONCAT(f.fname, ' ', if(f.mname = '', '', CONCAT(f.mname, ' ')), f.lname) LIKE '%$query%'
									OR DATE_FORMAT(e.date_appointed, '%m/%d/%Y') LIKE '%$query%'
									OR e.remarks LIKE '%$query%'
								)
							$employment_status_filter
							AND e.id IN (
								SELECT MAX(id)
						        FROM adminservices_plantilla_details
						        GROUP BY plantilla_header_id
						    )
						    AND a.active = 1
							ORDER BY c.item_number ASC";
			$result = $this->db->query($commandText);
			$query_count = $result->result();

			$data['active_year'] = $active_year;
			if(count($query_result) == 0 && $transaction_type == 'Report') 
			{
				$data = array("success"=> false, "data"=>'No records found!');
				die(json_encode($data));
			}

			if(count($query_result) == 0 && $transaction_type == 'Grid') 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				$staff_name 	= $value->staff_name;
				$date_appointed = $value->date_appointed;
				$remarks 		= $value->remarks;

				$step_increment = 1;
				
				$step_increment = $value->step_increment + 1;
				$step_increment = $step_increment >= 8 ? 8 : $step_increment;

				if(strtotime($value->date_vacated) > strtotime($value->date_appointed))
				{
					$staff_name = "(Vacant)";
					$date_appointed = null;
					$step_increment = 1;
					$remarks = "";
				}

				$column_name = "step_" . $step_increment;

				// check if active year has a succeeding tranche data, returns null data if no succeeding tranche
				$commandText = "SELECT * 
								FROM adminservices_plantilla_salary_grades 
								WHERE year = (
									SELECT year+1 FROM adminservices_plantilla_salary_grades WHERE active = 1 GROUP BY year
								)";
				$result = $this->db->query($commandText);
				$query_result2 = $result->result();

				// if no succeeding tranche data, get only authorized rates and not budget year rates
				if($query_result2 == null)
				{
					$commandText = "SELECT 
										a.$column_name AS authorized_monthly_rate,
										a.$column_name * 12 AS authorized_annual_rate,
										NULL AS budget_year_monthly_rate,
										NULL AS budget_year_annual_rate,
										a.year
									FROM adminservices_plantilla_salary_grades a
									WHERE a.salary_grade = $value->salary_grade AND a.active = 1";
				}
				else
				{
					$commandText = "SELECT 
										a.$column_name AS authorized_monthly_rate,
										a.$column_name * 12 AS authorized_annual_rate,
										b.$column_name AS budget_year_monthly_rate,
										b.$column_name * 12 AS budget_year_annual_rate,
										a.year
									FROM adminservices_plantilla_salary_grades a
										JOIN adminservices_plantilla_salary_grades b on b.salary_grade = a.salary_grade
									WHERE a.salary_grade = $value->salary_grade AND a.active = 1 AND a.year < b.year";
				}
				$result = $this->db->query($commandText);
				$query_result3 = $result->result();

				// echo $commandText;
				// die();

				$data['data'][] = array(
					'id' 					=> $value->id,
					'old_item_number' 		=> $value->old_item_number,
					'new_item_number' 		=> $value->new_item_number,
					'position_description' 	=> mb_strtoupper($value->position_description),
					'staff_name' 			=> $staff_name,
					'date_appointed' 		=> mb_strtoupper($date_appointed),
					'salary_grade'			=> $value->salary_grade,
					'step_increment' 		=> $step_increment,
					'salary_grade_step'		=> $value->salary_grade . "/" . $step_increment,
					'authorized_annual_rate'=> number_format($query_result3[0]->authorized_annual_rate, 2),
					'budget_year_annual_rate'=> number_format($query_result3[0]->budget_year_annual_rate, 2),
					'increase_amount'		=> is_null($query_result3[0]->budget_year_annual_rate) ? number_format(0): number_format($query_result3[0]->budget_year_annual_rate - $query_result3[0]->authorized_annual_rate, 2),
					'remarks'				=> mb_strtoupper($remarks)
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

	public function crud()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id						= $this->input->post('id');
			$employment_status_id 	= $this->input->post('employment_status_id');
			$division_id 			= $this->input->post('division_id');
			$position_id			= $this->input->post('position_id');
			$itemnumber_history_id	= $this->input->post('itemnumber_history_id');
			$item_number			= $this->input->post('item_number');
			$salary_grade			= $this->input->post('salary_grade');
			$year 					= $this->input->post('year');
			$type 					= $this->input->post('type');

			die();
			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);


			// begin transaction
			// $this->db->trans_start();
			if ($type == "Delete")
			{
				$commandText = "UPDATE adminservices_plantilla_header SET active = 0 WHERE id = $id";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_plantilla_header', $type, $this->modulename('label'));
			}
			else
			{
				// if input details are for regular
				if ($employment_status_id == 1)
				{
					// year of item number always depends on the current year
					if ($type == "Add")
					{
						$commandText = "SELECT a.*, b.*
										FROM adminservices_plantilla_header a 
											LEFT JOIN adminservices_plantilla_itemnumbers_history b ON b.plantilla_header_id = a.id
										WHERE b.item_number = $item_number AND b.year = YEAR(CURDATE())";
						$result = $this->db->query($commandText);
						$query_result = $result->result();

						$this->load->model('adminservices_plantilla_header');
						$id = 0;
						$this->load->model('adminservices_plantilla_itemnumbers_history');
						$itemnumber_history_id = 0;
						$this->adminservices_plantilla_itemnumbers_history->year	= date("Y"); //defaults to current year
					}
					else if ($type == "Edit")
					{
						$commandText = "SELECT a.*, b.* 
										FROM adminservices_plantilla_header a 
											LEFT JOIN adminservices_plantilla_itemnumbers_history b ON b.plantilla_header_id = a.id
										WHERE a.id <> $id AND b.item_number = $item_number AND b.year = YEAR(CURDATE())";
						$result = $this->db->query($commandText);
						$query_result = $result->result();

						$this->load->model('adminservices_plantilla_header');
						$this->adminservices_plantilla_header->id 					= $id;
						$this->load->model('adminservices_plantilla_itemnumbers_history');
						$this->adminservices_plantilla_itemnumbers_history->id 		= $itemnumber_history_id;
						$this->adminservices_plantilla_itemnumbers_history->year 	= $year;
					}

					if (count($query_result) > 0)
					{
						$data = array("success"=> false, "data"=>"Item already exists!");
						die(json_encode($data));
					}

					$this->adminservices_plantilla_header->division_id 		= $division_id;
					$this->adminservices_plantilla_header->position_id 		= $position_id;
					$this->adminservices_plantilla_header->employment_status_id = $employment_status_id;
					$this->adminservices_plantilla_header->salary_grade		= $salary_grade;
					$this->adminservices_plantilla_header->active 			= 1;
					$this->adminservices_plantilla_header->save($id);

					$this->adminservices_plantilla_itemnumbers_history->plantilla_header_id		= $this->adminservices_plantilla_header->id;
					$this->adminservices_plantilla_itemnumbers_history->item_number				= $item_number;
					
					$this->adminservices_plantilla_itemnumbers_history->save($itemnumber_history_id);

					$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_plantilla_header', $type, $this->modulename('label') . ' Header & Item #');
				}
				// if input details are for casual and JO
				else
				{
					$this->load->model('adminservices_plantilla_header');
					if ($type == "Add")
						$id = 0;
					else if ($type == "Edit")
						$this->adminservices_plantilla_header->id 					= $id;

					$this->adminservices_plantilla_header->employment_status_id = $employment_status_id;
					$this->adminservices_plantilla_header->division_id 			= $division_id;
					$this->adminservices_plantilla_header->position_id 			= $position_id;
					$this->adminservices_plantilla_header->salary_grade			= $salary_grade;
					$this->adminservices_plantilla_header->active 				= 1;
					$this->adminservices_plantilla_header->save($id);

					$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_plantilla_header', $type, $this->modulename('label') . ' Header (Casual and J.O.)');
				}
			}

			$arr = array();  
			$arr['success'] = true;
			if ($type == "Add") 
				$arr['data'] = "Successfully Created";
			if ($type == "Edit")
				$arr['data'] = "Successfully Edited";
			if ($type == "Delete")
				$arr['data'] = "Successfully Deleted";
			die(json_encode($arr));

			#end transaction, commit if no error rollback if there is
			//$this->db->trans_complete();

		}
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
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
			$commandText = "SELECT year FROM adminservices_plantilla_salary_grades WHERE active = 1 GROUP BY year";
			$result = $this->db->query($commandText);
			$query_result = $result->result();
			$active_year = $query_result[0]->year;

			$commandText = "SELECT
								a.id,
								a.division_id,
								a.position_id,
								a.employment_status_id,
								b.description AS division_description,
								c.description AS position_description,
								e.description AS employment_status_description,
								a.salary_grade,
								d.id AS itemnumber_history_id,
								d.item_number,
								d.year AS year
							FROM adminservices_plantilla_header a
								LEFT JOIN divisions b ON b.id = a.division_id
								LEFT JOIN positions c ON c.id = a.position_id
								LEFT JOIN adminservices_plantilla_itemnumbers_history d ON d.plantilla_header_id = a.id
								LEFT JOIN employment_statuses e ON e.id = a.employment_status_id
							WHERE a.id = $id AND d.year = $active_year
							LIMIT 1";

			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$data = array();
			$record = array();

			if(count($query_result) == 0) {
				$data = array('success'=> false, 'data'=>'Please update Item No. first before you can edit other details of this item.');
				die(json_encode($data));
			}

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 							= $value->id;					
				$record['division_id']					= $value->division_id;
				$record['position_id']					= $value->position_id;
				$record['employment_status_id']			= $value->employment_status_id;
				$record['itemnumber_history_id']		= $value->itemnumber_history_id;
				$record['division_description']			= $value->division_description;
				$record['position_description']			= $value->position_description;
				$record['employment_status_description']= $value->employment_status_description;
				$record['salary_grade']					= $value->salary_grade;
				$record['item_number']					= $value->item_number;
				$record['year'] 						= $value->year;
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

	public function salary_gradeslist()
	{
		try
		{
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$calendar_year = $_GET['calendar_year'];
			die(json_encode($this->generate_salary_gradeslist($query, $calendar_year, 'Grid')));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generate_salary_gradeslist($query, $calendar_year, $transaction_type)
	{
		try
		{
			$limitQuery = "";
			if($transaction_type == 'Grid')
			{
				$limit = $_GET['limit'];
				$start = $_GET['start'];
				$limitQuery = " LIMIT $start, $limit";
			}

			$commandText = "SELECT *
							FROM adminservices_plantilla_salary_grades
							WHERE (
									salary_grade LIKE '%$query%'
								)
								AND year = $calendar_year
							$limitQuery";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$commandText = "SELECT count(*) as count
							FROM adminservices_plantilla_salary_grades
							WHERE (
									salary_grade = '$query'
								)
								AND year = $calendar_year";
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
				$data['data'][] = array(
					'id' 			=> $value->id,
					'salary_grade' 	=> $value->salary_grade,
					'step_1' 		=> number_format($value->step_1),
					'step_2' 		=> number_format($value->step_2),
					'step_3' 		=> number_format($value->step_3),
					'step_4' 		=> number_format($value->step_4),
					'step_5' 		=> number_format($value->step_5),
					'step_6' 		=> number_format($value->step_6),
					'step_7' 		=> number_format($value->step_7),
					'step_8' 		=> number_format($value->step_8),
					'year'			=> $value->year
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

	public function salarygrade_crud()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id				= $this->input->post('id');
			$salary_grade	= $this->input->post('salary_grade');
			$step_1			= $this->input->post('step_1');
			$step_2			= $this->input->post('step_2');
			$step_3			= $this->input->post('step_3');
			$step_4			= $this->input->post('step_4');
			$step_5			= $this->input->post('step_5');
			$step_6			= $this->input->post('step_6');
			$step_7			= $this->input->post('step_7');
			$step_8			= $this->input->post('step_8');
			$year 			= $this->input->post('year');
			$type 			= $this->input->post('type');

			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);

			if ($type == "Delete")
			{
				$commandText = "DELETE FROM adminservices_plantilla_salary_grades WHERE id = $id";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_plantilla_salary_grades', $type, $this->modulename('label'));
			}
			else
			{
				if ($type == "Add")
				{
					$commandText = "SELECT *
									FROM adminservices_plantilla_salary_grades
									WHERE salary_grade = $salary_grade AND year = $year";
					$result = $this->db->query($commandText);
					$query_result = $result->result();

					$this->load->model('adminservices_plantilla_salary_grades');
					$id = 0;
				}
				else if ($type == "Edit")
				{
					$commandText = "SELECT *
									FROM adminservices_plantilla_salary_grades
									WHERE id <> $id AND salary_grade = $salary_grade AND year = $year";
					$result = $this->db->query($commandText);
					$query_result = $result->result();

					$this->load->model('adminservices_plantilla_salary_grades');
					$this->adminservices_plantilla_salary_grades->id 				= $id;
				}

				if (count($query_result) > 0)
				{
					$data = array("success"=> false, "data"=>"Item already exists!");
					die(json_encode($data));
				}

				//if the passed year field is the same as current year, set to 1
				if($year == date("Y"))
					$active = 1;
				else
					$active = 0;

				$this->adminservices_plantilla_salary_grades->salary_grade 		= $salary_grade;
				$this->adminservices_plantilla_salary_grades->step_1 			= $step_1;
				$this->adminservices_plantilla_salary_grades->step_2 			= $step_2;
				$this->adminservices_plantilla_salary_grades->step_3 			= $step_3;
				$this->adminservices_plantilla_salary_grades->step_4 			= $step_4;
				$this->adminservices_plantilla_salary_grades->step_5 			= $step_5;
				$this->adminservices_plantilla_salary_grades->step_6 			= $step_6;
				$this->adminservices_plantilla_salary_grades->step_7 			= $step_7;
				$this->adminservices_plantilla_salary_grades->step_8 			= $step_8;
				$this->adminservices_plantilla_salary_grades->year 				= $year;
				$this->adminservices_plantilla_salary_grades->active 			= $active;
				$this->adminservices_plantilla_salary_grades->save($id);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_plantilla_salary_grades', $type, $this->modulename('label') . ': ' . $type . ' Salary Grade');
				
			}

			$arr = array();  
			$arr['success'] = true;
			if ($type == "Add") 
				$arr['data'] = "Successfully Created";
			if ($type == "Edit")
				$arr['data'] = "Successfully Edited";
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

	public function salaryview()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT *
							FROM adminservices_plantilla_salary_grades
							WHERE id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 				= $value->id;					
				$record['salary_grade']		= $value->salary_grade;
				$record['step_1']			= $value->step_1;
				$record['step_2']			= $value->step_2;
				$record['step_3']			= $value->step_3;
				$record['step_4']			= $value->step_4;
				$record['step_5']			= $value->step_5;
				$record['step_6']			= $value->step_6;
				$record['step_7']			= $value->step_7;
				$record['step_8']			= $value->step_8;
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

	public function setactive_year()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$active_year = $this->input->post('active_year');

			#get year of the active set of salary grades
			$commandText = "SELECT year FROM adminservices_plantilla_salary_grades WHERE active = 1 GROUP BY year";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			if($query_result[0]->year == $active_year)
			{
				$data = array("success"=> false, "data"=>"Year already set as active!");
				die(json_encode($data));
			}
			else
			{
				#mark all active salary grades as inactive
				$commandText = "UPDATE adminservices_plantilla_salary_grades SET active = 0 WHERE active = 1";
				$result = $this->db->query($commandText);

				#set as active all salary grades based on the year
				$commandText = "UPDATE adminservices_plantilla_salary_grades SET active = 1 WHERE active = 0 AND year = $active_year";
				$result = $this->db->query($commandText);
			}

			$data = array();  
			$data['success'] = true;
			$data['data'] = "Successfully set!";
			die(json_encode($data));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function itemnumber_historylist()
	{
		try
		{
			//$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$years = array();
			$year = date('Y');
			for($i = ($year-1); $i < ($year+4); $i++) 
				array_push($years, $i);
			$data['years'] = $years;
			// // columns
			// $data['metaData']['columns'][] = array('dataIndex' => 'id', 'hidden' => true);
			// $data['metaData']['columns'][] = array('text' => 'Title of Position', 'dataIndex' => 'position_description', 'width' => '50%');

			// for($i = 0; $i < 5; $i++) 
			// 	$data['metaData']['columns'][] = array('text' => $years[$i], 'dataIndex' => '' . $years[$i], 'width' => '10%');

			// fields
			$data['metaData']['fields'][] = array('name' => 'id', 'type' => 'int');
			$data['metaData']['fields'][] = array('name' => 'position_description');
			for($i = 0; $i < 5; $i++) 
				$data['metaData']['fields'][] = array('name' => $years[$i]);	

			$commandText = "SELECT 
								a.id,
								b.description AS position_description
							FROM adminservices_plantilla_header a
								LEFT JOIN positions b ON b.id = a.position_id
							WHERE a.employment_status_id = 1";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$j = 0;
			foreach($query_result as $key => $value)
			{
				$commandText = "SELECT
									item_number,
									year
								FROM adminservices_plantilla_itemnumbers_history
								WHERE id = $value->id
								ORDER BY year ASC";
				$result = $this->db->query($commandText);
				$query_result2 = $result->result();

				$data['data'][$j] = array(
					'id' 					=> $value->id,
					'position_description' 	=> $value->position_description,
				);

				for($i = 0; $i < 5; $i++)
				{
					$data['data'][$j][$years[$i]] = null;
				}
				for($i = 0; $i < count($query_result2); $i++)
				{
					$data['data'][$j][$query_result2[$i]->year] = $query_result2[$i]->item_number;
				}
				$j++;
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

	public function itemnumber_history_crud()
	{
		try
		{

		}
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function itemnumber_history_view()
	{
		try
		{
			
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function incumbentslist()
	{
		try
		{
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query2'])));
			die(json_encode($this->generate_incumbentslist($query, 'Grid')));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generate_incumbentslist($query, $transaction_type)
	{
		try
		{
			$plantilla_header_id = $_GET['plantilla_header_id'];

			$limitQuery = "";
			if($transaction_type == 'Grid')
			{
				$limit = $_GET['limit'];
				$start = $_GET['start'];
				$limitQuery = " LIMIT $start, $limit";
			}

			$commandText = "SELECT
								a.id,
								b.id AS plantilla_header_id,
								CONCAT(c.fname, ' ', c.mname, ' ', c.lname) AS staff_name,
								DATE_FORMAT(a.date_appointed, '%m/%d/%Y') AS date_appointed,
								IF(a.date_vacated = '1970-01-01 00:00:00', 'PRESENT', DATE_FORMAT(a.date_vacated, '%m/%d/%Y')) AS date_vacated,
								a.remarks
							FROM adminservices_plantilla_details a 
								LEFT JOIN adminservices_plantilla_header b ON b.id = a.plantilla_header_id
								LEFT JOIN staff c ON a.staff_id = c.id
							WHERE (
									a.remarks LIKE '%$query%' OR
									CONCAT(c.fname, ' ', if(c.mname = '', '', CONCAT(c.mname, ' ')), c.lname) LIKE '%$query%'
								)
								AND b.id = $plantilla_header_id
								AND a.active = 1
							ORDER BY a.date_appointed DESC                 
							$limitQuery";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$commandText = "SELECT count(*) as count
							FROM adminservices_plantilla_details a 
								LEFT JOIN adminservices_plantilla_header b ON b.id = a.plantilla_header_id
								LEFT JOIN staff c ON a.staff_id = c.id
							WHERE (
									a.remarks LIKE '%$query%' OR
									CONCAT(c.fname, ' ', if(c.mname = '', '', CONCAT(c.mname, ' ')), c.lname) LIKE '%$query%'
								)
								AND b.id = $plantilla_header_id
								AND a.active = 1";
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
				$data['data'][] = array(
					'id' 					=> $value->id,
					'plantilla_header_id' 	=> $value->plantilla_header_id,
					'staff_name' 			=> $value->staff_name,
					'date_appointed'		=> $value->date_appointed,
					'date_vacated'			=> $value->date_vacated,
					'remarks' 				=> mb_strtoupper($value->remarks)
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

	public function incumbents_crud()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id					= $this->input->post('id');
			$staff_id			= $this->input->post('staff_id');
			$plantilla_header_id= $this->input->post('plantilla_header_id');
			$date_appointed		= date('Y-m-d', strtotime($this->input->post('date_appointed')));
			$date_vacated		= date('Y-m-d', strtotime($this->input->post('date_vacated')));
			$remarks			= strip_tags(trim($this->input->post('remarks')));
			$type 				= $this->input->post('type');

			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);

			if ($type == "Delete")
			{
				$commandText = "UPDATE adminservices_plantilla_details SET active = 0 WHERE id = $id";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_plantilla_details', $type, $this->modulename('label'));
			}
			else
			{
				if ($type == "Add")
				{
					#check if staff is still appointed
					$commandText = "SELECT *
									FROM adminservices_plantilla_details
									WHERE staff_id = $staff_id AND date_vacated = '1970-01-01 00:00:00' AND active = 1";
					$result = $this->db->query($commandText);
					$query_result = $result->result();

					#check if item is still occupied
					$commandText = "SELECT *
									FROM adminservices_plantilla_details
									WHERE plantilla_header_id = $plantilla_header_id AND date_vacated = '1970-01-01 00:00:00' AND active = 1";
					$result = $this->db->query($commandText);
					$query_result2 = $result->result();

					#check if new incumbent's date of appointment overlaps with previous appointment
					$commandText = "SELECT *
									FROM adminservices_plantilla_details
									WHERE plantilla_header_id = $plantilla_header_id
										AND '$date_appointed' <= DATE(date_vacated)
										AND active = 1
									ORDER BY date_appointed DESC
									LIMIT 1";
					$result = $this->db->query($commandText);
					$query_result3 = $result->result();

					$this->load->model('adminservices_plantilla_details');
					$id = 0;
				}
				else if ($type == "Edit")
				{
					#check if staff is still appointed
					$commandText = "SELECT *
									FROM adminservices_plantilla_details
									WHERE id <> $id AND staff_id = $staff_id AND date_vacated = '1970-01-01 00:00:00' AND active = 1";
					$result = $this->db->query($commandText);
					$query_result = $result->result();

					#check if item is still occupied
					$commandText = "SELECT *
									FROM adminservices_plantilla_details
									WHERE id <> $id AND plantilla_header_id = $plantilla_header_id AND date_vacated = '1970-01-01 00:00:00' AND active = 1";
					$result = $this->db->query($commandText);
					$query_result2 = $result->result();

					#check if new incumbent's date of appointment overlaps with previous appointment
					$commandText = "SELECT *
									FROM adminservices_plantilla_details
									WHERE id <> $id 
										AND plantilla_header_id = $plantilla_header_id
										AND '$date_appointed' <= DATE(date_vacated)
										AND active = 1
									ORDER BY date_appointed DESC
									LIMIT 1";
					$result = $this->db->query($commandText);
					$query_result3 = $result->result();

					$this->load->model('adminservices_plantilla_details');
					$this->adminservices_plantilla_details->id 				= $id;
				}

				if (count($query_result) > 0)
				{
					$data = array("success"=> false, "data"=>"Staff is still currently appointed.");
					die(json_encode($data));
				}
				if (count($query_result2) > 0)
				{
					$data = array("success"=> false, "data"=>"Item is still occupied.");
					die(json_encode($data));
				}
				if (count($query_result3) > 0)
				{
					$data = array("success"=> false, "data"=>"Date of appointment overlaps with previous appointment.");
					die(json_encode($data));
				}

				// update position and employment status of employee in staff table
				// retrieve current position and employment status first
				$commandText = "SELECT position_id, employment_status_id
								FROM staff
								WHERE id = $staff_id";
				$result = $this->db->query($commandText);
				$query_result = $result->result();

				// retreive position and employment status of plantilla item
				$commandText = "SELECT position_id, employment_status_id
								FROM adminservices_plantilla_header
								WHERE id = $plantilla_header_id";
				$result = $this->db->query($commandText);
				$query_result2 = $result->result();

				// if position_id and employment_status_id are not the same, update staff details
				if ($query_result[0]->position_id != $query_result2[0]->position_id && $query_result[0]->employment_status_id != $query_result2[0]->employment_status_id)
				{
					$pos_id = $query_result2[0]->position_id;
					$emp_id = $query_result2[0]->employment_status_id;
					$commandText = "UPDATE staff SET position_id = $pos_id, employment_status_id = $emp_id WHERE id = $staff_id";
					$result = $this->db->query($commandText);
				}

				$this->adminservices_plantilla_details->plantilla_header_id = $plantilla_header_id;
				$this->adminservices_plantilla_details->staff_id 			= $staff_id;
				$this->adminservices_plantilla_details->date_appointed 		= $date_appointed;
				$this->adminservices_plantilla_details->date_vacated 		= $date_vacated;
				$this->adminservices_plantilla_details->remarks 			= $remarks;
				$this->adminservices_plantilla_details->active 				= 1;
				$this->adminservices_plantilla_details->save($id);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_plantilla_details', $type, $this->modulename('label') . ': ' . $type . ' Incumbent');
				
			}

			$arr = array();  
			$arr['success'] = true;
			if ($type == "Add") 
				$arr['data'] = "Successfully Created";
			if ($type == "Edit")
				$arr['data'] = "Successfully Edited";
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

	public function incumbentview()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT
								a.id,
								b.id AS plantilla_header_id,
								c.id AS staff_id,
								CONCAT(c.fname, ' ', c.mname, ' ', c.lname) AS staff_name,
								DATE_FORMAT(a.date_appointed, '%m/%d/%Y') AS date_appointed,
								IF(a.date_vacated = '1970-01-01 00:00:00', 'PRESENT', DATE_FORMAT(a.date_vacated, '%m/%d/%Y')) AS date_vacated,
								a.remarks
							FROM adminservices_plantilla_details a 
								LEFT JOIN adminservices_plantilla_header b ON b.id = a.plantilla_header_id
								LEFT JOIN staff c ON a.staff_id = c.id
							WHERE a.id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 					= $value->id;					
				$record['plantilla_header_id']	= $value->plantilla_header_id;
				$record['staff_id']				= $value->staff_id;
				$record['staff_name']			= $value->staff_name;
				$record['date_appointed']		= $value->date_appointed;
				$record['date_vacated']			= $value->date_vacated;
				$record['remarks']				= $value->remarks;
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

	public function headerview()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT 
								a.id,
								b.item_number,
								c.description AS position_description,
								a.salary_grade
							FROM adminservices_plantilla_header a
								LEFT JOIN adminservices_plantilla_itemnumbers_history b ON b.plantilla_header_id = a.id
								LEFT JOIN positions c ON c.id = a.position_id
							WHERE a.id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$data = array();
			$record  = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 							= $value->id;
				$record['item_number']					= $value->item_number;
				$record['position_description']			= mb_strtoupper($value->position_description);
				$record['salary_grade']					= $value->salary_grade;
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
								a.user_id,
								a.username,
								CONCAT(fname, ' ', mname, ' ', lname) AS staff_name,
								CONCAT('(', a.username, ') ', fname, ' ', mname, ' ', lname) AS staffslist
							FROM 
								(
									SELECT a.*, b.fname, b.mname, b.lname
									FROM users a 
										LEFT JOIN staff b ON a.user_id = b.id
									WHERE a.type = 'Staff' AND a.active = 1 AND b.active = 1
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
									SELECT a.*, b.fname, b.mname, b.lname
									FROM users a 
										LEFT JOIN staff b ON a.user_id = b.id
									WHERE a.type = 'Staff' AND a.active = 1 AND b.active = 1
								) a
							WHERE
								(
									a.username LIKE '%$query%' OR
									CONCAT(a.fname, ' ', if(a.mname = '', '', CONCAT(a.mname, ' ')),a.lname) LIKE '%$query%'
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
					'id' 					=> $value->user_id,
					'username' 				=> $value->username,
					'staffslist'			=> mb_strtoupper($value->staffslist),
					'staff_name' 			=> mb_strtoupper($value->staff_name)
				);
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

	public function itemnumber_view()
	{
		try
		{
			die(json_encode($this->generate_itemnumber_view($this->input->post('id'))));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generate_itemnumber_view($id)
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			$commandText = "SELECT year FROM adminservices_plantilla_salary_grades WHERE active = 1 GROUP BY year";
			$result = $this->db->query($commandText);
			$query_result = $result->result();
			$active_year = $query_result[0]->year;
			$prev_year = $active_year-1;

			$commandText = "SELECT * FROM adminservices_plantilla_itemnumbers_history WHERE plantilla_header_id = $id AND year = $active_year";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			// if item number does not exist for active year
			if(count($query_result) == 0) {
				$commandText = "SELECT
									a.id,
									b.description AS position_description,
									d.item_number AS prev_item_number,
									d.year AS prev_year
								FROM adminservices_plantilla_header a
									LEFT JOIN positions b ON b.id = a.position_id
									LEFT JOIN adminservices_plantilla_itemnumbers_history d ON d.plantilla_header_id = a.id AND d.year = $prev_year
								WHERE a.id = $id
								LIMIT 1";
			}
			else{
				$commandText = "SELECT
									a.id,
									b.description AS position_description,
									c.item_number AS new_item_number,
									c.year AS new_year,
									d.item_number AS prev_item_number,
									d.year AS prev_year
								FROM adminservices_plantilla_header a
									LEFT JOIN positions b ON b.id = a.position_id
									LEFT JOIN adminservices_plantilla_itemnumbers_history c ON c.plantilla_header_id = a.id
									LEFT JOIN adminservices_plantilla_itemnumbers_history d ON d.plantilla_header_id = a.id AND d.year = $prev_year
								WHERE a.id = $id AND c.year = $active_year
								LIMIT 1";
			}
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$data = array();
			$record = array();

			foreach($query_result as $key => $value) 
			{	
				$record['id'] 							= $value->id;
				$record['position_description']			= $value->position_description;
				$record['prev_item_number']				= $value->prev_item_number;
				$record['prev_year'] 					= $value->prev_year;
				$record['new_item_number']				= isset($value->new_item_number) ? $value->new_item_number: null;
				$record['new_year'] 					= isset($value->new_year) ? $value->new_year: $active_year;
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

	public function update_itemnumber()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();
			$plantilla_header_id	= $this->input->post('plantilla_header_id');
			$new_item_number		= $this->input->post('new_item_number');
			$new_year				= $this->input->post('new_year');
	
			#check first if new_item_number has duplicate for new_year
			$commandText = "SELECT * FROM adminservices_plantilla_itemnumbers_history WHERE item_number = $new_item_number AND year = $new_year";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			if(count($query_result) > 0) {
				$data = array("success"=> false, "data"=>"New item number has duplicate!");
				die(json_encode($data));
			}

			#check second if plantilla_header_id has existing item number value for new_year
			$commandText = "SELECT * FROM adminservices_plantilla_itemnumbers_history WHERE plantilla_header_id = $plantilla_header_id AND year = $new_year";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$this->load->model('adminservices_plantilla_itemnumbers_history');
			if(count($query_result) > 0) {
				$id = $query_result[0]->id;
				$this->adminservices_plantilla_itemnumbers_history->id	 	 			= $id;
			}
			else $id = 0;

			$this->adminservices_plantilla_itemnumbers_history->plantilla_header_id	 	= $plantilla_header_id;
			$this->adminservices_plantilla_itemnumbers_history->item_number	 			= $new_item_number;
			$this->adminservices_plantilla_itemnumbers_history->year	 				= $new_year;
			$this->adminservices_plantilla_itemnumbers_history->save($id);

			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'adminservices_plantilla_itemnumbers_history', 'Update Item Number', $this->modulename('label'));
			
			$data = array("success"=> true, "data"=>"Successfully updated");
			die(json_encode($data));
		}
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}
}