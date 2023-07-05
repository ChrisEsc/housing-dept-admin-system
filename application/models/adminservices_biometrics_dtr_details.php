<?php

require_once "my_model.php";
class adminservices_biometrics_dtr_details extends My_Model {

	const DB_TABLE = 'adminservices_biometrics_dtr_details';
	const DB_TABLE_PK = 'id';

	public $id;
	public $adminservices_biometrics_dtr_header_id;
	public $day;
	public $original_biometrics_data;
	public $final_biometrics_data;
}