<?php

require_once "my_model.php";
class approver_departments extends My_Model {

	const DB_TABLE = 'approver_departments';
	const DB_TABLE_PK = 'id';

	public $id;
	public $approver_id;
	public $department_id;
}