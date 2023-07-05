<?php

require_once "my_model.php";
class adminservices_records_from_to extends My_Model {

	const DB_TABLE = 'adminservices_records_from_to';
	const DB_TABLE_PK = 'id';

	public $id;
	public $description;
}