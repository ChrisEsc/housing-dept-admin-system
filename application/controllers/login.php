<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Login extends CI_Controller {
	/**
	*/
	private function modulename($type)
	{		
		if($type == 'link')
			return 'login';
		else 
			return 'Login';
	}

	public function index(){
		$this->load->helper('common_helper');
		$this->load->view($this->modulename('link').'/index');
		$this->load->view('templates/footer');
	}

	public function userauthentication() 
	{
		if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		    header('Access-Control-Allow-Origin: *');
		    header('Access-Control-Allow-Methods: POST, GET, DELETE, PUT, PATCH, OPTIONS');
		    header('Access-Control-Allow-Headers: token, Content-Type');
		    header('Access-Control-Max-Age: 1728000');
		    header('Content-Length: 0');
		    header('Content-Type: text/plain');
		    die();
		}

		header('Access-Control-Allow-Origin: *');
		header('Content-Type: application/json');
		try 
		{
			$user_name	= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('user_name'))));
			$password	= mysqli_real_escape_string($this->db->conn_id, strip_tags(trim($this->input->post('password'))));
			$type		= $this->input->post('type');
			
			$this->load->model('Cipher');
			$this->Cipher->secretpassphrase();			
			$encryptedtext = $this->Cipher->encrypt($password);

			$commandText = "SELECT 	
								a.id,
								a.user_id,
								b.department_id,
							    b.division_id,
							    b.section_id,
							    b.employee_id,
								a.admin,
								a.username,	
							    b.division_head,
							    b.section_head,
							    c.description AS department_description,
							    d.description AS division_description,
							    e.description AS position_description,
							    CONCAT(b.fname, ' ', b.mname, ' ', b.lname) AS sname,
							    eSignature
							FROM users a 
								JOIN staff b ON a.user_id = b.id
							    JOIN departments c ON b.department_id = c.id 
							    JOIN divisions d ON b.division_id = d.id
							    LEFT JOIN positions e ON b.position_id = e.id
							WHERE a.username = '$user_name' 
							    AND a.password = '$encryptedtext'
							    AND a.active = 1
							    AND a.type ='$type'";
			$result = $this->db->query($commandText);
			$query_result = $result->result();

			if(count($query_result) == 0) 
			{
				$this->load->library('session');
				$commandText = "insert into audit_logs (transaction_id, transaction_type, query_type, date_created, time_created) values (0, 'Failed Attempt! (Username:".mysqli_real_escape_string($this->db->conn_id, $user_name).")', 'Login', '".date('Y-m-d')."', '".date('H:i:s')."')";
				$result = $this->db->query($commandText);
				$data = array("success"=> false, "data"=>"Username/password incorrect. Please contact system administrator.");
				die(json_encode($data));
			}
			#set session
			$this->load->library('session');

			$newdata = array(
				'id'					=> $query_result[0]->id,
				'user_id'				=> $query_result[0]->user_id,
				'department_id'			=> $query_result[0]->department_id,
				'division_id'			=> $query_result[0]->division_id,
				'section_id'			=> $query_result[0]->section_id,
				'employee_id'			=> $query_result[0]->employee_id,
				'admin'					=> $query_result[0]->admin,
				'un'					=> $query_result[0]->username,
				'division_head'			=> $query_result[0]->division_head,
				'section_head' 			=> $query_result[0]->section_head,
				'name'  				=> mb_strtoupper($query_result[0]->sname),
				'department_description'=> $query_result[0]->department_description,
				'division_description'	=> $query_result[0]->division_description,
				'position_description'	=> $query_result[0]->position_description,
				'type'					=> $type,
				'logged_in' 			=> TRUE,
				'time' 					=> date('Y-m-d H:i:s')
			);
			$this->session->set_userdata($newdata);

			$route = "thumbnailmenu";	 

			$this->load->model('Logs'); $this->Logs->audit_logs(0, 'login', 'Login', 'Successfully Login!');
		

			$arr = array();  
			$arr['success'] = true;
			$arr['data'] = $route;
			$arr['name'] = mb_strtoupper($query_result[0]->sname);
			$arr['staffID'] = $query_result[0]->user_id;
			$arr['division_head'] = $query_result[0]->division_head;
			$arr['division_id'] = $query_result[0]->division_id;
			$arr['section_head'] = $query_result[0]->section_head;
			$arr['section_id'] = $query_result[0]->section_id;
			$arr['eSignature'] = $query_result[0]->eSignature;
			die(json_encode($arr));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}

	public function emailvalidation() 
	{
		try 
		{ 			
			#update session
			$email	= strip_tags(trim($this->input->post('email')));
			
			$commandText = "SELECT 	
								IF(a.type = 'Staff', UPPER(CONCAT(b.fname, ' ', b.mname, ' ', b.lname)), UPPER(CONCAT(c.fname, ' ', c.mname, ' ', c.lname))) AS fullname,
								a.username,
								a.password
							FROM users a 
								LEFT JOIN staff b ON b.id = a.user_id
							WHERE a.email = '".mysqli_real_escape_string($this->db->conn_id, $email)."' 
								AND a.active = 1";
			$result = $this->db->query($commandText);
			$query_result = $result->result(); 

			if(count($query_result) == 0) 
			{
				$data = array("success"=> false, "data"=>"Email not found in the system's database.");
				die(json_encode($data));
			}

			$this->load->model('Cipher');
			$this->Cipher->secretpassphrase();		
			$fullname = $query_result[0]->fullname;
			$username = $query_result[0]->username;
			$decryptedtext = $this->Cipher->decrypt($query_result[0]->password);

			$html  = '
				<br>
                <table width="30%" style="padding: 2px;background: #ff6666;border: solid 1px white;">
                <tr style="background: #ff6666;">
                <td colspan="2" style="padding: 2px;" width="100%"><font color=white size=2>User Information</font></td>
                </tr>
                <tr >
                <td align="right" style="background: #ffbec2; padding: 2px;" ><font color=black size=2>Name</td>
                <td align="left" style="background: #ffd9d9; padding: 2px;" ><font color=black size=2>'.$fullname.'</td>
                </tr>
                <tr >
                <td align="right" style="background: #ffbec2; padding: 2px;" ><font color=black size=2>Username</td>
                <td align="left" style="background: #ffd9d9; padding: 2px;" ><font color=black size=2>'.$username.'</td>
                </tr>
                <tr >
                <td align="right" style="background: #ffbec2; padding: 2px;" ><font color=black size=2>Password</td>
                <td align="left" style="background: #ffd9d9; padding: 2px;" ><font color=black size=2>'.$decryptedtext.'</td>
                </tr>
                </table>
                <br>
                <p>We highly appreciate ideas that will enhance our system. click ICT Development Team at the footer of CHUDD Internal Application and contact us. Thank you!
                <br><font color=red>This message is generated by an automatic notification system. Please don\'t respond to this e-mail.</font></p>';
                    

			$this->load->library('phpmailer/phpmailer');
			$mail = new PHPMailer();
	        $mail->IsSMTP(); // we are going to use SMTP
	        $mail->SMTPAuth   	= true; // enabled SMTP authentication
	        $mail->SMTPSecure 	= "ssl";  // prefix for secure protocol to connect to the server
	        $mail->Host       	= getenv('SMTP_HOST'); 	// SMTP server
	        $mail->Port       	= getenv('SMTP_PORT'); 	// SMTP port to connect
	        $mail->Username   	= getenv('SMTP_USERNAME');  
	        $mail->Password   	= getenv('SMTP_PASSWORD');            
	        $mail->From     	= getenv('SMTP_FROM');
	        $mail->FromName 	= getenv('SMTP_FROM_NAME');

	        $mail->isHTML(true);
	        $mail->Subject    	= "Notification - Username & Password Request";
	        $mail->Body    		= $html;
	        $mail->AltBody    	= "Plain text message";
	        $mail->AddAddress($email, $fullname);

	        if(!$mail->Send())
	        	$arr = array("success"=> false, "data"=>"Connection Problem / Error: " . $mail->ErrorInfo);
	        else
	        	$arr = array("success"=> true, "data"=>"Successfully Sent! Please check your email @ ".$email.". Thank you!");

			die(json_encode($arr));
		} 
		catch (phpmailerException $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
		catch(Exception $e) 
		{
			$data = array("success"=> false, "data"=>$e->getMessage());
			die(json_encode($data));
		}
	}
}