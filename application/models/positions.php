<?php

require_once "my_model.php";
class Positions extends My_Model {

	const DB_TABLE = 'positions';
	const DB_TABLE_PK = 'id';

	public $id;
	public $description;
}