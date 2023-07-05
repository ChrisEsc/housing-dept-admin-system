<?php

require_once "my_model.php";
class Record_Types extends My_Model {

	const DB_TABLE = 'record_types';
	const DB_TABLE_PK = 'id';

	public $id;
	public $description;
}