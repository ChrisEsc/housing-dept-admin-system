<?php

require_once "my_model.php";
class adminservices_plantilla_header extends My_Model {

	const DB_TABLE = 'adminservices_plantilla_header';
	const DB_TABLE_PK = 'id';

	public $id;
	public $division_id;
	public $position_id;
	public $employment_status_id;
	public $salary_grade;
	public $active;
}