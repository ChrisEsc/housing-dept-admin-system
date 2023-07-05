<?php

require_once "my_model.php";
class staff extends My_Model {

	const DB_TABLE = 'staff';
	const DB_TABLE_PK = 'id';

	public $id;
	public $employee_id;
	public $department_id;
	public $division_id;
	public $section_id;
	public $position_id;
	public $employment_status_id;
	public $division_head;
	public $section_head;
	public $fname;
	public $mname;
	public $lname;
	public $temp_key;
	public $createdAt;
	public $updatedAt;
	public $deletedAt;
	public $active;	
}