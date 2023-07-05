<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class AdminServices_WeeklyDeliverables_Monitoring extends CI_Controller {
	/**
	*/ 
	private function modulename($type)
	{		
		if($type == 'link')
			return 'adminservices_weeklydeliverables_monitoring';
		else 
			return 'Weekly Accomplishments Monitoring';
	} 

	public function index()
	{		
		$this->load->model('Page');		
        $this->Page->set_page($this->modulename('link'));
	}

	public function weeklydeliverables_monitoring_list()
	{
		try
		{
			die(json_encode($this->genereteweeklydeliverables_monitoring_list()));
		}
		catch (Exception $e)
		{
			print $e->getMessage();
			die();
		}
	}

	public function genereteweeklydeliverables_monitoring_list()
	{
		try
		{
			$this->load->library('session');

			$division_id 		= $this->session->userdata('division_id');
			$section_id 		= $this->session->userdata('section_id');
			$is_division_head 	= $this->session->userdata('division_head');
			$is_div_admin_asst	= $section_id == 28 ? true : false; 	// if staff's section id is "Division Admin. Assistant"

			// division/section filter
			if($is_division_head || $is_div_admin_asst)	// if div. head or div. admin. asst.
				$filter = "AND c.division_id = $division_id";
			else if((!$is_division_head || !is_div_admin_asst) && $section_id != 29) 	// if section members but not PDM section
				$filter = "AND b.section_id = $section_id";
			else 	// else, PDM section
				$filter = "";

			$commandText = "SELECT a.id,
								b.id AS ppa_id,
							    b.ppa,
							    b.success_indicator AS si,
							    b.persons_incharge_ids,
							    a.deliverables,
							    a.deadline
							FROM adminservices_weeklydeliverables_monitoring_header a
								LEFT JOIN adminservices_opcr_details b ON b.id = a.opcr_details_id
								LEFT JOIN adminservices_opcr_header c ON c.id = b.opcr_header_id
							WHERE c.year = YEAR(CURDATE())
								$filter";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			$commandText = "SELECT count(*) AS count
							FROM adminservices_weeklydeliverables_monitoring_header a
								LEFT JOIN adminservices_opcr_details b ON b.id = a.opcr_details_id
								LEFT JOIN adminservices_opcr_header c ON c.id = b.opcr_header_id
							WHERE c.year = YEAR(CURDATE())
								$filter";
			$result = $this->db->query($commandText);
			$query_count = $result->result();

			$i=0;
			foreach($query_result as $key => $value)
			{
				// retrieve names of persons in-charge
				$persons_incharge_ids = explode(",",$value->persons_incharge_ids);
				$persons_incharge = "";
				$j=0;
				foreach($persons_incharge_ids as $id)
				{
					$commandText = "SELECT CONCAT(fname, ' ', mname, ' ', lname) AS name
									FROM staff
									WHERE id = $id";
					$result = $this->db->query($commandText);
					$query_result2 = $result->result();

					$persons_incharge .= $query_result2[0]->name;
					if($j < count($persons_incharge_ids)-1)
						$persons_incharge .= ", ";
					$j++;
				}

				// format header information to data array
				$data['data'][] = array(
					'id' 				=> $value->id, 	// weeklydeliverables_monitoring_header_id
					'ppa_id' 			=> $value->ppa_id,
					'ppa'				=> $value->ppa,
					'si'				=> $value->si,
					'persons_incharge' 	=> $persons_incharge,
					'deliverables' 		=> $value->deliverables,
					'deadline' 			=> date('M. j', strtotime($value->deadline))
					// 'deadline' 			=> date('M. j, Y', strtotime($value->deadline))
				);

				// query/retrieve the weekly accomplishment reports (week 1 to week 54)
				$commandText = "SELECT a.id,
									a.weeklydeliverables_monitoring_header_id,
									a.week_no,
									IF(a.accomplishment_report IS NULL, '', a.accomplishment_report) AS accomplishment_report,
									IF(a.evaluation_recommendation IS NULL, '', a.evaluation_recommendation) AS evaluation_recommendation, 
									IF(a.remarks IS NULL, '', a.remarks) AS remarks
								FROM adminservices_weeklydeliverables_monitoring_details a
								WHERE a.weeklydeliverables_monitoring_header_id = $value->id
								ORDER BY a.week_no ASC";
				$result = $this->db->query($commandText);
				$query_result3 = $result->result();

				// concat every accomplishment to the header information
				foreach($query_result3 as $key => $value)
				{
					$accomp = 'week' . $value->week_no . '_accomp';
					$eval = 'week' . $value->week_no . '_eval';
					$remarks = 'week' . $value->week_no . '_remarks';

					$week_details = array(
						$accomp 		=> $value->accomplishment_report,
						$eval 			=> $value->evaluation_recommendation,
						$remarks 		=> $value->remarks
					);

					$data['data'][$i] = array_merge($data['data'][$i], $week_details);
				}
				
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
}
