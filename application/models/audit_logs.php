<?php

require_once "my_model.php";
class audit_logs extends My_Model {

	const DB_TABLE = 'audit_logs';
	const DB_TABLE_PK = 'id';

	public $id;
	public $transaction_type;
	public $transaction_id;
	public $entity;
	public $query_type;
	public $created_by;
	public $date_created;
	public $time_created;
}