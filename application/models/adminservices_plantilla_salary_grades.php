<?php

require_once "my_model.php";
class adminservices_plantilla_salary_grades extends My_Model {

	const DB_TABLE = 'adminservices_plantilla_salary_grades';
	const DB_TABLE_PK = 'id';

	public $id;
	public $salary_grade;
	public $step_1;
	public $step_2;
	public $step_3;
	public $step_4;
	public $step_5;
	public $step_6;
	public $step_7;
	public $step_8;
	public $year;
	public $active;
}