<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * book PDF generator:
 */


function islandora_internet_archive_bookreader_custom_pdf_generator_pid ($pid, $options = array('-density' => '96','-compress' => 'LZW',)) {
    module_load_include('inc', 'islandora', 'includes/derivatives');
    try{
          $object = islandora_object_load($pid);
          $messages = array();
          $new_pid = str_replace(":", "-", $pid);
          $targetdir = drupal_realpath('temporary://') ."/". $new_pid."/";          
          islandora_remove_defer_derivatives_flag($object);
          $messages[$pid][] = "A folder ".$new_pid." has been created to store the datastream files and temporary PDF files for book ".$pid."\n";
          if(!file_exists($targetdir))
                drupal_mkdir($targetdir); 
          $messages[$pid][] = "book ".$pid." is ready to generate the PDF file.\n";
          $book_pdf_base_name = $new_pid."_PDF.pdf"; // "islandora-119_PDF.pdf"
          $book_pdf_path = $targetdir.$book_pdf_base_name; // "temporary://islandora-119/islandora-119_PDF.pdf"
          $messages[$pid][] = "The book PDF will be saved at ".$book_pdf_path."\n";
    }
    catch(Exception $ex){
        $messages[$pid][] =  "Cannot generate PDF for this book: book object cannot be loaded or cannot generate directory to store files.\n";
    }

    
    module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
    module_load_include('inc', 'islandora_paged_content', 'includes/batch');
    $page_ids = islandora_paged_content_get_pages($object);//drupal_realpath
    islandora_paged_content_create_pdf_batch($object, $page_ids, $options);
    $pdf_pages_completed = false;
    $pages_count = count($page_ids);
    $count = 0;
  
    foreach($page_ids as $page_info) {
        $count++;
        try{
            $page_id = $page_info['pid'];
            $page = islandora_object_load($page_id);
            if (!islandora_paged_content_can_derive($page, 'PDF')) {
                $messages[$pid][] = "This book contains a page that cannot be converted to PDF!\n";
                $messages[$pid]['result'] = 'Creation of the PDF book of '. $object->label . ' has failed!';
                break;
            }
            $mime_detector = new MimeDetect();
            $ext = $mime_detector->getExtension($page['JPG']->mimeType);

            $base_name = str_replace(':', '-', $page_id."_JPG.{$ext}");
            $pdf_base_name = $base_name.".pdf";
            $pdf_source_file = $targetdir.$pdf_base_name;
            if(file_exists($pdf_source_file)) {
                $messages[$pid][] = "This book page ".$page_id." has already exists so PDF generation is skipped!\n";
                $messages[$pid]['pdf'][$page_id] = $pdf_source_file;
                if(islandora_paged_content_update_datastream($page, $pdf_source_file, 'PDF')){
                    $messages[$pid][] = "datastream for page ".$page_id." has been updated.\n";
                }
                if($count == $pages_count){
                    $pdf_pages_completed = true;
                    break;
                }
                continue;
            }
            
            $source_file = $targetdir.$base_name; //temporary://islandora-120_OBJ.jpg
            if(!file_exists($source_file)){
                $data = $page['JPG'] ? $page['JPG'] : $page['OBJ'];
                $data->getContent($source_file);
            }
            
            $pdf_file = islandora_paged_content_convert_to_pdf($source_file, $options);
            if($pdf_file){
              if(islandora_paged_content_update_datastream($page, $pdf_file, 'PDF')){
                  $messages[$pid][] = "datastream for page ".$page_id." has been updated.\n";
              }
            }//"/usr/bin/convert -density 96 -compress LZW /tmp/islandora-96/islandora-118_JPG.jp2 /tmp/islandora-96/islandora-118_JPG.jp2.pdf"
            //"-density 96 -compress LZW /tmp/islandora-119/islandora-120_JPG.jp2 /tmp/islandora-119/islandora-120_JPG.jp2.pdf"
            else{
                $messages[$pid][] = "Generation of page PDF or page PDF datastream update for page ".$page_id." is wrong!\n";
                $messages[$pid]['result'] = 'Creation of the PDF book of '. $object->label . ' has failed!';
                break;
            }
            $messages[$pid][] = "This book page ".$page_id." has already exists so PDF generation is skipped!\n";
            $messages[$pid]['pdf'][$page_id] = $pdf_source_file;
            if($count == $pages_count){
              $pdf_pages_completed = true;
              break;
            }
        } catch (Exception $ex) {
            $messages[$pid][] = "The book's PDF generation is disrupted at page ".$page_id."\n";
            $messages[$pid]['result'] = 'Creation of the PDF book of '. $object->label . ' has failed!';
        }
      
    }
    if($pdf_pages_completed == true){
        if(!file_exists($book_pdf_path)) {
            trY{
                $book_pdf_generation = islandora_paged_content_pdf_combine($messages[$pid]['pdf'], $book_pdf_path);
                if($book_pdf_generation){
                    $messages[$pid][] = "The book PDF has been successfully generated.\n";                      
                    unset($messages[$pid]['pdf']);
                }
            }
            catch(Exception $ex){
                $messages[$pid][] = "Generation of book PDF or book PDF datastream update for page is wrong!\n";
                $messages[$pid]['result'] = 'Creation of the PDF book of '. $object->label . ' has failed!';
            }
        }
        if(islandora_paged_content_update_datastream($object, $book_pdf_path, 'PDF')){
            $messages[$pid][] = "Successfully updated the book's PDF datastream.\n";    
            $messages[$pid]['result'] = 'The PDF book of '. $object->label . ' has been successfully created!';
            $dh = opendir($targetdir);
            while($file = readdir($dh))
            {
                if(!is_dir($file))
                {
                    @unlink($targetdir.$file);
                }
            }
            closedir($dh);
        }
        else{
            $messages[$pid][] = "Failed to update the book's PDF datastream.\n";
            $messages[$pid]['result'] = 'Creation of the PDF book of '. $object->label . ' has failed!';
        }
        $messages_implode = "";
        foreach ($messages[$pid] as $message) {
            $messages_implode .= $message;
        }
        file_put_contents($targetdir.$new_pid.'.txt', $messages_implode);
        $result = $messages[$pid]['result'];
        unset($messages);
        return $result;
    }
}