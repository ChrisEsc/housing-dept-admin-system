<?php

require_once "my_model.php";
class approver_hierarchies extends My_Model {

	const DB_TABLE = 'approver_hierarchies';
	const DB_TABLE_PK = 'id';

	public $id;
	public $approver_transaction_id;
	public $description;
	public $remarks;
	public $sno;
}