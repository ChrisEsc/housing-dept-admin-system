<?php

require_once "my_model.php";
class adminservices_activity_report extends My_Model {

	const DB_TABLE = 'adminservices_activity_report';
	const DB_TABLE_PK = 'id';

	public $id;
	public $division_id;
	public $section_id;
	public $documented_by;
	public $reviewed_by;
	public $approved_by;
	public $documented_date;
	public $reviewed_date;
	public $approved_date;
	public $venue;
	public $activity;
	public $participants;
	public $purpose;
	public $expected_output;
	public $accomplishments;
	public $remarks;
	public $documentation;
	public $submit_date;
	public $chudd_participants;
}