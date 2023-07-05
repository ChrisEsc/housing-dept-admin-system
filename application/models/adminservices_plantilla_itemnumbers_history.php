<?php

require_once "my_model.php";
class adminservices_plantilla_itemnumbers_history extends My_Model {

	const DB_TABLE = 'adminservices_plantilla_itemnumbers_history';
	const DB_TABLE_PK = 'id';

	public $id;
	public $plantilla_header_id;
	public $item_number;
	public $year;
}