<?php

require_once "my_model.php";
class datetime_filters extends My_Model {

	const DB_TABLE = 'datetime_filters';
	const DB_TABLE_PK = 'id';

	public $id;
	public $code;
	public $description;
	public $time_type;
	public $count;
}