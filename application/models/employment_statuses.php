<?php

require_once "my_model.php";
class employment_statuses extends My_Model {

	const DB_TABLE = 'employment_statuses';
	const DB_TABLE_PK = 'id';

	public $id;
	public $description;
}