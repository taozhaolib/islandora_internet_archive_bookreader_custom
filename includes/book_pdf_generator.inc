<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * book PDF generator:
 * 
 * 1. Generates the PDF file for each page image and saves it to the Drupal tmp folder
 * 2. Updates the PDF datastream of the page
 * 3. Generates the PDF file for the book after the program iterates through all the pages
 * 4. Updates the PDF datastream of the book
 * 5. Deletes the PDF and jpg or tiff files in the tmp folder after the PDF book is generated
 * 6. Write the messages into the txt log file which is saved in the tmp folder named based on the book pid and date-time
 * 
 * Further optimization idea: Import two page images at one time, and update all the page PDF datastreams at one time?
 * 
 */


function islandora_internet_archive_bookreader_custom_pdf_generator_pid ($pid, $is_drush = false, $options = array('-density' => '96','-compress' => 'LZW',)) {
    module_load_include('inc', 'islandora', 'includes/derivatives');
    try{
        $object = islandora_object_load($pid);

        $targetdir = getPdfBookDir($pid);          
        islandora_remove_defer_derivatives_flag($object);

        if(!file_exists($targetdir)){
            drupal_mkdir($targetdir); 
        }

        module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
        module_load_include('inc', 'islandora_paged_content', 'includes/batch');
        $page_ids = islandora_paged_content_get_pages($object);//drupal_realpath
    //    islandora_paged_content_create_pdf_batch($object, $page_ids, $options);
        $pages_count = count($page_ids);

        $batch = array(
            'operations' => array(),
            'finished' => 'book_page_pdf_process_finished',
            'title' => t('Generating PDF book ...'),
            'init_message' => t('Start to generate PDF book...'),
            'progress_message' => t('Processed @current out of @total.'),
            'error_message' => t('PDF book generation has encountered an error.'),
            'file' => drupal_get_path('module', 'islandora_internet_archive_bookreader_custom').'/includes/book_pdf_generator.inc',
        );

        foreach($page_ids as $page_info) {
            $page_id = $page_info['pid'];
            $batch['operations'][] = array('book_page_pdf_processor', array($object, $page_id, $options, $pages_count));      
        }

        $batch['operations'][] = array('book_page_pdf_processor_cleanup', array($object));

        batch_set($batch);
        
        if($is_drush){
            $batch = &batch_get();
            $batch['progressive'] = FALSE;
            drush_backend_batch_process();
        }
        else{
            $url = get_object_link_by_url();
            batch_process($url);
        }
    }
    catch(Exception $ex){
        drupal_set_message(t('Cannot generate PDF for this book: book object cannot be loaded or cannot generate directory to store files. %e', array('%e' => $e)), 'error');
    }
}

/**
 * The batch processor.
 */
function book_page_pdf_processor($object, $page_id, $options, $pages_count, &$context) {

    $pid = $object->id;
    $title = $object->label; 
    
    if (!isset($context['results'][$pid])) {
        $context['results'][$pid] = array();
        $context['results'][$pid]['message'] = array();
        $context['results']['count'] = 0;
    }
    
    $context['results']['count']++;
    if($context['results']['count'] == $pages_count){
        $context['results']['pdf_pages_completed'] = true;
    }
    
    try{            
        module_load_include('inc', 'islandora_paged_content', 'includes/utilities');                       
        $targetdir = getPdfBookDir($pid);
        
        $page = islandora_object_load($page_id);
        if (!islandora_paged_content_can_derive($page, 'PDF')) {
            $context['results'][$pid]['message'][] = t("This book contains a page that cannot be converted to PDF!\n");
            $context['results'][$pid]['message'][] = t('Creation of the PDF book of '. $title . ' has failed!\n');
            return;
        }
        $mime_detector = new MimeDetect();
        $ext = $mime_detector->getExtension($page['JPG']->mimeType);

        $base_name = str_replace(':', '-', $page_id."_JPG.{$ext}");
        $pdf_base_name = $base_name.".pdf";
        $pdf_source_file = $targetdir.$pdf_base_name;

        if(file_exists($pdf_source_file)) {
            $context['results'][$pid]['message'][] = t("This book page ".$page_id." has already exists so PDF generation is skipped!\n");
            $context['results'][$pid]['pdf'][$page_id] = $pdf_source_file;
            if(islandora_paged_content_update_datastream($page, $pdf_source_file, 'PDF')){
                $context['results'][$pid]['message'][] = t("PDF datastream for page ".$page_id." has been updated.\n");
            }            
            return;
        }

        $source_file = $targetdir.$base_name; //temporary://islandora-120_OBJ.jpg
        if(!file_exists($source_file)){
            $data = $page['JPG'] ? $page['JPG'] : $page['OBJ'];
            $data->getContent($source_file);
        }

        $pdf_file = islandora_paged_content_convert_to_pdf($source_file, $options);
        if($pdf_file){
            $context['results'][$pid]['message'][] = t("This book page ".$page_id." has a PDF file generated.\n");
          if(islandora_paged_content_update_datastream($page, $pdf_file, 'PDF')){
              $context['results'][$pid]['message'][] = t("datastream for page ".$page_id." has been updated.\n");
          }
        }
        else{
            $context['results'][$pid]['message'][] = t("Generation of page PDF or page PDF datastream update for page ".$page_id." is wrong!\n");
            $context['results'][$pid]['message'][] = t('Creation of the PDF book of '. $title . ' has failed!');
            return;
        }        
        $context['results'][$pid]['pdf'][$page_id] = $pdf_source_file;
    } catch (Exception $ex) {
        $context['results'][$pid]['message'][] = t("The book's PDF generation is disrupted at page ".$page_id."\n");
        $context['results'][$pid]['message'][] = t('Creation of the PDF book of '. $title . ' has failed!');
    }
    
}

