<?php

require_once "my_model.php";
class adminservices_opcr_details extends My_Model {

	const DB_TABLE = 'adminservices_opcr_details';
	const DB_TABLE_PK = 'id';

	public $id;
	public $opcr_header_id;
	public $section_id;
	public $ppa_no;
	public $persons_incharge_ids;
	public $ppa;
	public $success_indicator;
}