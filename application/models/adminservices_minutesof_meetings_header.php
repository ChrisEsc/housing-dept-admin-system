<?php

require_once "my_model.php";
class adminservices_minutesof_meetings_header extends My_Model {

	const DB_TABLE = 'adminservices_minutesof_meetings_header';
	const DB_TABLE_PK = 'id';

	public $id;
	public $division_id;
	public $section_id;
	public $present_ids;
	public $absent_ids;
	public $prepared_by;
	public $reviewed_by;
	public $approved_by;
	public $prepared_date;
	public $reviewed_date;
	public $approved_date;
	public $meeting_type;
	public $meeting_date;
	public $venue;
	public $agenda;
	public $discussion;
}