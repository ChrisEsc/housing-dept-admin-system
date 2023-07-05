<?php

require_once "my_model.php";
class adminservices_weeklydeliverables_monitoring_details extends My_Model {

	const DB_TABLE = 'adminservices_weeklydeliverables_monitoring_details';
	const DB_TABLE_PK = 'id';

	public $id;
	public $weeklydeliverables_monitoring_header_id;
	public $complied_by;
	public $reviewed_by;
	public $evaluated_by;
	public $remarked_by;
	public $week_no;
	public $accomplishment_report;
	public $evaluation_recommendation;
	public $remarks;
	public $date_reviewed;
	public $date_complied;
	public $date_evaluated;
	public $date_remarked;
}