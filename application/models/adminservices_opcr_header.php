<?php

require_once "my_model.php";
class adminservices_opcr_header extends My_Model {

	const DB_TABLE = 'adminservices_opcr_header';
	const DB_TABLE_PK = 'id';

	public $id;
	public $division_id;
	public $mfo_no;
	public $mfo;
	public $year;
}