function book_page_pdf_processor_cleanup($object, &$context) {
       
    $pdf_pages_completed = $context['results']['pdf_pages_completed'];
    $pid = $object->id;
    $targetdir = getPdfBookDir($pid);
    $pdfBookName = getPdfBookName($pid);
    
    try{
        if($pdf_pages_completed == true){
            if(!file_exists($pdfBookName)) {

                module_load_include('inc', 'islandora_paged_content', 'includes/utilities');

                trY{
                    $book_pdf_generation = islandora_paged_content_pdf_combine($context['results'][$pid]['pdf'], $pdfBookName);
                    if($book_pdf_generation){
                        $context['results'][$pid][] = "The book PDF has been successfully generated.\n";                      
                        unset($context['results'][$pid]['pdf']);
                    }
                }
                catch(Exception $ex){
                    $context['results'][$pid]['message'][] = "Generation of book PDF or book PDF datastream update for page is wrong!\n";
                    $context['results'][$pid]['message'][] = 'Creation of the PDF book of '. $object->label . ' has failed!\n';
                }
            }
            if(islandora_paged_content_update_datastream($object, $pdfBookName, 'PDF')){
                $context['results'][$pid]['message'][] = "Successfully updated the book's PDF datastream.\n";    
                $context['results'][$pid]['message'][] = 'The PDF book of '. $object->label . ' has been successfully created!';
                $dh = opendir($targetdir);
                while($file = readdir($dh))
                {
                    $path_info = pathinfo($file);
                    if(!is_dir($file) && $path_info['extension'] != 'txt')
                    {
                        @unlink($targetdir.$file);
                    }
                }
                closedir($dh);
            }
            else{
                $context['results'][$pid]['message'][] = "Failed to update the book's PDF datastream.\n";
                $context['results'][$pid]['message'][] = 'Creation of the PDF book of '. $object->label . ' has failed!';
            }
            $messages_implode = "";
            foreach ($context['results'][$pid]['message'] as $message) {
                $messages_implode .= $message;
            }

            $log = getLogFileName($pid);
            file_put_contents($log, $messages_implode);
            $result = $context['results'][$pid]['message'];
            unset($context);
            return $result;
        }
    }
    catch(Exception $e){
        drupal_set_message(t('Failed to execute the cleanup after PDF book generation . %e', array('%e' => $e)), 'error');
    }
}

function book_page_pdf_process_finished($success, $results, $operations) {
  if ($success) {
    drupal_set_message('PDF book generation is complete!');
  }
  else {
    $error_operation = reset($operations);
    $message = t('An error occurred while processing %error_operation with arguments: @arguments', array(
      '%error_operation' => $error_operation[0],
      '@arguments' => print_r($error_operation[1], TRUE)
    ));
    drupal_set_message($message, 'error');
  }
  //drupal_set_message(l('Run again', 'my_module/batch_fix'));
  
}

function getPdfBookDir($pid){
    $new_pid = str_replace(":", "-", $pid);
    return drupal_realpath('temporary://') ."/". $new_pid."/";   
}

function getPdfBookName($pid){
    $new_pid = str_replace(":", "-", $pid);
    $book_pdf_base_name = $new_pid."_PDF.pdf"; 
    $targetdir = getPdfBookDir($pid);
    return $targetdir.$book_pdf_base_name; 
}

function getLogFileName($pid){
    $new_pid = str_replace(":", "-", $pid);
    $targetdir = getPdfBookDir($pid);
    $date = date("Y-m-d-H-i-s");
    return $targetdir.$new_pid.'-'.$date.'.txt';
}