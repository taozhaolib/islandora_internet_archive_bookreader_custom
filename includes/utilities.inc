<?php

function bookreader_custom_social_link_block_view(AbstractFedoraObject $object) {
    
    global $base_url;
    $block = null;
    
    $path = drupal_get_path('module', 'islandora_internet_archive_bookreader_custom');
   
    try{
        $pid = $object->id;
        $pages = get_pages_by_book_pid($object);        
    
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
        );
    }
    catch(Exception $e){
        drupal_set_message(t('Cannot retrieve information for this book %e', array('%e' => $e)), 'error');
    }
    return $block;
}

function bookreader_custom_download_block_view(AbstractFedoraObject $object) {
    
    $fileName = get_download_file_prefix($object);    
    
    $link = $GLOBALS['base_url']."/islandora/object/".$object->id."/custom/".$fileName."/PDF/download";
    $path = drupal_get_path('module', 'islandora_internet_archive_bookreader_custom');
    $download_settings = array(
        'fileName' => $fileName,
        'containerDiv' => 'block-islandora-internet-archive-bookreader-custom-reader-block',
    );
    
    $block = array
    (
        '#markup' => t('<a href="'.$link.'">PDF book download</a><BR>'),
        '#attached' => array
          (
            'js' => array
            (
              array(
                  'type' => 'setting',
                  'path' => $path,
                  'data' => array('islandora_book_reader_downloadLinks' => $download_settings),
              ),
              array
              (
                'type' => 'file',
                'data' => $path . '/js/book_page_download.js',
              ),
            ),
            'css' => array(
                'type' => 'file',
                'data' => $path . '/css/islandora_internet_archive_bookreader_custom.css',
            ),
          ),   
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
        drupal_set_message(t('Unable to get book pages %e', array('%e' => $e)), 'error');
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

/**
 * Retrieve islandora book page from url
 *   ou repository is http://repository.ou.edu/uuid/83498398#page/%d/mode/1up or 
 *   it can be the generic url : http://repository.ou.edu/islandora/object/islandora%3A119#page/%d/mode/1up
 */

function get_page_by_url() {
    
    $url = current_path();
    if(preg_match('/((uuid\/)|(islandora\/object\/islandora)(:|%3A))((\w|-)+)($|(#|\/)\w+)/', $url, $matches)){
        return "islandora:".$matches[5];
    }
    else{
        return false;
    }
}

/**
 * 
 */
function get_book_download_id($object) {
    
}

/**
 * Retrieve the metadata information to compose the file name prefix for downloaded files instead of using 'Thumnail.JPG' or 'OBJ.tiff'
 * based on the MODS.xml of repository.ou.edu
 * This function needs extensive testing to make sure that it works with all MODS files as they may have different schema
 * 
 * @param AbstractFedoraObject $object
 */
function get_download_file_prefix(AbstractFedoraObject $object) {
    @include_once 'sites/all/libraries/tuque/Datastream.php';
    @include_once 'sites/all/libraries/tuque/FedoraApi.php';
    
    $fileNameInfo = array();
    
    try{
        $pid = $object->id;
        $stream = $object['MODS'];            
        $content = $stream->repository->api->a->getDatastreamDissemination($pid, $stream->id, $stream->createdDate, null);
        
        // build a fake $content in order to mimic the MODS data in repository.ou.edu to execute the code, development purpose only
/*        $content = "<?xml version=\"1.0\" encoding=\"utf-8\"?><mods version=\"3.5\" xsi:schemaLocation=\"http://www.loc.gov/mods/v3 http://www.loc.gov/standards/mods/v3/mods-3-5.xsd\">" */
//                        . "<name type=\"personal\" usage=\"primary\">"
//                            . "<namePart>Gaubil, Antoine</namePart>"
//                            . "<namePart type=\"date\">1689-1759</namePart>"
//                        . "</name>"
//                        . "<originInfo>"
//                            . "<place><placeTerm type=\"code\" authority=\"marccountry\">enk</placeTerm></place>"
//                            . "<place><placeTerm type=\"text\">London]</placeTerm></place>"
//                            . "<dateIssued>[1758]</dateIssued>"
//                            . "<dateIssued encoding=\"marc\">1758</dateIssued>"
//                            . "<issuance>monographic</issuance>"
//                        . "</originInfo>"
//                    . "</mods>";
        
        $namePrefix = "";
        $yearPrefix = "";
        
        $doc = new DOMDocument();
        $doc->loadXML($content);
        $names = $doc->getElementsByTagName('name');
        foreach ($names as $name){
            $nameParts = $name->getElementsByTagName('namePart');
            foreach ($nameParts as $nameNode) {
                if(!$nameNode->hasAttributes()){
                    $namePrefix = $nameNode->nodeValue;
                }
            }
        }
        $namePrefixInfo = explode(',', $namePrefix);        
        $namePrefix = trim($namePrefixInfo[0]);
        
        $originInfo = $doc->getElementsByTagName('originInfo');
        foreach ($originInfo as $info) {
            $dates = $info->getElementsByTagName('dateIssued');
            foreach ($dates as $dateNode){
                if($dateNode->hasAttribute('encoding')){
                    $yearPrefix = $dateNode->nodeValue;
                }
            }
            
        }
        
        if(empty($namePrefix) || empty($yearPrefix)){
            $uuid = explode(':', $pid);
            $uuid = trim($uuid[1]);
        }
        
        $uuid = '';
        $fileNameInfo['year'] = $yearPrefix;
        $fileNameInfo['author'] = $namePrefix;        
        $fileNameInfo['uuid'] = $uuid;
        $fileName = '';
        
        foreach ($fileNameInfo as $key => $value){
            if(!empty($value)){
                $fileName .= $value . '_';
            }
        }
        
        $fileName = rtrim($fileName, '_');
    } catch (Exception $ex) {
        drupal_set_message(t('Unable to build the prefix for the downloaded file names %e', array('%e' => $ex)), 'error');
    }
    
    return $fileName;
}

function save_islandora_bookreader_custom_configuration($collection, $pdf_download_show, $page_download_show, $social_link_show) {
    
    global $user;
    $uid = $user->uid;
    
    $settings_arr = array();
    
    $settings = variable_get("bookreader_custom_configurations");
    if(!empty($settings)){
        $settings_arr = json_decode($settings, TRUE);
    }
    $settings_arr[$collection]["pdf_download_show"] = $pdf_download_show;
    $settings_arr[$collection]["page_download_show"] = $page_download_show;
    $settings_arr[$collection]["social_link_show"] = $social_link_show;
    
    variable_set("bookreader_custom_configurations", json_encode($settings_arr));
}

function load_islandora_bookreader_custom_configuration($pid) {
    $configurations = variable_get("bookreader_custom_configurations");
    if(!empty($configurations)){
        $configurations = json_decode($configurations, TRUE);
    }
    return $configurations[$pid];
}

function get_parent_collection_pid(AbstractFedoraObject $object) {
    module_load_include('inc', 'islandora_internet_archive_bookreader_custom', 'includes/utilities');
    
    $repository = $object->repository;
    $pid = $object->id;
    
    $query = <<<EOQ
    PREFIX islandora-rels-ext: <http://islandora.ca/ontology/relsext#>
    PREFIX fedora-rels-ext: <info:fedora/fedora-system:def/relations-external#>
    SELECT DISTINCT ?object ?label
    FROM <#ri>
    WHERE {
        <info:fedora/!pid> ?collection_predicate ?object;
        <fedora-model:label> ?label .
        ?object <fedora-model:state> <fedora-model:Active>
        .
        !optionals
        !filters
          }
        !order
EOQ;

    $query_optionals = (array) module_invoke('islandora_xacml_api', 'islandora_basic_collection_get_query_optionals', 'view');
    $query_filters = (array) module_invoke('islandora_xacml_api', 'islandora_basic_collection_get_query_filters');
    $filter_map = function ($filter) {
      return "FILTER($filter)";
    };
    $collection_predicate_filters = "sameTerm(?collection_predicate, <fedora-rels-ext:isPartOf>)";
    $collection_predicate_filters .= " || sameTerm(?collection_predicate, <fedora-rels-ext:isMemberOfCollection>) || sameTerm(?collection_predicate, <fedora-rels-ext:isMemberOf>)";
    $query_filters[] = $collection_predicate_filters;
    $query_order = "ORDER BY DESC(?label)";
    $query = format_string($query, array(
      '!optionals' => !empty($query_optionals) ? ('OPTIONAL {{' . implode('} UNION {', $query_optionals) . '}}') : '',
      '!filters' => implode(' ', array_map($filter_map, $query_filters)),
      '!order' => $query_order,
    ));
    $query = format_string($query, array(
      '!pid' => $pid,
    ));

    $results = $repository->ri->sparqlQuery($query, 'unlimited');

    if (count($results) > 0) {
      return $parent = $results[0]['object']['value'];
    }
}

function hasAccessCustomFeature(AbstractFedoraObject $object, $type){
    $has_access = FALSE;
    
    $pid = $object->id;
    if(!empty($pid)){
        $parent = get_parent_collection_pid($object);
        $configurations = load_islandora_bookreader_custom_configuration($parent);
        if(!empty($configurations)){
            switch($type){
                case "pdf_generator":
                    $has_access = $configurations['pdf_download_show'];
                    break;
                case "download_block":
                    $has_access = $configurations['page_download_show'];
                    break;
                default:
                    break;
            }
        }
    }
    
    return $has_access;
}