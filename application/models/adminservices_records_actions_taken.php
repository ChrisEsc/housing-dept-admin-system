<?php

require_once "my_model.php";
class adminservices_records_actions_taken extends My_Model {

	const DB_TABLE = 'adminservices_records_actions_taken';
	const DB_TABLE_PK = 'id';

	public $id;
	public $record_id;
	public $action_taken;
	public $staff_id;
	public $date_action_taken;
}