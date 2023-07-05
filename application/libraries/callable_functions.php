<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Callable_Functions {
	/**
	*/
	function GenerateControlNumber($date_communication, $date_logged, $sequence_number)
	{
		try
		{
			$control_number = "";
			// if there is no comm. date, dont concat
			if ($date_communication == NULL)
				$control_number .= date('d', strtotime($date_logged)) . ' ';
			else
				$control_number .=  date('d', strtotime($date_logged)) . '-' . date('d', strtotime($date_communication)) . ' ';

			// if date of communication is within 2019 and seq. number is between 2041 and 2049 (those communications dated 2019 but received in the office january 2, 2020, use "19" (communication date) in building the control number, else use the year of the date logged
			// explanation: implementation of control number is changed (2 JAN 2020), instead of using the year of the communication date, the year of the date logged is used. this is critical during Dec-Jan transition because of the reset in sequence number. This is to prevent communications dated many months ago and have just been recently received to be tagged with erroneous year concatenated in the control number.
			if(date('y', strtotime($date_communication)) == '19' && $sequence_number >= 2041 && $sequence_number <= 2049)
			{
				$control_number .= date('y', strtotime($date_communication)) . '-' . sprintf('%03d', $sequence_number);
			}
			else
			{
				$control_number .= date('y', strtotime($date_logged)) . '-' . sprintf('%03d', $sequence_number);
			}
			return $control_number;
		}
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	function CommunicationDetailsBuilder($record_type, $communication_number, $subject)
	{
		try
		{

			$details = '<b>' . mb_strtoupper($record_type) . ':</b><br>' . $subject;
			if ($record_type == 'Directive' || $record_type == 'Memo' || $record_type == 'Ordinance')
				$details = '<b>' . mb_strtoupper($record_type) . '#' . $communication_number . ':</b><br>' . $subject;
			else if ($record_type == 'Endorsement')
				$details = '<b>' . $communication_number . ' ' . mb_strtoupper($record_type) . ':</b><br>' . $subject;

			return $details;
		}
		catch (Exception $e)
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	// function SaveRetrieveRecordAddressID($id, $name)
	// {
	// 	try
	// 	{
	// 		$commandText = "SELECT * FROM adminservices_records_from_to WHERE description LIKE '%$name%'";
	// 		$result = $this->db->query($commandText);
	// 		$query_result = $result->result();

	// 		if (count($query_result) == 0)
	// 		{
	// 			$this->load->model('adminservices_records_from_to');
	// 			$this->adminservices_records_from_to->description 		= $name;
	// 			$this->adminservices_records_from_to->save(0);

	// 			$address_id = $this->adminservices_records_from_to->id;
	// 		}
	// 		else
	// 		{
	// 			$address_id = $query_result[0]->id; 
	// 		}

	// 		return $address_id;
	// 	}
	// 	catch (Exception $e)
	// 	{
	// 		$data = array("success"=> false, "data"=>$e->getMessage());
	// 		die(json_encode($data));
	// 	}
	// }
} 