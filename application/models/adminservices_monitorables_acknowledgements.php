<?php

require_once "my_model.php";
class adminservices_monitorables_acknowledgements extends My_Model {

	const DB_TABLE = 'adminservices_monitorables_acknowledgements';
	const DB_TABLE_PK = 'id';

	public $id;
	public $doc_type
	public $doc_id;
	public $staff_id;
	public $date_acknowledged;
}