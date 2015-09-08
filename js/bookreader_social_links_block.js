/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function ($) {
    Drupal.getPageUrl = function(pages, pageNum){
        
        var pageUrl = '';        
        var pageInfo = new Object();
        var currentUrl = document.URL;
        
        $.each(pages, function(pagePid, info){
            if(pageNum == info.page){
                if(currentUrl.indexOf("/uuid/") > 0){
                    pageUrl = window.location.host + "/uuid/" + pagePid.split(":")[1];       
                }
                else{
                    pageUrl = window.location.host + "/islandora/object/" + pagePid;
                }
                if(pageUrl.indexOf("http") < 0){
                    pageUrl = window.location.protocol + "//" + pageUrl;
                }  
                pageInfo.pageUrl = pageUrl;
                pageInfo.pid = pagePid;
                pageInfo.pageLabel = info.label;
                pageInfo.pageImgUrl = pageUrl + "/datastream/TN/view";
            }
        });
        
        return pageInfo;
    };
    
    Drupal.behaviors.addSocialLinkDiv = {
            attach: function(context, settings){

            var blockContainer = $("div#block-islandora-internet-archive-bookreader-custom-social-link-block");
            if(blockContainer){
                var divContent = blockContainer.find(".content");
            }
            
            var hostDivName = "bookreaderSocialLinkDiv";
            blockContainer.append("<span class='socialLinkTitle'>"+Drupal.settings.islandora_book_reader_socialLinks.bookTitle+"</span><BR><div id=" + hostDivName + "></div>");                        

            var pages = jQuery.parseJSON(Drupal.settings.islandora_book_reader_socialLinks.pages);
            
            var pageNum = 1;
            var pageInfo = new Object();
            var pageLabel = '';
            var pageImgUrl = '';
            var currentUrl = document.URL;
            
            // ge the page object id:            
            try{
                pageNum = currentUrl.split("#page/")[1].toString().split("/")[0].toString();
            }
            catch(err){
                pageNum = '1';
            }
            
            pageInfo = Drupal.getPageUrl(pages, pageNum);
            
            var hostPageDivName = "pageSocialLinkDiv";
            blockContainer.append("<BR><span class='socialLinkTitle'>Current page:<BR>"+pageInfo.pageLabel+"</span><BR><div id=" + hostPageDivName + "></div>");
            
            // Set up the data used for rendering the social links:
            var shareLinkData = new Array();
            var shareBookLinkDataObj = new Object;
            var sharePageLinkDataObj = new Object;
            
            shareBookLinkDataObj.title = Drupal.settings.islandora_book_reader_socialLinks.bookTitle;
            shareBookLinkDataObj.url = Drupal.settings.islandora_book_reader_socialLinks.bookUrl;
            shareBookLinkDataObj.urlText = Drupal.settings.islandora_book_reader_socialLinks.bookUrlText;
            shareBookLinkDataObj.imgUrl = Drupal.settings.islandora_book_reader_socialLinks.pageImgUrl === '' ? pageInfo.pageImgUrl : Drupal.settings.islandora_book_reader_socialLinks.pageImgUrl;           
            shareBookLinkDataObj.desc = Drupal.settings.islandora_book_reader_socialLinks.bookDesc;  
            shareBookLinkDataObj.hostDivName = hostDivName;
            shareLinkData.push(shareBookLinkDataObj);
            
            sharePageLinkDataObj.title = pageInfo.pageLabel;            
            sharePageLinkDataObj.urlText = Drupal.settings.islandora_book_reader_socialLinks.pageUrl === '' ? pageInfo.pageUrl : Drupal.settings.islandora_book_reader_socialLinks.pageUrl ;
            sharePageLinkDataObj.imgUrl = Drupal.settings.islandora_book_reader_socialLinks.pageImgUrl === '' ? pageInfo.pageImgUrl : Drupal.settings.islandora_book_reader_socialLinks.pageImgUrl;
            sharePageLinkDataObj.url = Drupal.settings.islandora_book_reader_socialLinks.pageUrl === '' ? pageInfo.pageUrl : Drupal.settings.islandora_book_reader_socialLinks.pageUrl ;            
            sharePageLinkDataObj.desc = pageInfo.pageLabel;
            sharePageLinkDataObj.hostDivName = hostPageDivName;
            shareLinkData.push(sharePageLinkDataObj);
            
            if(!Drupal.settings.islandora_socialLinks){
                Drupal.settings.islandora_socialLinks = new Object();
            }
            Drupal.settings.islandora_socialLinks.shareLinkData = shareLinkData;
            Drupal.settings.islandora_socialLinks.socialLinkTypes = "fb,tw";
            
        }
    };
})(jQuery);
