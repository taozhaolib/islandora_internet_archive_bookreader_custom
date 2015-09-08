<?php

function bookreader_custom_social_link_block_view() {
    
    global $base_url;
    $block = null;
   
    try{
        $pid = get_pid_by_url();
        $object = islandora_object_load($pid);
        $pages = get_pages_by_book_pid($object);
        $path = drupal_get_path('module', 'islandora_internet_archive_bookreader_custom');
    
        $bookreader_social_link_settings = array(
          'bookHostDivName' => "bookSocialLinkDiv",
          'bookPrecedingDivName' => "",
          'bookNextDivName' => "booklink",
          'pageHostDivName' => "pageSocialLinkDiv",
          'pagePrecedingDivName' => "",
          'pageNextDivName' => "pageview",
          'bookTitle' => $object->label,
          'bookUrl' => url($base_url."/islandora/object/".$pid,array('absolute' => true)),
          'bookUrlText' => t($base_url."/islandora/object/".$pid),
          'pageUrl' => '',
          'pageImgUrl' => '',
          'PageDesc' => '',
          'bookDesc' => $object->label,
          'pages' => $pages
        );

        $block = array
        (
          'subject' => t('Share the book:'),
          'content' => array
          (
            '#attached' => array
            (
              'js' => array
              (
                array(
                    'type' => 'setting',
                    'data' => array('islandora_book_reader_socialLinks' => $bookreader_social_link_settings),
                ),
                array
                (
                  'type' => 'file',
                  'data' => $path . '/js/bookreader_social_links_block.js',
                ),
                array
                (
                  'type' => 'file',
                  'data' => $path . '/js/social_link.js',
                ),
              ),
              'css' => array(
                  'type' => 'file',
                  'data' => $path . '/css/islandora_internet_archive_bookreader_custom.css',
              ),
            ),
          ),
        );
    }
    catch(Exception $e){
        drupal_set_message(t('Cannot retrieve information for this book %e', array('%e' => $e)), 'error');
    }
    return $block;
}

function bookreader_custom_download_block_view() {
    
    $link = $GLOBALS['base_url']."/islandora/object/".get_pid_by_url()."/datastream/PDF/download";

    $block = array
    (
      'subject' => t('Download the book:'),
      'content' => array('#markup' => t('<a href="'.$link.'">PDF book link</a>')),
    );
    return $block;
}

function get_pages_by_book_pid ($object) {
    
    try {
        if(!empty($object)){
            module_load_include('inc', 'islandora_paged_content', 'includes/utilities');
            $page_ids = islandora_paged_content_get_pages($object);
            return json_encode($page_ids);
        }
    }
    catch (Exception $e) {
        drupal_set_message(t('Unable to connect to the repository %e', array('%e' => $e)), 'error');
    }
}
/**
 * Retrieve islandora object pid from url
 *   ou repository is http://repository.ou.edu/uuid/83498398 or 
 *   it can be the generic url : http://repository.ou.edu/islandora/object/islandora%3A119
 */

function get_pid_by_url() {
    
    $url = current_path();
    if(preg_match('/((uuid\/)|(islandora\/object\/islandora)(:|%3A))((\w|-)+)($|(#|\/)\w+)/', $url, $matches)){
        return "islandora:".$matches[5];
    }
    else{
        return false;
    }
}