/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


(function ($) {
    
    Drupal.setSocialLinkHostDiv = function(linkDataObj, hostDivName, procedingDivName, nextDivName){
        
            var hostDiv = $("#"+hostDivName);
            var procedingDiv = $("#"+procedingDivName);
            var nextDiv = $("#"+nextDivName);
            
            if(hostDivName && hostDiv && hostDiv.length > 0){
                linkDataObj.hostDivName = hostDivName;                
            }
            else if(procedingDivName && procedingDiv && procedingDiv.length > 0){
                if(hostDivName){
                    procedingDiv.after($("<div id=\""+hostDivName + "\"></div>"));
                    linkDataObj.hostDivName = hostDivName;
                }
                else{
                    procedingDiv.after($("<div id=\"bookreaderSocialLinkDiv\"></div>"));
                    linkDataObj.hostDivName = "bookreaderSocialLinkDiv";
                }
            }
            else if(nextDivName && nextDiv && nextDiv.length > 0){
                if(hostDivName){
                    nextDiv.before($("<div id=\""+hostDivName + "\"></div>"));
                    linkDataObj.hostDivName = hostDivName;
                }
                else{
                    nextDiv.before($("<div id=\"bookreaderSocialLinkDiv\"></div>"));
                    linkDataObj.hostDivName = "bookreaderSocialLinkDiv";
                }
            }
            else{
                alert("Cannot find the perching div for social links!");
                return false;
            }
    };
  
    Drupal.behaviors.addSocialLinkDiv = {
        attach: function(context, settings){
            var bookHostDivName = Drupal.settings.islandora_book_reader_socialLinks.bookHostDivName;
            var bookProcedingDivName = Drupal.settings.islandora_book_reader_socialLinks.bookPrecedingDivName;
            var bookNextDivName = Drupal.settings.islandora_book_reader_socialLinks.bookNextDivName;
            var pageHostDivName = Drupal.settings.islandora_book_reader_socialLinks.pageHostDivName;
            var pageProcedingDivName = Drupal.settings.islandora_book_reader_socialLinks.pagePrecedingDivName;
            var pageNextDivName = Drupal.settings.islandora_book_reader_socialLinks.pageNextDivName;
            
            var pageNum = 1;
            var pageId = '';
            var pageUrl = '';
            
            // ge the page object id:
            var currentUrl = document.URL;
            var index = 0;
            var pageImgUrl = 'http://192.168.11.142:8181/islandora/object/islandora%3A54';
            var re = /\/islandora/g;
            var count = 0;
            while(res = re.exec(currentUrl) && count < 2){
                index = re.lastIndex;
                count++;
            }
            
            if(index > 0){
                pageImgUrl = currentUrl.substring(0,index+3);
            }
            
            if(currentUrl.indexOf('#page/') > 0){
                pageNum = currentUrl.split('#page/')[1].split('/mode')[0];
                var pageInfo = Drupal.getPageIdByNumbers(new Array(pageNum), false);
                pageId = pageInfo[pageNum];
                pageUrl = pageImgUrl + pageId.split(':')[1];
                pageImgUrl = pageUrl + "/datastream/TN/view";
            }
            else{
                alert('The current URL cannot be interpreted!');
                return false;
            }
            
            // Set up the data used for rendering the social links:
            var shareLinkData = new Array();
            var shareBookLinkDataObj = new Object;
            var sharePageLinkDataObj = new Object;
            
            shareBookLinkDataObj.title = Drupal.settings.islandora_book_reader_socialLinks.bookTitle;
            shareBookLinkDataObj.url = Drupal.settings.islandora_book_reader_socialLinks.bookUrl;
            shareBookLinkDataObj.urlText = Drupal.settings.islandora_book_reader_socialLinks.bookUrlText;
            shareBookLinkDataObj.imgUrl = Drupal.settings.islandora_book_reader_socialLinks.pageImgUrl === '' ? pageImgUrl : Drupal.settings.islandora_book_reader_socialLinks.pageImgUrl;           
            shareBookLinkDataObj.desc = Drupal.settings.islandora_book_reader_socialLinks.bookDesc;            
            Drupal.setSocialLinkHostDiv(shareBookLinkDataObj, bookHostDivName, bookProcedingDivName, bookNextDivName);
            shareLinkData.push(shareBookLinkDataObj);
            
            sharePageLinkDataObj.title = "Page title"; //Drupal.settings.islandora_book_reader_socialLinks.bookTitle;            
            sharePageLinkDataObj.urlText = Drupal.settings.islandora_book_reader_socialLinks.pageUrl === '' ? pageUrl : Drupal.settings.islandora_book_reader_socialLinks.pageUrl ;
            sharePageLinkDataObj.imgUrl = Drupal.settings.islandora_book_reader_socialLinks.pageImgUrl === '' ? pageImgUrl : Drupal.settings.islandora_book_reader_socialLinks.pageImgUrl;
            sharePageLinkDataObj.url = Drupal.settings.islandora_book_reader_socialLinks.pageUrl === '' ? pageUrl : Drupal.settings.islandora_book_reader_socialLinks.pageUrl ;            
            sharePageLinkDataObj.desc = Drupal.settings.islandora_book_reader_socialLinks.bookPageDesc;
            Drupal.setSocialLinkHostDiv(sharePageLinkDataObj, pageHostDivName, pageProcedingDivName, pageNextDivName);
            shareLinkData.push(sharePageLinkDataObj);
            
            Drupal.settings.islandora_socialLinks.shareLinkData = shareLinkData;
            
        }
    };
})(jQuery);