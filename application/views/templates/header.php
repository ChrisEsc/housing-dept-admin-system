<body>
	<div id="user">
		<font size=1 color=white face="verdana"><?php echo $username;?> | <?php echo $department;?> 
		<?php 
			if($admin) 
				echo '<font color=white>(<font color=red><b>Administrator</b></font>)</font>';									
		?>
		</font>
	</div>
	<div id="realtime">
		<font size=1 color=white face="verdana">Today is <?php echo(date("l, F d, Y"));?></font>
	</div>
	<div id="navigation">
		<!--<a href="<?php echo base_url().'index.php/thumbnailmenu'; ?>">CHUDD Internal Application</a>-->
		<a href="<?php echo base_url().'./thumbnailmenu'; ?>">CHUDD Internal Application</a>
	</div>
	<div>
		<ul id="menu">		
			<?php foreach($menu['Main'] as $valueModule) { ?>
		    <li>
		        <a href="#"><?php echo $valueModule['main_module']; ?></a>		        
		        <ul>
		        	<?php foreach($menu[$valueModule['main_module']] as $key => $value) { ?>
		            <!--<li><a href="<?php echo base_url().'index.php/'.$value['link']; ?>"><?php echo $value['module_name']; ?></a></li> -->
					  <li><a href="<?php echo base_url().'./'.$value['link']; ?>"><?php echo $value['module_name']; ?></a></li>     
		            <?php } ?>
		        </ul>
		    </li>
		    <?php } ?>
		</ul>    
	</div>

	<script type="text/javascript">
		if('<?php echo $boolMaintenance;?>' == 1)
			var crudMaintenance = false;
		else 
			var crudMaintenance = true;
	</script>
</body>