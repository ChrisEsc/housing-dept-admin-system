<?php

require_once "my_model.php";
class Page extends My_Model {
    /**
    */
    function set_page($page) {
        try 
        {
            $this->load->library('session');
            $id                 = $this->session->userdata('id');
            $user_id            = $this->session->userdata('user_id');
            $user_division_id   = $this->session->userdata('division_id');


            if(!$id){
                header("Location:".base_url().'index.php/login');
                exit();
            }

            #module
            $commandText = "SELECT module_name FROM modules WHERE link = '$page'";
            $result = $this->db->query($commandText);
            $query_result = $result->result(); 
            $module_name = $query_result[0]->module_name;

            #access right to Maintenance(...) ADD / EDIT / DELETE
            $commandText = "SELECT * FROM modules_users WHERE module_id = (SELECT id FROM modules WHERE module_name = 'Maintenance Module') AND user_id = $id AND (uadd = 1 OR uedit = 1 OR udelete = 1)";
            $result = $this->db->query($commandText);
            $query_result = $result->result(); 

            #generating menu         
            $this->load->model('Menu');
            $data['menu']       = $this->Menu->set_userid($id);
            $data['username']   = $this->session->userdata('name');
            $data['admin']      = $this->session->userdata('admin');
            $data['user_type']  = $this->session->userdata('type');
            $user_type = $data['user_type'];
            $data['department'] = $this->session->userdata('department_description'). ' Department';
            $data['department_id'] = $this->session->userdata('department_id');
            $data['division'] = $this->session->userdata('division_description');
            $data['division_id'] = $this->session->userdata('division_id');
            $data['module_name'] = $module_name;
            $data['incoming_communications_status'] = $this->session->userdata('incoming_communications_status');
            $data['outgoing_communications_status'] = $this->session->userdata('outgoing_communications_status');
            if(count($query_result) > 0) $data['boolMaintenance'] = 1;
            else $data['boolMaintenance'] = 0;



            $user_division_id = $this->session->userdata('division_id');
			$user_section_id = $this->session->userdata('section_id');
			$user_section_head = $this->session->userdata('section_head');
            $filter = " AND a.division_id = $user_division_id";


            if($page == 'thumbnailmenu')
            {     

                $data['notification_name'] = "";

                if($user_type == 'Staff')
                {


                    if($user_section_head ==1 or ($user_section_id <> 28 and $user_section_id <> 0))
			        {
				        $sec_filter_1 =$user_section_id.'%'; // e.g. 5 is the first index
				        $sec_filter_2 = '%,'.$user_section_id.'%'; // e.g. 5 is the next value								
				        $filter = " AND a.division_id LIKE '%$user_division_id%' AND 
							        (CASE WHEN LENGTH('$user_section_id') = 1 THEN  a.section_id LIKE '$sec_filter_1' OR a.section_id LIKE '$sec_filter_2'
																        ELSE a.section_id LIKE '%$user_section_id%' END)
				        ";
			        }

                    #pending incoming communications actions taken
                    $commandText = "SELECT count(*) as count
                                    FROM adminservices_records_header a
                                    LEFT JOIN record_types b ON a.record_type_id = b.id
                                    LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
                                    LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
                                    LEFT JOIN adminservices_records_actions_taken f ON a.action_taken_id = f.id
                                    WHERE a.status = 'Pending Action Taken'                                       
                                        AND a.communication_type = 'Incoming'
                                        AND a.active = 1";
                    $commandText .= $filter;
                    $result = $this->db->query($commandText);
                    $query_result = $result->result(); 
                    $pending_incoming_actionstaken_count = $query_result[0]->count;

                    #pending incoming communications acknowledgement
                    $commandText = "SELECT count(*) as count
                                    FROM adminservices_records_header a       
                                    LEFT JOIN record_types b ON a.record_type_id = b.id
                                    LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
                                    LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
                                    LEFT JOIN adminservices_records_actions_taken f ON a.action_taken_id = f.id
                                    WHERE a.status = 'Pending Acknowledgement'                                        
                                        AND a.communication_type = 'Incoming'
                                        AND a.active = 1";
                    $commandText .= $filter;
                    $result = $this->db->query($commandText);
                    $query_result = $result->result(); 
                    $pending_incoming_acknowledgements_count = $query_result[0]->count;

                    #pending incoming communications on process
                    $commandText = "SELECT count(*) as count
                                    FROM adminservices_records_header a
                                    LEFT JOIN record_types b ON a.record_type_id = b.id
                                    LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
                                    LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
                                    LEFT JOIN adminservices_records_actions_taken f ON a.action_taken_id = f.id
                                    WHERE a.status = 'On Process'                                        
                                        AND a.communication_type = 'Incoming'
                                        AND a.active = 1";
                    $commandText .= $filter;
                    $result = $this->db->query($commandText);
                    $query_result = $result->result(); 
                    $pending_incoming_onprocess_count = $query_result[0]->count;
                  

                    
                    #query the position description, to be used to check if dept. head or not
                    $commandText = "SELECT b.description AS position_desc
                                    FROM staff a
                                        LEFT JOIN positions b ON b.id = a.position_id
                                    WHERE a.id = $user_id";
                    $result = $this->db->query($commandText);
                    $position_result = $result->result();

                    #if department head
                    if($position_result[0]->position_desc == 'City Government Department Head II' or ($user_section_id == 29 ))
                    {
                        #pending incoming communications division assigning
                        $commandText = "SELECT count(*) as count
                                        FROM adminservices_records_header a
                                            LEFT JOIN record_types b ON a.record_type_id = b.id
                                            LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
                                            LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
                                            LEFT JOIN adminservices_records_actions_taken f ON a.action_taken_id = f.id
                                        WHERE a.status = 'Pending Division Assigning'
                                            AND a.communication_type = 'Incoming'
                                            AND a.active = 1";
                        $result = $this->db->query($commandText);
                        $query_result = $result->result(); 
                        $pending_incoming_divisionassigning_count = $query_result[0]->count;

                        #pending incoming communications actions taken count for department head
                        $commandText = "SELECT count(*) as count
                                        FROM adminservices_records_header a
                                            LEFT JOIN record_types b ON a.record_type_id = b.id
                                            LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
                                            LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
                                            LEFT JOIN divisions e ON a.division_id = e.id
                                            LEFT JOIN adminservices_records_actions_taken f ON a.action_taken_id = f.id
                                        WHERE a.status = 'Pending Action Taken'
                                            AND a.communication_type = 'Incoming'
                                            AND a.active = 1";
                        $result = $this->db->query($commandText);
                        $query_result = $result->result(); 
                        $pending_incoming_actionstaken_count = $query_result[0]->count;

                        #pending incoming communications on process count for department head
                        $commandText = "SELECT count(*) as count
                                        FROM adminservices_records_header a
                                            LEFT JOIN record_types b ON a.record_type_id = b.id
                                            LEFT JOIN adminservices_records_from_to c ON a.from_id = c.id
                                            LEFT JOIN adminservices_records_from_to d ON a.to_id = d.id
                                            LEFT JOIN divisions e ON a.division_id = e.id
                                            LEFT JOIN adminservices_records_actions_taken f ON a.action_taken_id = f.id
                                        WHERE a.status = 'On Process'
                                            AND a.communication_type = 'Incoming'
                                            AND a.active = 1";
                        $result = $this->db->query($commandText);
                        $query_result = $result->result(); 
                        $pending_incoming_onprocess_count = $query_result[0]->count;

                        if(isset($pending_incoming_divisionassigning_count) && $pending_incoming_divisionassigning_count > 0)
                        $data['notification_name'] .= '<a href="./adminservices_incoming_records?status=1" style="text-decoration:none;color:red"><b>('.$pending_incoming_divisionassigning_count.') Pending Incoming Communications Division Assigning.</b></a><br>';
                    }
                    

                    if(isset($pending_incoming_actionstaken_count) && $pending_incoming_actionstaken_count > 0)
                        $data['notification_name'] .= '<a href="./adminservices_incoming_records?status=3" style="text-decoration:none;color:red"><b>('.$pending_incoming_actionstaken_count.') Pending Incoming Communications Action/s Taken.</b></a><br>';

                    if(isset($pending_incoming_onprocess_count) && $pending_incoming_onprocess_count > 0)
                        $data['notification_name'] .= '<a href="./adminservices_incoming_records?status=5" style="text-decoration:none;color:red"><b>('.$pending_incoming_onprocess_count.') Pending Incoming Communications On Process.</b></a><br>';

                    if(isset($pending_incoming_acknowledgements_count) && $pending_incoming_acknowledgements_count > 0)
                        $data['notification_name'] .= '<a href="./adminservices_incoming_records?status=2" style="text-decoration:none;color:red"><b>('.$pending_incoming_acknowledgements_count.') Pending Incoming Communications Acknowledgement.</b></a><br>';
                }

                $data['notification_name'] .= 'We highly appreciate ideas that will enhance our system, click ICT Development Team at the footer of this page and contact us.<br><br><br>';
                //$data['notification_name'] .= $pending_incoming_acknowledgements_count . '<br>';
                //$data['notification_name'] .= $pending_incoming_onprocess_count . '<br>';
                //$data['notification_name'] .= $pending_incoming_actionstaken_count . '<br>';
            }

            $module = array('module' => $page);
            $this->session->set_userdata($module);
            #validating user access to module
            $this->load->model('Module_Validation');
            $this->Module_Validation->module_name($id, $page);


            $this->load->view('templates/header', $data);
            $this->load->view($page.'/index');
            $this->load->view('templates/footer');
            $this->load->helper('common_helper');
        }
        catch (Exception $e) 
        {
            print $e->getMessage();
            die();  
        }
    }
}