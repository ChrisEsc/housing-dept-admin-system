<?php

require_once "my_model.php";
class modules_default extends My_Model {

	const DB_TABLE = 'modules_default';
	const DB_TABLE_PK = 'id';

	public $id;
	public $group_id;
	public $module_id;
}