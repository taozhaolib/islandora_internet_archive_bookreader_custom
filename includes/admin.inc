<?php

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function get_collection_options() {
    /**
    * Searches through available collection objects.
    *FILTER(regex(?label, '$search_value', 'i') || regex(str(?pid), '$search_value', 'i'))
    * @param string $search_value
    *   Returns a json array of matching collections.
    */
    $tuque = islandora_get_tuque_connection();
    $sparql_query = <<<EOQ
        SELECT ?pid ?label
        WHERE {
          ?pid <fedora-model:label> ?label ;
               <fedora-model:hasModel> <info:fedora/islandora:collectionCModel> .
          
        }
EOQ;
    $results = $tuque->repository->ri->sparqlQuery($sparql_query);
    $return = array();
    foreach ($results as $objects) {
      $return[$objects['pid']['value']] = t('@label (@pid)', array(
        '@label' => $objects['label']['value'],
        '@pid' => $objects['pid']['value'],
      ));
    }
    //drupal_json_output($return);
    return $return;
}

/** 
 * 
 */

function get_islandora_bookreader_configuration_by_collection($collection) {
    global $user;
    $uid = $user->uid;
    $values = array();
    
    $query = db_select('islandora_bookreader_custom', 'f');
    
    $query->fields('f', array('pid', 'collection_id'));
    $query->fields('f', array('pdf_download_show', 'pdf_download_show'));
    $query->fields('f', array('page_download_show', 'page_download_show'));
    $query->fields('f', array('social_link_show', 'social_link_show'));
    $query->fields('f', array('book_pdf_source_type', 'book_pdf_source_type'));
    $query->fields('f', array('creator', 'creator'));

    $query->condition('f.pid', $collection, '=');
    
    $result = $query->execute();
    foreach ($result as $record) {
        $values['view'][] = $record->vid;
        $values['show_name'] = $record->show_name;
    }
    return $values;
}