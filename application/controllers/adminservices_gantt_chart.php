<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class AdminServices_Gantt_Chart extends CI_Controller {
	/**
	*/ 
	private function modulename($type)
	{		
		if($type == 'link')
			return 'adminservices_gantt_chart';
		else 
			return 'Gantt Chart Logging';
	} 
	public function index()
	{		
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}

	public function export_section_activities_reporting(){
		try
		{
			
			$this->load->library('session');
			$id = $this->session->userdata('user_id');

			$commandText_staff = "SELECT e.id, CONCAT(e.fname, ' ', e.mname, ' ', e.lname) as staffname,
					s.code as section,
					d.div_code as division
			FROM chuddiadb.staff e
			INNER JOIN chuddiadb.sections s ON s.id = e.section_id
			INNER JOIN chuddiadb.divisions d on d.id = e.division_id
			WHERE e.active = 1 AND e.division_id =  (SELECT division_id FROM chuddiadb.staff WHERE id='$id')
			";
			$result_staff = $this->db->query($commandText_staff);
			$query_result_staff = $result_staff->result();

			foreach($query_result_staff as $key => $value)
			{
				$staff_id = $value->id;
				$staffer = $value->staffname;
				$staff_section  = $value->section;
				$staff_division  = $value->division;
				//get signatory data
				$cmdtxtSH = "SELECT CONCAT(e.fname, ' ', e.mname, ' ', e.lname) as sh
							FROM chuddiadb.staff e 
							WHERE active = 1
							AND section_head = 1  
							AND section_id = (SELECT section_id from chuddiadb.staff WHERE id = '$staff_id' and active = 1)";

				$cmdtxtDH = "SELECT CONCAT(e.fname, ' ', e.mname, ' ', e.lname) as dh
							FROM chuddiadb.staff e 
							WHERE active = 1
							AND division_head = 1  
							AND division_id = (SELECT division_id from chuddiadb.staff WHERE id = '$staff_id' and active = 1)";
				$result = $this->db->query($cmdtxtSH);
				$val_row = $result->row(0);
				$val_sh = $val_row->sh;

				$result = $this->db->query($cmdtxtDH); 
				$val_row = $result->row(0);
				$val_dh = $val_row->dh;
		
				$commandText = "SELECT DISTINCT
				a.id,
				CONCAT(e.fname, ' ', e.mname, ' ', e.lname) as staffname,
				c.activity,	
				(SELECT GROUP_CONCAT(CONCAT(LEFT(sched_start,10), ' to ', LEFT(sched_end,10)) SEPARATOR '\n') FROM staffmonitoring.sectionactivityschedules 
					WHERE activity_id = a.sectionactivityID 
					AND deletedAt is NULL 
					AND sched_start <= '2021-07-01 00:00:00'
					AND sched_start >= '2021-01-31 00:00:00'
					AND sched_start <= '2021-04-30 00:00:00')
					as schedules,    
				a.logDate, a.logActivity  FROM staffmonitoring.dailylogs a
				INNER JOIN staffmonitoring.sectionactivity c ON c.sectionactivityID = a.sectionactivityID
				LEFT JOIN staffmonitoring.sectionactivityschedules d ON d.activity_id = a.sectionactivityID
				INNER JOIN chuddiadb.staff e on e.id = a.staffID
				WHERE e.id = '$staff_id' AND e.active = '1' AND
				a.logDate >= '2021-04-15' AND a.logDate <= '2021-04-30' AND
				a.sectionactivityID IS NOT NULL and
				a.deletedAt IS NULL 
				ORDER BY a.sectionactivityID ASC, a.logDate ASC
				";
				$result = $this->db->query($commandText);
				$query_result = $result->result();
				
				$query_count2 = 0;
				$data = null;

				foreach($query_result as $key => $value)
				{
					$data['data'][] = array(
						'id'	=> $value->id,
						'staffname'	=> $value->staffname,
						'activity'	=> $value->activity,
						'schedules'	=> $value->schedules,
						'logDate'	=> $value->logDate,
						'logActivity'=> $value->logActivity
					);
					$query_count2 += 1;
				}
				$data['totalCount'] = $query_count2;

				//build pdf
				$this->load->library('tcpdf');
				//$this->load->library('PHPExcel/PHPExcel/Shared/PDF/tcpdf');
				$pdf = new TCPDF();
				$fDate = date("Ymd_His"); 
				$filename = "AR-".$staff_id."-".$fDate.".pdf";
			
				// set document information
				$pdf->SetCreator(getenv('REPORT_CREATOR'));
				$pdf->SetAuthor(getenv('REPORT_AUTHOR'));
				$pdf->SetTitle('SectionActivitiesLog');
				$pdf->SetSubject('SectionActivitiesLog');
				$pdf->SetKeywords(getenv('REPORT_KEYWORDS'));
			
				//set margins
				$pdf->SetPrintHeader(false);
				$pdf->SetPrintFooter(false);

				//$pdf->AddPage('P', 'LETTER');
				$pdf->AddPage('P', 'PH_LEGAL'); 
				//$pdf->Image('image/logo-chudd.png', 10, 8, 20, 20, 'PNG', null, '', true, 300, '', false, false, 0, false, false, false);
				
				$img_test = base_url('./image/logo-chudd.png');
				//echo $img_test;

				$html =	'
						<table border=1 width="100%">
							<tr style="font-weight:bold;font-size:45px;">
								<td width="10%"><img src="'.$img_test.'"></td>
								<td width="1%"></td>
								<td width="89%" align="left"><font face="Arial">CITY HOUSING AND URBAN DEVELOPMENT DEPARTMENT<br>EMPLOYEE ACCOMPLISHMENT REPORT</font></td>
							</tr>
						</table>
						<br>						
						<br>
						Staff Name: '.$staffer.'<br>
						Date Range: April 15 - April 30, 2021
						<br>
						<br>
						<table border="1" cellpadding="2" width="100%">						
						<tr style="padding: 10px;font-weight:bold;font-size:20px;">
							<td width="45%" style="padding: 10px;" align="center">Planned - Gantt Chart</td>
							<td width="55%"  style="padding: 10px;" align="center">E-Log of Activity</td>
						</tr>
						</table>
						<table border="1" cellpadding="2">						
							<tr style="padding: 10px;font-weight:bold;font-size:20px;">
							  <td width="30%"  style="padding: 10px;" align="center">Section Activity</td>
							  <td width="15%"  style="padding: 10px;" align="center">Activity Schedule</td>
							  <td width="10%"  style="padding: 10px;" align="center">Date</td>
							  <td width="45%"  style="padding: 10px;" align="left">Activity</td>
							</tr>';

				$rowspan_count = 0;
				$row_builder = '';
				$first_row = '';
				$cur_activity='';
				$cur_schedules ='';
				$cur_logDate ='';
				$cur_logActivity = '';
				$next_activity ='';
				$next_schedules='';

				$fr_i=0;
				$fr_logDate='';
				$fr_logActivity='';

				$old_fr_logDate = '';
				$old_fr_logActivity='';

				$x=0;
				$loops= intval($data['totalCount']);
				//this condition is good for displaying all items
				for ($i = 0; $i<$loops ;$i++)
				{
					//get next activity
					if ($i==$loops-1) //this is for the last row
					{
						$next_activity="EOF";
					}
					else
					{
						$next_activity=$data['data'][$i+1]['activity'] ;
					}

					$cur_activity=$data['data'][$i]['activity'] ;
					$cur_schedules =$data['data'][$i]['schedules'] ;
					$cur_logDate =$data['data'][$i]['logDate'] ;
					$cur_logActivity =$data['data'][$i]['logActivity'] ;	

					//build rows here
					if ($cur_activity==$next_activity)
					{
						//if rowspan = 0 //rowspan also logs total under activities
						if($rowspan_count ==0)
						{
							$rowspan_count +=1;
							$fr_logDate = $cur_logDate;
							$fr_logActivity= $cur_logActivity;
							$fr_i = $rowspan_count;
						}
						//add a new row
						else
						{
							$rowspan_count +=1;
							$row_builder .=	'
								<tr nobr="true" style="font-size:20px;">
								<td style="padding: 10px;" align="center">'.$cur_logDate.'</td>
								<td style="padding: 10px;" align="left">'.$cur_logActivity.'</td>
								</tr>';
						}
					}

					//print rows here
					else{
						//check here for stragglers
						if($rowspan_count ==0)
						{
							$rowspan_count +=1;
							$fr_i = $rowspan_count;
							$fr_logDate = $cur_logDate;
							$fr_logActivity= $cur_logActivity;
							$first_row = '<tr nobr="true" style="font-size:20px;">
								<td nobr="true" rowspan="'. $rowspan_count . '" style="padding: 10px;" align="center">'.$cur_activity.'</td>
								<td nobr="true" rowspan="'. $rowspan_count . '" style="padding: 10px;" align="center">'.$cur_schedules .'</td>
								<td nobr="true" style="padding: 10px;" align="center">'.$fr_logDate.'</td>
								<td nobr="true"style="padding: 10px;" align="left">'.$fr_logActivity.'</td>
								</tr>';
							$html .= $first_row;

						}
						elseif($rowspan_count ==1)
						{
							$rowspan_count +=1;
							$first_row = '<tr nobr="true" style="font-size:20px;">
								<td nobr="true" rowspan="'. $rowspan_count . '" style="padding: 10px;" align="center">'.$cur_activity.'</td>
								<td nobr="true" rowspan="'. $rowspan_count . '" style="padding: 10px;" align="center">'.$cur_schedules .'</td>
								<td nobr="true" style="padding: 10px;" align="center">'.$fr_logDate.'</td>
								<td nobr="true"style="padding: 10px;" align="left">'.$fr_logActivity.'</td>
								</tr>';
							$row_builder .=	'
								<tr nobr="true" style="font-size:20px;">
								<td style="padding: 10px;" align="center">'.$cur_logDate.'</td>
								<td style="padding: 10px;" align="left">'.$cur_logActivity.'</td>
								</tr>';
							$html .= $first_row;
							$html .= $row_builder;
						}
						//add a new row
						//elseif($rowspan_count >=1)
						else
						{
							//since we are unable to build the latest current row, we append it here instead.
							$rowspan_count += 1;
							$first_row = '<tr nobr="true" style="font-size:20px;">
								<td nobr="true" rowspan="'. $rowspan_count . '" style="padding: 10px;" align="center">'.$cur_activity.'</td>
								<td nobr="true" rowspan="'. $rowspan_count . '" style="padding: 10px;" align="center">'.$cur_schedules .'</td>
								<td nobr="true" style="padding: 10px;" align="center">'.$fr_logDate.'</td>
								<td nobr="true"style="padding: 10px;" align="left">'.$fr_logActivity.'</td>
								</tr>';
							$row_builder .=	'
								<tr nobr="true" style="font-size:20px;">
								<td style="padding: 10px;" align="center">'.$cur_logDate.'</td>
								<td style="padding: 10px;" align="left">'.$cur_logActivity.'</td>
								</tr>';
							$html .= $first_row;
							$html .= $row_builder;
						}
						//reset variables
						$rowspan_count = 0;
						$row_builder = '';
						$first_row = '';
					}
					//$html .= '
					//	<tr nobr="true">
					//		<td>'.$new_activity.'</td>
					//		<td>'.$new_schedules.'</td>
					//		<td>'.$new_logDate.'</td>
					//		<td>'.$new_logActivity.'</td>
					//	</tr>					';
					
				}

				$html .= '</table><br>';
				$html .= '
					<table border="1" cellpadding="2" width="100%">
						<tr nobr="true">
							<td> 
								Section Head Comment:
								<br><br><br>
							</td>
						</tr>
					</table><br><br>
				';

				//special conditions for special kids
				$dh_text = $staff_division.' Division Head';
				$staffer = ucfirst($staffer);
				if ($val_dh == getenv('NAME_ADH')){
					$dh_text = 'Assistant Department Head';
				}

				if($staff_section =='PDRM'){
					$html .= '
					<table cellpadding="2" nobr="true">
						<tr>
							<td width="33%">Submitted by:</td>
							<td width="33%">Acknowledged by:</td>
							<td width="33%">Approved by:</td>
						</tr>
						<tr>
							<td><br><br><u>'.ucfirst($staffer).'</u><br>'.$staff_section.' Staff</td>
							<td><br><br><u>'.getenv('NAME_SAO').'</u><br>ASSD Division Head</td>
							<td><br><br><u>'.getenv('NAME_DH').'</u><br>CHUDD Department Head</td>
						</tr>												
					</table>
					';
				}
				else if($staff_section != 'DAS'){
					$html .= '
					<table cellpadding="2" nobr="true">
						<tr>
							<td width="33%">Submitted by:</td>
							<td width="33%">Acknowledged by:</td>
							<td width="33%">Approved by:</td>
						</tr>
						<tr>
							<td><br><br><u>'.ucfirst($staffer).'</u><br>'.$staff_section.' Staff</td>
							<td><br><br><u>'.$val_sh.'</u><br>'.$staff_section.' Section Head</td>
							<td><br><br><u>'.getenv('NAME_DH').'</u><br>CHUDD Department Head</td>
						</tr>
						<tr>
							<td></td>
							<td><br><br><u>'.$val_dh.'</u><br>'.$dh_text.'</td>
							<td></td>
						</tr>						
					</table>
					';
				}
				else {
					$html .= '
					<table cellpadding="2" nobr="true">
						<tr>
							<td width="33%">Submitted by:</td>
							<td width="33%">Acknowledged by:</td>
							<td width="33%">Approved by:</td>
						</tr>
						<tr>
							<td><br><br><u>'.$staffer.'</u><br>'.$staff_division.' Division Admin Assistant</td>
							<td><br><br><u>'.$val_dh.'</u><br>'.$dh_text.'</td>
							<td><br><br><u>'.getenv('NAME_DH').'</u><br>CHUDD Department Head</td>
						</tr>						
					</table>
					';
				}

				date_default_timezone_set('Asia/Manila');
				$this->load->library('session');
				//$html .= '<div style="font-size:32px;"><br><br><br>Printed by:<br>'.$this->session->userdata('name').'<br>Date Printed: '.date('m/d/Y h:i:sa', time()).'</div>';
				$pdf->writeHTML($html, true, false, true, false, '');
				$path = "documents";
				$pdf->Output("$path/$filename", 'F');
				$response['filenames'][] = array(
					'fileowner'=> $staffer,
					'filename'=> "$path/$filename",
					'filedata'=> $html
					//'filedata' => 'none'
				);

			}
			$response['success'] = true;
			//$response['filename'] = "$path/$filename";
			die(json_encode($response));
			//return "$path/$filename";
		}
		catch (Exception $e)
		{
			echo $this->db->last_query();
			print $e->getMessage();
			die();
		}
	}

	public function section_activities_list()
	{
		try
		{
			$query = "";
			if (isset($_GET['query'])){
				$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			}
			die(json_encode($this->generate_section_activities_list($query)));			
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}


	public function generate_section_activities_list($query)
	{
		try
		{
			$this->load->library('session');
			$section_id = $this->session->userdata('section_id');
			
			if(isset($query)){				
				//echo $query, $section_id;
				if (is_numeric($query)){
					$section_id = $query;
				}
			}

			$commandText = "SELECT a1.sectionactivityID, a1.activity, a1.createdAt, a1.section_id, a1.activityPoint,
							(SELECT GROUP_CONCAT(UCASE(b.lname) ORDER BY b.lname ASC) FROM staffmonitoring.sectionactivityassignments a 
							LEFT JOIN chuddiadb.staff b ON a.staff_id = b.id
							WHERE a.activity_id = a1.sectionactivityID AND a.deletedAT IS NULL AND b.active = 1) AS staffers
							FROM staffmonitoring.sectionactivity a1 
							WHERE a1.deletedAt IS NULL AND 
							a1.createdAt >= '2021-01-01 00:00:00' AND
							a1.section_id = $section_id
							";		
							
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$sched_array=[];
			foreach($query_result as $key=>$value)
			{
				$activity_id = $value->sectionactivityID;

				//get schedules
				$commandText = "SELECT LEFT(sched_start, 10) as start_date, LEFT(sched_end, 10) as end_date, with_report FROM staffmonitoring.sectionactivityschedules
								WHERE activity_id = $activity_id and DeletedAt IS  NULL";
				$result2 = $this->db->query($commandText);
				$query_result2 = $result2->result();		
		
				$commandText = "SELECT count(*) AS count FROM
				staffmonitoring.sectionactivityschedules WHERE activity_id = $activity_id and DeletedAt IS NULL";
				$result = $this->db->query($commandText);
				$query_count = $result->num_rows();

				$sched_array=[];
			
				foreach($query_result2 as $key=>$value2)
				{
					$with_report = $value2->with_report;
					$week_offset = 0;
					$start_date = new DateTime($value2->start_date);
					$start_week = $start_date->format("W");
					$start_week = $start_week - $week_offset;

					$end_date = new DateTime($value2->end_date);
					$end_week = $end_date->format("W");
					$end_week = $end_week -$week_offset;
					
					//schedule gets rewritten when there are multiple schedules, advice do not loop through 27 per schedule detected
					//27
					for ($x = $start_week; $x <= 26 ; $x++) 
					{
						$week_num = $x;
						$dto = new DateTime();
						$week_offset = 0;
						$dto->setISODate(date("Y"), $week_num+$week_offset);
						$week_start = $dto->format('Y-m-d');
						$dto->modify('+6 days'); //para aha ni?
						$week_end = $dto->format('Y-m-d');

						//total of daily logs for this id and schedule
						$command_text = "SELECT COUNT(*) as count FROM staffmonitoring.dailylogs a					
						WHERE
						a.logDate >= '$week_start 00:00:00' AND
						a.logDate <= '$week_end 00:00:00' AND
						a.sectionactivityID = $activity_id AND
						a.deletedAt IS NULL";

						$dl_query_count = $this->db->query($command_text);
						$dl_count = $dl_query_count->result();

						if($x>=$start_week and $x<=$end_week)
						{
							if($with_report == True)
							{
								$sched_array['wk'.$x]= array('<div style="font-weight:bolder;"><u>X</u></div>', $dl_count[0]->count);
							}
							else
							{
								$sched_array['wk'.$x]= array('x', $dl_count[0]->count);
							}
						}
						else
						{
							$sched_array['wk'.$x]= array('', $dl_count[0]->count);
						}
					}
				}
				
				//schedule gets rewritten when there are multiple schedules
				$data['data'][]=array(
					'id'=> $value->sectionactivityID,
					'activity'=> $value->activity,
					'staffers'=> $value->staffers,
					'schedules'=> $sched_array,
					'activity_points'=> $value->activityPoint
				);
			}
			$data['totalCount']=$result2->num_rows();
			//throw needed ci_cookie data here
			//$data['user_id']= $this->session->userdata('user_id');
			//$data['section_id']= $this->session->userdata('section_id');

			return $data;
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	//view gantt chart entry
	public function activity_logs_list()
	{
		try
		{
			$query = "";
			if (isset($_GET['query'])){
				$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			}
			die(json_encode($this->generate_activity_logs_list($query)));		
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	//view gantt chart entry
	public function generate_activity_logs_list($query)
	{
		$this->load->library('session');
		$id=(int)$this->input->post('id');
		$week_num=(int)$this->input->post('week_num');
		
		$dto = new DateTime();
		$week_offset = 0;
		$dto->setISODate(date("Y"), $week_num+$week_offset);
		$week_start = $dto->format('Y-m-d');
		$dto->modify('+6 days');
		$week_end = $dto->format('Y-m-d');

		#$week_start = date("Y-m-d", $week_start);
		#$week_end = date("Y-m-d", $week_end);
		
		$command_text = "SELECT a.*, CONCAT(b.fname, ' ', b.mname, ' ', b.lname) as prepared_name FROM chuddiadb.adminservices_activity_report a
			LEFT JOIN chuddiadb.staff b ON b.id = a.documented_by
			WHERE 
			a.documented_date >= '$week_start' AND
			a.documented_date <= '$week_end' AND
			a.section_activity_id = $id 
			ORDER BY prepared_name, documented_date
			";
		$result = $this->db->query($command_text);		
		$query_result = $result->result();
		$query_count = $result->num_rows();;

		if ($query_count > 0){
			foreach($query_result as $key => $value)
			{
				$data['data'][] = array(
					'id'					=> $value->id,				
					'documented_date'		=> date('j M Y', strtotime($value->documented_date)),
					'documented_by'			=> $value->documented_by,
					'activity'				=> $value->activity,
					'venue' 				=> $value->venue,
					'participants'			=> $value->participants,
					'purpose'				=> $value->purpose,
					'target_output'			=> $value->expected_output,
					'accomplishments'		=> $value->accomplishments,
					'remarks'				=> $value->remarks,
					'submit_date'			=> $value->submit_date,
					'chudd_participants'	=> $value->chudd_participants,
					'documentation'			=> $value->documentation,
					'prepared_date'			=> $value->documented_date,				
					'prepared_name'			=> $value-> prepared_name
				);
			}
		}
		else{
			$data['data'][]=array();
		}
		$data['totalCount'] = $query_count;
		//return $data;

		// DAILY LOGS
		$command_text = "SELECT a.*, CONCAT(b.fname, ' ', b.mname, ' ', b.lname) as prepared_name FROM staffmonitoring.dailylogs a
		LEFT JOIN chuddiadb.staff b ON b.id = a.staffID 
		WHERE
		a.logDate >= '$week_start' AND 
		a.logDate <= '$week_end' AND
		a.deletedAt is NULL AND 
		a.sectionactivityID = $id 
		ORDER BY prepared_name, logDate";
		$result = $this->db->query($command_text);		
		$query_result = $result->result();
		$query_count = $result->num_rows();
		
		if ($query_count > 0){
			foreach($query_result as $key => $value)
			{
				$data['data2'][] = array(
					'id' => $value->id,
					'log_date' => date('j M Y', strtotime($value->logDate)),
					'log_location' => $value->logLocation,
					'log_activity'=> $value->logActivity,
					'prepared_name' =>$value->prepared_name
				);
			}
		}
		else{
			$data['data2'][]=array();
		}
		$data['totalCount2'] = $query_count;
		return $data;
	}

	public function export_post_activity_report()
	{
		$this->load->library('session');
		$id = $this->session->userdata('user_id');
		$par_id = $this->input->post('doc_id');
		
		$command_text = "SELECT a.*, 
		b.id as prepared_id, CONCAT(b.fname, ' ', b.mname, ' ', b.lname) as prepared_name,  
		c.id as reviewed_id, CONCAT(c.fname, ' ', c.mname, ' ', c.lname) as reviewed_name,
		d.id as approved_id, CONCAT(d.fname, ' ', d.mname, ' ', d.lname) as approved_name,
		e.code as section_code,
		f.div_code as division_code 
		FROM chuddiadb.adminservices_activity_report a
		LEFT JOIN chuddiadb.staff b ON b.id = a.documented_by
		LEFT JOIN chuddiadb.staff c ON c.id = a.reviewed_by
		LEFT JOIN chuddiadb.staff d ON d.id = a.approved_by
		LEFT JOIN chuddiadb.sections e ON e.id = a.section_id
		LEFT JOIN chuddiadb.divisions f ON f.id = a.division_id		
		WHERE a.id = $par_id";
		$result = $this->db->query($command_text);
		$query_result = $result->result();

		$command_text = "SELECT count(*) AS count FROM adminservices_activity_report a  WHERE a.id = $par_id";
		$result = $this->db->query($command_text);
		$query_count = $result->result();

		foreach($query_result as $key => $value)
		{
			$data['data']=array(
				$id= $value->id,
				$documented_date = substr($value->documented_date,0,11) ,
				$venue = $value->venue,
				$activity= $value->activity,
				$participants= $value->participants,
				$purpose= $value->purpose,
				$expected_output= $value->expected_output,
				$accomplishments= $value->accomplishments,
				$remarks= $value->remarks,			
				$chudd_participants= $value->chudd_participants,
				$section_activity_id= $value->section_activity_id,
				$prepared_name = $value->prepared_name,
				$reviewed_name = $value->reviewed_name,
				$approved_name = $value->approved_name,
				$section_code = $value->section_code,
				$division_code = $value->division_code);
		}

		//build pdf
		$this->load->library('tcpdf');
		//$this->load->library('PHPExcel/PHPExcel/Shared/PDF/tcpdf');
		$pdf = new TCPDF();
		$fDate = date("Ymd_His"); 
		$filename = "PAR-".$id."-".$section_activity_id."-".$documented_date.".pdf";
		//set margins
		$pdf->SetPrintHeader(false);
		$pdf->SetPrintFooter(false);
		$pdf->AddPage('P', 'PH_LEGAL');
		$pdf->Image('image/logo-chudd.png', 10, 8, 20, 20, 'PNG', null, '', true, 300, '', false, false, 0, false, false, false);

		$html = '
				<table border=1>
					<tr style="font-weight:bold;font-size:45px;">
						<td width="60"></td>
						<td style="background: black; padding: 10px;" align="left"><font face="Arial">'.getenv('DEPARTMENT_NAME_ALL_CAPS').'</font></td>
					</tr>
				</table>
				</br>
				<h3 align="center">POST-ACTIVITY REPORT</h3> 
				</br>
				</br>
				</br>
				<table cellpadding="2" style="padding: 10px;">
					<tr>
						<td>
							ACTIVITY
						</td>
						<td>
							'.$activity.'
						</td>
					</tr>
					<tr>
						<td>
							VENUE
						</td>
						<td>
							'.$venue.'
						</td>
					</tr>
					<tr>
						<td>
							PARTICIPANTS
						</td>
						<td>
							'.$participants.'
						</td>
					</tr>
					<tr>
						<td>
							PURPOSE
						</td>
						<td>
							'.$purpose.'
						</td>
					</tr>
					<tr>
						<td>
							TARGET OUTPUT
						</td>
						<td>
							'.$expected_output.'
						</td>
					</tr>
					<tr>
						<td>
							ACTUAL ACCOMPLISHMENTS
						</td>
						<td>
							'.$accomplishments.'
						</td>
					</tr>
					<tr>
						<td>
							REMARKS
						</td>
						<td>
							'.$remarks.'
						</td>
					</tr>
					<tr>
						<td>
							DOCUMENTATION
						</td>
						<td>
						</td>
					</tr>
				</table>
				</br></br></br>
				<div></div>
				<table>
					<tr>
						<td>
							Prepared By
						</td>
						<td>
							Reviewed By
						</td>
						<td>
							Noted By
						</td>
					</tr>
					<tr>
						<td>
							<br><br>	
							<u>'.$prepared_name.'</u>
							<br>
							'.$section_code.' Staff
						</td>
						<td>
							<br><br>
							<u>'.$reviewed_name.'</u>
							<br>
							'.$section_code.' Section Head
						</td>
						<td>
							<br><br>
							<u>'.$approved_name.'</u>
							'.$division_code.' Division Head
							<br>
						</td>
					</tr>
				</table>
		';

		$this->load->library('session');
		//$html .= '<div style="font-size:32px;"><br><br><br>Printed by:<br>'.$this->session->userdata('name').'<br>Date Printed: '.date('m/d/Y h:i:sa', time()).'</div>';
		$pdf->writeHTML($html, true, false, true, false, '');
		$path = getenv('DOCUMENTS_DIR');
		$pdf->Output("$path/$filename", 'F');
			
		$response['filename']= ("$path.$filename");
		$response['success'] = true;
		//$response['filename'] = "$path/$filename";
		die(json_encode($response));
		//return "$path/$filename";
	}

	public function editActivityPoint()
	{
		try{
			$this->load->library('callable_functions');
			$this->load->library('session');
			$this->load->model('Access');
			$this->Access->rights($this->modulename('link'), null, null);
			$id = $this->session->userdata('user_id');

			$this->db>update('staffmonitoring.sectionactivity');
		}
		catch(Exception $e){

		}
	}

	public function export_IPCRs(){
		//past section id from combobox data
		error_reporting(E_ERROR | E_WARNING | E_PARSE);
		$this->load->library('session');
		$id = $this->session->userdata('user_id');
		$section_id = $this->session->userdata('section_id');

		$commandText_staff = "SELECT e.id, CONCAT(e.fname, ' ', e.mname, ' ', e.lname) as staffname,
			e.division_head,
			e.section_head,
			s.description as section,
			s.code as section_code,
			d.div_code as division,
			p.description as position
			FROM chuddiadb.staff e
			INNER JOIN chuddiadb.sections s ON s.id = e.section_id
			INNER JOIN chuddiadb.divisions d on d.id = e.division_id
			INNER JOIN chuddiadb.positions p on p.id = e.position_id
			WHERE e.active = 1  AND e.section_id = '$section_id'";
		$result_staff = $this->db->query($commandText_staff);
		$query_result_staff = $result_staff->result();
		
		foreach($query_result_staff as $key => $value)
		{
			$staff_id = $value->id;
			$staffer = strtoupper( $value->staffname);
			$staff_position=  $value->position;
			$staff_section  =  $value->section;
			$staff_division  =  strtoupper($value->division);
			
			$is_division_head =  strtoupper($value->division_head);
			$is_section_head =  strtoupper($value->section_head);

			$sem_start = 'August 1, 2020'; //date of ipcr approval
			$sem_end = 'January 8, 2021';	//date of rating

			//get signatory data
			$cmdtxtSH = "SELECT CONCAT(e.fname, ' ', e.mname, ' ', e.lname) as sh, 
						p.description as sh_position
						FROM chuddiadb.staff e 
						INNER JOIN chuddiadb.positions p ON e.position_id = p.id
						WHERE active = 1
						AND section_head = 1  
						AND section_id = (SELECT section_id from chuddiadb.staff WHERE id = '$staff_id' and active = 1)";

			$cmdtxtDH = "SELECT CONCAT(e.fname, ' ', e.mname, ' ', e.lname) as dh,
						p.description as dh_position
						FROM chuddiadb.staff e 
						INNER JOIN chuddiadb.positions p ON e.position_id = p.id
						WHERE active = 1
						AND division_head = 1  
						AND division_id = (SELECT division_id from chuddiadb.staff WHERE id = '$staff_id' and active = 1)";
			$result = $this->db->query($cmdtxtSH);
			$val_row = $result->row(0);
			$val_sh = $val_row->sh;
			$val_sh_position = $val_row->sh_position;

			$result = $this->db->query($cmdtxtDH); 
			$val_row = $result->row(0);
			$val_dh = $val_row->dh;
			$val_dh_position = $val_row ->dh_position;

			$val_rater = null;
			$val_rater_position = null;

			if($is_section_head == 1)
			{
				//that means rater is division_head
				$val_rater = strtoupper($val_dh);
				$val_rater_position = $val_dh_position;
			}
			elseif($is_division_head == 1)
			{
				$val_rater = 'DEPARTMENT HEAD';
				$val_rater_position = 'DEPARTMENT HEAD';
			}
			else
			{
				$val_rater = strtoupper($val_sh);
				$val_rater_position =$val_sh_position;
			}

			$command_text = "SELECT a.*,
				(SELECT GROUP_CONCAT(CONCAT(logDate,': ', logActivity) SEPARATOR  '\r\n\r\n')  FROM staffmonitoring.dailylogs sq1 WHERE sq1.sectionactivityID = a.sectionactivityID AND sq1.staffID = b.staff_id) as daily_logs 
				FROM staffmonitoring.sectionactivity a
				INNER JOIN staffmonitoring.sectionactivityassignments b ON b.activity_id = a.sectionactivityID
				WHERE 
				a.deletedAt is NULL AND 
				a.createdAt >= '2021-01-01 00:00:00' AND
				b.staff_id = '$staff_id'
				#WHERE a.section_id = 4
				ORDER BY a.sectionactivityID ASC";
			$result = $this->db->query($command_text);
			$query_result = $result->result();
				
			$query_count2 = 0;
			$data = null;
			foreach($query_result as $key => $value)
			{
				$data['data'][] = array(
					'sectionactivityID'	=> $value->sectionactivityID,
					'activity'	=> $value->activity,
					'section_id'	=> $value->section_id,
					'activity_points'	=> $value->activityPoint,
					'daily_logs'	=> $value->daily_logs
				);
				$query_count2 += 1;
			}
			$data['totalCount'] = $query_count2;

			//build pdf
			$this->load->library('tcpdf');
			//$this->load->library('PHPExcel/PHPExcel/Shared/PDF/tcpdf');
			
			//$ph_legal = array(936, 612); //  or array($height, $width) 
			//$pdf = new TCPDF('p', 'pt', $ph_legal, true, 'UTF-8', false);
			$pdf = new TCPDF('p', 'pt', Array(936, 612), true, 'UTF-8', false);
			$fDate = date("Ymd_His"); 
			$filename = "IPCR-".$staff_id."-".$fDate.".pdf";

			$pdf->SetCreator(getenv('REPORT_CREATOR'));
			$pdf->SetAuthor(getenv('REPORT_AUTHOR'));
			$pdf->SetTitle('SectionActivitiesLog');
			$pdf->SetSubject('SectionActivitiesLog');
			$pdf->SetKeywords(getenv('REPORT_KEYWORDS'));
			
			//set margins
			$pdf->SetPrintHeader(false);
			$pdf->SetPrintFooter(false);

			$pdf->AddPage('L');
			//$pdf->AddPage();	
			$pdf->setPage(1, true);
			#$pdf->SetY(50);
			#$pdf->Cell(0, 0, 'A4 LANDSCAPE', 1, 1, 'C');
			#$pdf->Image('image/logo-chudd.png', 10, 8, 20, 20, 'PNG', null, '', true, 300, '', false, false, 0, false, false, false);

			$underscore = null;
			for ($x = 0; $x <= (strlen($staffer)+strlen($staffer)*0.33); $x++) {
				$underscore .= "_";
			}
			
			$html = '
				<body style="font: 11pt Arial">
				<table style="border-collapse: collapse; width:100%;font: 11pt Arial">
					<tr nobr="true" style="display: none;"> 
						<th style="width:12.5%"></th>
						<th style="width:21.875%"></th>
						<th style="width:40%"></th>
						<th style="width:3.19125%"></th>
						<th style="width:3.19125%"></th>
						<th style="width:3.19125%"></th>
						<th style="width:3.19125%"></th>
						<th style="width:12.5%"></th>
					</tr>
					<tr>
						<td colspan=8 style="border-left: 1px solid black; border-right: 1px solid black; border-top: 1px solid black">
							<center><b>INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)</b></center>
							<br><br>
							I, <b><u>'.$staffer.'</u></b>, <b><u>'.$staff_position.'</u></b>, '.getenv('DEPARTMENT_NAME_CAMEL_CASE').', commit to deliver and 
							agree to be rated on the attainment of the following targets in accordance with the indicated measures for the period July to December 2020.							
						</td>
					</tr>
					<tr nobr="true">
						<td style="border-left: 1px solid black;" ></td>
						<td></td>
						<td></td>
						<td colspan=5 style="border-right: 1px solid black;" >
							<center>_'.$underscore.'_
							<br>
							<b>'.$staffer.'</b>
							<br>
							Date: '.$sem_start.'
							</center>	
						
						</td>
					</tr>
					<tr nobr="true">
						<td style="border-left: 1px solid black;" >APPROVED BY:<br>Name:<br>Position:<br>Date:</td>
						<td colspan="2"><br><b>'.getenv('NAME_DH').'</b><br>Department Head<br>'.$sem_start.'</td>												
						<td align="center" colspan="4" style="border: 1px solid black; font-size: 11pt;"></td>
							<table style="border-collapse: collapse; width:100%;font: 11pt Arial">
								<tr align="center">5-Outstanding</tr>
								<tr align="center">4-Very Satisfactory</tr>
								<tr align="center">3-Satisfactory</tr>
								<tr align="center">2-Unsatisfactory</tr>
								<tr	align="center"> 1-Poor</tr>
								<tr><b><center>RATING</center></b></tr>
							</table>	
						</td>
						<td style="border-right: 1px solid black;" >
						
						</td>
					</tr>
					<tr nobr="true">
						<td style="border: 1px solid black;" align="center"><b>MFO/PAP</b></td>
						<td style="border: 1px solid black;" align="center"><b>SUCCESS INDICATOR (Targets+Measures)</b></td>
						<td style="border: 1px solid black;" align="center"><b>ACTUAL ACCOMPLISHMENTS</b></td>
						<td style="border: 1px solid black;" align="center"><b>Q</b></td>
						<td style="border: 1px solid black;" align="center"><b>E</b></td>
						<td style="border: 1px solid black;" align="center"><b>T</b></td>
						<td style="border: 1px solid black;" align="center"><b>Ave.</b></td>
						<td style="border: 1px solid black;" align="center"><b>RERMARKS</b></td>
					</tr>'
					;
			//<td style="writing-mode: vertical-rl ; text-orientation: upright;">Rating</td> doesn't woirk'
			$x=0;
			$loops= intval($data['totalCount']);
			//this condition is good for displaying all items
			for ($i = 0; $i<$loops ;$i++)
			{
					$cur_activity=$data['data'][$i]['activity'] ;					
					$cur_logs =$data['data'][$i]['daily_logs'] ;	
					$cur_logs2 = nl2br($cur_logs);#str_replace('@.@', nl2br(),$cur_logs);

					$html .= '<tr nobr="true" style="padding: 15px;">
								<td  style="border: 1px solid black;"></td>
								<td style="border: 1px solid black;">'.$cur_activity.'</td>
								<td style="border: 1px solid black;">'.$cur_logs2.'</td>
								<td style="border: 1px solid black;"></td>
								<td style="border: 1px solid black;"></td>
								<td style="border: 1px solid black;"></td>
								<td style="border: 1px solid black;"></td>
								<td style="border: 1px solid black;"></td>
							 </tr>';
			}

			$html .= '<tr>
						<td colspan="7" style="border: 1px solid black; text-align:right; border-collapse: collapse;">
							<b>Final Average Rating</b>
						</td>
						<td style="border: 1px solid black; text-align:right; border-collapse: collapse;">
							
						</td>
					</tr>
					<tr>
						<td colspan="7"  style="border: 1px solid black; text-align:right; border-collapse: collapse;">
							<b>Adjectival Rating</b>
						</td>
						<td style="border: 1px solid black; text-align:right;border-collapse: collapse;">
						</td>
					</tr>
					<tr>
						<td colspan="7"  style="border: 1px solid black;text-align:right;border-collapse: collapse;">
							<br>
						</td>
						<td style="border: 1px solid black; text-align:right;border-collapse: collapse;">
							<br>
						</td>
					</tr>
					</table>';

			$html .= '<br><br><table style="border: 1px solid black; width:100%;border-collapse: collapse;  font: 11pt Arial;" nobr="true">
				<tr nobr="true">
					<td style="border: 1px solid black;border-collapse: collapse;">Name and Signature of Ratee: <b>'.$staffer.'</b></td>
					<td style="border: 1px solid black;border-collapse: collapse;">Name and Signature of Rater: <b>'.$val_rater.'</b></td>
				</tr>
				<tr nobr="true">
					<td style="border: 1px solid black;border-collapse: collapse;">Position: '.$staff_position.'</td>
					<td style="border: 1px solid black;border-collapse: collapse;">Position: '.$val_rater_position.'</td>
				</tr>
				<tr nobr="true">
					<td style="border: 1px solid black;border-collapse: collapse;">Date:</td>
					<td style="border: 1px solid black;border-collapse: collapse;">Date:</td>
				</tr>
			</table>';


			$html .= '<br><br><table style="border: 1px solid black; width:50%;border-collapse: collapse;font: 11pt Arial;" nobr="true">
				<tr nobr="true">
					<td style="border: 1px solid black;" >Name and Signature of Rater: <b>'.getenv('NAME_DH_OTHER').'</b></td>					
				</tr>
				<tr nobr="true">
					<td style="border: 1px solid black;" >Position: '.getenv('DH_POSITION_DESCRIPTION').'</td>					
				</tr>
				<tr nobr="true">
					<td style="border: 1px solid black;">Date:</td>					
				</tr>
			</table>';


			$html .='<br><br>
				<table style="border: 1px solid black; border-collapse: collapse; width:50%; font: 11pt Arial;" nobr="true">
					<tr>
						<td style="border: 1px solid black;">Approved by: </td>					
					</tr>
					<tr>
						<td style="border: 1px solid black;"><br><br><b><center>'.getenv('NAME_BUDGET_OFFICER').'</center></b></td>					
					</tr>
					<tr>
						<td style="border: 1px solid black;"><center>City Mayor'."'".'s Authorized Representative/PMT Vice Chairman</center></td>					
					</tr>
				</table>
			';

			date_default_timezone_set('Asia/Manila');
			$this->load->library('session');
			//$html .= '<div style="font-size:11pt;"><br><br><br>Printed by:<br>'.$this->session->userdata('name').'<br>Date Printed: '.date('m/d/Y h:i:sa', time()).'</div>';
			//deprecate
			//$pdf->writeHTML($html, true, false, true, false, '');
			$path = "documents";
			#$pdf->Output("$path/$filename", 'F');
			$response['filenames'][] = array(
				'fileowner'=> $staffer,
				'filename'=> "$path/$filename",
				'filedata'=> $html
			);

		}
		$response['success'] = true;			
		die(json_encode($response));			
	}	

	public function upload_document()
	{
		try
		{
			$this->load->library('callable_functions');
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$activity_id 	= $this->input->post('activity_id');
			$year 		    = $this->input->post('year');
			$week_num 		= $this->input->post('week_num');
			
			$uploadedBy = $this->session->userdata('user_id');
			$filename =  $_FILES['form-file']['name'];
			$filesource = $_FILES['form-file']['tmp_name'];
			$description= strip_tags(trim($this->input->post('description'))) ;
			$createdAt = date('Y-m-d H:i:s');

			//$this->load->model('Access'); $this->Access->rights($this->modulename('link'), $type, null);
			$name= $filename;
			$source=$filesource;
			$path = getenv('DELIVERABLES_DIR');
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
				if (move_uploaded_file($source,$path.$name))
				{
					list($txt, $ext) = explode(".", $name);
					$this->load->model('adminservices_gantt_chart_attachments');
					$this->adminservices_gantt_chart_attachments->activity_id 		= $activity_id;
					$this->adminservices_gantt_chart_attachments->year 				= $year;
					$this->adminservices_gantt_chart_attachments->week_num			= $week_num;
					$this->adminservices_gantt_chart_attachments->uploadedBy		= $uploadedBy;
					$this->adminservices_gantt_chart_attachments->filename			= $txt;
					//$this->adminservices_gantt_chart_attachments->filepath			= $date('Y-m-d H:i:s');
					$this->adminservices_gantt_chart_attachments->description		= $description;
					$this->adminservices_gantt_chart_attachments->createdAt			= $createdAt;					
					$this->adminservices_gantt_chart_attachments->save(0);
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
			
			$arr['success'] = true;			 			
			$arr['data'] = "Successfully Uploaded";
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=>false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function toolAssignToTask(){
		try{
			$staff_id = $_GET["staff_id"];
			$activity_id = $_GET["activity_id"];
			$created_at = date('Y-m-d H:i:s');

			$command_text = "INSERT INTO staffmonitoring.sectionactivityassignments (activity_id, staff_id, createdAt)
							VALUES ('$activity_id', '$staff_id', '$created_at')";

			$result = $this->db->query($command_text);
			$arr['success'] = true;
			$arr['data'] = "Successfully assigned task";
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=>false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function toolRemoveFromTask(){
		try{
			$staff_id = $_GET["staff_id"];
			$activity_id = $_GET["activity_id"];
			$deleted_at = date('Y-m-d H:i:s');

			$command_text = "UPDATE  staffmonitoring.sectionactivityassignments SET deletedAt = '$deleted_At
							WHERE staff_id='$staff_id' AND activity_id='$activity_id'";

			$result = $this->db->query($command_text);
			$arr['success'] = true;
			$arr['data'] = "Successfully assigned task";
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=>false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function getPersonalLogs()
	{
		$staff_id =$_GET["staff_id"];// $this->input->post('staff_id');
		$month_num =$_GET["month_num"];// $this->input->post('month_num');
		$year_num = $_GET["year_num"];//$this->input->post('year_num');

		$default_date_start = $year_num.'-'.$month_num.'-01';
		$default_date_end = $year_num.'-'.($month_num+1).'-01';

		$command_text = "SELECT id, logDate, logLocation, logActivity FROM staffmonitoring.dailylogs
						WHERE logDate >= '$default_date_start' AND logDate < '$default_date_end' AND staffID = '$staff_id' AND deletedAt IS NULL ORDER BY logDate DESC" ;
		$result = $this->db->query($command_text);		
		$query_result = $result->result();
		$query_count = $result->num_rows();

		if ($query_count > 0){
			foreach($query_result as $key => $value)
			{
				$data['data'][] = array(
					'id'					=> $value->id,				
					'logDate'				=> $value->logDate,				
					'logLocation'			=> $value->logLocation,				
					'logActivity'			=> $value->logActivity,				
				);
			}
		}
		else{
			$data['data'][]=array();
		}
		$data['totalCount'] = $query_count;
		die(json_encode($data));
	}
}