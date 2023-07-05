<?php

require_once "my_model.php";
class adminservices_monitorables_evaluations extends My_Model {

	const DB_TABLE = 'adminservices_monitorables_evaluations';
	const DB_TABLE_PK = 'id';

	public $id;
	public $doc_id;
	public $doc_type;
	public $evaluated_by;
	public $evaluation_date;
	public $evaluation;
	public $responded_by;
	public $response_date;
	public $response;
	public $status;

	
}