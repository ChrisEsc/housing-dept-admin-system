<?php

require_once "my_model.php";
class adminservices_weeklydeliverables_monitoring_header extends My_Model {

	const DB_TABLE = 'adminservices_weeklydeliverables_monitoring_header';
	const DB_TABLE_PK = 'id';

	public $id;
	public $opcr_details_id;
	public $deliverables;
	public $deadline;
}