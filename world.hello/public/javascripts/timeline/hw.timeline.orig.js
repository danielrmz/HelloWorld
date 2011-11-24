/**
 *  Timeline functions
 * 
 *  @version 1.0
 *  @author Daniel Ramirez <hello@danielrmz.com>
 */

World.Timeline = (function ($) {
	var undefined;

	/**
	 * Represents a collection of posts, feed items etc.
	 * 
	 * @constructor
	 * @param {HTMLElement} container Container of the stream
	 * @param {string} provider_url Service url to fetch for feed items.
	 */
	function Stream(container, provider_url) {
		if(provider_url == "") {
			throw new Error(World.Utils.GetMessage("Stream_NoProviderSpecified"));
		}
		this._element  = container;
		this._provider = provider_url;
		
		this.render();
	}
	
	// Properties
	Stream.prototype._element  = null;
	Stream.prototype._provider = "";
	Stream.prototype._items    = [];
	
	// Public methods.
	
	/**
	 * Posts to the server.
	 * 
	 * @static 
	 */
	Stream.Post   = function () {};
	
	/**
	 * Fetches new items or the ones specified by the page argument
	 * 
	 * @param {number=} page
	 */
	Stream.prototype.fetch  = function (page) 
	{
		var self   = this;
		var childs = $(this._element).children();
		var last   = "0";
		
		if(childs.size() > 0) {
			last = childs.first().data("object").getId();
		}
		
		action = last == 0 ? 'latest' : 'since'
		$.get(this._provider + "/" + action, { id: last }, function(data) {
			self.render_posts(data, (action == 'latest'));
		});
	};
	
	/**
	 * Starts the polling for new items on the stream
	 * 
	 * @param {number} fetch_interval Time in seconds the stream will fetch/look for new items.
	 * @return {boolean} False indicates it is already started.
	 */
	Stream.prototype.start = function(fetch_interval) {
		if(!fetch_interval || isNaN(fetch_interval)) {
			throw new Exception(World.Utils.GetMessage("Stream_NoFetchIntervalSpecified"));
		}
		if(this._interval_h) {
			return false;
		}
		var self = this;
		this._interval_h = setInterval(function() { self.fetch() }, fetch_interval * 1000 ); 
		this.fetch(); // initial fetch
		return true;
	};
	
	/**
	 * Stops the current polling if exists
	 * 
	 * @return {boolean} Returns true if it was able to stop the polling.
	 */
	Stream.prototype.stop = function() {
		if(!this._interval_h) {
			return false;
		}
		clearInterval(this._interval_h);
		this._interval_h = null;
		return true;
	};
	
	/**
	 * Renders the current stream elements, establishes ui behaviors.
	 */
	Stream.prototype.render = function () {
		var self = this;
		
		$(this._element).infinitescroll({
			navSelector  : "div.navigation",   // selector for the paged navigation (it will be hidden)
		    nextSelector : "div.navigation a:first", // selector for the NEXT link (to page 2)
		    itemSelector : "",      // selector for all items you'll retrieve
		    dataType: 'json',
		    loadingText: "",
			appendCallback: false,
			pathParse: function(arg1, arg2) { 
				var last_tweet_id = jQuery(".tweet").last().data("object").getId();
				return "/provider/page/" + last_tweet_id;
				//return "/home/page/" + $("#tweets").children().last().prev().prev().attr("id").split("_")[1]; 
			}
		}, function(items) { 
			items = $.parseJSON(items);
			self.render_posts(items, true);
		});
	};
	
	/**
	 * Renders the stream posts accordingly
	 * 
	 * @param {Array.<Object>} posts
	 * @param {boolean=} append
	 */
	Stream.prototype.render_posts = function (posts, append) 
	{
		for(var i = (append ? 0 : posts.length - 1); (!append ? i >= 0 : i < posts.length) ; (!append ? i-- : i++)) {
				var ps = posts[i];
				var post = new Post(ps, this._provider +'/item/{post_type}/{post_id}/' );
				
				// Avoid readding it twice if it already exists in the dom.
				var exists = $(this._element).find("*[data-postid="+post.getId()+"]");
				if(exists.size() > 0) {
					return;
				}
				
				$(this._element)[append ? "append" : "prepend"](post.render());
				post.show();
		}
	};
	
	/**
	 * Represents a single post, 
	 * contains all of it functions.
	 * 
	 * @constructor
	 * @param {HTMLElement} element
	 * @param {string} provider_url Template url of a specific item /provider/{post_id}/{action}
	 * @param {Object} data
	 */
	function Post(data, provider_url) 
	{
		if(!data) {
			throw new Error(World.Utils.GetMessage("Post_NoDataProvided"));
		}
		if(!data["world_post_id"]) {
			throw new Error(World.Utils.GetMessage("Post_PostIdNotFound"));
		}
		if(!provider_url || provider_url == "") {
			throw new Error(World.Utils.GetMessage("Post_NoProviderSpecified"));
		}
		
		//this._element      = element;
		this._data         = data;
		this._provider_url = provider_url.replace("{post_id}", data["world_post_id"]).replace("{post_type}", data["world_post_type"]);
	}
	
	// Properties
	Post.prototype._provider_url = "";
	Post.prototype._element    = null;
	Post.prototype._data       = {};
	
	
	// Public methods
	Post.prototype.getId = function () {
		return this._data["world_post_id"];
	};
	
	/**
	 * Removes the post
	 */
	Post.prototype.remove     = function () 
	{
		var self = this;
		this._get({ "action": '/delete', 
					"success": function () { $(self._element).fadeOut(function(){ $(this).remove(); }); }, 
					"error": "Post_CantDelete" });
	};
	
	Post.prototype.share      = function () 
	{
		var self = this;
		this._get({ "action": '/share', 
					"success": function () { alert('Shared!'); }, 
					"error": "Post_CantShare"});
	};
	
	Post.prototype.unshare    = function () 
	{
		var self = this;
		this._get({ "action": '/unshare', 
					"success": function () { alert('UnShared!'); }, 
					"error": "Post_CantUnshare"});
	};
	
	Post.prototype.favorite   = function () 
	{
		var self = this;
		this._get({ "action": '/favorite', 
					"success": function () { alert('Favorited!'); }, 
					"error": "Post_CantFavorite"});
	};

	Post.prototype.unfavorite = function () 
	{
		var self = this;
		this._get({ "action": '/unfavorite', 
					"success": function () { alert('UnFavorite!'); }, 
					"error": "Post_CantUnfavorite"});
	};
	
	Post.prototype.show = function() {
		if(this._element) {
			$(this._element).fadeIn();
		}
	};
	
	/**
	 * Renders the post
	 */
	Post.prototype.render     = function () 
	{
		this._element = null;
		var post = this._data;
		var self = post.user.id == Hello.id;
		
		// Get template
		var html = '<div class="tweet ' + (self ? "self" : "") + '" id="t_' + post.id_str + '" style="display:none;" data-postid=' + post.id_str + '>' +
							'<img class="picture" src="http://cache.world.dotcloud.com/' + post.user.profile_image_url + '" />' +
							'<ul class="actions"><li class="act-retweet"><span></span></li><li class="act-reply"><span></span></li>' +
								(self ? '<li class="act-delete"><span></span></li> ' : '') +
								'</ul><div class="bubble"><div class="content">' +
								'<div class="user">' +
								'<span class="screen_name">' + post.user.screen_name + '</span>' +
								'&nbsp;' +
								'<span class="name">' + post.user.name + '</span></div>' +
								'<div class="description">' +
								World.Utils.ParsePostContent(post.text) + '</div>' +
							'</div></div>' +
							'</div>';
		this._element = $(html);
		
		// Create element
		$(this._element).data('object', this);
		
		// Bind events
		$(this._element).find(".act-delete").click(this.remove);
				
		return this._element;
	};
	
	/**
	 * Creates a GET request to the specified source.
	 * 
	 * @param {Object} options
	 */
	Post.prototype._get = function (options) 
	{ 
		var action   = options["action"];
		var success_c= options["success"];
		var error_c  = options["error"];
		
		var id = this._data["world_post_id"];
		var ty = this._data["world_post_type"];
		var parms = options["params"];
		parms["id"] = id;
		parms["type"] = ty;
		
		$.get(this._provider_url + action, parms, function(data) {
			if(data.error == false) {
				success_c(data);
			} else {
				if(error_callback) {
					error_c(data);
				} else if(typeof(error_c) == "string") {
					alert(World.Utils.GetMessage(error_callback));
				}
				// TODO: Log
			}
		});
	};
	
	/**
	 * Creates a POST request to the specified source.
	 * 
	 * @param {Object} options
	 */
	Post.prototype._post= function () { 
		var action   = options["action"];
		var success_c= options["success"];
		var error_c  = options["error"];
		
		var id = this._data["post_id"];
		var ty = this._data["post_type"];
		var parms = options["params"];
		parms["id"] = id;
		parms["type"] = ty;
		
		$.post(this._provider_url + action, parms, function(data) {
			if(data.error == false) {
				success_c(data);
			} else {
				if(error_callback) {
					error_c(data);
				} else if(typeof(error_c) == "string") {
					alert(World.Utils.GetMessage(error_callback));
				}
				// TODO: Log
			}
		});
	
	};
	
	return {
		"Stream": Stream, 
		"Post": Post
	};

})(jQuery);

