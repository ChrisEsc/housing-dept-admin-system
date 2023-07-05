<?php

require_once "my_model.php";
class adminservices_records_acknowledgements extends My_Model {

	const DB_TABLE = 'adminservices_records_acknowledgements';
	const DB_TABLE_PK = 'id';

	public $id;
	public $record_id;
	public $staff_id;
	public $date_acknowledged;
}