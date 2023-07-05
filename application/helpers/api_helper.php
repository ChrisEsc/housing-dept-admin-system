<?php
	
	function generate_table($table_params=array(),$data=array(),$data1=array(),$extaTables='',$ExtableBottom=''){
		 if(file_exists($table_params['folder_name'].$table_params['file_name'].'.pdf')){
			 unlink($table_params['folder_name'].$table_params['file_name'].'.pdf');
		  }
		
		ob_clean();
		$ci =& get_instance();
		if(!isset($table_params['table_hidden'])) $table_params['table_hidden'] = false;
			
		if((count($table_params) > 0 && count($data) > 0) || $table_params['table_hidden'] == true){
			if(!isset($table_params['title'])) die("title field is required");
			if(!isset($table_params['file_name'])) die("file_name field is required");
			if(!isset($table_params['folder_name'])) die("folder_name field is required");
			
			if(!isset($table_params['title_font_style'])) $table_params['title_font_style'] = 'B';
			if(!isset($table_params['title_font_size'])) $table_params['title_font_size'] = 12;
			if(!isset($table_params['grid_font_size'])) $table_params['grid_font_size'] = 8;
			if(isset($table_params['grid_font_style'])){
				if($table_params['grid_font_style'] == 'N') $table_params['grid_font_style'] = '';
			}else{
				$table_params['grid_font_style'] = '';
			}
			if(!isset($table_params['font_style'])) $table_params['font_style'] = 'helvetica';
			if(!isset($table_params['orientation'])) $table_params['orientation'] = 'P';
			if(!isset($table_params['date'])) $table_params['date'] = false;
			if(!isset($table_params['date_format'])) $table_params['date_format'] = 'm-d-Y';
			if(!isset($table_params['margin_bottom_after_title'])) $table_params['margin_bottom_after_title'] = 5;
			if(!isset($table_params['margin_bottom_after_date'])) $table_params['margin_bottom_after_date'] = 5;
			if(!isset($table_params['generate_total'])) $table_params['generate_total'] = false;
			if(!isset($table_params['table_width'])) $table_params['table_width'] = '100%';
			if($table_params['generate_total'] == true && !isset($table_params['total_fields'])) die("total_fields field is required");
			
			$ci->pdf->setPrintHeader(false);
			$ci->pdf->setPrintFooter(true);
			$ci->pdf->SetMargins(6, 10); 
			
			$ci->pdf->AddPage($orientation=$table_params['orientation']);
			// if($table_params['orientation']=='P'){
				// getlogo();
				// getheader(); 
			// }else{
				// getlogo();
				// getheader2(); 
			// }
			
			$ci->pdf->SetFont(trim($table_params['font_style']),trim($table_params['title_font_style']), $table_params['title_font_size']);
			$ci->pdf->Cell(0, 0,$table_params['title'], 0,true, 'C');
			if(isset($table_params['subTitle'])){
				$ci->pdf->Cell(0, 0,$table_params['subTitle'], 0,true, 'C');
			}
			
			$ci->pdf->Ln($table_params['margin_bottom_after_title']);
			
			$ci->pdf->SetFont(trim($table_params['font_style']),trim($table_params['grid_font_style']), $table_params['grid_font_size']);
			if($table_params['date'] == true){
				$ci->pdf->Cell(200, 5,'Date : '.Date($table_params['date_format']), 0,true, 'L');
				$ci->pdf->Ln($table_params['margin_bottom_after_date']);
			}
			$tbl  = $extaTables;
			if($table_params['table_hidden'] == false){
			$tbl .= '<br><table style="width:'.$table_params['table_width'].';border-collapse: collapse;" cellpadding="7" border = "1">';
				 $data_cnt = count($data);
				 $tbl .= '<tr style="background-color:#f1f1f1;">';
					 for($x=0;$x<$data_cnt;$x++){
						if(!isset($data[$x]['header'])) die('header title header is required.');
						if(!isset($data[$x]['data_index'])) die('data_index is required.');
						
						if(!isset($data[$x]['type']))  $data[$x]['type'] = 'text';
						
						if($data[$x]['type'] == 'numbercolumn'){
							if(!isset($data[$x]['decimalplaces'])) $data[$x]['decimalplaces'] = 2;
							 $data[$x]['data_align'] = 'right';
						}else if($data[$x]['type'] == 'datecolumn'){
							if(!isset($data[$x]['format'])) $data[$x]['format'] = 'm/d/Y';
							$data[$x]['data_align'] = 'left';
						}else{
							$data[$x]['data_align'] = 'left';
						}
						
						if(!isset($data[$x]['align'])) $data[$x]['align'] = 'C';
						
						if($data[$x]['align'] == 'L') $data[$x]['align'] = 'left';
						else if($data[$x]['align'] == 'R') $data[$x]['align'] = 'right';
						else if($data[$x]['align'] == 'C') $data[$x]['align'] = 'center';
						
						if(!isset($data[$x]['width'])) $data[$x]['width'] = number_format((100/$data_cnt),2)."%";
						
						$align = $data[$x]['align'];
						$width = $data[$x]['width'];
						$header = $data[$x]['header'];
						
						$tbl .= "<th style=\"width:$width;text-align:$align\"><strong>$header</strong></th>";
					 }
				 $tbl .= '</tr>';
				 $n = 0;
				 $v = 0;
				 $totalamount = array();
				 for($x=0;$x<count($data1);$x++){
					if($n % 2 == 0) $tbl .= '<tr>';
					else $tbl .= '<tr>';
					
					 for($y=0;$y<$data_cnt;$y++){
						foreach($data1[$x] as $key => $v1){
							if($data[$y]['data_index'] == $key){
								if($table_params['generate_total'] == true){
									foreach($table_params['total_fields'] as $val1 => $key1){
										if( is_array($key1) && $val1 == $key ){
											$totalamount[$y] = array($val1=>$v1); 
										}
										if($key1 == $key){
											if(isset($totalamount[$y][$val1])) $v = $totalamount[$y][$val1];
											else $v = 0;
											
											$v += $v1;
											$totalamount[$y] = array($val1=>$v); 
										}
									}
								}
								$align = $data[$y]['data_align'];
								if($data[$y]['type'] == 'numbercolumn'){ 	  
									$tbl .= "<td style=\"text-align:$align\">" .number_format($v1,$data[$y]['decimalplaces']). '</td>';
								}else if($data[$y]['type'] == 'datecolumn'){
									$v1 = str_replace('-', '/', $v1);
									$tbl .= "<td style=\"text-align:$align\">" .(!empty($v1) ? date($data[$y]['format'],strtotime($v1)):''). '</td>';
								}else{ 
									$tbl .= "<td style=\"text-align:$align\">" .$v1. '</td>';
								}
							} 
						}
					}
					$tbl .= '</tr>';
					$n++;
				}
			$b = 0;
			$trig = false;
			if(count($totalamount) > 0){	
				$tbl .= "<tr>";
				for($i=1;$i<$data_cnt;$i++){
					if(isset($totalamount[$i])){
						if($trig == false){ 
							$tbl .= "<td style=\"text-align:center;\"><strong>TOTAL :</strong></td>"; $trig = true;
						}
						foreach($totalamount[$i] as $v){
							$tbl .= '<td style="text-align:right;"><strong>'.number_format($v,$data[$i]['decimalplaces']).'</strong></td>';
						}
					}else{
						$tbl .= "<td></td>";
					}
				}
				$tbl .= "</tr>";
			}
			$tbl .= '</table><br>';
			}
			$tbl .= $ExtableBottom;
			$ci->pdf->writeHTML($tbl, true, false, false, false, '');
		  
		  // getfooter(1);
		  
			
		   if(isset($_SERVER['SERVER_SOFTWARE']) && strpos($_SERVER['SERVER_SOFTWARE'],'Google App Engine') !== false){
				$directoryPath  = 'gs://fifo/';
			}
			else{
				$directoryPath='./';
			}
			$ci->pdf->Output($directoryPath.$table_params['folder_name'].$table_params['file_name'].'.pdf', 'F');
		}
	}
	
	function generateTcpdf($par){
		ini_set('memory_limit', '-1');

		$ci =& get_instance();
		//$ci = $this->load->library('tcpdf');
		// print_r($ci);
		$ci->pdf->setPrintHeader(false);
		$ci->pdf->setPrintFooter(true);
		$ci->pdf->SetMargins(6, 6); //default 
		// $ci->pdf->SetMargins(25, 6, 6); // for master list binding
		$ci->pdf->SetAutoPageBreak(true, 10);
		$ci->pdf->setFooterFont(Array(PDF_FONT_NAME_DATA, '', PDF_FONT_SIZE_DATA));
		$ci->pdf->SetFooterMargin(PDF_MARGIN_FOOTER);

		// ->SetFont('times', 'BI', 20, '', 'false');
		
		if(empty($par['file_name'])) echo "file name is required";
		if(empty($par['folder_name']))  echo "folder name is required";
		if(empty($par['records']))  echo "records to be printed is required";
		if(empty($par['header']))  echo "header to be printed is required";
		
		$par['file_name'] = str_replace("%20"," ",$par['file_name']);
		$resolution='';
		if( isset( $par['resolution'] ) ){
			$resolution= $par['resolution'];
		} 
		$ci->pdf->AddPage($orientation = (isset($par['orientation']))?$par['orientation']:'P',$resolution);
		// getlogo();
		// if($orientation == 'P')	getheader();
		// else					getheader2();
		$ci->pdf->setTitle($par['file_name']);
		

		// $ci->pdf->StartTransform();
		
		// $ci->pdf->SetFont('helvetica','B',100);
		// $ci->pdf->Rotate(-33);
		//Cell($w, $h=0, $txt='', $border=0, $ln=0, $align='', $fill=0, $link='', $stretch=0, $ignore_min_height=false, $calign='T', $valign='M')
		// $ci->pdf->Cell(0,0,'CHUDD',0,1,'C',0,'');
		// Image($file, $x='', $y='', $w=0, $h=0, $type='', $link='', $align='', $resize=false, $dpi=300, $palign='', $ismask=false, $imgmask=false, $border=0, $fitbox=false, $hidden=false, $fitonpage=false)
		// $ci->pdf->SetAlpha(0.1);
		// $ci->pdf->Image('assets/images/chuud-logo.png', 50, 5, 200, 200, '', '', '', true, 72);
		// $ci->pdf->SetAlpha(1);
		// $ci->pdf->StopTransform();
		
		waterMark($par['orientation']);

		$ci->pdf->SetFont('helvetica','B',12);
				
		/*CAPTION SA REPORT*/
		$ci->pdf->MultiCell(0,0,$text = $par['file_name'],0,$align='C',false, $ln=1,'','', true,0,'');
		$ci->pdf->Ln(5);
		
		/*
			default config
		*/

		/*FOR GRID FILTER*/
		if(isset($par['filter_font_family'])) $filter_font_family = trim($par['filter_font_family']);
		else $filter_font_family = 'helvetica';
		
		if(isset($par['filter_font_style'])) $filter_font_style = trim($par['filter_font_style']);
		else $filter_font_style = 'B';
		
		if(isset($par['filter_font_size'])) $filter_font_size = trim($par['filter_font_size']);
		else $filter_font_size = '11';
		
		/*FOR GRID HEADER*/
		if(isset($par['header_font_family'])) $header_font_family = trim($par['header_font_family']);
		else $header_font_family = 'helvetica';
		
		if(isset($par['header_font_style'])) $header_font_style = trim($par['header_font_style']);
		else $header_font_style = 'B';
		
		if(isset($par['header_font_size'])) $header_font_size = trim($par['header_font_size']);
		else $header_font_size = '12';
		
		
		/*FOR GRID ROW*/
		if(isset($par['row_font_family'])) $row_font_family = trim($par['row_font_family']);
		else $row_font_family = 'helvetica';
		
		if(isset($par['row_font_style'])) $row_font_style = trim($par['row_font_style']);
		else $row_font_style = 'N';
		
		if(isset($par['row_font_size'])) $row_font_size = trim($par['row_font_size']);
		else $row_font_size = '11';
		
		/*ORIENTATION*/
		if($orientation =='P') $orientationWidth = 204;
		else $orientationWidth = 280;
		
		
		//HEADER FILTERS
		//Pls referer implementation on 'controller/po/invpurreport.php' function 'Monitoring_PDF'
		if(isset($par['headerFields'])){
			$ci->pdf->SetFont($header_font_family,$header_font_style, $header_font_size);
			// $ci->pdf->SetFont($row_font_family,'', 9);
			
			#GETTING THE MAX LENGTH FIELD AND VALUE PER COLUMN
			foreach($par['headerFields'] as $index => $container){
				$columnsWidth[] = array(
									'labelWidth' => isset($container['labelWidth']) ? $container['labelWidth'] : 30, 
									'valueWidth' => isset($container['valueWidth']) ? $container['valueWidth'] : 40
								);
				unset($par['headerFields'][$index]['labelWidth']);			
				unset($par['headerFields'][$index]['valueWidth']);			
			}
			
			$x = 5;
			$y = $ci->pdf->GetY();	
			$oldY =  $y;
			$maxHeight = 0;
			foreach($par['headerFields'] as $index => $container){
				$stringHeightsValue = 0;
				$stringHeightsLabel = 0;
				$stringHeights = 0;
				$stringWidths = 0;
				
				foreach($container as  $data){
						$separator = ' : ';
						if(!isset($data['label']) || $data['label'] =='') $separator = '';

						$stringHeightsLabel = $ci->pdf->getStringHeight($columnsWidth[$index]['labelWidth'],$data['label']);
						$stringHeightsValue = $ci->pdf->getStringHeight($columnsWidth[$index]['valueWidth'],$data['value']);
						if($stringHeightsLabel > $stringHeightsValue){
							$stringHeights = $stringHeightsLabel;
						}else 
							$stringHeights = $stringHeightsValue;
						
						$ci->pdf->MultiCell(	
											$columnsWidth[$index]['labelWidth'],
											$stringHeights,
											$data['label'] . $separator,
											$border = 0,
											$align = 'L',
											$fill = false,
											$ln = 0,
											$x,
											$y,
											$reseth = true,
											$stretch = 0,
											$ishtml = false,
											$autopadding = true,
											$maxh = 0,
											$valign = 'T',
											$fitcell = false 
										);	
						$ci->pdf->MultiCell(	
											$columnsWidth[$index]['valueWidth'],
											$stringHeights,
											$data['value'] ,
											$border = 0,
											$align = 'L',
											$fill = false,
											$ln = 1,
											'',
											'',
											$reseth = true,
											$stretch = 0,
											$ishtml = false,
											$autopadding = true,
											$maxh = 0,
											$valign = 'T',
											$fitcell = false 
										);	
										
						$y += $stringHeights;
						$stringWidths = $columnsWidth[$index]['labelWidth'] + $columnsWidth[$index]['valueWidth'];
				} 
				if($y > $maxHeight){
					$maxHeight = $y;
				}
				
				$y = $oldY; 
				$x += $stringWidths; 
			}
			
			$ci->pdf->setY($maxHeight);
			$ci->pdf->ln(5);
		}
		
		
		
		$ci->pdf->SetFont($header_font_family,$header_font_style, $header_font_size);
		$headerCnt =  count($par['header']) -1 ;
		$headerInc=0;
		$border='';
		$ln=0;
		$headerHeight=0;
		$totalHeaderWithOutWidth=0;
		$remainingWidth=0;
		$decimalPlaces=0;
		
		$lastColumn = '';
		$ci->pdf->setCellHeightRatio(1.5);
		$ci->pdf->SetFillColor(240,240,240);
		
		
		
		/*calculate maximum header height*/
		foreach($par['header'] as $key=>$val){
			$cntHeaderHeight  =  $ci->pdf->getStringHeight($orientationWidth * ($val['width'] / 100),$val['header'],false,true,'',1);
			if($cntHeaderHeight > $headerHeight)	$headerHeight = $cntHeaderHeight;
			
		}
		
		//======================
		// $h1 = $par['header'];
		// print_r($h1);
		// echo '============ ';
		// array_splice($h1,8,1);
		// print_r($h1);
		//======================
		
		//======================
		$headers;
		$headerHeader_height =0;
		if(isset($par['sub_headers'])){
			
			$headers = $par['header'];
			
			foreach($par['sub_headers'] as $key){
				$FirstColumn = true;
				// print_r($key['subheaders']);
				$headerHeaderWidth = 0;
				foreach($key['subheaders'] as $val){
					foreach($headers as $cols){
						if($cols['dataIndex'] == $val)	$headerHeaderWidth += floatval($cols['width']);
					}
				}
				
				foreach($key['subheaders'] as $val){
					for($x=0; $x<count($headers); $x++){
						if(isset($headers[$x])){
							
							if($headers[$x]['dataIndex'] == $val){
								if($FirstColumn){
									
									array_splice($headers,$x,1,array(array('Top'=>$key['header'],'dataIndex'=>'top_header','width'=>$headerHeaderWidth)));
									$FirstColumn = false;
								}
								else{
									array_splice($headers,$x,1);
									
								}
								break;
							}
						}
					}
				}
			}
			
			foreach($headers as $key=>$val){
				$headerHeaderHeight  =  $ci->pdf->getStringHeight($orientationWidth * ($val['width'] / 100),isset($val['Top'])? $val['Top'] : '',false,true,'',1);
				if($headerHeaderHeight > $headerHeader_height)	$headerHeader_height = $headerHeaderHeight;
				
			}
			
			
			for($x=0; $x<count($headers); $x++){
				$width  = $orientationWidth * ($headers[$x]['width'] / 100);
				$text   = isset($headers[$x]['Top'])? $headers[$x]['Top'] : '';
				$border = isset($headers[$x]['Top'])? 'LTRB' : 'LTR';
				$nextln = $x==count($headers)-1? 1 : '';
				$ci->pdf->MultiCell($width,$headerHeaderHeight,$text,$border,'C',1, $nextln,'','', true,0,'');
			}
			
			
		}

		//======================
		
		foreach($par['header'] as $key=>$val){
			
			if($headerInc==0) {
				$border = 'LRB';
			}
			else if($headerInc==$headerCnt){
				$ln=1;
				$border = 'LRB';
			}
			else{
				$border = 'LRB';
				$x='';$y='';
			}
			
			if(!isset($par['sub_headers']))$border .= 'T';
			
			
			if(isset($val['width'])) $width = $orientationWidth * ($val['width'] / 100);
			else{
				$width=$orientationWidth / count($par['header']);
			}
			
			
			if(isset($val['align'])) $align = $val['align'];
			else $align='C';
			
			
			
			$ci->pdf->MultiCell($width,$headerHeight,$text = $val['header'],$border,$align,1, $ln,'','', true,0,'');
			
			
			
			$headerInc++;
			$remainingWidth = $remainingWidth + (int)$width;  
			$lastColumn = $val['dataIndex'];
			
		}

		/*
			para sa pg kuha og records
		*/
		
		$recordCnt =  count($par['records']) -1;
		$recInc=0;
		$recLn=0;
		$headerInc=0;
		$rowHeight=0;
		
		
		/* initialization sa taga total columns */
		$totalColumns 	= array();
		$untotal		= array();
		$unTotalcounter	= 0;
		if(isset($par['totalSummary'])){
			foreach($par['totalSummary'] as $totals){
				$totalColumns[$totals] = 0;
			}
			
			$untotal[$unTotalcounter] = 0;
			foreach($par['header'] as $key=>$val){
				
				$same = false;
				foreach($par['totalSummary'] as $totals){
					if($totals == $val['dataIndex']){
						$same = true;
						break;
					}
				}
				
				if($same){
					$untotal[$val['dataIndex']] = floatval(str_replace("%","",$val['width']));
					$unTotalcounter++;
					$untotal[$unTotalcounter] = 0;
				}
				else{
					$untotal[$unTotalcounter] += floatval(str_replace("%","",$val['width']));
				}
			}
			
			for($x=count($untotal)-1; $x>=0; $x--){
				if(isset($untotal[$x]))if($untotal[$x]==0) unset($untotal[$x]);
			}
			
			
			
		}
		
		
		
		
		
		
		$ci->pdf->SetFont($row_font_family,$row_font_style, $row_font_size);
		foreach($par['records'] as $key=>$val){
			$first_border_nextPage = false;
			
			/*calculate maximum record height per row*/
			foreach($par['header'] as $key=>$headerValRow){
				if(isset($headerValRow['width'])) 	$rowWidth = $orientationWidth * ($headerValRow['width'] / 100);
				else 								$rowWidth = $orientationWidth / count($par['header']);
				
				if(isset($val['height'])) $rowHeight = $val['height'];
				else{
					$recordVal = ($val[$headerValRow['dataIndex']])?$val[$headerValRow['dataIndex']]:'';
					$cntRecordHeight  =  $ci->pdf->getStringHeight($rowWidth,$rowTxt =$recordVal ,$reseth = false,$autopadding = true,$cellpadding = '',$border = 1);
					if(floatval($cntRecordHeight)	>= floatval($rowHeight)) $rowHeight = $cntRecordHeight;
				}
				
			}
			
			
			
			
			// echo $headerValRow['dataIndex'];
		
			foreach($par['header'] as $key=>$headerVal){
				if($headerInc==$headerCnt){
					$headerInc=0;
					$recLn=1;
					$recBorder  = 'LRB';
				}else{
					$recLn=0;
					$recBorder = 'LRB';
					$headerInc++;
				}
				
				if(isset($headerVal['width'])) $rowWidth = $orientationWidth * ($headerVal['width'] / 100);
				else $rowWidth=$orientationWidth / count($par['header']);
				
				
				$value = $val[$headerVal['dataIndex']];
				$align = 'L';
				// echo is_date_check($val[$headerVal['dataIndex']]).' -';
				is_date_check($val[$headerVal['dataIndex']]);
				if(is_date_check($val[$headerVal['dataIndex']]) == true){
					$align = 'R';
					if(isset($par['dateFormat'])) 	$dateFormat = $par['dateFormat'];
					else 							$dateFormat ='m/d/Y h:i A';
					$value = date($dateFormat,strtotime($val[$headerVal['dataIndex']]));
				}
				else if(isset($headerVal['type'])){
					if($headerVal['type'] == 'numbercolumn' || $headerVal['type'] == 'running'){
						$align   = 'R';
						$decimal = isset($headerVal['decimalplaces'])? intval($headerVal['decimalplaces']) : 2;
						$value   = (is_numeric($val[$headerVal['dataIndex']]))? number_format($val[$headerVal['dataIndex']],$decimal) : 0;
						
						
						if(isset($totalColumns[$headerVal['dataIndex']])){
							if($headerVal['type'] == 'numbercolumn')
								$totalColumns[$headerVal['dataIndex']] += (float)$val[$headerVal['dataIndex']];
							else if($headerVal['type'] == 'running')
								$totalColumns[$headerVal['dataIndex']] = (float)$val[$headerVal['dataIndex']];
						}
						
					}
					// else if($headerVal['type'] == 'checkcolumn'){
					// 	$value = "&#8486;";
					// }
				}
				else if(isset($headerVal['align'])){
					$align = $headerVal['align'];
				}
				
				
				$currentHeight = $ci->pdf->getPageHeight()-12;
				$currentY = $ci->pdf->GetY();
				// if($rowHeight > ($currentHeight - $currentY) ){ 
					// print_r('rowheight : '.$rowHeight.' - currentH :'.$currentHeight .' - Y : '.$currentY.',     ');
				// }
				
				
				if($rowHeight > ($currentHeight - $currentY) ){ 
					
					$ci->pdf->AddPage(isset($par['orientation'])?$par['orientation']:'P');

					waterMark($par['orientation']);

					$first_border_nextPage = true;

					$headerInc1 = 0;
					$headerCnt1 =  count($par['header']) -1 ;
					$ln=0;
					foreach($par['header'] as $key1=>$val1){
			
						if($headerInc1==0) {
							$border = 'LRB';
						}
						else if($headerInc1==$headerCnt1){
							$ln=1;
							$border = 'LRB';
						}
						else{
							$border = 'LRB';
							$x='';$y='';
						}
						
						if(!isset($par['sub_headers']))$border .= 'T';
						
						
						if(isset($val1['width'])) $width = $orientationWidth * ($val1['width'] / 100);
						else{
							$width=$orientationWidth / count($par['header']);
						}
						
						
						if(isset($val1['align'])) $align = $val1['align'];
						else $align='C';
						
						
						
						$ci->pdf->MultiCell($width,$headerHeight,$textH = $val1['header'],$border,$align,1, $ln,'','', true,0,'');
						
						
						
						$headerInc1++;
						// $remainingWidth = $remainingWidth + (int)$width;  
						// $lastColumn = $val['dataIndex'];
						
					}
				}
				
				if($first_border_nextPage){
					$recBorder = 'LTRB';
					if($lastColumn == $headerVal['dataIndex'])	$first_border_nextPage = false;
				}
				
			
				$ci->pdf->MultiCell($rowWidth,$rowHeight,$text = strip_tags($value) ,$recBorder,$align,false, $recLn,'','', true,0,'',$autopading=true,$maxh = 0,$valign = 'T',$fitcell = true );
				
				
			}
			
			
			$rowHeight=0;
			$recInc++;
			
			
		}
		
		
		
		/* SUMMATION */
		if(isset($par['totalSummary'])){
			$ci->pdf->SetFont($header_font_family,$header_font_style, $header_font_size);
			$ci->pdf->SetFillColor(255,255,255);
			$totalstring = true;
			$sumHeight   = 0;
			$totalSummaryDecimal = 2;
			if(isset($par['totalSummaryDecimal'])){
				$totalSummaryDecimal = 0;
			}
			foreach($untotal as $key=>$val){
				$cntRecordHeight  =  $ci->pdf->getStringHeight($orientationWidth * ($val / 100),isset($totalColumns[$key])? number_format($totalColumns[$key],$totalSummaryDecimal) : '',false,true,'',1);
				if($cntRecordHeight > $sumHeight)	$sumHeight = $cntRecordHeight;
			}
			
			
			foreach($untotal as $key=>$val){
				$width  = $orientationWidth * ($val / 100);
				$text   = isset($totalColumns[$key])? number_format($totalColumns[$key],$totalSummaryDecimal) : '';
				$border = ($totalstring)? 'LTRB' : 'LTRB';
				
				
				// if($totalstring)	$ci->pdf->SetFillColor(255,255,255);
				// else				
					$ci->pdf->SetFillColor(240,240,240);
				
				if($sumHeight > (($ci->pdf->getPageHeight()-10) - $ci->pdf->GetY()) ){	$ci->pdf->AddPage(isset($par['orientation'])?$par['orientation']:'P');}
				$ci->pdf->MultiCell($width,$sumHeight,($totalstring? 'Total' : $text),$border,($totalstring? 'L' : 'R'),1, 0,'','', true,0,'');
				
				
				$totalstring = false;
			}
			$ci->pdf->SetFillColor(255,255,255);
		}
		

		if(isset($par['withSignatories'])){
			// $ci->pdf->AddPage(isset($par['orientation'])?$par['orientation']:'P');
			$ci->pdf->lastPage();
			$ci->pdf->SetFont($header_font_family,$header_font_style, $header_font_size);
			$ci->pdf->SetY(215);
			$sumHeight   = 0;
			$width  = 40;
			$cntRecordHeight  =  $ci->pdf->getStringHeight($width,'Prepared by:',false,true,'',1);
			if($cntRecordHeight > $sumHeight)	$sumHeight = $cntRecordHeight;
			if($sumHeight > (($ci->pdf->getPageHeight()-10) - $ci->pdf->GetY()) ){	$ci->pdf->AddPage(isset($par['orientation'])?$par['orientation']:'P');}
			$ci->pdf->MultiCell($width,5,'Prepared:',0, 'L',false, 1,'','', true,0,'');
			$ci->pdf->MultiCell(100,5,'Application and Profilling Section:',0, 'L',false, 1,'','', true,0,'');
		
			$ci->pdf->MultiCell($width,5,'',0, 'L',false, 1,'','', true,0,'');
			$ci->pdf->MultiCell($width,5,'',0, 'L',false, 1,'','', true,0,'');
			$ci->pdf->MultiCell($width,5,'',0, 'L',false, 1,'','', true,0,'');
			$ci->pdf->MultiCell($width,5,'',0, 'L',false, 1,'','', true,0,'');
			$ci->pdf->MultiCell($width,5,'',0, 'L',false, 1,'','', true,0,'');
			$ci->pdf->Ln();
	
			$width  = 99;
			$ci->pdf->MultiCell($width,0,'Reviewed by:',0, 'L',false, 0,'','', true,0,'');
			$ci->pdf->MultiCell($width,0,'Endorsed by:',0, 'L',false, 1,'','', true,0,'');
			$ci->pdf->Ln();
			$ci->pdf->MultiCell($width,20,'',0, 'L',false, 0,'','', true,0,'');
			$ci->pdf->MultiCell($width,0,'',0, 'L',false, 1,'','', true,0,'');
			// $ci->pdf->MultiCell($width,0,'ICT Section Head',0, 'L',false, 0,'','', true,0,'');
			$ci->pdf->MultiCell($width,0,'APS Section Head',0, 'L',false, 0,'','', true,0,'');
			$ci->pdf->MultiCell($width,0,'Assistant Dept Head / UPD Division Head',0, 'L',false, 1,'','', true,0,'');

			
		}
		
		 // if(isset($_SERVER['SERVER_SOFTWARE']) && strpos($_SERVER['SERVER_SOFTWARE'],'Google App Engine') !== false){
			// $directoryPath  = 'gs://fifo/';
		// }
		// else{
			$directoryPath='./';
		// }
		
		
		if(!is_dir($directoryPath.'pdf/')){
			//wtf is rmkdir?
			rmkdir($directoryPath.'pdf/');
			if(!is_dir($directoryPath.$par['folder_name'])) rmkdir('./'.$par['folder_name']);
		}
		
		 if(file_exists($directoryPath.'pdf/'.$par['folder_name'].$par['file_name'].'.pdf')){
			 @unlink($directoryPath.'pdf/'.$par['folder_name'].$par['file_name'].'.pdf');
		 }
		
		$ci->pdf->Output($directoryPath.'pdf/'.$par['folder_name'].'/'.$par['file_name'].'.pdf', 'F');
		
		if(file_exists($directoryPath.'pdf/'.$par['folder_name'].'/'.$par['file_name'].'.pdf')){
			die(json_encode(array('success'=>true,'match'=>0)));
		}
		else{
			die(json_encode(array('success'=>true,'match'=>1)));
		}
	}
	
	function MultiCell($params){
		// print_r($params);
		$ci =& get_instance();
		
		$bMargin 				= $ci->pdf->getBreakMargin();
		$auto_page_break	= $ci->pdf->AutoPageBreak;
		
		$this->SetAutoPageBreak(false, 0);
		$params['numLines'] 	= isset($params['numLines']) ?  $params['numLines'] : 1;
		$params['height'] 			= (!empty($params['height'])) ? $params['height'] : 5;
		$params['lineHeight'] 	= isset($params['lineHeight']) ?  $params['lineHeight'] : 1.25;
		$params['align']			= (!empty($params['align'])) ? $params['align']:'L';
		$params['border']			= (!empty($params['border'])) ? $params['border']:0;
		$ci->pdf->setCellHeightRatio($params['lineHeight']);
		$ci->pdf->MultiCell(	$params['width'],
												$params['height'],
												$params['text'],
												$border = $params['border'],
												$align = $params['align'],
												$fill = false,
												$ln = 1,
												$params['x'],
												$params['y'],
												$reseth = true,
												$stretch = 0,
												$ishtml = false,
												$autopadding = true,
												$maxh = $params['height'],
												$valign = 'T',
												$fitcell = false 
											);				
		
		$this->SetAutoPageBreak($auto_page_break, $bMargin);

	}
	
	function is_date_check( $str ){
		$d = DateTime::createFromFormat('Y-m-d', $str);
		return $d && $d->format('Y-m-d') === $str;
	}
	
	function postData(){
		if(isset($_POST)){
			$data = array();
			$extraParams = extraParameter();
			if( isset( $_POST['module'] ) ){
				$module =  $_POST['module'];
			}
			else{
				$module =  ($extraParams['module'] ? $extraParams['module']:'');
			}
			
			foreach( $_POST as $key=>$val ) {
				$keyReplace =  str_replace($module,'',$key); 
				$data[$keyReplace] =  ($val)?$val:null;
				if( isset($extraParams['dateFormat']) ) {			
					if( (int)validateDate($val) == 1 ){
						$data[$keyReplace] =  date($extraParams['dateFormat'],strtotime($val));
					}
				}
			}
			unset($data['unsetParams']);
			return $data;
		}
	}
	
	function extraParameter() {
		if( isset($_POST) ){
			if(isset($_POST['unsetParams'])){
				$unsetParams =  json_decode($_POST['unsetParams'],true);
				foreach( $unsetParams as $key=>$val ) {
					$extraParams[$key] =  $val;
				}
				return $extraParams;
			}
		}
	}
	
	function validateDate( $date, $format = 'Y-m-d'){
		$d = DateTime::createFromFormat($format, $date);
		return $d && $d->format($format) == $date;
	}
	
	function waterMark($orientation){
		if($orientation == 'L'){
			$ci =& get_instance();
			$ci->pdf->SetAlpha(0.1);
			$ci->pdf->Image('assets/images/CHUDD_Logo_big.png', 50, 5, 200, 200, '', '', '', true, 72);
			$ci->pdf->SetAlpha(1);
		}
		else{
			$ci =& get_instance();
			$ci->pdf->SetAlpha(0.1);
			$ci->pdf->Image('assets/images/CHUDD_Logo_big.png', 5, 30, 200, 200, '', '', '', true, 72);
			$ci->pdf->SetAlpha(1);
		}
		
	}

?>
