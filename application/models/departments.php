<?php

require_once "my_model.php";
class departments extends My_Model {

	const DB_TABLE = 'departments';
	const DB_TABLE_PK = 'id';

	public $id;
	public $dept_code;
	public $description;
}