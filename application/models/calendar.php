<?php

require_once "my_model.php";
class calendar extends My_Model {

	const DB_TABLE = 'calendar';
	const DB_TABLE_PK = 'id';

	public $id;
	public $calendar_year;
	public $calendar_quarter;
	public $calendar_month;
	public $current_month;
	public $active;
}