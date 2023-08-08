<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');
class AdminServices_Monitorables_Evaluations extends CI_Controller{
	private function modulename($type)
	{		
		if($type == 'link')
					//'adminservices_monitorables_evaluations'
			return 'adminservices_monitorables_evaluations';
		else 
			return 'Monitorables Evaluations';
	} 

	public function index()
	{		
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}

	
	public function evaluations_list()
	{
		try
		{
			$query = "";
			if (isset($_GET['query'])){
				$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			}
			die(json_encode($this->generate_evaluations_list($query)));		
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function generate_evaluations_list($query)
	{
		try
		{
			$this->load->library('session');
			$division_id 		= $this->session->userdata('division_id');
			$section_id 		= $this->session->userdata('section_id');
			$is_department_head = $this->session->userdata('id');
			$is_division_head 	= $this->session->userdata('division_head');
			$is_div_admin_asst	= $section_id == 28 ? true : false; 	// if staff's section id is "Division Admin. Assistant"
			
			$filter = "1=1";
			// division/section filter
			//print_r ('test ' . $this->session->userdata('position_id') . ' test end');
			//if ($is_department_head == 3)
				//$filter = "1=1";
			//else if($is_division_head || $is_div_admin_asst)	// if div. head or div. admin. asst., view all division post activity reports
				//$filter = "a.division_id = $division_id";
			//else if((!$is_division_head || !is_div_admin_asst) && $section_id != '29') 	// if section members but not PDM section, view only section activity reports
				//$filter = "a.section_id = $section_id";
			//else 	// else PDM section, view all
				//$filter = "1=1";


			//print_r ('text asdjlajs '. $filter . 'the filter ends here');
			$id=(int)$this->input->post('id');
			$idQuery= ( $id ? "and a.id = ".$id : '');
			$where = "WHERE $filter $idQuery";
						
			if(isset($query)){
				$where = "WHERE
							(
								a.evaluation LIKE '%$query%'
								OR a.response LIKE '%$query%'								
								
							) AND 
							$filter $idQuery
							";
			}
			
			$commandText = "SELECT a.id,
								a.doc_id,
								a.doc_type,
								a.evaluated_by, 
								COALESCE(a.evaluation, '') As evaluation,
								DATE_FORMAT(a.evaluation_date,'%m/%d/%Y') AS evaluation_date,
								COALESCE(a.response, '') AS response,
								a.responded_by,
								COALESCE(DATE_FORMAT(a.response_date,'%m/%d/%Y'),'') AS response_date,
								a.status,
								b.division_id as document_division,
								b.section_id as document_section,
								c.id AS division_id,								
								c.div_code AS division_description,
								d.id AS section_id,
								d.description AS section_description,
								d.code as section_code,
								COALESCE(CONCAT(e.fname, ' ', e.mname, ' ', e.lname),'') AS evaluated_name, 
								COALESCE(CONCAT(f.fname, ' ', f.mname, ' ', f.lname),'') AS responded_name
							FROM adminservices_monitorables_evaluations a 
								LEFT JOIN adminservices_activity_report AS b ON b.id = a.doc_id	
								LEFT JOIN divisions c ON c.id = b.division_id
								LEFT JOIN sections d ON d.id = b.section_id
								LEFT JOIN staff e on e.id  = a.evaluated_by
								LEFT JOIN staff f on f.id  = a.responded_by
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
				$evaluator = $value->evaluated_name;
				$responder = $value->responded_name;
				$status = '';	
				if ($evaluator != null and $responder == null)
				{
					$status = 'FOR FEEDBACK';
				}
				elseif ($evaluator != null and $responder != null )
				{
					$status = 'FOR CLOSURE';
				}
				else
				{
					$status = 'ERROR';
				}
				$doc_type_id = '';
				$doc_type_id = $value->doc_type . ' #' . $value->doc_id;
				$data['data'][] = array(
					'id' 					=> $value->id,
					'doc_id' 				=> $value->doc_id,
					'doc_type' 				=> $value->doc_type,
					'evaluation' 			=> $value->evaluation,
					'evaluated_by' 			=> $value->evaluated_by,
					'evaluated_name'		=> $value->evaluated_name,
					'evaluation_date' 		=> $value->evaluation_date,
					'response' 				=> $value->response,
					'responded_by' 			=> $value->responded_by,
					'responded_name'		=> $value->responded_name,
					'response_date' 		=> $value->response_date,
					'document_division' 	=> $value->document_division,
					'document_section' 		=> $value->document_section,
					'division_id' 			=> $value->division_id,
					'division_description' 	=> $value->division_description,
					'section_id' 			=> $value->section_id,
					'section_description' 	=> $value->section_description,
					///some return information
					'doc_type_id'	=> $doc_type_id,
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
?>