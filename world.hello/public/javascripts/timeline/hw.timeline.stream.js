/* DO NOT MODIFY. This file was compiled Thu, 24 Nov 2011 00:03:53 GMT from
 * /Users/daniel/github/Projects/HelloWorld/world.hello/public/coffee/timeline/hw.timeline.stream.coffee
 */

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  World.Timeline.Stream = (function() {
    /*
       Represents a collection of posts, feed items etc.
        
       @constructor
       @param {HTMLElement} container Container of the stream
       @param {string} provider_url Service url to fetch for feed items.
       @param {Object=} options
      */    function Stream(container, provider_url, options) {
      if (provider_url === "") {
        throw new Error(World.Utils.GetMessage("Stream_NoProviderSpecified"));
      }
      this._container = container;
      this._provider_url = provider_url;
      this.render();
    }
    Stream.prototype._container = null;
    Stream.prototype._provider_url = "";
    Stream.prototype._items = [];
    Stream.prototype._infinite_scroll_enabled = true;
    Stream.Post = function() {};
    /*
       Fetches new items or the ones specified by the page argument
      */
    Stream.prototype.fetch = function() {
      var action, childs, last;
      childs = $(this._container).children();
      last = 0;
      if (childs.size() > 0) {
        last = childs.first();
        if (last != null) {
          last = last.data("object").get_id();
        } else {
          last = 0;
        }
      }
      action = last === 0 ? 'latest' : 'since';
      return $.get(this._provider_url + "/" + action, {
        id: last
      }, __bind(function(data) {
        if (data.error === false) {
          return this.render_posts(data["data"], action === 'latest');
        } else {
          return alert(data["data"]["message"]);
        }
      }, this));
    };
    /*
       Starts the polling for new items on the stream
       
       @param {number} fetch_interval Time in seconds the stream will fetch/look for new items.
       @return {boolean} False indicates it is already started.
      */
    Stream.prototype.start = function(fetch_interval) {
      if (!fetch_interval || isNaN(fetch_interval)) {
        throw new Exception(World.Utils.GetMessage("Stream_NoFetchIntervalSpecified"));
      }
      if (this._interval_h != null) {
        return false;
      }
      this._interval_h = setInterval((__bind(function() {
        this.fetch();
        return this.updateTimes();
      }, this)), fetch_interval * 1000);
      $(this._container).bind("stream.update", __bind(function() {
        return this.fetch();
      }, this)).addClass("posts");
      this.fetch();
      return true;
    };
    /*
       Stops the current polling if exists
        
       @return {boolean} Returns true if it was able to stop the polling.
      */
    Stream.prototype.stop = function() {
      if (!this._interval_h) {
        return false;
      }
      clearInterval(this._interval_h);
      this._interval_h = null;
      return true;
    };
    /*
      */
    Stream.prototype.updateTimes = function() {
      return $(".time").each(function() {
        var post_time;
        post_time = $(this).attr("data-time");
        return $(this).html(World.Utils.TimeDifference(post_time));
      });
    };
    /*
       Renders the current stream elements, establishes ui behaviors.
      */
    Stream.prototype.render = function() {
      return $(this._container).infinitescroll({
        navSelector: "div.navigation",
        nextSelector: "div.navigation a:first",
        itemSelector: "",
        dataType: "json",
        loadingText: "",
        appendCallback: false,
        pathParse: __bind(function(arg1, arg2) {
          var last_tweet, last_tweet_id;
          last_tweet = jQuery(".tweet").last();
          if (last_tweet != null) {
            last_tweet_id = last_tweet.data("object").get_id();
            return this._provider_url + "/page/" + last_tweet_id;
          } else {
            return "";
          }
        }, this)
      }, __bind(function(items) {
        items = $.parseJSON(items);
        if (items.error === false) {
          return this.render_posts(items["data"], true);
        } else {
          return alert(items["data"]["message"]);
        }
      }, this));
    };
    /*
       Renders the stream posts accordingly
        
       @param {Array.<Object>} posts
       @param {boolean=} append
      */
    Stream.prototype.render_posts = function(posts, append) {
      var displayed, exists, i, post, ps;
      i = append ? 0 : posts.length - 1;
      displayed = [];
      while ((!append ? i >= 0 : i < posts.length)) {
        ps = posts[i];
        post = new World.Timeline.Post(ps, this._provider_url.toString() + '/item/{post_type}/{post_id}/');
        exists = $(this._container).find("*[data-postid=" + post.get_id() + "]");
        if (exists.size() > 0) {
          if (append) {
            i++;
          } else {
            i--;
          }
          continue;
        }
        $(this._container)[append ? "append" : "prepend"](post.render());
        post.show();
        displayed.push(ps);
        if (append) {
          i++;
        } else {
          i--;
        }
      }
      this.updateTimes();
      if (append === false && World.Utils.Notifier.HasPermission() && displayed.length > 0) {
        if (displayed.length === 1) {
          return World.Utils.Notifier.Notify(displayed[0]["user"]["profile_image_url"], displayed[0]["user"]["screen_name"] + " says,", displayed[0]["text"]);
        } else {
          return World.Utils.Notifier.Notify("", "Hello World", "There are new unread posts");
        }
      }
    };
    return Stream;
  })();
}).call(this);
