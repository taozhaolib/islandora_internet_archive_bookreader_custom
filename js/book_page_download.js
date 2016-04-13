
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
      
      if(urlArr.length == 2){
          var bookUrl = urlArr[0].split("//")[1].split("/")[0];
          var urlHashInfo = urlArr[1];
          var pageArr = urlHashInfo.split("/");
          if(pageArr.length != 3){
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
            var url_base = window.location.protocol + "//" + window.location.host + "/";
            var page_pids = Drupal.getPageIdByNumbers(pagesArray, book_solution_page_viewer);
        }
        else{
            pagesArray = [Drupal.settings.islandora_internet_archive_bookreader.page_object_id];
            var page_url = document.URL;
            var url_base = page_url.split("islandora/")[0];
            var page_pids = new Object;
            page_pids[Drupal.settings.islandora_internet_archive_bookreader.page_num] = Drupal.settings.islandora_internet_archive_bookreader.page_object_id;
        }
      
        if(page_pids !== null){
            
            // here build up the download links:
            var containerDivName = Drupal.settings.islandora_book_reader_downloadLinks.containerDiv;
            var fileName = Drupal.settings.islandora_book_reader_downloadLinks.fileName;
            var div = $("#"+containerDivName);

            var showDownloadBtn = $('<label id="book-page-download-links-btn" >');
            //var showDownloadBtnTxt = $('<span id="book-page-download-btntxt-show" class="book-page-download-btntxt"> Page image download links &gt;&gt;</span>');
            //var hideDownloadBtnTxt = $('<span id="book-page-download-btntxt-hide" class="book-page-download-btntxt" > &lt;&lt; Hide page download links</span>');
            var downloadLinksTableContent = "<div id='downloadTableDiv'>";
            for(var page_num in page_pids){
                var page_id = page_pids[page_num];
                var pageFileName = fileName + "_page_" + page_num;
                downloadLinksTableContent += "<a class=\"download_link\" href=\""+url_base+"islandora/object/"+page_id+"/custom/"+pageFileName+"/TN/download"+"\" >Page "+page_num+" (Thumbnail Image)</a><BR>";
                downloadLinksTableContent += "<a class=\"download_link\" href=\""+url_base+"islandora/object/"+page_id+"/custom/"+pageFileName+"/JPG/download"+"\" >Page "+page_num+" (Medium Sized JPEG)</a><BR>";
                downloadLinksTableContent += "<a class=\"download_link\" href=\""+url_base+"islandora/object/"+page_id+"/custom/"+pageFileName+"/OBJ/download"+"\" >Page "+page_num+" (Full Size TIFF)</a><BR>";
            }
            div.append(showDownloadBtn).append(downloadLinksTableContent);

        }
      }
  }
  
  //  Drupal.getBookviewerBtnInfo = function(btn){
//        var pages_array = null;        
//        var pages_info = new Object;
//
//        var page_url = document.URL;
//        var url_base = page_url.split("islandora/")[0];
//        var page_mode_array = page_url.split("#page/");
//        
//        if(null !== page_mode_array && page_mode_array.length == 2){
//            var page_mode_info = page_mode_array[1].split("/mode/");
//            if(page_mode_info !== null && page_mode_info.length == 2){
//                var page = parseInt(page_mode_info[0]);
//                var mode = page_mode_info[1];
//                var id = btn["id"];
//                var page_display = mode.substr(0,1);
//                
//                if(mode === 'thumb' || mode.indexOf('up') === 1){
//                    
//                    var total_pages = Drupal.settings.islandoraInternetArchiveBookReader.pages.length;
//                    
//                    if(null !== btn && btn !== undefined && id !== undefined && null !== btn["id"]){
//                        switch(id){
//                            case "ui-slider-handle":                                
//                                var page = parseInt($(".currentpage").html().split(" ")[1]);
//                                if(page === 1){
//                                    page_display = "1";
//                                }
//                                else if(page_display === "2" && page % 2 === 1)
//                                    page -= 1;
//                                break;
//                            case "BRicon_onepg": 
//                                page_display = "1";
//                                if(mode.substr(0,1) === "2" && page % 2 === 1 && page > 1)
//                                    page -= 1;
//                                break;
//                            case "BRicon_twopg":
//                                if(page === 1){
//                                    page = 1;
//                                    page_display = "1";
//                                }
//                                else if(mode.substr(0,1) === "1" && page % 2 === 1 && page > 1){
//                                    page -= 1;
//                                    page_display = "2";
//                                }
//                                else{
//                                    page_display = "2";
//                                }
//                                break;
//                            case "BRicon_thumb":
//                                return false;
//                                break;
//                            case "BRicon_book_left":                                
//                                if(page > 1){
//                                    if(page_display === "1")
//                                        page -= 1;
//                                    else if(page_display === "2" && page > 2 && page % 2 === 0)
//                                        page -= 2;
//                                    else if(page_display === "2" && page > 3 && page % 2 === 1)
//                                        page -= 3;
//                                    else if(page_display === "2" && page <= 3){
//                                        page = 1;
//                                        page_display = "1";
//                                    }
//                                    else if(page === 1){
//                                        page = 1;
//                                        page_display = "1";
//                                    }
//                                }
//                                else{
//                                    page_display = "1";
//                                }
//                                break;
//                            case "BRicon_book_right":
//                                if(page === total_pages){
//                                    page_display = "1";
//                                }
//                                else if(page % 2 == 0 && page_display === "2"){
//                                    page += 2;
//                                }
//                                else if(page < total_pages)
//                                    page += 1;
//                                break;
//                            default:
//                                alert("wrong clicked button!");
//                                return false;
//                                break;
//                        }
//                    }else{
//                        if(page === 1 || page === total_pages)
//                            page_display = "1";
//                        else
//                            page_display = mode.substr(0,1);
//                    }
//                    
//                    if(mode === 'thumb' && id !== 'BRicon_twopg' && id !== 'BRicon_onepg'){
//                        return false;
//                    }
//                    else{                        
//                        if(page_display === "1"){
//                            pages_array = [page];
//                        }
//                        else if(page_display === "2"){
//                            if(page === 1 || page === total_pages)
//                                pages_array = [page];                
//                            else
//                                pages_array = [page, page+1];
//                        }
//                        else{
//                            alert(page_display + " is not correct");
//                        }
//                    }
//                }
//                
//            }
//            else{
//                alert("page and mode information is not correct!");
//                return false;
//            }
//
//      }
//      else{
//        //page = parseInt(Drupal.settings.islandora_internet_archive_bookreader.current_page);
//        pages_array = [1]; 
//      }
//      
//      pages_info.pages_array = pages_array;
//      pages_info.url_base = url_base;
//      return pages_info;
//      
//  };

})(jQuery);


