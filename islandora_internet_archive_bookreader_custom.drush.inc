<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function islandora_internet_archive_bookreader_custom_drush_command() {
  $items = array();
  $items['islandora_bookreader_pdf_generator'] = array(
    'callback' => 'islandora_internet_archive_bookreader_custom_pdf_generator_drush',
    'description' => 'generates islandora PDF books',
    'file' => 'includes/book_pdf_generator.inc',
    'arguments' => array(
      'pid' => "The Fedora PID to process",
    ),
    'options' => array(),
    'examples' => array(
      'simple example' => 'drush -u 1 --root=/var/www/drupal7 -l http://localhost islandora_bookreader_pdf_generator islandora:1',
    ),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUPAL_LOGIN,
  );

  return $items;
}

function islandora_internet_archive_bookreader_custom_pdf_generator_drush($pid) {
    module_load_include('inc', 'islandora_internet_archive_bookreader_custom', 'includes/book_pdf_generator');
    islandora_internet_archive_bookreader_custom_pdf_generator_pid($pid);
}