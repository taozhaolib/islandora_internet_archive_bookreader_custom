/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function ($) {
    
    Drupal.fbButtonDiv = function(dataObj, fbMetaAdded) {
        var fbSDKDiv = $("<div id=\"fb-root\"></div>" );
        var scriptTxt =    "(function(d, s, id) { " +
                        "var js, fjs = d.getElementsByTagName(s)[0]; " +
                        "if (d.getElementById(id)) return; " +
                        " js = d.createElement(s); js.id = id; " +
                        " js.src = \"//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0\"; " +
                        " fjs.parentNode.insertBefore(js, fjs); " +
                        " \"}(document, 'script', 'facebook-jssdk')); ";

        var script = document.createElement("script");
        script.type = "text/javascript";
        script.textContent = scriptTxt;

        var hostDivName = dataObj.hostDivName;
        var url = dataObj.url;

        var likePluginDiv = $("<div class=\"fb-like\" data-href=\""+url+"\" data-layout=\"standard\" data-action=\"like\" data-show-faces=\"true\" data-share=\"true\"></div>");

        var body = $("body");                       
        body.prepend(fbSDKDiv);                                    
        fbSDKDiv.after("<script>(function(d, s, id) {var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = \"//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0\"; fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'facebook-jssdk'));</script>");

        if(fbMetaAdded === false){
            var head = $('head');
            head.append("<meta property='og:title' content='"+dataObj.title+"' />");
            head.append("<meta property='og:type' content='website' />");
            head.append("<meta property='og:url' content='"+dataObj.url+"' />");
            head.append("<meta property='og:image' content='"+dataObj.imgUrl+"' />");
            head.append("<meta property='og:image:type' content='image/jpg' />");
            head.append("<meta property='og:image:width' content='300' />");
            head.append("<meta property='og:image:height' content='300' />");
            head.append("<meta property='og:description' content='"+dataObj.desc+"' />");
            head.append("<meta property='fb:app_id' content='534924973316459' />");
        }
        
        $("#"+hostDivName).append(likePluginDiv);

    };
    
    Drupal.twLinkDiv = function(dataObj, twMetaAdded){
        
        var hostDivName = dataObj.hostDivName;
        var url = dataObj.url;
        var desc = dataObj.desc;
        var twitterButtons = $(".twitter-share-button");

        var twLink = $("<div><a class=\"twitter-share-button\" data-url=\""+url+"\" data-via=\"twitterdev\" data-text=\""+desc+"\">Tweet</a></div>");
        var twScriptTxt = "<script>window.twttr=(function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],t=window.twttr||{};if(d.getElementById(id))return;js=d.createElement(s);js.id=id;js.src=\"https://platform.twitter.com/widgets.js\";fjs.parentNode.insertBefore(js,fjs);t._e=[];t.ready=function(f){t._e.push(f);};return t;}(document,\"script\",\"twitter-wjs\"));</script>";
        
        var script = document.createElement("script");
        script.type = "text/javascript";        
        script.textContent = twScriptTxt;
        
        if(twMetaAdded === false){
            var head = $("head");
            head.append("<meta name=\"twitter:card\" content=\"summary\" />");
            head.append("<meta name=\"twitter:site\" content=\"@ztgtt\" />");
            head.append("<meta name=\"twitter:title\" content=\""+dataObj.title+"\" />");
            head.append("<meta name=\"twitter:description\" content=\""+dataObj.desc+"\" />");
            head.append("<meta name=\"twitter:image\" content=\""+dataObj.imgUrl+"\" />");
            head.append("<meta name=\"twitter:url\" content=\""+dataObj.url+"\" />");
        }
           
        $("#"+hostDivName).append(twLink);
        if(twitterButtons && twitterButtons.length <= 1)
            twLink.after(twScriptTxt);
    };
    
    Drupal.behaviors.addSocialLink = {
        attach: function(context, settings){
            var socialLinkTypes = Drupal.settings.islandora_socialLinks.socialLinkTypes.split(',');
            var shareLinkData = Drupal.settings.islandora_socialLinks.shareLinkData;
            var fbMetaAdded = false;
            var twMetaAdded = false;
            
            if(Array.isArray(shareLinkData) && shareLinkData.length > 0){
                for(var j = 0; j < shareLinkData.length; j++){
                    for(var i = 0; i < socialLinkTypes.length; i++){
                        var type = socialLinkTypes[i];
                        switch(type){
                            case 'fb':
                                Drupal.fbButtonDiv(shareLinkData[j], fbMetaAdded);
                                fbMetaAdded = true;
                                break;
                            case 'tw':
                                Drupal.twLinkDiv(shareLinkData[j], twMetaAdded);
                                twMetaAdded = true;
                                break;
                            case 'pi':
                                break;
                            default:
                                alert("Illegal social link type specified!");
                                return false;
                                break;
                        }
                    }
                }
            }
            
            
        }
    };
    
    
})(jQuery);
