
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
    
  Drupal.getPageIdByNumbers = function(pages_array, pid_to_pagenum){
      var page_ids = new Object;
      var page_info = Drupal.settings.islandoraInternetArchiveBookReader.pages;
      for(var i = 0; i < pages_array.length; i++){
          if(pid_to_pagenum === true){
              for(var pagenum in page_info){
                    if(page_info[pagenum] === pages_array[i]){
                        page_ids[pagenum] = pages_array[i];
                    }
                }                
            }
        else{
            page_ids[pages_array[i]] = page_info[pages_array[i]-1].pid;
        }
      }
      return page_ids;
  };
  
  Drupal.getBookviewerBtnInfo = function(btn){
        var pages_array = null;        
        var pages_info = new Object;

        var page_url = document.URL;
        var url_base = page_url.split("islandora/")[0];
        var page_mode_array = page_url.split("#page/");
        
        if(null !== page_mode_array && page_mode_array.length == 2){
            var page_mode_info = page_mode_array[1].split("/mode/");
            if(page_mode_info !== null && page_mode_info.length == 2){
                var page = parseInt(page_mode_info[0]);
                var mode = page_mode_info[1];
                var id = btn["id"];
                var page_display = mode.substr(0,1);
                
                if(mode === 'thumb' || mode.indexOf('up') === 1){
                    
                    var total_pages = Drupal.settings.islandoraInternetArchiveBookReader.pages.length;
                    
                    if(null !== btn && btn !== undefined && id !== undefined && null !== btn["id"]){
                        switch(id){
                            case "ui-slider-handle":                                
                                var page = parseInt($(".currentpage").html().split(" ")[1]);
                                if(page === 1){
                                    page_display = "1";
                                }
                                else if(page_display === "2" && page % 2 === 1)
                                    page -= 1;
                                break;
                            case "BRicon_onepg": 
                                page_display = "1";
                                if(mode.substr(0,1) === "2" && page % 2 === 1 && page > 1)
                                    page -= 1;
                                break;
                            case "BRicon_twopg":
                                if(page === 1){
                                    page = 1;
                                    page_display = "1";
                                }
                                else if(mode.substr(0,1) === "1" && page % 2 === 1 && page > 1){
                                    page -= 1;
                                    page_display = "2";
                                }
                                else{
                                    page_display = "2";
                                }
                                break;
                            case "BRicon_thumb":
                                return false;
                                break;
                            case "BRicon_book_left":                                
                                if(page > 1){
                                    if(page_display === "1")
                                        page -= 1;
                                    else if(page_display === "2" && page > 2 && page % 2 === 0)
                                        page -= 2;
                                    else if(page_display === "2" && page > 3 && page % 2 === 1)
                                        page -= 3;
                                    else if(page_display === "2" && page <= 3){
                                        page = 1;
                                        page_display = "1";
                                    }
                                    else if(page === 1){
                                        page = 1;
                                        page_display = "1";
                                    }
                                }
                                else{
                                    page_display = "1";
                                }
                                break;
                            case "BRicon_book_right":
                                if(page === total_pages){
                                    page_display = "1";
                                }
                                else if(page % 2 == 0 && page_display === "2"){
                                    page += 2;
                                }
                                else if(page < total_pages)
                                    page += 1;
                                break;
                            default:
                                alert("wrong clicked button!");
                                return false;
                                break;
                        }
                    }else{
                        if(page === 1 || page === total_pages)
                            page_display = "1";
                        else
                            page_display = mode.substr(0,1);
                    }
                    
                    if(mode === 'thumb'){
                        return false;
                    }
                    else{                        
                        if(page_display === "1"){
                            pages_array = [page];
                        }
                        else if(page_display === "2"){
                            if(page === 1 || page === total_pages)
                                pages_array = [page];                
                            else
                                pages_array = [page, page+1];
                        }
                        else{
                            alert(page_display + " is not correct");
                        }
                    }
                }
                
            }
            else{
                alert("page and mode information is not correct!");
                return false;
            }

      }
      else{
        page = parseInt(Drupal.settings.islandora_internet_archive_bookreader.current_page);
        pages_array = [page]; 
      }
      
      pages_info.pages_array = pages_array;
      pages_info.url_base = url_base;
      return pages_info;
      
  };
  
  Drupal.behaviors.addBtnIds = {
      attach: function(context, settings) {
      $(".onepg").attr("id","BRicon_onepg");
        $(".twopg").attr("id","BRicon_twopg");
        $(".thumb").attr("id","BRicon_thumb");
        $(".book_left").attr("id","BRicon_book_left");
        $(".book_right").attr("id","BRicon_book_right");
        $(".ui-slider-handle").attr("id","ui-slider-handle");
        
      $("#BRicon_onepg, #BRicon_twopg, #BRicon_thumb, #BRicon_book_left, #BRicon_book_right, #ui-slider-handle").each(function(){
            //alert($(this).click);
            //if($(this).click === undefined || !$(this).click){
                $(this).mouseup(Drupal.behaviors.addDownloadLinksDiv.attach);                            
            //}
        });
      }
  }

  // Adds facet toggle functionality
  Drupal.behaviors.addDownloadLinksDiv = {
    attach: function(context, settings) {
      
        var old_div = $("#book-page-download-links");
        if(old_div){
            old_div.remove();
        }

        var pages_array = null;
        var book_solution_page_viewer = Drupal.settings.islandora_internet_archive_bookreader.book_solution_page_viewer;
        
        if(!book_solution_page_viewer === true){
            var pages_info = Drupal.getBookviewerBtnInfo(this);
            pages_array = pages_info.pages_array;
            var url_base = pages_info.url_base;
            var page_pids = Drupal.getPageIdByNumbers(pages_array, book_solution_page_viewer);
        }
        else{
            pages_array = [Drupal.settings.islandora_internet_archive_bookreader.page_object_id];
            var page_url = document.URL;
            var url_base = page_url.split("islandora/")[0];
            var page_pids = new Object;
            page_pids[Drupal.settings.islandora_internet_archive_bookreader.page_num] = Drupal.settings.islandora_internet_archive_bookreader.page_object_id;
        }
      
        if(page_pids !== null){
            
            // here build up the download links:
            var div = Drupal.settings.islandora_internet_archive_bookreader.div;
            var downloadLinksDiv = $("<br><div id='book-page-download-links'></div>");
            //var showDownloadBtn = $('<button id="book-page-download-links-btn" >');
            var showDownloadBtn = $('<label id="book-page-download-links-btn" >');
            var showDownloadBtnTxt = $('<span id="book-page-download-btntxt-show" class="book-page-download-btntxt"> Page image download links &gt;&gt;</span>');
            var hideDownloadBtnTxt = $('<span id="book-page-download-btntxt-hide" class="book-page-download-btntxt" > &lt;&lt; Hide page download links</span>');
            var downloadLinksTableContent = "<div id='downloadTableDiv'><table id='downloadLinksTable'>";
            for(var page_num in page_pids){

                var page_id = page_pids[page_num];
                downloadLinksTableContent += "<tr>";
                downloadLinksTableContent += "<td><a class=\"download_link\" href=\""+url_base+"islandora/object/"+page_id+"/datastream/TN/download"+"\" >Page "+page_num+" (Thumbnail Image)</a></td>";
                downloadLinksTableContent += "<td><a class=\"download_link\" href=\""+url_base+"islandora/object/"+page_id+"/datastream/JPG/download"+"\" >Page "+page_num+" (Medium Sized JPEG)</a></td>";
                downloadLinksTableContent += "<td><a class=\"download_link\" href=\""+url_base+"islandora/object/"+page_id+"/datastream/OBJ/download"+"\" >Page "+page_num+" (Full Size TIFF)</a></td>";
                downloadLinksTableContent += "</tr>";

            }
            downloadLinksTableContent += "</table></div>";
            var downloadLinksTable = $(downloadLinksTableContent);

            if(! $("#book-page-download-links").length>0) {
                $(div).after(downloadLinksDiv);
            }

            showDownloadBtn.prepend(showDownloadBtnTxt);
            downloadLinksDiv.prepend(showDownloadBtn).append(downloadLinksTable);

        //      showDownloadBtn.click(function(){
        //         downloadLinksTable.toggle('1500');
        //         showDownloadBtnTxt.toggle();
        //         hideDownloadBtnTxt.toggle();
        //      }).prepend(showDownloadBtnTxt).prepend(hideDownloadBtnTxt);

              //hideDownloadBtnTxt.hide();
              //downloadLinksTable.hide();
              downloadLinksTable.find('td').addClass('downloadLinksTableCell');
        }
      }
  }

})(jQuery);


