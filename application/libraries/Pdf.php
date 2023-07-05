<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

require_once dirname(__FILE__) . '/tcpdf/tcpdf.php';

class Pdf extends TCPDF
{
    function __construct()
    {
        parent::__construct();
	}

	protected $title;

    public function setTitle($var){
        $this->title = $var;
    }

    // Page footer
    public function Footer() {
		// $timestamp = date("d/m/Y ");
		$timestamp = '09/03/2021';
		$this->SetRightMargin(-1); // right margin issue on footer
        // Position at 10 mm from bottom
		$this->SetY(-12);
		
		// Cell($w, $h=0, $txt='', $border=0, $ln=0, $align='', $fill=0, $link='', $stretch=0, $ignore_min_height=false, $calign='T', $valign='M')

		$complex_cell_border = array(
			'T' => array('width' => 1, 'color' => array(255,255,255)),
		 );
		
		// $pdf->Line(5, 10, 80, 30, $style);
		// $this->Line(25, 287, 206, 287);
		$this->Line(5, 287, 206, 287);
		// $style = ['width' => 0.2, 'cap' => 'butt', 'join' => 'miter', 'dash' => 0, 'color' => [0, 0, 0]];
		// $this->SetLineStyle($style);

		$footerRight = 'Date Printed: '.$timestamp.' '.$this->PageNo().' /'.$this->getAliasNbPages();
		$this->Cell(0, 10, $txt = $this->title, $complex_cell_border, false, 'L', 0, '', 0, false, 'T', 'M');  
		$this->Cell(0, 10, $footerRight, 0, false, 'R', 0, '', 0, false, 'T', 'M' );
		
    }
}
