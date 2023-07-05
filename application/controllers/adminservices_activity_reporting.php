<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class AdminServices_Activity_Reporting extends CI_Controller {
	/**
	*/ 
	private function modulename($type)
	{		
		if($type == 'link')
			return 'adminservices_activity_reporting';
		else 
			return 'Post Activity Reporting';
	} 
	public function index()
	{		
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
		//$status = isset($_GET['status']) ? $_GET['status'] : 0;
		//$this->session->set_userdata('par_status', $status);
		//$this->load->model('Page');		
        //$this->Page->set_page($this->modulename('link'));
	}
	public function createPAR()
	{
		try
		{
			$this->load->library('callable_functions');
			$this->load->library('session');
			$this->load->model('Access');
			$this->Access->rights($this->modulename('link'), null, null);
			
			date_default_timezone_set('Asia/Manila');
			$submit_date = date('Y-m-d H:i:s'); //$this->session->userdata('evaluation_date');
			$documented_by = $this->session->userdata('user_id');
			$division_id = $this->session->userdata('division_id');
			$section_id = $this->session->userdata('section_id');
			$is_section_head = $this->session->userdata('section_head');
			$id= $documented_by;
			//this is actually acitivty date
			//'documented_date'		=> date('j M Y', strtotime($value->documented_date)),
			$documented_date = $this->input->post('documented_date');
			$documented_date = date('Y-m-d H:i:s', strtotime($documented_date));
			$reviewed_date = $this->input->post('reviewed_date');
			//$approved_date = $this->input->post('approved_date');
			$venue = $this->input->post('venue');
			$activity = $this->input->post('activity');
			//$activity_date = $this->input->post('activity_date');
			$other_participants = $this->input->post('other_participants');
			$purpose = $this->input->post('purpose');
			$expected_output = $this->input->post('expected_output');
			$accomplishments = $this->input->post('accomplishments');
			$remarks = $this->input->post('remarks');
			//dummy
			$documentation = $this->input->post('documentation');
			$section_activity_id = $this->input->post('section_activity_id');
			//$documentation = $_FILES['form-file']['name'];
			$chudd_participants = $this->input->post('chudd_participants');
			//print_r  ($_POST);
			//print_r ("this shit is going through");
			//print_r ($_FILES);


			//$documentation = $_FILES['form-file']['tmp_name'];
			
			
			$ext2 = pathinfo($documentation, PATHINFO_EXTENSION);
			$newfilename2 =  "PAR" . date("YmdHis") . "." . $ext2;
			$documentation = $newfilename2;

			//extension now working

			//dangerous level
			$target_dir = getenv('PAR_TARGET_DIR');
			//$target_file = $target_dir . basename($_FILES['form-file']['name']);
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
	

			
			//$docUpload($documentation);
			if ($upsucc == true)
			{
				if ($is_section_head == 1)
				{
					$reviewed_by = $documented_by;
					$reviewed_date = $submit_date;
				}
				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'post_activity_report', 'Submit PAR', $this->modulename('label'));
				$dumpData = array(
									'division_id' => $division_id,
									'section_id' => $section_id,
									'documented_by' => $documented_by,
									'reviewed_by' => $documented_by,
									//this is actually acitivty date
									'documented_date' => $documented_date,
									'venue' => $venue,
									'activity' => $activity,
									'participants' => $other_participants,
									'purpose' => $purpose,
									'expected_output' => $expected_output,
									'accomplishments' => $accomplishments,
									'remarks' => $remarks,
									'documentation' => $documentation,
									'submit_date' => $submit_date,
									'reviewed_date' => $reviewed_date,
									'chudd_participants' => $chudd_participants,
									'section_activity_id' => $section_activity_id
								);
				$this->db->insert('adminservices_activity_report', $dumpData);
				$arr['success'] = true;
				$arr['data'] = "Successfully uploaded Post-Activity Report";
				die(json_encode($arr));
			}
			else
			{
				$arr['success'] = false;
				$arr['data'] = "Unable to upload Post-Activity Report";
				die(json_encode($arr));
			}
		
		}
		catch (Exception $e)
		{
			//print_r ("Hi!");
			$data = array("success"=>false, "data"=>"Something went wrong. ");
			die(json_encode($data));
		}
	}


	public function createEval()
	{
		try
		{
		
			$this->load->library('session');
			$doc_id = $this->input->post('doc_id');
			$doc_type = $this->input->post('doc_type');
			$evaluated_by =   $this->session->userdata('user_id');
			$evaluated_section_id 		= $this->session->userdata('section_id');
			$id= $evaluated_by;
			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'post_activity_report', 'Evaluate PAR', $this->modulename('label'));
			date_default_timezone_set('Asia/Manila');
			$evaluation_date = date('Y-m-d H:i:s');
			$evaluation = $this->input->post('evaluation');
			$dumpData = array(
				'doc_id' =>  $doc_id,
				'doc_type' =>  $doc_type,
				'evaluated_by' => $evaluated_by,
				'evaluation_date' => $evaluation_date,
				'evaluation' => $evaluation
			);
			return $this->db->insert('adminservices_monitorables_evaluations', $dumpData);
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
			
	}


	public function deletePAR()
	{
		try
		{

			
			$this->load->library('session');
			$doc_id = $this->input->post('doc_id');
			$doc_attachment = $this->input->post('documentation');
			$id = $this->session->userdata('user_id');
			$target_dir = "documents/Post activity Reports/";
			$target_file = $target_dir . $doc_attachment;
			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'post_activity_report', 'Delete PAR', $this->modulename('label'));
			unlink( $target_file );
			$this->db->where('id', $doc_id);
			return $this->db->delete('adminservices_activity_report');
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}

	}

	public function section_activity_list()
	{
		try
		{
			$query = "";
			if (isset($_GET['query'])){
				$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			}
			die(json_encode($this->generate_section_activity_list()));
			//die(json_encode($this->generateactivity_reportslist($_GET['record_type_filter'], $_GET['priority'], $_GET['division_filter'], $query, $_GET['status'], 'Grid')));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}


	public function generate_section_activity_list()
	{
		try{
			$this->load->library('session');
			$division_id 		= $this->session->userdata('division_id');
			$section_id 		= $this->session->userdata('section_id');
			
			$db2 = $this->load->database('staffmonitoring', TRUE); // the TRUE paramater tells CI that you'd like to return the database object.
			//$query = $otherdb->select('first_name, last_name')->get('person');
			//var_dump($query);


			$commandText = "SELECT a.sectionactivityID,
									a.activity,
									a.section_id
							FROM sectionactivity a 
							WHERE a.section_id = '$section_id'
							ORDER BY a.sectionactivityID ASC
							";

			$result = $db2->query($commandText);
			$query_result = $result->result();

			$commandText = "SELECT count(*) AS count
							FROM sectionactivity a
							WHERE a.section_id = '$section_id'
							";
			//WHERE 1=1
			$result = $db2->query($commandText);
			$query_count = $result->result();


			foreach($query_result as $key => $value)
			{

				$data['data'][] = array(
					'id'	=> $value->sectionactivityID,
					'activity'	=> $value->activity
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



	public function activity_reportslist()
	{
		try
		{
			$query = "";
			if (isset($_GET['query'])){
				$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			}


			die(json_encode($this->generateactivity_reportslist($query)));
			//die(json_encode($this->generateactivity_reportslist($_GET['record_type_filter'], $_GET['priority'], $_GET['division_filter'], $query, $_GET['status'], 'Grid')));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}





	public function generateactivity_reportslist($query)
	{
		try
		{
			$this->load->library('session');
			// $id=$this->input->get('id');
			$division_id 		= $this->session->userdata('division_id');
			$section_id 		= $this->session->userdata('section_id');
			$is_division_head 	= $this->session->userdata('division_head');
			$is_div_admin_asst	= $section_id == 28 ? true : false; 	// if staff's section id is "Division Admin. Assistant"
			
			$filter = "";
			// division/section filter
			if($is_division_head || $is_div_admin_asst)	// if div. head or div. admin. asst., view all division post activity reports
				$filter = "a.division_id = $division_id";
			else if((!$is_division_head || !is_div_admin_asst) && $section_id != 29) 	// if section members but not PDM section, view only section activity reports
				$filter = "a.section_id = $section_id";
			else 	// else PDM section, view all
				$filter = "1=1";

			$id=(int)$this->input->post('id');
			$idQuery= ( $id ? "and a.id = ".$id : '');
			$where = "WHERE $filter $idQuery";

			if(isset($query)){
				$where = "WHERE
							(
								b.description LIKE '%$query%'
								OR a.activity LIKE '%$query%'
								OR a.venue LIKE '%$query%'
								OR a.participants LIKE '%$query%'
								OR a.purpose LIKE '%$query%'
								OR a.expected_output LIKE '%$query%'
								OR a.accomplishments LIKE '%$query%'
								OR a.remarks LIKE '%$query%'
								OR a.chudd_participants LIKE '%$query%'
							)
							AND 
							$filter $idQuery
							";
			}


			$commandText = "SELECT a.id,
								b.id AS division_id,
								c.id AS section_id,
								DATE_FORMAT(a.documented_date,'%m/%d/%Y') as prepared_date,
								a.activity,
								b.div_code AS division_description,
								c.description AS section_description,
								a.venue,
								a.participants,
								a.purpose, 
								a.expected_output AS target_output,
								a.accomplishments,
								a.remarks,
								a.documentation,
								a.documented_by as prepared_by,
								DATE_FORMAT(a.submit_date,'%m/%d/%Y') as submit_date,
								a.chudd_participants,
								COALESCE(CONCAT(d.fname, ' ', d.mname, ' ', d.lname),'') AS prepared_name,
								COALESCE(CONCAT(e.fname, ' ', e.mname, ' ', e.lname),'') AS reviewed_name,
								COALESCE(CONCAT(f.fname, ' ', f.mname, ' ', f.lname),'') AS approved_name
							FROM adminservices_activity_report a
								LEFT JOIN divisions b ON b.id = a.division_id
								LEFT JOIN sections c ON c.id = a.section_id
								LEFT JOIN staff d on d.id  = a.documented_by
								LEFT JOIN staff e on e.id  = a.reviewed_by
								LEFT JOIN staff f on f.id  = a.approved_by
							$where
							ORDER BY a.id DESC
							";
			//WHERE 1=1
			$result = $this->db->query($commandText);
			$query_result = $result->result();
			// //echo $this->db->last_query();

			$commandText = "SELECT count(*) AS count
							FROM adminservices_activity_report a
							WHERE
							$filter";
			//WHERE 1=1
			$result = $this->db->query($commandText);
			$query_count = $result->result();

			foreach($query_result as $key => $value)
			{

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
				
				WHERE doc_id = $value->id AND doc_type = 'PAR'
				ORDER BY a.id DESC"
				;
				$result = $this->db->query($commandText);
				$eval_result = $result->result();

				if(count($eval_result) == 0) 
					$evaluations_list = 'NO EVALUATIONS AVAILABLE';

				
				$i = 0;
				$evaluations_list = null;
				$eval_data = null;
				$eval_count = count($eval_result);

				foreach($eval_result as $key => $val)
				{
					$eval_data['data'][] = array(
						'eval_id'=> $val->id,
						'eval_date'=> $val->evaluation_date,
						'eval_who'=> $val->evaluated_name,
						'eval_text'=> $val->evaluation,
						'res_by'=> $val->responded_by,
						'res_date'=> $val->response_date,
						'res_test '=> $val->response
					);

				}
				//lol this actually works
				$evaluations_list = $eval_result;
				//$evaluations_list = $eval_data;

				$prepper = $value->prepared_name;
				$reviewer = $value->reviewed_name;
				$approver = $value->approved_name;
				$status = '';	

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

				$data['data'][] = array(
					'id'					=> $value->id,
					'division_id'			=> $value->division_id,
					'section_id'			=> $value->section_id,
					'documented_date'		=> date('j M Y', strtotime($value->prepared_date)),
					'activity'				=> $value->activity,
					//'activity_date'			=> date('j M Y', strtotime($value->activity_date)),
					'division_description' 	=> $value->division_description,
					'section_description' 	=> $value->section_description,
					'venue' 				=> $value->venue,
					'participants'			=> $value->participants,
					'purpose'				=> $value->purpose,
					'target_output'			=> $value->target_output,
					'accomplishments'		=> $value->accomplishments,
					'remarks'				=> $value->remarks,
					'documentation'			=> $value->documentation,
					'submit_date'			=> $value->submit_date,
					'chudd_participants'	=> $value->chudd_participants,
					///more return information					
					'prepared_date'			=> $value->prepared_date,
					'prepared_by'			=> $value-> prepared_by,
					'prepared_name'			=> $value-> prepared_name,
					'reviewed_name'			=> $value-> reviewed_name,
					'approved_name'			=> $value->	approved_name,
					'documentation'			=> $value->documentation,
					'evaluations_list'		=> $evaluations_list,
					///additional return information
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


	
	public function answerEval()
	{
		try
		{
			$this->load->library('session');
			$eval_id = $this->input->post('eval_id');	
			$feedback_by =   $this->session->userdata('user_id');
			date_default_timezone_set('Asia/Manila');
			$id = $this->session->userdata('user_id');
			$this->load->model('Logs'); $this->Logs->audit_logs($id, 'post_activity_report', 'Answer PAR Evaluation', $this->modulename('label'));
			$feedback_date = date('Y-m-d H:i:s'); 
			$feedback = $this->input->post('feedback');
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


	public function ackPAR()
	{
		try
		{
			
			$this->load->library('callable_functions');
			$this->load->library('session');
			$this->load->model('Access');
			$this->Access->rights($this->modulename('link'), null, null);
			$id = $this->session->userdata('user_id');
			$ack_by = $this->session->userdata('user_id');
			$ack_id = $this->input->post('ack_id');
			$ack_type = $this->input->post('ack_type');
			$ack_date = date('Y-m-d H:i:s'); 
			$doc_id = $this->input->post('doc_id');

			if ($ack_by == $ack_id and $ack_type == 'review'){
				//this works
				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'post_activity_report', 'Review PAR', $this->modulename('label'));
				$dumpData = array(
				'reviewed_by' => $ack_by,
				'reviewed_date' => $ack_date);
				$this->db->where('id',$doc_id);
				$this->db->update('adminservices_activity_report', $dumpData);
				$data = array("success"=>true, "data"=>$e->getMessage());
			}elseif ($ack_by == $ack_id and $ack_type == 'approve')
			{
				$this->load->model('Logs'); $this->Logs->audit_logs($id, 'post_activity_report', 'Approve PAR', $this->modulename('label'));
				$dumpData = array(
				'approved_by' => $ack_by,
				'approved_date' => $ack_date);
				//'reviewed_by' => $ack_by);
				//'reviewed_date' => $ack_date);
				$this->db->where('id',$doc_id);
				$this->db->update('adminservices_activity_report', $dumpData);
				$data = array("success"=>true, "data"=>$e->getMessage());

			}else{
				$data = array("success"=>false, "data"=>$e->getMessage());
			}
			//end of function
			//
		}
		catch (Exception $e)
		{
			$data = array("success"=>false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}
}
