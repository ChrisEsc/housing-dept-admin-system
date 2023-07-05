<?php

require_once "my_model.php";
class calendar_holidays extends My_Model {

	const DB_TABLE = 'calendar_holidays';
	const DB_TABLE_PK = 'id';

	public $id;
	public $calendar_id;
	public $holiday_date;
	public $holiday_description;
	public $active;
}