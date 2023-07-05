<?php

require_once "my_model.php";
class adminservices_plantilla_details extends My_Model {

	const DB_TABLE = 'adminservices_plantilla_details';
	const DB_TABLE_PK = 'id';

	public $id;
	public $plantilla_header_id;
	public $staff_id;
	public $date_appointed;
	public $date_vacated;
	public $remarks;
	public $active;
}