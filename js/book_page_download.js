
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
    
  Drupal.getPageIdByNumbers = function(pagesArray, pid_to_pagenum){
      var page_ids = new Object;
      var page_info = Drupal.settings.islandoraInternetArchiveBookReader.pages;
      for(var i = 0; i < pagesArray.length; i++){
          if(pid_to_pagenum === true){
              for(var pagenum in page_info){
                    if(page_info[pagenum] === pagesArray[i]){
                        page_ids[pagenum] = pagesArray[i];
                    }
                }                
            }
        else{
            page_ids[pagesArray[i]] = page_info[pagesArray[i]-1].pid;
        }
      }
      return page_ids;
  };
  
  Drupal.getDownloadPageIds = function(){
      var url = document.URL;
      var urlArr = url.split("#page/");
      
      if(urlArr.length === 2){
          var bookUrl = urlArr[0].split("//")[1].split("/")[0];
          var urlHashInfo = urlArr[1];
          var pageArr = urlHashInfo.split("/");
          if(pageArr.length !== 3){
              return null;
          }
          var currentPage = parseInt(pageArr[0]);
          var mode = pageArr[2];
          var pagesInfo = new Object;
          var btn = Drupal.settings.islandora_book_reader_downloadLinks.btn;
          var total_pages = Drupal.settings.islandoraInternetArchiveBookReader.pages.length;
          var pagesArray;
          
          if(mode == "2up"){
              if(btn == "BRicon_book_right" || btn == "BRicon_book_left"){
                  pagesArray = Drupal.getBookviewerBtnInfo(currentPage, mode);
              }
              else{
                  if(currentPage === 1 || (currentPage === total_pages && total_pages % 2 === 0)){
                      pagesArray = [currentPage];
                  }
                  else{
                    pagesArray = [currentPage, parseInt(currentPage) + 1];                    
                  }
              }              
          }
          else{
                pagesArray = [currentPage];
          }
            pagesInfo.pagesArray = pagesArray;
            pagesInfo.url_base = bookUrl;
          Drupal.settings.islandora_book_reader_downloadLinks.btn = null;
          return pagesInfo;
      }
      else{
          Drupal.settings.islandora_book_reader_downloadLinks.btn = null;
          return null;
      }
  }
  
  Drupal.behaviors.addBtnIds = {
      attach: function(context, settings) {
      $(".onepg").attr("id","BRicon_onepg");
        $(".twopg").attr("id","BRicon_twopg");
        $(".thumb").attr("id","BRicon_thumb");
        $(".book_left").attr("id","BRicon_book_left");
        $(".book_right").attr("id","BRicon_book_right");
        $(".ui-slider-handle").attr("id","ui-slider-handle");
        
      $("#BRicon_onepg, #BRicon_twopg, #BRicon_thumb, #BRicon_book_left, #BRicon_book_right, #ui-slider-handle").each(function(){
            $(this).mouseup(function() {
                Drupal.behaviors.addBtnClick($(this));
            });                    
        });
        
        window.onhashchange = function(){
            Drupal.behaviors.addDownloadLinksDiv.attach();
            //$(this).mouseup(Drupal.behaviors.addDownloadLinksDiv.attach);
        }
      }
  };
  
  Drupal.behaviors.addBtnClick = function(btn) {
        Drupal.settings.islandora_book_reader_downloadLinks.btn = btn[0].id;
        //alert(Drupal.settings.islandora_book_reader_downloadLinks.btn);
  }
  
  Drupal.getBookviewerBtnInfo = function(page, mode){
        var pagesArray = null;
        var id = Drupal.settings.islandora_book_reader_downloadLinks.btn;
        
        if(null !== id){
            
            var page_display = mode.substr(0,1);
            var total_pages = Drupal.settings.islandoraInternetArchiveBookReader.pages.length;

            switch(id){
                case "BRicon_book_left":                                
                    if(page === 1){
                        page_display = "1";
                    }
                    break;
                case "BRicon_book_right":
                    if(page == total_pages){
                        if(total_pages % 2 === 0){
                            page_display = "1";
                        }
                        else{
                            page -= 1;
                        }
                    }
                    else{
                        page -= 1;
                    }
                    break;
                default:
                    alert("wrong clicked button!");
                    return false;
                    break;
            }
            
            if(page <= 0){
                page_display = "1";
                page = 1;
            }

            if(page_display === "1"){
                pagesArray = [page];
            }
            else if(page_display === "2"){
                pagesArray = [page, page+1];
            }
            else{
                alert(page_display + " is not correct");
            }
      }
      else{
        //page = parseInt(Drupal.settings.islandora_internet_archive_bookreader.current_page);
        pagesArray = [1]; 
      }
      
      return pagesArray;
      
  };

  // Adds facet toggle functionality
  Drupal.behaviors.addDownloadLinksDiv = {
    attach: function(context, settings) {
      
        var oldDiv = $("#downloadTableDiv");
        if(oldDiv)
            oldDiv.remove();
        
        var pagesArray = null;
        if(Drupal.settings.islandora_internet_archive_bookreader)
            var book_solution_page_viewer = Drupal.settings.islandora_internet_archive_bookreader.book_solution_page_viewer;
        
        if(!book_solution_page_viewer === true){
            var pages_info = Drupal.getDownloadPageIds();
            pagesArray = pages_info.pagesArray;
            var page_pids = Drupal.getPageIdByNumbers(pagesArray, book_solution_page_viewer);
        }
        else{
            pagesArray = [Drupal.settings.islandora_internet_archive_bookreader.page_object_id];
            var page_url = document.URL;
            var page_pids = new Object;
            page_pids[Drupal.settings.islandora_internet_archive_bookreader.page_num] = Drupal.settings.islandora_internet_archive_bookreader.page_object_id;
        }
      
        if(page_pids !== null){
            
            // here build up the download links:
            var containerDivName = Drupal.settings.islandora_book_reader_downloadLinks.containerDiv;
            var fileName = Drupal.settings.islandora_book_reader_downloadLinks.fileName;
            var objUrlBase = Drupal.settings.islandora_book_reader_downloadLinks.objectUrlBase;
            var div = $("#"+containerDivName);

            var showDownloadBtn = $('<label id="book-page-download-links-btn" >');
            //var showDownloadBtnTxt = $('<span id="book-page-download-btntxt-show" class="book-page-download-btntxt"> Page image download links &gt;&gt;</span>');
            //var hideDownloadBtnTxt = $('<span id="book-page-download-btntxt-hide" class="book-page-download-btntxt" > &lt;&lt; Hide page download links</span>');
            var downloadLinksTableContent = "<div id='downloadTableDiv'>";
            for(var page_num in page_pids){
                var page_id = page_pids[page_num];
                var pageFileName = fileName + "_page_" + page_num;
                if(objUrlBase.includes('/islandora/object/')){
                    downloadLinksTableContent += "<a class=\"download_link\" href=\""+objUrlBase+page_id+"/custom/"+pageFileName+"/TN/download"+"\" >Page "+page_num+" (Thumbnail Image)</a><BR>";
                    downloadLinksTableContent += "<a class=\"download_link\" href=\""+objUrlBase+page_id+"/custom/"+pageFileName+"/JPG/download"+"\" >Page "+page_num+" (Medium Sized JPEG)</a><BR>";
                    downloadLinksTableContent += "<a class=\"download_link\" href=\""+objUrlBase+page_id+"/custom/"+pageFileName+"/OBJ/download"+"\" >Page "+page_num+" (Full Size TIFF)</a><BR>";
                }
                else if(objUrlBase.includes('/uuid/')){
                    var uuid = page_id.split(':')[1];
                    downloadLinksTableContent += "<a class=\"download_link\" href=\""+objUrlBase+uuid+"/custom/"+pageFileName+"/TN/download"+"\" >Page "+page_num+" (Thumbnail Image)</a><BR>";
                    downloadLinksTableContent += "<a class=\"download_link\" href=\""+objUrlBase+uuid+"/custom/"+pageFileName+"/JPG/download"+"\" >Page "+page_num+" (Medium Sized JPEG)</a><BR>";
                    downloadLinksTableContent += "<a class=\"download_link\" href=\""+objUrlBase+uuid+"/custom/"+pageFileName+"/OBJ/download"+"\" >Page "+page_num+" (Full Size TIFF)</a><BR>";
                }
            }
            div.append(showDownloadBtn).append(downloadLinksTableContent);

        }
      }
  };
  
})(jQuery);


