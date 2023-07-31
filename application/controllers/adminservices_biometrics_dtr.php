<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Cell\Cell;

class AdminServices_Biometrics_DTR extends CI_Controller {
	/**
	*/ 
	private function modulename($type)
	{		
		if($type == 'link')
			return 'adminservices_biometrics_dtr';
		else 
			return 'Biometrics Automation System';
	} 

	public function index()
	{
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}

	public function biometrics_recordslist()
	{
		try
		{
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$employment_status = $_GET['employment_status'];

			die(json_encode($this->generatebiometrics_recordslist($query, $employment_status, $_GET['calendar_id'])));
		}
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function generatebiometrics_recordslist($query, $employment_status, $calendar_id)
	{
		try
		{
			// $limit = $_GET['limit'];
			// $start = $_GET['start'];
			// $limitQuery = " LIMIT $start, $limit";
			$employment_status_filter = "AND b.employment_status_id = $employment_status";

			$commandText = "SELECT a.*,
								CONCAT(b.fname, ' ', b.mname, ' ', b.lname) AS employee_name
							FROM adminservices_biometrics_dtr_header a 
								LEFT JOIN staff b ON b.employee_id = a.employee_id
							WHERE (
								CONCAT(b.fname, ' ', if(b.mname = '', '', CONCAT(b.mname, ' ')),b.lname) LIKE '%$query%'
								)
								AND a.calendar_id = $calendar_id
								AND b.active = 1
								$employment_status_filter
							ORDER BY a.id ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result();
	
			$commandText = "SELECT count(*) as count
							FROM adminservices_biometrics_dtr_header a 
								LEFT JOIN staff b ON b.employee_id = a.employee_id
							WHERE (
								CONCAT(b.fname, ' ', if(b.mname = '', '', CONCAT(b.mname, ' ')),b.lname) LIKE '%$query%'
								)
								AND a.calendar_id = $calendar_id
								AND b.active = 1
								$employment_status_filter";
			$result = $this->db->query($commandText);
			$query_count = $result->result();

			if(count($query_result) == 0) 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			$i = 0;
			foreach ($query_result as $key => $value)
			{
				$commandText = "SELECT 
									day,
									IF(original_biometrics_data IS NULL, '', original_biometrics_data) AS original_biometrics_data,
									IF(final_biometrics_data IS NULL, '', final_biometrics_data) AS final_biometrics_data
								FROM adminservices_biometrics_dtr_details 
								WHERE adminservices_biometrics_dtr_header_id = $value->id";
				$result = $this->db->query($commandText);
				$query_result2 = $result->result();

				$employee_details = null;
				$employee_details = array(
					'employee_id'		=> $value->employee_id,
					'dtr_header_id'		=> $value->id,
					'employee_name'		=> $value->employee_name
				);

				$biometrics_records = null;
				foreach ($query_result2 as $key => $val)
				{
					$string = 'day_' . $val->day;
					$biometrics_records[$string] = $val->final_biometrics_data;	//swap between original_biometrics_data and final_biometrics_data
				}
				$data['data'][] = array_merge($employee_details, $biometrics_records);
				$i++;
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

	public function monthstree()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$commandText = "SELECT
								a.calendar_year
							FROM calendar a
							WHERE a.active = 1
							GROUP BY a.calendar_year
							ORDER BY a.calendar_year ASC";
			$result = $this->db->query($commandText);
			$year_result = $result->result(); 

			$current_year; //initialize variable
			foreach($year_result as $key => $year_value)
			{
				$calendar_year = $year_value->calendar_year;
				$commandText = "SELECT
									a.calendar_quarter
								FROM calendar a
								WHERE a.calendar_year = $year_value->calendar_year AND a.active = 1
								GROUP BY a.calendar_quarter
								ORDER BY a.calendar_quarter ASC";
				$result = $this->db->query($commandText);
				$quarter_result = $result->result();

				foreach($quarter_result as $key => $quarter_value)
				{
					$commandText = "SELECT
								 		a.id,
										a.calendar_month,
										a.current_month
									FROM calendar a
									WHERE a.calendar_year = $year_value->calendar_year AND a.calendar_quarter = $quarter_value->calendar_quarter AND a.active = 1
									GROUP BY a.calendar_month
									ORDER BY a.id ASC";
					$result = $this->db->query($commandText);
					$month_result = $result->result();

					$current_quarter = 0;
					foreach ($month_result as $key => $month_value)
					{
						$current_month 	= $month_value->current_month;
						$qtip 			= $month_value->calendar_month;

						if ($current_month == 1)
						{
							$current_quarter = 1;
							$qtip = 'Current Month';
						}

						$months_array[] = array(
							'id' 			=> $month_value->id,
							'text' 			=> $month_value->calendar_month,
							'leaf' 			=> true,
							'qtip' 			=> $qtip
						);
					}

					$quarters_array[] = array(
						'text' 			=> $this->ordinal($quarter_value->calendar_quarter) . ' Quarter',
						'expanded'		=> ($current_quarter == 1 ? true : false),
						'children'		=> $months_array
					);

					$months_array = null;
				}

				$years_array[] = array(
					'text' 		=> $year_value->calendar_year,
					'expanded' 	=> ($year_value->calendar_year == date("Y") ? true : false),
					'children'	=> $quarters_array
				);
				$quarters_array = null;
			}
			$record = array();
			$record['text'] 	= 'List of Months';
			$record['cls'] 		= 'folder';
			$record['expanded'] = true;
			$record['children'] = $years_array;

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

	public function crud()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$dtr_header_ids 			= explode(',',$this->input->post('dtr_header_ids'));
			$days 						= explode(',',$this->input->post('days'));
			$dtr_datas					= explode(',',$this->input->post('dtr_datas'));
			$i = 0;
			foreach ($dtr_header_ids as $key => $value)
			{
				$commandText = "SELECT * FROM adminservices_biometrics_dtr_details WHERE adminservices_biometrics_dtr_header_id = $dtr_header_ids[$i] AND day = $days[$i]";
				$result = $this->db->query($commandText);
				$query_result = $result->result();

				if (count($query_result) == 0)
				{
					$data = array("success"=> false, "data"=>"Data does not exist.");
					die(json_encode($data));
				}
				else if (count($query_result) > 1)
				{
					$data = array("success"=> false, "data"=>"Data exists multiple times.");
					die(json_encode($data));
				}

				$this->load->model('adminservices_biometrics_dtr_details');
				$this->adminservices_biometrics_dtr_details->id 										= $query_result[0]->id;
				$this->adminservices_biometrics_dtr_details->adminservices_biometrics_dtr_header_id 	= $query_result[0]->adminservices_biometrics_dtr_header_id;
				$this->adminservices_biometrics_dtr_details->day 										= $query_result[0]->day;
				$this->adminservices_biometrics_dtr_details->original_biometrics_data 					= $query_result[0]->original_biometrics_data;
				$this->adminservices_biometrics_dtr_details->final_biometrics_data 						= $dtr_datas[$i];
				$this->adminservices_biometrics_dtr_details->save($query_result[0]->id);

				

				$this->load->model('adminservices_biometrics_dtr_changelogs');
				$this->adminservices_biometrics_dtr_changelogs->adminservices_biometrics_dtr_header_id 	= $query_result[0]->adminservices_biometrics_dtr_header_id;
				$this->adminservices_biometrics_dtr_changelogs->day 									= $query_result[0]->day;
				$this->adminservices_biometrics_dtr_changelogs->biometrics_data_from 					= $query_result[0]->final_biometrics_data;
				$this->adminservices_biometrics_dtr_changelogs->biometrics_data_to 						= $dtr_datas[$i];
				$this->adminservices_biometrics_dtr_changelogs->date_changed 							= date('Y-m-d H:i:s');
				$this->adminservices_biometrics_dtr_changelogs->active 									= 1;
				$this->adminservices_biometrics_dtr_changelogs->save(0);

				$this->load->model('Logs'); $this->Logs->audit_logs($query_result[0]->id, 'adminservices_biometrics_dtr_details', 'Change DTR', $this->modulename('label'));
				$i++;
			}

			$arr = array();  
			$arr['success'] = true;
			$arr['data'] = "Successfully Saved";
			die(json_encode($arr));
		}
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function dtr_names_list()
	{
		try
		{
			$employment_status 	= $_GET['employment_status'];
			$calendar_id 		= $_GET['calendar_id'];

			die(json_encode($this->generatedtr_names_list($employment_status, $calendar_id)));
		}
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function generatedtr_names_list($employment_status, $calendar_id)
	{
		try
		{
			$commandText = "SELECT
								a.id,
								b.employee_id,
								CONCAT(UPPER(b.lname), ', ', b.fname, ' ', b.mname) AS employee_name
							FROM adminservices_biometrics_dtr_header a 
								LEFT JOIN staff b ON b.employee_id = a.employee_id
							WHERE 
							 	a.calendar_id = $calendar_id
							 	AND b.employment_status_id = $employment_status
								AND b.active = 1
							ORDER BY b.lname ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result();
			
			$commandText = "SELECT count(*) as count
							FROM adminservices_biometrics_dtr_header a 
								LEFT JOIN staff b ON b.employee_id = a.employee_id
							WHERE 
							 	a.calendar_id = $calendar_id
							 	AND b.employment_status_id = $employment_status
								AND b.active = 1";
			$result = $this->db->query($commandText);
			$query_count = $result->result();

			if(count($query_result) == 0) 
			{
				$data["totalCount"] = 0;
				$data["data"] 		= array();
				die(json_encode($data));
			}

			foreach ($query_result as $key => $value)
			{
				$data['data'][] = array(
					'id' 						=> $value->id,
					'employee_id'				=> $value->employee_id,
					'employee_name' 			=> $value->employee_name,
					'selected'					=> true
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

	public function holidayslist()
	{
		try
		{
			$query 			= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$calendar_id 	= $_GET['calendar_id'];

			$commandText = "SELECT * FROM calendar_holidays WHERE holiday_description LIKE '%$query%' AND calendar_id = $calendar_id AND active = 1 ORDER BY holiday_date ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			if(count($query_result) == 0) 
			{
				$data["count"] 	= 0;
				$data["data"]	= array();
				die(json_encode($data));
			}

			foreach($query_result AS $key => $value)
			{
				$data['data'][] = array(
					'id' 					=> $value->id,
					'holiday_date'			=> date('m/d/Y', strtotime($value->holiday_date)),
					'holiday_description' 	=> mb_strtoupper($value->holiday_description));
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

	public function holidaysview()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id = $this->input->post('id');

			$commandText = "SELECT * FROM calendar_holidays WHERE id = $id";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$record = array();
			foreach($query_result as $key => $value) 
			{	
				$record['id'] 					= $value->id;
				$record['calendar_id']			= $value->calendar_id;
				$record['holiday_date']			= date('m/d/Y', strtotime($value->holiday_date));
				$record['holiday_description']	= mb_strtoupper($value->holiday_description);
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


	public function holidays_crud()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$id						= $this->input->post('id');
			$calendar_id			= $this->input->post('calendar_id');
			$holiday_date 			= date('Y-m-d',strtotime($this->input->post('holiday_date')));
			$day 					= date('d',strtotime($this->input->post('holiday_date')));
			$holiday_description	= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('holiday_description'))));
			$type 					= $this->input->post('type');

			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);

			if ($type == "Delete")
			{
				$commandText = "UPDATE calendar_holidays SET active = 0 WHERE id = $id";
				$result = $this->db->query($commandText);

				$commandText = "UPDATE adminservices_biometrics_dtr_details
								SET final_biometrics_data = '1-' 
								WHERE 
									adminservices_biometrics_dtr_header_id IN (SELECT id FROM adminservices_biometrics_dtr_header WHERE calendar_id = (SELECT calendar_id FROM calendar_holidays WHERE id = $id))
									AND day = $day";
				$result = $this->db->query($commandText);

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'calendar_holidays', $type, $this->modulename('label'));
			}
			else
			{
				if ($type == "Add")
				{
					$commandText = "SELECT * FROM calendar_holidays WHERE holiday_date LIKE '%$holiday_date%' AND active = 1";
					$result = $this->db->query($commandText);
					$query_result = $result->result();

					$this->load->model('calendar_holidays');
					$id = 0;
				}
				else if ($type == "Edit")
				{
					$commandText = "SELECT * FROM calendar_holidays WHERE id <> $id AND holiday_date LIKE '%$holiday_date%' AND active = 1";
					$result = $this->db->query($commandText);
					$query_result = $result->result();

					$this->load->model('calendar_holidays');
					$this->calendar_holidays->id 		= $id;
				}

				if (count($query_result) > 0)
				{
					$data = array("success"=> false, "data"=>"Holiday/Weekend already exists! Check the date.");
					die(json_encode($data));
				}

				$this->calendar_holidays->calendar_id 			= $calendar_id;
				$this->calendar_holidays->holiday_description 	= mb_strtoupper($holiday_description);
				$this->calendar_holidays->holiday_date 			= $holiday_date;
				$this->calendar_holidays->active 				= 1;
				$this->calendar_holidays->save($id);

				if (mb_strtoupper($holiday_description) != "SATURDAY" && mb_strtoupper($holiday_description) != "SUNDAY")
					$holiday_description = "0-HOLIDAY";
				else 
					$holiday_description = "0-".mb_strtoupper($holiday_description);

				$commandText = "UPDATE adminservices_biometrics_dtr_details
								SET final_biometrics_data = '$holiday_description' 
								WHERE 
									adminservices_biometrics_dtr_header_id IN (SELECT id FROM adminservices_biometrics_dtr_header WHERE calendar_id = $calendar_id)
									AND day = $day";
				$result = $this->db->query($commandText);
			}

			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'calendar_holidays', $type . 'Calendar Holiday', $this->modulename('label'));
			
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

	public function upload_biometricsfile()
	{
		try
		{
			#define static file name of biometrics report
			$FILE_NAME = '1_StandardReport';

			#update session
			$this->load->model('Session');$this->Session->Validate();

			$calendar_id 	= $this->input->post('calendar_id');
			$type 			= $this->input->post('type');


			$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);

			//benchmarking purposes
			//$this->benchmark->mark('code_start');
			if ($type == "Upload")
			{
				$commandText = "SELECT calendar_year, calendar_month FROM calendar WHERE id = $calendar_id";
				$result = $this->db->query($commandText);
				$query_result = $result->result();

				$name 				= $_FILES['form-file']['name'];
				$source 			= $_FILES['form-file']['tmp_name'];

				$path = getenv('BIOMETRICS_TARGET_DIR');
				$valid_formats = array("xls", "xlsx");

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

				#check if the selected file's format is valid
				if (in_array($ext, $valid_formats))
				{
					#check if the file name is same with the original biometrics log file name
					if ($txt != $FILE_NAME)
					{
						$arr['success'] = false;
						$arr['data'] = "Selected file is not the original biometrics file.";
						die(json_encode($arr));		
					}

					$name = $query_result[0]->calendar_month.' '.$query_result[0]->calendar_year.'.'.$ext;
					#set memory limit to unlimited before uploading to fix exhausted memory error
					ini_set('memory_limit', '-1');
					if (move_uploaded_file($source, $path.$name))
					{
						#read the file and extract all needed data
						$this->read_biometrics_file($path, $name, $calendar_id);

						$this->load->model('Logs'); $this->Logs->audit_logs($calendar_id, 'adminservices_biometrics_dtr', 'Biometrics Log'.$type, $this->modulename('label'));
					}
					else
					{
						$arr['success'] = false;
						$arr['data'] = "File upload failed.";
						die(json_encode($arr));
					}
					#re-set memory limit to default value
					ini_set('memory_limit', '128M');
				}
				else
				{
					$arr['success'] = false;
					$arr['data'] = "Selected file is not an excel file.";
					die(json_encode($arr));
				}
			}

			//benchmarking purposes
			// $this->benchmark->mark('code_end');
			// echo $this->benchmark->elapsed_time('code_start', 'code_end');

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

	private function read_biometrics_file($path, $name, $calendar_id)
	{
		try
		{
			$sheetname 		= "Att.log report";
			$file_type  	= IOFactory::identify($path.$name);
			$reader 		= IOFactory::createReader($file_type);
			$reader->setLoadSheetsOnly($sheetname);
			//xlsx reader
			$spreadsheet 	= $reader->load($path.$name);
			$sheetData 		= $spreadsheet->getActiveSheet()->toArray(null, true, true, true);

			#declare this array first so that it will not become undefined if there are no unregistered users
			$data['unregistered_names'] = NULL;

			#check first if all staff in biometrics file is registered on the system
			for ($i = 1; $i <= count($sheetData); $i++)
			{
				if ($sheetData[$i]['A'] == "ID:")
				{
					$full_name = $sheetData[$i]['K'];

					#get first the employee id based on names reflected on DTR file
					$commandText = "SELECT employee_id FROM staff a WHERE CONCAT(a.fname, ' ', if(a.mname = '', '', CONCAT(a.mname, ' ')),a.lname) LIKE '%$full_name%'";
					$result = $this->db->query($commandText);
					$query_result = $result->result();

					if (count($query_result) == 0)
						$data['unregistered_names'][] = $full_name;
					else
						$data['registered_names'][] = array(
							'employee_id' 			=> $query_result[0]->employee_id,
							'employee_name'			=> $full_name,
							'biometrics_records'	=> $sheetData[$i+1]
						);
				}
			}

			if ($data['unregistered_names'] != NULL)
			{
				$data['sucess'] = false;
				$data['data'] = "Please contact the system administrator to register the following: " . json_encode($data['unregistered_names']);
				die(json_encode($data));
			}

			foreach ($data['registered_names'] as $key => $value)
			{
				$employee_id = $value['employee_id'];

				#check if the employee id exists for the current month of the biometrics data
				$commandText = "SELECT * FROM adminservices_biometrics_dtr_header WHERE calendar_id = $calendar_id AND employee_id = $employee_id";
				$result = $this->db->query($commandText);
				$query_result = $result->result();

				#if not exist, then insert
				if (count($query_result) == 0)
				{
					$this->load->model('adminservices_biometrics_dtr_header');
					$this->adminservices_biometrics_dtr_header->calendar_id 	= $calendar_id;
					$this->adminservices_biometrics_dtr_header->employee_id 	= $employee_id;
					$this->adminservices_biometrics_dtr_header->save(0);

					$adminservices_biometrics_dtr_header_id = $this->adminservices_biometrics_dtr_header->id;
				}
				else
					$adminservices_biometrics_dtr_header_id = $query_result[0]->id;

				$day = 1;
				foreach ($value['biometrics_records'] as $key => $val)
				{
					$commandText = "SELECT * FROM adminservices_biometrics_dtr_details WHERE adminservices_biometrics_dtr_header_id = $adminservices_biometrics_dtr_header_id AND day = $day";
					$result = $this->db->query($commandText);
					$query_result2 = $result->result();

					$original_biometrics_data = $this->add_separator_to_time_string($val, false);

					#NEED TO INITIALLY FIX THE DATA
					#query first if there is a holiday on the certain day
					$commandText = "SELECT 
										IF (holiday_description <> 'SATURDAY' AND holiday_description <> 'SUNDAY', 'HOLIDAY', holiday_description) AS holiday_description
									FROM calendar_holidays
									WHERE calendar_id = $calendar_id AND DATE_FORMAT(holiday_date, '%d') = $day AND active = 1";
					$result = $this->db->query($commandText);
					$query_result3 = $result->result();

					if (count($query_result3) > 0)
						$final_biometrics_data = '0-'.$query_result3[0]->holiday_description;
					else
						$final_biometrics_data = $this->fix_original_data($original_biometrics_data);

					if (count($query_result2) == 0)
					{
						#try batch insert for faster implementation
						$this->load->model('adminservices_biometrics_dtr_details');
						$this->adminservices_biometrics_dtr_details->adminservices_biometrics_dtr_header_id = $adminservices_biometrics_dtr_header_id;
						$this->adminservices_biometrics_dtr_details->day 									= $day;
						$this->adminservices_biometrics_dtr_details->original_biometrics_data 				= $original_biometrics_data;
						$this->adminservices_biometrics_dtr_details->final_biometrics_data 					= $final_biometrics_data;
						$this->adminservices_biometrics_dtr_details->save(0);
					}
					else if (count($query_result2) > 0 && $query_result2[0]->original_biometrics_data == NULL)
					{
						#try batch update for faster implementation
						$commandText = "UPDATE adminservices_biometrics_dtr_details 
										SET original_biometrics_data = '$original_biometrics_data' , final_biometrics_data = '$final_biometrics_data'
										WHERE adminservices_biometrics_dtr_header_id = $adminservices_biometrics_dtr_header_id
											AND day = $day";
						$result = $this->db->query($commandText);
					}
					$day++;
				}
			}

			$this->load->model('Logs'); $this->Logs->audit_logs(0, 'adminservices_biometrics_dtr_details', 'Batch Insert' . '- Header and Details', $this->modulename('label'));
		}
		catch(Exception $e) 
		{
			$data = array("success"=>false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function monthslist()
	{
		try
		{
			$this->load->library('session');
			$employee_id 		= $this->session->userdata('employee_id');

			$commandText = "SELECT 
								a.id,
								a.calendar_year,
								a.calendar_month,
								CONCAT(a.calendar_month, ' ', a.calendar_year) AS month_description
							FROM calendar a
								LEFT JOIN adminservices_biometrics_dtr_header b ON b.calendar_id = a.id
								LEFT JOIN staff c ON c.employee_id = b.employee_id
							WHERE
								c.employee_id = $employee_id
							ORDER BY a.id DESC";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$commandText = "SELECT count(a.id) AS count
							FROM calendar a
								LEFT JOIN adminservices_biometrics_dtr_header b ON b.calendar_id = a.id
								LEFT JOIN staff c ON c.employee_id = b.employee_id
							WHERE
								c.employee_id = $employee_id";
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
					'id' 				=> $value->id,
					'calendar_year' 	=> $value->calendar_year,
					'calendar_month' 	=> $value->calendar_month,
					'month_description'	=> $value->month_description
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

	public function view_monthly_dtr()
	{
		try
		{
			#update session
			$this->load->model('Session');$this->Session->Validate();

			die(json_encode($this->generate_monthly_dtr($this->input->post('calendar_id'), $this->input->post('employee_id'))));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generate_monthly_dtr($calendar_id, $employee_id)
	{
		try
		{
			$this->load->library('session');

			$commandText = "SELECT 
								CONCAT(UPPER(a.lname), ', ', a.fname, ' ', a.mname) AS name,
								IF(b.description IS NULL, '', b.description) AS position_description
							FROM staff a
								LEFT JOIN positions b ON b.id = a.position_id
							WHERE employee_id = $employee_id";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$name 					= $query_result[0]->name;
			$position_description	= $query_result[0]->position_description;

			if($calendar_id == 0)
				$commandText = "SELECT 
									id, 
									CONCAT(calendar_month, ' ', calendar_year) AS month_description 
								FROM calendar 
								WHERE current_month = 1";
			else 
				$commandText = "SELECT 
									id,
									CONCAT(calendar_month, ' ', calendar_year) AS month_description
								FROM calendar
								WHERE id = $calendar_id";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$calendar_id = $query_result[0]->id;

			$data['header_details'][] = array(
				'employee_id'			=> $employee_id,
				'calendar_id'			=> $calendar_id,
				'month_description'		=> $query_result[0]->month_description,
				'name'					=> $name,
				'position_description'	=> $position_description,
				'total_tardy'			=> '',
				'total_undertime'		=> '',
				'total_absences'		=> ''
			);

			$commandText = "SELECT
								a.day,
								a.final_biometrics_data
							FROM adminservices_biometrics_dtr_details a
								LEFT JOIN adminservices_biometrics_dtr_header b ON a.adminservices_biometrics_dtr_header_id = b.id
							WHERE b.calendar_id = $calendar_id 
								AND b.employee_id = $employee_id
							ORDER BY a.day ASC";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$i = 0;
			foreach($query_result as $key => $val)
			{
				$final_biometrics_data_string = $this->remove_flag_to_time_string($val->final_biometrics_data);
				$final_biometrics_data_array = explode(" ", $final_biometrics_data_string);

				$keys = array("morning_in", "morning_out", "afternoon_in", "afternoon_out");

				for ($j = 0; $j < 4; $j++)
				{
					$data['dtr_details'][$i]['day'] = $val->day;

					if (isset($final_biometrics_data_array[$j]) && $final_biometrics_data_array[$j] != null)
					{
						$data['dtr_details'][$i][$keys[$j]] = $final_biometrics_data_array[$j];
					}
					else 
						$data['dtr_details'][$i][$keys[$j]] = "";
				}
				$i++;
			}

			$data["success"] = true;
			$data["dtr_logs_count"] = count($query_result);

			return $data;
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();	
		}
	}

	public function export_dtr()
	{
		$dtr_classification 	= $this->input->post('dtr_classification');
		$calendar_id 			= $this->input->post('calendar_id');
		$employee_ids 			= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('employee_ids'))));
		$type 					= $this->input->post('type');

		$response = array();
		$response['success'] = true;

		// query the month and year detail based on calendar_id
		$commandText = "SELECT 
							calendar_year,
							UPPER(calendar_month) AS calendar_month,
							MONTH(STR_TO_DATE(calendar_month, '%M')) AS calendar_month_numeric	
						FROM calendar WHERE id = $calendar_id";
		$result = $this->db->query($commandText);
		$query_result = $result->result();

		// get the number of days for that month
		$number_of_days = cal_days_in_month(CAL_GREGORIAN, $query_result[0]->calendar_month_numeric, $query_result[0]->calendar_year);
		$dtr_period = $query_result[0]->calendar_month . " 1-" . $number_of_days . ", " . $query_result[0]->calendar_year;

		// implement on individual first. batch afterwards
		if($type == "Excel")
		{
			$employee_ids_count = $this->input->post('employee_ids_count');
			// optimize code by removing $dtr_classification variable
			if ($dtr_classification == "Individual")
				$response['filename'] = $this->exportexcelDTR($calendar_id, $employee_ids, $dtr_period, $dtr_classification, $employee_ids_count);
			else 
			{
				$response['filename'] = $this->exportexcelDTR($calendar_id, $employee_ids, $dtr_period, $dtr_classification, $employee_ids_count);
			}
		}
			
		$this->load->model('Logs'); $this->Logs->audit_logs(0, 'adminservices_biometrics_dtr_header', 'Generate DTR', $this->modulename('label'));        	
		die(json_encode($response));
	}

	public function exportexcelDTR($calendar_id, $employee_ids, $dtr_period, $dtr_classification, $employee_ids_count)
	{
		try
		{
			// load the dtr template first
			$path 			= getenv('BIOMETRICS_TARGET_DIR');
			$name 			= "DTR Form Template.xlsx";
			$spreadsheet 	= IOFactory::load($path.$name);
			$worksheet 		= $spreadsheet->getActiveSheet();

			// duplicate the template sheet
			$number_of_sheets = $employee_ids_count/2;
			if ($employee_ids_count%2 != 0) 
				$number_of_sheets = $employee_ids_count/2 + 0.5;

			for ($i=1; $i<$number_of_sheets; $i++)
			{
				$title = '' . ($i+1);
				$template_worksheet = clone $worksheet;
				$template_worksheet->setTitle($title);
				$spreadsheet->addSheet($template_worksheet);
			}

			$employee_ids_array = explode(",", $employee_ids);
			// loop thru each employee ID, and place the data to the readied DTR file
			for ($i=0; $i<$employee_ids_count; $i++)
			{
				$data = $this->generate_monthly_dtr($calendar_id, $employee_ids_array[$i]);
				//$data = $this->generate_monthly_dtr($calendar_id, $employee_ids);

				// if odd
				if (($i+1)%2 != 0)
				{
					$offset = 0;
					$worksheet = $spreadsheet->getSheet($i/2);
					$worksheet->getCellByColumnAndRow(1,4)->setValue($data['header_details'][0]['name']);
					$worksheet->getCellByColumnAndRow(4,6)->setValue($dtr_period);
				}
				else
				{
					$offset = 8;
					$worksheet->getCellByColumnAndRow(9,4)->setValue($data['header_details'][0]['name']);
					$worksheet->getCellByColumnAndRow(12,6)->setValue($dtr_period);

				}

				// loop thru the days and paste the DTR per employee
				for ($j = 0; $j<31 ;$j++)
				{
					// if whole day saturday, sunday, absent, leave, or holiday
					$daily_record = $data['dtr_details'][$j];
					if (($daily_record['morning_in'] == "SATURDAY" || $daily_record['morning_in'] == "SUNDAY" || $daily_record['morning_in'] == "ABSENT" || $daily_record['morning_in'] == "LEAVE" || $daily_record['morning_in'] == "HOLIDAY") && $daily_record['morning_out'] == "" && $daily_record['afternoon_in'] == "" && $daily_record['afternoon_out'] == "")
					{
						$worksheet->mergeCellsByColumnAndRow($offset+2, $j+12, $offset+5, $j+12);
						$worksheet->getStyleByColumnAndRow($offset+2, $j+12, $offset+5, $j+12)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
						$worksheet->getStyleByColumnAndRow($offset+2, $j+12, $offset+5, $j+12)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

						$worksheet->getCellByColumnAndRow($offset+2, $j+12)->setValue($daily_record['morning_in']);
					}

					// if morning is absent or leave
					else if (($daily_record['morning_in'] == "ABSENT" || $daily_record['morning_in'] == "LEAVE") && $daily_record['afternoon_in'] != "" && $daily_record['afternoon_out'] != "")
					{
						$worksheet->mergeCellsByColumnAndRow($offset+2, $j+12, $offset+3, $j+12);
						$worksheet->getStyleByColumnAndRow($offset+2, $j+12, $offset+3, $j+12)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

						$worksheet->getCellByColumnAndRow($offset+2, $j+12)->setValue($daily_record['morning_in']);
						$worksheet->getCellByColumnAndRow($offset+4, $j+12)->setValue($daily_record['afternoon_in']);
						$worksheet->getCellByColumnAndRow($offset+5, $j+12)->setValue($daily_record['afternoon_out']);
					}

					// if afternoon is absent or leave
					else if (($daily_record['afternoon_in'] == "ABSENT" || $daily_record['afternoon_in'] == "LEAVE") && $daily_record['morning_in'] != "" && $daily_record['morning_out'] != "")
					{
						$worksheet->mergeCellsByColumnAndRow($offset+4, $j+12, $offset+5, $j+12);
						$worksheet->getStyleByColumnAndRow($offset+4, $j+12, $offset+5, $j+12)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

						$worksheet->getCellByColumnAndRow($offset+2, $j+12)->setValue($daily_record['morning_in']);
						$worksheet->getCellByColumnAndRow($offset+3, $j+12)->setValue($daily_record['morning_out']);
						$worksheet->getCellByColumnAndRow($offset+4, $j+12)->setValue($daily_record['afternoon_in']);
					}

					else
					{
						$worksheet->getCellByColumnAndRow($offset+2, $j+12)->setValue($daily_record['morning_in']);
						$worksheet->getCellByColumnAndRow($offset+3, $j+12)->setValue($daily_record['morning_out']);
						$worksheet->getCellByColumnAndRow($offset+4, $j+12)->setValue($daily_record['afternoon_in']);
						$worksheet->getCellByColumnAndRow($offset+5, $j+12)->setValue($daily_record['afternoon_out']);
					}
		      	}
			}

			// generate filename before saving file, then go to subfolder path
			if ($dtr_classification == "Individual")
			{
				$name = explode(",", $data['header_details'][0]['name']);
				$dtr_classification = $name[0];
			}
			$filename = "Generated DTR " . $dtr_classification . " " . str_replace(",", "", $dtr_period . " " . date("md_His") . '.xlsx');
			$path .= "Generated DTRs/";

			//set metadata first before saving
			$spreadsheet->getProperties()
			    ->setCreator(getenv('REPORT_CREATOR'))
			    ->setLastModifiedBy(getenv('REPORT_CREATOR'))
			    ->setTitle("Generated DTR Report")
			    ->setSubject("Generated DTR Report")
			    ->setDescription(
			        "This file is automatically generated by the system developed by CHUDD-ICT"
			    )
			    ->setKeywords(getenv('REPORT_KEYWORDS'))
			    ->setCategory("Reports");

			// save the dtr template
			$writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
			$writer->save($path . $filename);
			return $path . $filename;
		}
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	private function fix_original_data($original_string)
	{
		$string_array = explode(" ", $original_string);

		if ($string_array != NULL)
		{
			//1st condition, remove duplicate time
			$new_array = array();
			$array_element_left = $string_array[0];
			
			$new_array[] = $array_element_left;
			for ($i = 0; $i < (count($string_array)-1); $i++)
			{	
				$array_element_right = $string_array[$i+1];
				if ($array_element_right == NULL)
					break;
				else if ($array_element_left == $array_element_right)
					continue;
				else
				{
					$array_element_left = $array_element_right;
					$new_array[] = $array_element_left;
				}
			}

			//check how many data left after removing duplicates
			$array_length = count($new_array);

			//ADD CODE FOR ARRANGING DATA
			//if less than 4
			if ($array_length < 4)
			{
				$time_string = "";
				//=======================
				// check 1st record
				// 	if record > 10:00 but < 12:31, add 1 space
				// 	if record >= 12:31 but < 15:16, add 2 spaces
				// 	if record >= 15:16, add 3 spaces and break
				// 	else, add no space
				// check 2nd record
				// 	if there are 3 records, record >= 12:31, and next record < 15:16, add 1 space after record
				// 	if record >= 12:31 but < 15:16, add 1 space
				// 	if record >= 15:16, 
				// 		if only 2 records
				// 			add 2 spaces and break
				// 		else, add 1 space and break
				// 	else, add no space
				// check 3rd record
				// 	if record >= 15:16, add 1 space and break
				// 	else, add no space
				//=======================
				for ($i = 0; $i < $array_length; $i++)
				{
					if ($i==0)
					{
						if (strtotime($new_array[$i]) > strtotime("10:00") && strtotime($new_array[$i]) < strtotime("12:31"))
							$time_string .= " " . $new_array[$i];
						else if (strtotime($new_array[$i]) >= strtotime("12:31") && strtotime($new_array[$i]) < strtotime("15:16"))
							$time_string .= "  " . $new_array[$i];
						else if (strtotime($new_array[$i]) >= strtotime("15:16"))
						{
							$time_string .= "   " . $new_array[$i];
							break;
						}
						else
						{
							$time_string .= $new_array[$i] . " ";
						}
					}
					else if ($i==1)
					{
						if (strtotime($new_array[$i]) >= strtotime("17:00") && strtotime($new_array[$i-1]) <= strtotime("08:00"))
						{
							$time_string .= "  " . $new_array[$i];
							break;
						}
						else if ($array_length == 3 && strtotime($new_array[$i]) <= strtotime("08:00") && strtotime($new_array[$i+1]) >= strtotime("17:00"))
							$time_string .= " ";
						else if ($array_length == 3 && strtotime($new_array[$i]) >= strtotime("12:31") && strtotime($new_array[$i+1]) < strtotime("15:16"))
							$time_string .= $new_array[$i] . " ";
						else if (strtotime($new_array[$i]) >= strtotime("12:31") && strtotime($new_array[$i]) < strtotime("15:16"))
							$time_string .= " " . $new_array[$i];
						else if (strtotime($new_array[$i]) >= strtotime("15:16"))
						{
							if ($array_length == 2 && strtotime($new_array[$i-1]) < strtotime("12:31"))
								$time_string .= "  " . $new_array[$i];
							else if ($array_length == 2 && strtotime($new_array[$i-1]) >= strtotime("12:31"))
								$time_string .= " " . $new_array[$i];
							else
								$time_string .= " " . $new_array[$i];
							break;
						}
						else
							$time_string .= $new_array[$i] . " ";
					}
					else
					{
						if (strtotime($new_array[$i]) >= strtotime("15:16"))
						{
							$time_string .= " " . $new_array[$i];
							break;
						}
						else
							$time_string .= $new_array[$i];
					}
				}
				return '1-' . $time_string;
			}
			//if more than or equal to 4
			else if ($array_length >= 4)
			{
				$needsCorrection = false;
				$new_array2 = array();

				for ($i = 0; $i < $array_length; $i++)
				{
					//get first time stamp
					if ($i == 0)
					{
						$new_array2[] = $new_array[$i];
					}
					else if (($i > 0) && ($i < ($array_length - 1)))
					{
						//if time is greater than 12 noon and next record is not greater than 5pm, get 2 consecutive time
						if (strtotime($new_array[$i]) >= strtotime("12:00") && strtotime($new_array[$i+1]) < strtotime("17:00"))
						{
							$new_array2[] = $new_array[$i];
							$new_array2[] = $new_array[$i+1];
							$i = ($array_length - 2);	// minus 2 because $i is incremented at start of loop, effectively setting $i to last element of array
						}
						//if time is greater than 12 noon and next record is greater than 5pm
						else if (strtotime($new_array[$i]) >= strtotime("12:00") && strtotime($new_array[$i+1]) >= strtotime("17:00"))
						{
							$new_array2[] = $new_array[$i];
							$new_array2[] = null;
							$new_array2[] = $new_array[$i+1];
							$needsCorrection = true;
							break;
						}
						else
						{
							//if second time is less than or equal to 8:00am and there are more than 4 biometrics record, disregard and continue with loop (because 1st time should be the AM time in)
							if (strtotime($new_array[$i]) <= strtotime("08:00") && $array_length > 4)
								continue;
							//if second time is less than 12 nn and there are more than 4 biometrics record, disregard and continue with loop
							else if (strtotime($new_array[$i]) <= strtotime("12:00") && $array_length > 4)
								continue;
							//if second time is less than or equal to 8:00am and there are exactly 4 biometris record, either make the AM timeout or PM timein NULL
							else if (strtotime($new_array[$i]) <= strtotime("08:00") && $array_length == 4)
							{
								if (strtotime($new_array[$i+1]) < strtotime("12:31"))
								{
									$new_array2[] = $new_array[$i+1];
									$new_array2[] = null;
								}
								else if (strtotime($new_array[$i+1]) >= strtotime("12:31"))
								{
									$new_array2[] = null;
									$new_array2[] = $new_array[$i+1];
								}

								$i = ($array_length - 2);	//go to last increment of the loop
								$needsCorrection = true;	//flag as needs correction
							}
							else
							{
								$new_array2[] = $new_array[$i];
								$new_array2[] = $new_array[$i+1];
								$i = ($array_length - 2);
								$needsCorrection = true;
							}
						}
					}
					//get last time stamp
					else
						$new_array2[] = $new_array[$i];
				}

				if ($needsCorrection)
					return '1-' . $this->rebuild_time_string($new_array2);
				else
					return '0-' . $this->rebuild_time_string($new_array2);
			}
		}
	}

	//remove flag '0- or 1-' and then return time string
	private function remove_flag_to_time_string($string)
	{
		$string_array = explode("-", $string);
		return $string_array[1];
	}

	//add separator then rebuild, return either time string or time array
	private function add_separator_to_time_string($string, $isArray)
	{
		$string_array = str_split($string, 5);
		if ($isArray)
			return $string_array;
		else
			return $this->rebuild_time_string($string_array);
	}

	private function rebuild_time_string($array)
	{
		$output_string = "";

		for ($i = 0; $i < count($array); $i++)
		{
			if (!isset($array[$i]))
				$output_string .= "";
			else if ($array[$i] == "")
				$output_string = null;
			else
				$output_string .= $array[$i];

			// space as separator for each time
			if ($i != (count($array)-1))
				$output_string .= " ";
		}
		return $output_string;
	}

	private function ordinal($number)
	{
	    $ends = array('th','st','nd','rd','th','th','th','th','th','th');
	    if ((($number % 100) >= 11) && (($number%100) <= 13))
	        return $number. 'th';
	    else
	        return $number. $ends[$number % 10];
	}
}