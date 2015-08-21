<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function islandora_internet_archive_bookreader_preprocess_html (&$variables) {
    $pid = $variables['object']->id;
    $module_path = drupal_get_path('module', 'islandora_internet_archive_bookreader_custom');
    
    $bookreader_alter_settings = array(
        'pid' => $pid,
    );
    
    drupal_add_js(array('islandora_internet_archive_bookreader_custom' => $bookreader_alter_settings), 'setting');
    drupal_add_js($module_path . '/js/bookreader_downloads.js', array('group' => JS_LIBRARY));
    drupal_add_css($module_path . "/css/islandora_internet_archive_bookreader_custom.css");
}