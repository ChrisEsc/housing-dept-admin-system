<?php

require_once "my_model.php";
class Modules_Users extends My_Model {

	const DB_TABLE = 'modules_users';
	const DB_TABLE_PK = 'id';

	public $id;
	public $module_id;
	public $user_id;
	public $uadd;
	public $uedit;
	public $udelete;
}