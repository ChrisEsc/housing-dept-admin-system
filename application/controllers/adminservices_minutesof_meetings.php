<?php if ( ! defined('BASEPATH')) exit('N	o direct script access allowed');

class AdminServices_MinutesOf_Meetings extends CI_Controller {
	/**
	*/ 
	private function modulename($type)
	{		
		if($type == 'link')
			return 'adminservices_minutesof_meetings';
		else 
			return 'Minutes of Meetings Tracking';
	} 

	public function index()
	{		
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}

	public function createEval()
	{
		try
		{
			$this->load->library('session');
			$doc_id = $this->input->post('doc_id');
			$doc_type = $this->input->post('doc_type');
			$evaluated_by =   $this->session->userdata('user_id');
			$id = $evaluated_by;
			date_default_timezone_set('Asia/Manila');
			$evaluation_date = date('Y-m-d H:i:s'); 
			$evaluation = $this->input->post('evaluation');
			$section_id = $this->session->userdata('section_id');
			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'minutes_of_meeting', 'Evaluate MOM', $this->modulename('label'));
			$dumpData = array(
				'doc_id' =>  $doc_id,
				'doc_type' =>  $doc_type,
				'evaluated_by' => $evaluated_by,
				'evaluation_date' => $evaluation_date,
				'evaluation' => $evaluation
			);

			if ($section_id == 29 ){
				return $this->db->insert('adminservices_monitorables_evaluations', $dumpData);
			}
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
			
	}

