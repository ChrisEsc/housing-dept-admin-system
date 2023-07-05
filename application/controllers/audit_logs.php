<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Audit_Logs extends CI_Controller {
	/**
	*/
	private function modulename($type)
	{		
		if($type == 'link')
			return 'audit_logs';
		else 
			return 'Audit Logs';
	}

	public function index(){
		$this->load->model('Page');
        $this->Page->set_page($this->modulename('link'));
	}

	public function loglist()
	{ 
		try 
		{
			$query = mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($_GET['query'])));
			$date_from 	= date('Y-m-d',strtotime($_GET['date_from']));
			$date_to 	= date('Y-m-d',strtotime($_GET['date_to']));			

			die(json_encode($this->generateloglist($query, $date_from, $date_to, 'Grid')));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function generateloglist($query, $date_from, $date_to, $transaction_type)
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

			$commandText = "SELECT 
								a.*,
								CONCAT(c.lname, ', ', c.fname, ' ',c.mname) AS created_by_staff
							FROM audit_logs a 
								LEFT JOIN users b ON a.created_by = b.id
								LEFT JOIN staff c ON b.user_id = c.id
							WHERE
								(a.date_created >= '$date_from' and a.date_created <= '$date_to') and
							    (
							    	a.transaction_type like '%$query%' or 
						    		a.query_type like '%$query%' or
						    		CONCAT(c.fname, ' ', c.mname, ' ',c.lname) LIKE '%$query%'
					    		 )
							ORDER BY a.date_created DESC, a.time_created DESC
							$limitQuery";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$commandText = "SELECT count(a.id) as count
							FROM audit_logs a 
								LEFT JOIN users b ON a.created_by = b.id
								LEFT JOIN staff c ON b.user_id = c.id
							WHERE
								(a.date_created >= '$date_from' and a.date_created <= '$date_to') and
							    (
							    	a.transaction_type like '%$query%' or 
									a.query_type like '%$query%' or
									CONCAT(c.fname, ' ', c.mname, ' ',c.lname) LIKE '%$query%'
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

			$countID = 1;
			foreach($query_result as $key => $value) 
			{	
				$created_by = mb_strtoupper($value->created_by_staff);

				$data['data'][] = array(
					'id' 				=> $countID,
					'table'				=> $value->entity,
					'date_created' 		=> date('m/d/Y',strtotime($value->date_created)).' '.date('h:i:sa',strtotime($value->time_created)),
					'transaction_type'	=> $value->transaction_type,
					'transaction_id' 	=> $value->transaction_id,
					'query_type'		=> $value->query_type,
					'created_by'		=> $created_by);
				$countID++;
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

	public function exportdocument()
	{
		$response = array();
        $response['success'] = true;
        if($this->input->post('reporttype') == 'List')
        {
			$query 		= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('query'))));
	    	$date_from 	=  $this->input->post('date_from');
	    	$date_to 	=  $this->input->post('date_to');

    		$response['filename'] = $this->exportpdfList($this->generateloglist($query, $date_from, $date_to, 'Report'), $query, $date_from, $date_to);
        }
    	else {
	    	$id 				=  $this->input->post('id');
	    	$auditlog_id 		=  $this->input->post('auditlog_id');
	    	$table 				=  $this->input->post('table');
	    	$transaction_type 	=  $this->input->post('transaction_type');

    		$response['filename'] = $this->exportpdfRecord($this->generateview($id, $auditlog_id, $table, $transaction_type));
    	}
		die(json_encode($response));
	}

	public function exportpdfList($data, $query, $date_from, $date_to)
	{
		try 
		{
			$this->load->library('tcpdf');
			$pdf = new TCPDF();
			$fDate = date("Ymd_His"); 
			$filename = "LogList".$fDate.".pdf";
			
			// set document information
			$pdf->SetCreator(getenv('REPORT_CREATOR'));
			$pdf->SetAuthor(getenv('REPORT_AUTHOR'));
			$pdf->SetTitle('LogList');
			$pdf->SetSubject('LogList');
			$pdf->SetKeywords(getenv('REPORT_KEYWORDS'));
			
			//set margins
			$pdf->SetPrintHeader(false);
			$pdf->SetPrintFooter(false);
			
			// add a page
			$pdf->AddPage('P', 'LETTER');
			
			if(!$query) $query = 'NULL';
			
			$pdf->Image('image/logo-chudd.png', 10, 8, 20, 20, 'PNG', null, '', true, 300, '', false, false, 0, false, false, false);

			$html  = '
			<table border=1>
				<tr style="font-weight:bold;font-size:45px;">
				  <td width="60"></td>
				  <td style="background: black; padding: 10px;" align="left"><font face="Arial" >'.getenv('DEPARTMENT_NAME_ALL_CAPS').'</font></td>
				</tr>
				<tr style="font-weight:bold;font-size:30px;">
				  <td></td>
				  <td style="background: black; padding: 10px;" align="left"><font face="Arial" >Audit Logs</font></td>
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

					<table>
						<tr style="font-size:24px;">
						  <td width="10%">Keyword</td>
						  <td width="1%" >:</td>
						  <td width="50%">'.$query.'</td>
						</tr>
						<tr style="font-size:24px;">
						  <td>Date From</td>
						  <td>:</td>
						  <td>'.date('m/d/Y',strtotime($date_from)).'</td>
						</tr>
						<tr style="font-size:24px;">
						  <td>Date To</td>
						  <td>:</td>
						  <td>'.date('m/d/Y',strtotime($date_to)).'</td>
						</tr>
					</table>

					<br>

					<table border="1" cellpadding="2">						
						<tr style="padding: 10px;font-weight:bold;font-size:17px;">
						  <td width="13%"  style="padding: 10px;" align="left">Date & Time</td>
						  <td width="40%"  style="padding: 10px;" align="left">Transaction Type</td>
						  <td width="10%"  style="padding: 10px;" align="center">ID</td>
						  <td width="10%"  style="padding: 10px;" align="center">Query Type</td>
						  <td width="25%"  style="padding: 10px;" align="left">User</td>
						</tr>';


			for ($i = 0; $i<$data['totalCount'];$i++)
			{
				$html .= '<tr style="font-size:15px;">
					  <td style="padding: 10px;" align="left">'.$data['data'][$i]['date_created'].'</td>
					  <td style="padding: 10px;" align="left">'.$data['data'][$i]['transaction_type'].'</td>
					  <td style="padding: 10px;" align="center">'.$data['data'][$i]['transaction_id'].'</td>
					  <td style="padding: 10px;" align="center">'.$data['data'][$i]['query_type'].'</td>
					  <td style="padding: 10px;" align="left">'.$data['data'][$i]['created_by'].'</td>
					</tr>';
			}

			$html .= '</table>';


			$this->load->library('session');
			$html .= '<div style="font-size:14px;">Printed by:'.$this->session->userdata('name').'<br>Date Printed: '.date('m/d/Y h:i:sa').'</div>';

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

	public function exportpdfRecord($data)
	{
		try 
		{
			
			$this->load->library('PHPExcel/Shared/PDF/tcpdf');
			$pdf = new TCPDF();
			$fDate = date("Ymd_His"); 
			$filename = "TransactionLog".$fDate.".pdf";
			
			// set document information
			$pdf->SetCreator(getenv('REPORT_CREATOR'));
			$pdf->SetAuthor(getenv('REPORT_AUTHOR'));
			$pdf->SetTitle('TransactionLog');
			$pdf->SetSubject('TransactionLog');
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
				  <td style="background: black; padding: 10px;" align="left"><font face="Arial" >Audit Logs - Transaction</font></td>
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

					<table border="1" cellpadding="2">						
						<tr style="padding: 10px;font-weight:bold;font-size:17px;">
						  <td width="10%"  style="padding: 10px;" align="left">Date Created</td>
						  <td width="40%"  style="padding: 10px;" align="left">'.$data['date_created'].'</td>
						</tr>
						<tr style="padding: 10px;font-weight:bold;font-size:17px;">
						  <td style="padding: 10px;" align="left">Time Create</td>
						  <td style="padding: 10px;" align="left">'.$data['time_created'].'</td>
						</tr>
						<tr style="padding: 10px;font-weight:bold;font-size:17px;">
						  <td style="padding: 10px;" align="left">Created by</td>
						  <td style="padding: 10px;" align="left">'.$data['created_by'].'</td>
						</tr>
						<tr style="padding: 10px;font-weight:bold;font-size:17px;">
						  <td style="padding: 10px;" align="left">Query Type</td>
						  <td style="padding: 10px;" align="left">'.$data['query_type'].'</td>
						</tr>
						<tr style="padding: 10px;font-weight:bold;font-size:17px;">
						  <td style="padding: 10px;" align="left">Transaction Type</td>
						  <td style="padding: 10px;" align="left">'.$data['transaction_type'].'</td>
						</tr>
						<tr style="padding: 10px;font-weight:bold;font-size:17px;">
						  <td style="padding: 10px;" align="left">Transaction ID</td>
						  <td style="padding: 10px;" align="left">'.$data['transaction_id'].'</td>
						</tr>';


			for ($i = 0; $i<$data['totalCount'];$i++)
			{
				$html .= '<tr style="font-size:15px;">
					  <td style="padding: 10px;" align="left">'.$data['label'][$i].'</td>
					  <td style="padding: 10px;" align="left">'.$data['value'][$i].'</td>
					</tr>';
			}

			$html .= '</table><br><br><br>';


			$this->load->library('session');
			$html .= '<div style="font-size:14px;">Printed by:'.$this->session->userdata('name').'<br>Date Printed: '.date('m/d/Y h:i:sa').'</div>';

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

	public function view()
	{
		try 
		{
			$id 	= $this->input->post('id');
			$table 	= $this->input->post('table');
			$transaction_type 	= $this->input->post('transaction_type');
			die(json_encode($this->generateview($id, 0, $table, $transaction_type)));
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}

	public function generateview($id, $auditlog_id, $table, $transaction_type)
	{
		try 
		{ 
			#update session
			$this->load->model('Session');$this->Session->Validate();

			$commandText = "SELECT 
								a.id,
								CONCAT(lname, ', ', fname, ' ',mname) AS name,
								b.description AS department_desc,
								c.description AS position_desc	
							FROM staff a
								LEFT JOIN departments b ON a.department_id = b.id
								LEFT JOIN positions c ON a.position_id = c.id 
								WHERE a.id = $id";	
			
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			$record = array();

			$data['totalCount'] = 0;
			foreach($query_result as $key => $value) 
			{	
				$record[0] = mb_strtoupper($value->name);
				$record[1] = $value->position_desc;	
				$record[2] = $value->department_desc;	
				$data['value'] = $record;

				$record = [];
				$record[0] = 'Name';	
				$record[1] = 'Position';	
				$record[2] = 'Department';
				$data['label'] = $record;

				$data['totalCount'] = 3;
			}

			
			$commandText = "SELECT 
								a.*,
								CONCAT(lname, ', ', fname, ' ',mname) AS created_by
							FROM audit_logs a 
								LEFT JOIN users b ON a.created_by = b.id
								LEFT JOIN staff c ON b.user_id = c.id
							WHERE a.id = $auditlog_id";	
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			foreach($query_result as $key => $value) 
			{				
				$data['date_created'] 		= date('m/d/Y',strtotime($value->date_created));
				$data['time_created'] 		= date('h:i:sa',strtotime($value->time_created));
				$data['transaction_type'] 	= $value->transaction_type;
				$data['transaction_id'] 	= $value->transaction_id;
				$data['query_type'] 		= $value->query_type;
				$data['created_by'] 		= mb_strtoupper($value->created_by);
			}

			$data['success'] = true;

			return $data;
		} 
		catch (Exception $e) 
		{
			print $e->getMessage();
			die();	
		}
	}	
}