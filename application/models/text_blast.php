<?php

require_once "my_model.php";
class text_blast extends My_Model {

	const DB_TABLE = 'text_blast';
	const DB_TABLE_PK = 'id';

	public $id;
	public $sent_to;
	public $sent_by;
	public $sent_from_module;
	public $sent_time;
	public $txt_message;
	public $sender_user_id;
}