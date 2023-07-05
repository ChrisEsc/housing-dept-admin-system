<?php

require_once "my_model.php";
class divisions extends My_Model {

	const DB_TABLE = 'divisions';
	const DB_TABLE_PK = 'id';

	public $id;
	public $div_code;
	public $description;
}