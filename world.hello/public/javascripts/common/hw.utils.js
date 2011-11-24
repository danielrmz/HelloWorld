/**
 *  Utilities namespace
 * 
 *  @version 1.0
 *  @author Daniel Ramirez <hello@danielrmz.com>
 */
World.Utils = (function($) { 
	
	var undefined;
	
	/**
	 * Gets the specified message based on the key, 
	 * and the default language set
	 * 
	 * @param {string} key
	 * @param {string} lang
	 */
	function get_message(key, lang) 
	{
		if (!World.i18n) {
			throw new Error("No messaging keys found.");
		}
		
		if (!World.Config) {
			throw new Error("No config settings found.");
		}
		
		lang = lang || World.Config["i18n"] || "en";
		
		if(!World.i18n[lang]) {
			throw new Error("No messaging keys found for the specified dictionary: " + lang);
		}
		
		if(!World.i18n[lang][key]) {
			// TODO: log, don't break.
			return "Undefined";
		}
		
		return World.i18n[lang][key];
	}
	
	/**
	 * Gets the time difference in text.
	 * 
	 * @param {Date} previous time in unix ime
	 * @param {Date=} current Defaults to DateTime.Now
	 * @return {string}
	 */
	function time_difference(previous, current) 
	{
		if(!current) {
			current = (new Date()).getTime() / 1000;	
		}
		
		var msPerMinute = 60;
	    var msPerHour = msPerMinute * 60;
	    var msPerDay = msPerHour * 24;
	    var msPerMonth = msPerDay * 30;
	    var msPerYear = msPerDay * 365;
	
	    var elapsed = current - previous;
		
	    if (elapsed < msPerMinute) {
	        return Math.round(elapsed) + ' seconds ago';   
	    }
	
	    else if (elapsed < msPerHour) {
	        return Math.round(elapsed/msPerMinute) + ' minutes ago';   
	    }
	
	    else if (elapsed < msPerDay ) {
	    	hours = Math.round(elapsed/msPerHour ) ;
	        return hours + ' hour' + (hours > 1 ? 's' : '')+ ' ago';   
	    }
	
	    else if (elapsed < msPerMonth) {
	        return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';   
	    }
	
	    else if (elapsed < msPerYear) {
	        return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';   
	    }
	
	    else {
	        return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';   
	    }
	}
	
	
    /**
	 * Place your application-specific JavaScript functions and classes here
	 * This file is automatically included by javascript_include_tag :defaults
	 * Convert URLs (w/ or w/o protocol), @mentions, and #hashtags into anchor links
	 * 
	 * @param {string} text
	 */
	function parse_post_content(text)
	{
	    var base_url = 'http://twitter.com/';   // identica: 'http://identi.ca/'
	    var hashtag_part = 'search?q=#';        // identica: 'tag/'
	    var mention_part = '';              // identica: ''
	    // convert URLs into links
	    text = text.replace(
	        /(>|<a[^<>]+href=['"])?(https?:\/\/([-a-z0-9]+\.)+[a-z]{2,5}(\/[-a-z0-9!#()\/?&.,]*[^ !#?().,])?)/gi,
	        function($0, $1, $2) {
	            return ($1 ? $0 : '<a href="' + $2 + '" target="_blank">' + $2 + '</a>');
	        });
	    // convert protocol-less URLs into links
	    text = text.replace(
	        /(:\/\/|>)?\b(([-a-z0-9]+\.)+[a-z]{2,5}(\/[-a-z0-9!#()\/?&.]*[^ !#?().,])?)/gi,
	        function($0, $1, $2) {
	            return ($1 ? $0 : '<a href="http://' + $2 + '">' + $2 + '</a>');
	        });
	    // convert @mentions into follow links
	    text = text.replace(
	        /(:\/\/|>)?(@([_a-z0-9\-]+))/gi,
	        function($0, $1, $2, $3) {
	            return ($1 ? $0 : '<a href="' + base_url + mention_part + $3
	                + '" title="Follow ' + $3 + '" target="_blank">@' + $3
	                + '</a>');
	        });
	    // convert #hashtags into tag search links
	    text = text.replace(
	        /(:\/\/|>)?(\#([_a-z0-9\-]+))/gi,
	        function($0, $1, $2, $3) {
	            return ($1 ? $0 : '<a href="' + base_url + hashtag_part + $3
	                + '" title="Search tag: ' + $3 + '" target="_blank">#' + $3
	                + '</a>');
	        });
	    return text;
	}

	/*
	 * Notifier. 
	 * Class to abstract the browser notification mechanism
	 * http://0xfe.blogspot.com/2010/04/desktop-notifications-with-webkit.html
	 * 
	 * @constructor
	 */
	function Notifier() {}

	/**
	 * Verifies the support of the browser for the notifications
	 * @return {boolean}
	 */
	Notifier.prototype.HasSupport = function() 
	{
	  if (window.webkitNotifications) {
	  	return true;
	  } else {
	    return false;
	  }
	}

	/**
	 * Request permission for this page to send notifications. If allowed,
	 * calls function "cb" with "true" as the first argument.
	 * 
	 * @param {Function} cb
	 */ 
	Notifier.prototype.RequestPermission = function(cb) 
	{
		
	  if(this.HasSupport()) {
	  	cb = function(a) { console.log(a); }
		  window.webkitNotifications.requestPermission(function() {
		    if (cb) { cb(window.webkitNotifications.checkPermission() == 0); }
		  });
	  }
	}
	
	/**
	 * Checks if the user has accepted the notifications feature
	 * 
	 * @return {boolean}
	 */
	Notifier.prototype.HasPermission = function() {
		if(this.HasSupport()) {
			return window.webkitNotifications.checkPermission() == 0;
		}
		return false;
	}

	/** 
	 * Popup a notification with icon, title, and body. Returns false if
	 * permission was not granted.
	 * 
	 * @param {string} icon
	 * @param {string} title
	 * @param {string} body
	 * @return {boolean}
	 */
	Notifier.prototype.Notify = function(icon, title, body) 
	{
		if(!this.HasSupport()) {
			return false;
		}
		
	  	if (window.webkitNotifications.checkPermission() == 0) {
	  		var popup = window.webkitNotifications.createNotification(icon, title, body);
	    	popup.show();
	    	return true;
	  	} 
	
	  return false;
	}
	
	/**
	 * formatJson() :: formats and indents JSON string 
	 * @param {string} val
	 * @return {string}
	 */
	function formatJson(val) {
		var retval = '';
		var str = val;
	    var pos = 0;
	    var strLen = str.length;
		var indentStr = '&nbsp;&nbsp;&nbsp;&nbsp;';
	    var newLine = '<br />';
		var charr = '';
		
		for (var i=0; i<strLen; i++) {
			charr = str.substring(i,i+1);
			
			if (charr == '}' || charr == ']') {
				retval = retval + newLine;
				pos = pos - 1;
				
				for (var j=0; j<pos; j++) {
					retval = retval + indentStr;
				}
			}
			
			retval = retval + charr;	
			
			if (charr == '{' || charr == '[' || charr == ',') {
				retval = retval + newLine;
				
				if (charr == '{' || charr == '[') {
					pos = pos + 1;
				}
				
				for (var k=0; k<pos; k++) {
					retval = retval + indentStr;
				}
			}
		}
		
		return retval;
	}
	
	function create_post() {
		var form = $("<form action='/provider/update' method='post'><h5>Post</h5><textarea name='post'></textarea><br /><input type='button' class='btn primary' value='Send' /><input type='hidden' name='authenticity_token' value='' /></form>")
		form.find("input[name=authenticity_token]").val($("meta[name=csrf-token]").attr("content"))
      	form.find(".btn").click(function() { 
			$.post(form.attr("action"), form.serialize(), function() { 
				$.facebox.close();
                $(".posts").trigger("stream.update");
                return true;	
			});	
		});
		$.facebox(form);
	}
	
	return {
		"TimeDifference": time_difference,
		"ParsePostContent": parse_post_content,
		"GetMessage": get_message,
		"Notifier": new Notifier(),
		"FormatJson": formatJson,
		"CreatePost": create_post
	};
	
})(jQuery);
