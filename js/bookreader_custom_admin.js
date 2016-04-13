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

(function ($) {
  Drupal.behaviors.islandora_bookreader_custom_admin_ajax = {
    attach: function(context, settings) {    

        var collection_defined = Drupal.settings.islandora_bookreader_custom_admin.collection;
        var pdf_download_link_defined = Drupal.settings.islandora_bookreader_custom_admin.pdf_download_link;
        var page_download_link_defined = Drupal.settings.islandora_bookreader_custom_admin.page_image_download_link;
        var social_link_defined = Drupal.settings.islandora_bookreader_custom_admin.social_link;
        
        var collection = $("#edit-"+collection_defined.toString().replace("_", "-"));
        var pdf_download_link = $("input[id^=edit-"+pdf_download_link_defined.toString().replace(new RegExp("_", "g"), "-")+"]");
        var page_download_link = $("input[id^=edit-"+page_download_link_defined.toString().replace(new RegExp("_", "g"), "-")+"]");
        var social_link = $("input[id^=edit-"+social_link_defined.toString().replace(new RegExp("_", "g"), "-")+"]");

        collection.change(function(){
            var pid_val = collection.val();
            $.ajax({
                method: 'POST',
                url: '/islandora_solr_view_feed/collection/get/views',
                data: {pid: pid_val},
                success: function(data) {
                    if(data.length > 0) {
                        var data_obj = jQuery.parseJSON(data);
                        var view_vals = data_obj.view.toString().split(',');

                        view_options.each(function(){
                            if($.inArray($(this).attr('value'), view_vals) >= 0) {
                                $(this).attr('checked', true);
                            }
                            else {
                                $(this).attr('checked', false);
                            }
                        });
                        show_name_options.each(function(){
                            if($(this).attr('value') == data_obj.show_name) {
                                $(this).attr('checked', true);
                            }
                            else {
                                $(this).attr('checked', false);
                            }
                        });
                    }
                    else{
                        view_options.each(function(){
                            $(this).attr('checked', false);
                        });
                        show_name_options.each(function(){
                            $(this).attr('checked', false);
                        });
                    }
                },
            }).done(function(data){
                alert(data);
            }).faile(function(jqXHR, textStatus){
                alert( "Request failed: " + textStatus );
            });
            //alert(selector_collection_defined + "\n" + selector_view_defined + '\n' + selector_show_name_defined);
        });
        
    }
  }
})(jQuery);