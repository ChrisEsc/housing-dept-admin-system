<?php

require_once "my_model.php";
class adminservices_gantt_chart extends My_Model {

	const DB_TABLE = 'sectionactivity';
	const DB_TABLE_PK = 'id';
	public $sectionactivityID;
	public $sidetailID;
	public $qty;
	public $activity;
	public $activityStart;
	public $activityEnd;
	public $activityCompleted;
	public $createdAt;
	public $UpdatedAt;
	public $deletedAt;
	public $section_id;

}