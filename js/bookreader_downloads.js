/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * @file
 * Javascript file for islandora solr search facets
 */

(function ($) {
    
//  Drupal.getPageIdByNumbers = function(pages_array, pid_to_pagenum){
//      var page_ids = new Object;
//      var page_info = Drupal.settings.islandoraInternetArchiveBookReader.pages;
//      for(var i = 0; i < pages_array.length; i++){
//          if(pid_to_pagenum === true){
//              for(var pagenum in page_info){
//                    if(page_info[pagenum] === pages_array[i]){
//                        page_ids[pagenum] = pages_array[i];
//                    }
//                }                
//            }
//        else{
//            page_ids[pages_array[i]] = page_info[pages_array[i]-1].pid;
//        }
//      }
//      return page_ids;
//  };
 

  // Adds facet toggle functionality
  Drupal.behaviors.addBookreaderDownloadLinksDiv = {
    attach: function(context, settings) {
      
        var page_pids = [1,2,3];
        var old_div = $("#bookreader-download-links");
        var url_base = window.location.origin;
        var pid = Drupal.settings.islandora_internet_archive_bookreader_custom.pid;

        if(old_div){
            old_div.remove();
        }
      
        if(pid !== null){
            
            var downloadLinksDiv = $("<br><div id='bookreader-download-links'></div>");
            //var showDownloadBtn = $('<button id="book-page-download-links-btn" >');
            var showDownloadBtn = $('<label id="book-page-download-links-btn" >');
            var showDownloadBtnTxt = $('<span id="book-page-download-btntxt-show" class="book-page-download-btntxt"> Book download links &gt;&gt;</span>');
            var hideDownloadBtnTxt = $('<span id="book-page-download-btntxt-hide" class="book-page-download-btntxt" > &lt;&lt; Hide page download links</span>');
            var downloadLinksTableContent = "<div id='downloadTableDiv'><table id='downloadLinksTable'>";

            downloadLinksTableContent += "<tr>";
            downloadLinksTableContent += "<td><a class=\"download_link\" href=\""+url_base+"/islandora/object/"+pid+"/datastream/PDF/download"+"\" >Download the book PDF</a></td>";
            downloadLinksTableContent += "</tr>";

            downloadLinksTableContent += "</table></div>";
            var downloadLinksTable = $(downloadLinksTableContent);

            if(! $("#book-page-download-links").length>0) {
                $("div#book-viewer").after(downloadLinksDiv);
            }

            showDownloadBtn.prepend(showDownloadBtnTxt);
            downloadLinksDiv.prepend(showDownloadBtn).append(downloadLinksTable);

            downloadLinksTable.find('td').addClass('downloadLinksTableCell');
        }
      }
  }

})(jQuery);


