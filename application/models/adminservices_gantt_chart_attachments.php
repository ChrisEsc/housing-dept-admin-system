<?php

require_once "my_model.php";
class adminservices_gantt_chart_attachments extends My_Model {

	const DB_TABLE = 'staffmonitoring.sectionactivityattachments';
	const DB_TABLE_PK = 'id';

	public $id;
	public $activity_id;
	public $year;
	public $week_num;
	public $uploadedBy;
	public $filename;
	public $filepath;
	public $description;
	public $createdAt;
	public $updatedAt;
	public $deletedAt;
}