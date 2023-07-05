<?php

require_once "my_model.php";
class Users extends My_Model {

	const DB_TABLE = 'users';
	const DB_TABLE_PK = 'id';

	public $id;
	public $username;
	public $password;
	public $user_id;
	public $admin;
	public $type;	
	//public $email;
	public $active;		
}