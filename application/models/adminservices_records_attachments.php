<?php

require_once "my_model.php";
class adminservices_records_attachments extends My_Model {

	const DB_TABLE = 'adminservices_records_attachments';
	const DB_TABLE_PK = 'id';

	public $id;
	public $record_id;
	public $attachment_name;
	public $attachment_extension;
	public $description;
	public $date_uploaded;
	public $active;
}