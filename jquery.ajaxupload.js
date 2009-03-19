/*
 * ajaxUpload for JQuery
 *
 * Usage:
 *   $.ajaxUpload({
 *      data: "file elements select",
 *      url: "/where/to/upload",
 *      success: function_to_be_called,
 *      complete: function_to_be_called,
 *      error: function_to_be_called
 *   })
 *
 * Based on: 
 *   http://www.phpletter.com/Our-Projects/AjaxFileUpload/
 *   http://valums.com/ajax-upload/
 *
 */
(function($) {

$.ajaxUpload = function(options) {

var defaults = {
    // url: where to upload
    // data: selector for inputs you want uploaded
    // dataType: expected returned datatype
    // timeout: number of seconds before abort
    // success:
    // global: whether to fire global events
    // error
    // complete
};
    
var s = $.extend(defaults, options);
    
// Build the IFRAME and FORM with a unique name.
var name = new Date().getTime()
i = $('<iframe src="javascript:false;" name="'+name+'" style="display:none" />')[0];
document.body.appendChild(i);
f = $('<form method="post" enctype="multipart/form-data" style="display:none"></form>')[0];
f.target = i.name
f.action = s.url
document.body.appendChild(f);

// Clone data and append it to FORM.
var data = $(s.data);
var clone = data.clone();
clone.appendTo(f);

if (s.global && ! $.active++)
    $.event.trigger("ajaxStart");

// Are we there yet?
var done = false;

// Dummy XHR so we can use $.httpData
var xhr = {}
xhr.getResponseHeader = function(_) {return ""};

if (s.global)
    $.event.trigger("ajaxSend", [xhr, s]);
    
// Called when IFRAME loads or TIMEOUT.
var uploadDone = function(isTimeout) {
    // $.isXMLDoc - do we even care about XML responess?
    // Does it even matter? could we just pass it through $?
    if (i.contentWindow) {
        xhr.responseText = i.contentWindow.document.body ? i.contentWindow.document.body.innerHTML : null;
        xhr.responseXML = i.contentWindow.document.XMLDocument ? i.contentWindow.document.XMLDocument : i.contentWindow.document;	
	} else if (i.contentDocument) {
        xhr.responseText = i.contentDocument.document.body ? i.contentDocument.document.body.innerHTML : null;
        xhr.responseXML = i.contentDocument.document.XMLDocument ? i.contentDocument.document.XMLDocument : i.contentDocument.document;
    }

    if (xhr || isTimeout == "timeout") {
        done = true;
        var status = isTimeout ? "success" : "error";
        if (status == "success") {
            // ### This try can be tightened up.
            try {
                // $.httpData(xhr, type, filter) -1.2
                // $.httpData( xhr, type, s ) - 1.3.2
                var data = $.httpData(xhr, s.dataType);    
                
                if (s.success)
                    s.success(data, status);
                
                if (s.global)
                    $.event.trigger("ajaxSuccess", [xhr, s]);
            
            } catch(e) {
                status = "error";
                $.handleError(s, xhr, status, e);
            }
        } else {
            $.handleError(s, xhr, status);
        }

        if (s.global)
            $.event.trigger("ajaxComplete", [xhr, s]);
    
        if (s.global && ! --$.active)
            $.event.trigger("ajaxStop");
    
        if (s.complete)
            s.complete(xhr, status);

        // Cleanup after ourselves.    
        $(i).unbind();
        xhr = null;

        setTimeout(function() {
            $(i).remove();
    		$(f).remove();}, 100)    
    }
}

if (s.timeout > 0) {
    setTimeout(function() {
        if (!done)
            uploadDone("timeout");}, s.timeout);
}

$(i).bind("load", uploadDone);
$(f).submit();

};

})(jQuery);