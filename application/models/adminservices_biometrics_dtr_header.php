<?php

require_once "my_model.php";
class adminservices_biometrics_dtr_header extends My_Model {

	const DB_TABLE = 'adminservices_biometrics_dtr_header';
	const DB_TABLE_PK = 'id';

	public $id;
	public $calendar_id;
	public $employee_id;
}