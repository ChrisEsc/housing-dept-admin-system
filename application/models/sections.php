<?php

require_once "my_model.php";
class Sections extends My_Model {

	const DB_TABLE = 'sections';
	const DB_TABLE_PK = 'id';

	public $id;
	public $division_id;
	public $description;
}