<link rel="stylesheet" type="text/css" href="<?php echo base_url(); ?>css/bootstrap/css/bootstrap.min.css" />
<link rel="stylesheet" type="text/css" href="<?php echo base_url(); ?>css/font-awesome-4.7.0/css/font-awesome.min.css" />
<!-- <link rel="stylesheet" type="text/css" href="<?php echo base_url(); ?>css/font-awesome-4.2.0/css/font-awesome.min.css" /> -->

<style type="text/css">
	.permit-icon {
			float: left;
			text-align: center;
			font-weight: bold;
			/*background-color: #f7f7f7;*/
			padding: 10px;
			border-radius: 10px;
			/*margin: 2px;*/
	} 
	.permit-icon:hover {
			cursor: pointer;
			background-color: #eaeaea;
	}

	#navigation {
		height: 50px !important;
		padding-top: 16px;
	}

	#realtime {
		top:13px;
	    left: 5px;
	    margin:0px 0px 0px 0px;    
	    padding: 0px 0px 0px 0px;
	}

	#user {
		top:3px;
	    left: 5px;
	    margin:0px 0px 0px 0px;    
	    padding: 0px 0px 0px 0px;
	}

	#menu {
	    top:58px;
	}

</style>	

<div id="innerdiv">
</div>

<script type="text/javascript">	

	<?php include_once("window.js") ?>

</script>

<style type="text/css">
	.bs-example{
		margin: 0px 20px 0 20px;
		/*width: 600px;*/
	}
</style>
<div class="bs-example">
    <!-- <div class="alert alert-danger" id="myAlert"> -->
    <div id="myAlert">
        <strong>NOTIFICATIONS!</strong><br> <?php echo $notification_name;?>
    </div>
</div>