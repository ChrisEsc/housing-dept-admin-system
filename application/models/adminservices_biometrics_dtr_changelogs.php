<?php

require_once "my_model.php";
class adminservices_biometrics_dtr_changelogs extends My_Model {

	const DB_TABLE = 'adminservices_biometrics_dtr_changelogs';
	const DB_TABLE_PK = 'id';

	public $id;
	public $adminservices_biometrics_dtr_header_id;
	public $day;
	public $biometrics_data_from;
	public $biometrics_data_to;
	public $date_changed;
	public $active;
}