	public function answerEval()
	{
		try
		{
			$this->load->library('session');
			$eval_id = $this->input->post('eval_id');	
			$feedback_by =   $this->session->userdata('user_id');
			date_default_timezone_set('Asia/Manila');
			$feedback_date = date('Y-m-d H:i:s'); 
			$feedback = $this->input->post('feedback');
			$id = $feedback_by;
			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'minutes_of_meeting', 'Answer MOM Evaluation', $this->modulename('label'));
			$dumpData = array(
				'responded_by' => $feedback_by,
				'response_date' => $feedback_date,
				'response' => $feedback
			);
			$this->db->where('id',$eval_id);
			$this->db->update('adminservices_monitorables_evaluations', $dumpData);
			$data = array("success"=>true, "data"=>$e->getMessage());
			//return $data;
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function ackMOM2()
	{
		$this->load->library('callable_functions');
		$this->load->library('session');
		$this->load->model('Access');
		$this->Access->rights($this->modulename('link'), null, null);

		$ack_by = $this->session->userdata('user_id');
		$ack_id = $this->input->post('ack_id');
		$ack_type = $this->input->post('ack_type');
		$ack_date = date('Y-m-d H:i:s'); 
		$doc_id = $this->input->post('doc_id');
		$id = $ack_by;

		if ($ack_by == $ack_id and $ack_type == 'review') {
			//this works
			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'minutes_of_meeting', 'Review MOM', $this->modulename('label'));
			$dumpData = array(
			'doc_id' => $doc_id,
			'doc_type' => 'MOM',
			'staff_id' => $ack_by,
			'date_acknowledged' => $ack_date);
			$this->db->insert('adminservices_monitorables_acknowledgements', $dumpData);
			$data = array("success"=>true, "data"=>$e->getMessage());
		}
		elseif ($ack_by == $ack_id and $ack_type == 'approve')
		{
			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'minutes_of_meeting', 'Approve MOM', $this->modulename('label'));
			$dumpData = array(
			'approved_by' => $ack_by,
			'approved_date' => $ack_date);
			$this->db->where('id',$doc_id);
			$this->db->update('adminservices_minutes_header', $dumpData);
			$data = array("success"=>true, "data"=>$e->getMessage());
		}
		else
		{
			$data = array("success"=>false, "data"=>$e->getMessage());
		}
	}

	public function ackMOM()
	{
		try
		{
			$this->load->library('callable_functions');
			$this->load->library('session');
			$this->load->model('Access');
			$this->Access->rights($this->modulename('link'), null, null);

			$ack_by = $this->session->userdata('user_id');
			$ack_id = $this->input->post('ack_id');
			$ack_type = $this->input->post('ack_type');
			$ack_date = date('Y-m-d H:i:s'); 
			$doc_id = $this->input->post('doc_id');
			$id = $ack_by;

			if ($ack_by == $ack_id and $ack_type == 'review'){
				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'minutes_of_meeting', 'Review MOM', $this->modulename('label'));
				$dumpData = array(
				'reviewed_by' => $ack_by,
				'reviewed_date' => $ack_date);
				$this->db->where('id',$doc_id);
				$this->db->update('adminservices_minutes_header', $dumpData);
				$data = array("success"=>true, "data"=>$e->getMessage());
			}
			elseif ($ack_by == $ack_id and $ack_type == 'approve')
			{
				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'minutes_of_meeting', 'Approve MOM', $this->modulename('label'));
				$dumpData = array(
				'approved_by' => $ack_by,
				'approved_date' => $ack_date);
				$this->db->where('id',$doc_id);
				$this->db->update('adminservices_minutes_header', $dumpData);
				$data = array("success"=>true, "data"=>$e->getMessage());

			}
			else
			{
				$data = array("success"=>false, "data"=>$e->getMessage());
			}

		}
		catch (Exception $e)
		{
			$data = array("success"=>false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function createMOM()
	{
		try
		{
			$this->load->library('callable_functions');
			$this->load->library('session');
			$this->load->model('Access');
			$this->Access->rights($this->modulename('link'), null, null);

			date_default_timezone_set('Asia/Manila');
			$prepared_date = date('Y-m-d H:i:s');
			$reviewed_date = '';
			$prepared_by = $this->session->userdata('user_id');
			$reviewed_by = null;
			$division_id = $this->session->userdata('division_id');
			$section_id = $this->session->userdata('section_id');
			$is_section_head = $this->session->userdata('section_head');
			$id = $prepared_by;

			$meeting_name = $this->input->post('meeting_date');
			$meeting_type = $this->input->post('meeting_type');
			$meeting_section = $this->input->post('meeting_section');
			$time_started = $this->input->post('time_started');
			$time_ended = $this->input->post('time_ended');

			$venue = $this->input->post('venue');
			$documentation = $this->input->post('documentation');
			$raw_documentation =  $this->input->post('documentation');
			

			//date processing
			$meeting_date = $this->input->post('meeting_date');
			$datetime_started = $meeting_date . ' ' . $time_started;
			$datetime_ended = $meeting_date . ' ' . $time_ended;

			$datetime_started = date('Y-m-d H:i:s', strtotime($datetime_started));
			$datetime_ended = date('Y-m-d H:i:s', strtotime($datetime_ended));

			$attendees =  $this->input->post('attendees');
			$agenda = $this->input->post('agenda');
			$discussion =  $this->input->post('discussion');
			
			$ext2 = pathinfo($documentation, PATHINFO_EXTENSION);
			$newfilename2 =  "MOM" . date("YmdHis") . "." . $ext2;
			$documentation = $newfilename2;
			$target_dir = "documents/Minutes of Meetings/";
			$target_file = $target_dir . $newfilename2;

			$upsucc = false;
			if (move_uploaded_file($_FILES['form-file']["tmp_name"], $target_file)) 
			{
				$upsucc =  true;
			} 
			else 
			{
				$upsucc =  false;
			}

			if ($raw_documentation ==''){
				$documentation = '';
			}

			if ($raw_documentation == '' or $upsucc == true)
			{
				if ($is_section_head == 1)
				{
					$reviewed_by = $prepared_by;
					$reviewed_date = $prepared_date;
				}

				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'minutes_of_meeting', 'Create MOM', $this->modulename('label'));
				$dumpData = array
				(
					'division_id' =>  $division_id,
					//'section_id' =>  $section_id,
					'section_id' => $meeting_section,
					'prepared_by' => $prepared_by,
					'present_ids' => $attendees,
					'prepared_date' => $prepared_date,
					'reviewed_date' => $reviewed_date,
					'meeting_type' => $meeting_type,
					'meeting_datetime_start' => $datetime_started,
					'reviewed_by' => $reviewed_by, 
					'meeting_datetime_end' => $datetime_ended,
					'venue' => $venue,
					'agenda' => $agenda,
					'discussion' => $discussion,
					'documentation' => $documentation,
				);
				$this->db->insert('adminservices_minutes_header', $dumpData);
				$arr['success'] = true;
				$arr['data'] = "Successfully uploaded Post-Activity Report";
				die(json_encode($arr));
				return true;
			}
			else 
			{
				$arr['success'] = false;
				$arr['data'] = "Unable to upload Post-Activity Report";
				die(json_encode($arr));
				return true;
			}

			//return $this->db->insert('adminservices_minutes_header', $dumpData);
		}
		catch (Exception $e)
		{
			//print_r ("Hi!");
			$data = array("success"=>false, "data"=>$e->getMessage());
			die(json_encode($data));
			return true;
		}
	}




	public function deleteMOM()
	{
		try
		{

			$this->load->library('session');
			$doc_id = $this->input->post('doc_id');
			$doc_attachment = $this->input->post('documentation');
			$target_dir = "documents/Minutes of Meetings/";
			$target_file = $target_dir . $doc_attachment;
			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'minutes_of_meeting', 'Delete MOM', $this->modulename('label'));
			unlink( $target_file );
			$this->db->where('id', $doc_id);
			return $this->db->delete('adminservices_minutes_header');
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function minutesof_meetingslist()
	{
		try
		{
			$query = "";
			if (isset($_GET['query'])){
				$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			}
			die(json_encode($this->generateminutesof_meetingslist($query)));		
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generateminutesof_meetingslist($query)
	{
		try
		{
			$this->load->library('session');
			$division_id 		= $this->session->userdata('division_id');
			$section_id 		= $this->session->userdata('section_id');
			$is_section_head = $this->session->userdata('section_head');
			$is_department_head = $this->session->userdata('id');
			$is_division_head 	= $this->session->userdata('division_head');
			$is_div_admin_asst	= $section_id == 28 ? true : false; 	// if staff's section id is "Division Admin. Assistant"
			
			$user_id =$this->session->userdata('id');

			$filter = "1=1";
			// division/section filter
			if ($is_department_head == 3)
				$filter = "1=1";
			else if ($user_id == 11 )
				$filter = "1=1";
			else if($is_division_head || $is_div_admin_asst)	// if div. head or div. admin. asst., view all division post activity reports
				$filter = "a.division_id = $division_id";
			
			else if($is_section_head && $section_id !='29')
				$filter = "(a.section_id = $section_id OR a.section_id = '28') AND (a.meeting_type = 'Section Meeting' OR a.meeting_type = 'Division Meeting' OR a.meeting_type = 'Division ManCom Meeting') AND a.division_id = $division_id";
			
			else if((!$is_division_head || !is_div_admin_asst) && $section_id != '29') 	// if section members but not PDM section, view only section activity reports
				$filter = "(a.section_id = $section_id) AND (a.meeting_type = 'Section Meeting' OR a.meeting_type = 'Division Meeting' OR a.meeting_type = 'Division ManCom Meeting')";
			else 
				$filter = "1=1";

			$id=(int)$this->input->post('id');
			$idQuery= ( $id ? "and a.id = ".$id : '');
			$where = "WHERE $filter $idQuery";
						
			if(isset($query)){
				$where = "WHERE
							(
								a.meeting_type LIKE '%$query%'
								OR a.venue LIKE '%$query%'
								OR a.agenda LIKE '%$query%'
								OR a.discussion LIKE '%$query%'
							) AND 
							$filter $idQuery
							";
			}

			$commandText = "SELECT a.id,
								b.id AS division_id,
								c.id AS section_id,
								b.div_code AS division_description,
								c.description AS section_description,
								c.code as section_code,
								a.meeting_type,
								a.meeting_datetime_start,
								a.meeting_datetime_end,
								a.venue,
								a.agenda,
								a.discussion,
								a.documentation,
								a.prepared_by,
								DATE_FORMAT(a.prepared_date,'%m/%d/%Y') AS prepared_date,
								COALESCE(CONCAT(d.fname, ' ', d.mname, ' ', d.lname),'') AS prepared_name,
								COALESCE(CONCAT(e.fname, ' ', e.mname, ' ', e.lname),'') AS reviewed_name,
								COALESCE(CONCAT(f.fname, ' ', f.mname, ' ', f.lname),'') AS approved_name

							FROM adminservices_minutes_header a 
								LEFT JOIN divisions b ON b.id = a.division_id
								LEFT JOIN sections c ON c.id = a.section_id
								LEFT JOIN staff d on d.id  = a.prepared_by
								LEFT JOIN staff e on e.id  = a.reviewed_by
								LEFT JOIN staff f on f.id  = a.approved_by
								
							$where
							ORDER BY a.id DESC";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$commandText = "SELECT count(*) AS count
							FROM adminservices_minutes_header a
							WHERE 1=1";
			$result = $this->db->query($commandText);
			$query_count = $result->result();

			foreach($query_result as $key => $value)
			{
				//for file 
				$commandText = "SELECT a.id,
								a.staff_id,
								COALESCE(CONCAT(b.fname, ' ', b.mname, ' ', b.lname),'') AS ack_name
								FROM adminservices_monitorables_acknowledgements a 
								LEFT JOIN staff b on b.id  = a.staff_id
								WHERE doc_type = 'MOM' and doc_id = $value->id";
				$result = $this->db->query($commandText);
				$ack_result = $result->result();

				if(count($ack_result) == 0) 
					$ack_list = 'NO ACKNOWLEDGEMENTS AVAILABLE';
				$i = 0;
				$ack_list = null;
				$ack_data = null;
				$ack_count = count($ack_result);
				$ack_list = $ack_result;
				$ack_names = null;

				foreach($ack_result as $key => $val)
				{
					$ack_names = $ack_names.$val->ack_name.'<br>';
				}

				//for file evaluations
				$commandText = "SELECT a.id,
								a.doc_id,
								a.evaluated_by,
								DATE_FORMAT(a.evaluation_date,'%m/%d/%Y') AS evaluation_date,
								COALESCE(a.evaluation,'') as evaluation,
								COALESCE(a.responded_by,'') as responded_by,
								COALESCE(DATE_FORMAT(a.response_date,'%m/%d/%Y'),'') AS response_date,
								COALESCE(a.response,'') as response,
								COALESCE(a.status,'') as status,
								COALESCE(CONCAT(b.fname, ' ', b.mname, ' ', b.lname),'') AS evaluated_name,
								COALESCE(CONCAT(c.fname, ' ', c.mname, ' ', c.lname),'') AS responded_name
				FROM adminservices_monitorables_evaluations a 
				LEFT JOIN staff b on b.id  = a.evaluated_by
				LEFT JOIN staff c on c.id  = a.responded_by
				WHERE doc_id = $value->id and doc_type = 'MOM'
				ORDER BY a.id DESC";
				$result = $this->db->query($commandText);
				$eval_result = $result->result();

				if(count($eval_result) == 0) 
					$evaluations_list = 'NO EVALUATIONS AVAILABLE';
				
				$i = 0;
				$evaluations_list = null;
				$eval_data = null;
				$eval_count = count($eval_result);

				//foreach($eval_result as $key => $val)
				//{
				//	$eval_data['data'][] = array(
				//		'eval_id'=> $val->id,
				//		'eval_date'=> $val->evaluation_date,
				//		'eval_who'=> $val->evaluated_name,
				//		'eval_text'=> $val->evaluation,
				//		'res_by'=> $val->responded_by,
				//		'res_date'=> $val->response_date,
				//		'res_test '=> $val->response
				//	);

				//}
				//$attachment_links .= '<ul>';
				//$evaluations_list = '<table width="100%" style="background: #ffffff; border: solid 1px white;">' . $evaluations_list . '</tables>';

				//lol this actually works
				$evaluations_list = $eval_result;

				//$evaluations_list = $eval_data;
				$prepper = $value->prepared_name;
				$reviewer = $value->reviewed_name;
				$approver = $value->approved_name;
				$meeting_type = $value->meeting_type;
				$status = '';	

				if ($meeting_type == 'Section Meeting')
				{
					if ($prepper != null and $reviewer == null and $approver == null){
						$status = 'FOR REVIEW';
					}
					elseif ($prepper != null and $reviewer != null and $approver == null){
						$status = 'FOR APPROVAL';
					}
					elseif ($prepper != null and $reviewer != null and $approver != null and $eval_count == 0){
						$status = 'APPROVED PENDING EVALUATION';
					}
					elseif ($prepper != null and $reviewer != null and $approver != null and $eval_count > 0){
						$status = 'APPROVED AND EVALUATED';
					}
					else{
						$status = 'BYPASS';
					}
				}
				else 
				{
					if($ack_count == 0){
						$status = 'FOR REVIEW';
					}
					elseif (($ack_count < 3) and $approver == null and $eval_count == 0){
						$status = 'FOR CONCURRENCE';
					}
					
					elseif (($ack_count >= 3) and $approver == null and $eval_count == 0){
						$status = 'FOR APPROVAL';
					}

					elseif (($ack_count >= 3) and $approver != null and $eval_count == 0){
						$status = 'FOR EVALUATION';
					}
					elseif (($ack_count >= 3) and $approver != null and $eval_count > 0){
						$status = 'APPROVED';
					}
					//retain for old files
					elseif ($prepper != null and $reviewer != null and $approver == null){
						$status = 'FOR APPROVAL';
					}
					elseif ($prepper != null and $reviewer != null and $approver != null and $eval_count == 0){
						$status = 'APPROVED PENDING EVALUATION';
					}
					elseif ($prepper != null and $reviewer != null and $approver != null and $eval_count > 0){
						$status = 'APPROVED AND EVALUATED';
					}
					//something else
					else
					{
						$status= 'BYPASS';
					}
					//change value of reviewer to ack_names
					$reviewer = $ack_names;
				}

				$meeting_datetime = date('j M Y g:iA', strtotime($value->meeting_datetime_start)) . " to " . date('g:iA',strtotime($value->meeting_datetime_end));
				$data['data'][] = array(
					'id' 					=> $value->id,
					'division_id'			=> $value->division_id,
					'section_id'			=> $value->section_id,
					'division_description' 	=> $value->division_description,
					'section_description' 	=> $value->section_code,
					'meeting_type'			=> $value->meeting_type,
					'meeting_datetime'		=> $meeting_datetime,
					'venue'					=> $value->venue,
					'agenda'				=> $value->agenda,
					'discussion'			=> $value->discussion,
					'prepared_date'			=> $value->prepared_date,
					'prepared_by'			=> $value->prepared_by,
					'prepared_name'			=> $value->prepared_name,
					'reviewed_name'			=> $reviewer,
					'approved_name'			=> $value->approved_name,
					'documentation'			=> $value->documentation,
					'evaluations_list'		=> $evaluations_list,
					'acknowledgements_list'	=> $ack_list,
					///additional return_information
					'viewer_id' => $this->session->userdata('user_id'),
					'viewer_name' =>  $this->session->userdata('name'),
					'viewer_section_id' =>   $this->session->userdata('section_id'),
					'viewer_division_id' =>   $this->session->userdata('division_id'),
					'is_section_head' => $this->session->userdata('section_head'),
					'is_division_head' => $this->session->userdata('division_head'),
					'status' => $status
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
}