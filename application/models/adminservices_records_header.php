<?php

require_once "my_model.php";
class adminservices_records_header extends My_Model {

	const DB_TABLE = 'adminservices_records_header';
	const DB_TABLE_PK = 'id';

	public $id;
	public $record_type_id;
	public $from_id;
	public $from_office;
	public $to_id;
	public $division_id;
	public $section_id;
	public $action_taken_id;
	public $sequence_number;
	public $priority;
	public $date_communication;
	public $date_logged;
	public $date_deadline;
	public $subject;
	public $side_notes;
	public $communication_type;
	public $status;
	public $active;



}