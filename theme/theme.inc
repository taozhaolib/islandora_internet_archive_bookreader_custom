<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//function islandora_internet_archive_bookreader_preprocess_html (&$variables) {
//    global $base_url;
//    $object = $variables['object'];
//    $pid = $object->id;
//    $module_path = drupal_get_path('module', 'islandora_internet_archive_bookreader_custom');
//    
//    $bookreader_alter_settings = array(
//        'pid' => $pid,
//    );
//    drupal_add_js(array('islandora_internet_archive_bookreader_custom' => $bookreader_alter_settings), 'setting');
//    drupal_add_js($module_path . '/js/bookreader_downloads.js', array('group' => JS_LIBRARY));
//    
//    
//    // *** the following code is for generating the download links *** //
//    $download_settings = array(
//      'div' => "#pageview"
//    );
//    drupal_add_js(array('islandora_internet_archive_bookreader' => $download_settings), 'setting');
//    drupal_add_js("$module_path/js/book_page_download.js", array(
//      'group' => JS_THEME,
//    ));
//   
//    drupal_add_css($module_path . "/css/islandora_internet_archive_bookreader_custom.css");
//}

//function islandora_book_page_preprocess_html (&$variables) {
//    // *** the following code is for generating the download links *** //  
//  $module_path = drupal_get_path('module', 'islandora_internet_archive_bookreader_custom');
//  $object = $variables['object'];
//
//  $download_settings = array(
//    'div' => "#book-page-viewer",
//    'book_solution_page_viewer' => true,
//    'page_object_id' => $object->id,
//    'page_num' =>$object->label
//  );
//
//  drupal_add_js(array('islandora_internet_archive_bookreader' => $download_settings), 'setting');
//  
//  drupal_add_js("$module_path/js/book_page_download.js", array(
//    'group' => JS_THEME,
//  ));
//  
//  $print_settings = array(
//      'image_path' => $GLOBALS['base_url']."/$module_path/images/print.jpg"
//  );
//  
//  drupal_add_js(array('islandora_internet_archive_bookreader' => $print_settings), 'setting');
//  
//  drupal_add_css($module_path . "/css/islandora_internet_archive_bookreader_custom.css");
//
//}