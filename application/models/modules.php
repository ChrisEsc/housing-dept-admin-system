<?php

require_once "my_model.php";
class Modules extends My_Model {

	const DB_TABLE = 'modules';
	const DB_TABLE_PK = 'id';

	public $id;
	public $parent_id;
	public $sno;
	public $module_name;
	public $link;
	public $icon;	
	public $type;
	public $menu;
	public $thumbnail;
}