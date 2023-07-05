<?php

require_once "my_model.php";
class approver_routetrail_common extends My_Model {

	const DB_TABLE = 'approver_routetrail_common';
	const DB_TABLE_PK = 'id';

	public $id;
	public $transaction_id;
	public $type;
	public $approver_id;
	public $sno;
	public $date;
	public $remarks;
	public $status;
	public $status_heirarchy;
	public $status_remarks;
}