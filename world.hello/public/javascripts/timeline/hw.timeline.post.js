/* DO NOT MODIFY. This file was compiled Thu, 24 Nov 2011 01:49:19 GMT from
 * /Users/daniel/github/Projects/HelloWorld/world.hello/public/coffee/timeline/hw.timeline.post.coffee
 */

(function() {
  /*
   The base Post Class
   should provide the basic definition for different types of posts
   
   @author Daniel Ramirez <hello@danielrmz.com>
  */
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  World.Timeline.Post = (function() {
    /*
       Represents a single post, 
       contains all of it functions.
        
       @constructor
       @param {HTMLElement} element
       @param {string} provider_url Template url of a specific item /provider/{post_id}/{action}
       @param {Object} data
      */
    var _data, _element, _provider_url;
    function Post(data, provider_url) {
      if (!data) {
        throw new Error(World.Utils.GetMessage("Post_NoDataProvided"));
      }
      if (!data["world_post_id"]) {
        throw new Error(World.Utils.GetMessage("Post_PostIdNotFound"));
      }
      if (!provider_url || provider_url === "") {
        throw new Error(World.Utils.GetMessage("Post_NoProviderSpecified"));
      }
      this._data = data;
      this._provider_url = provider_url.replace("{post_id}", data["world_post_id"]).replace("{post_type}", data["world_post_type"]);
    }
    _provider_url = "";
    _element = null;
    _data = {};
    Post.prototype.get_id = function() {
      return this._data["world_post_id"];
    };
    /*
       Removes the post
      */
    Post.prototype.remove = function() {
      return this._get({
        action: 'delete',
        success: __bind(function() {
          return $(this._element).fadeOut(function() {
            return $(this).remove();
          });
        }, this),
        error: "Post_CantDelete"
      });
    };
    /*
       Shares the post
      */
    Post.prototype.share = function() {
      return this._get({
        action: 'share',
        error: 'Post_CantShare',
        success: __bind(function() {
          return alert('Shared!');
        }, this)
      });
    };
    /*
       Unshares the post
      */
    Post.prototype.unshare = function() {
      return this._get({
        action: 'unshare',
        error: 'Post_CantUnshare',
        success: __bind(function() {
          return alert('UnShared!');
        }, this)
      });
    };
    /*
       Favorites a post
      */
    Post.prototype.favorite = function() {
      return this._get({
        action: 'favorite',
        error: 'Post_CantFavorite',
        success: __bind(function() {
          return alert('Favorited!');
        }, this)
      });
    };
    /*
        Unfavorites a post
      */
    Post.prototype.unfavorite = function() {
      return this._get({
        action: '/unfavorite',
        error: 'Post_CantUnfavorite',
        success: __bind(function() {
          return alert('UnFavorite!');
        }, this)
      });
    };
    /*
       Displays an element on screen
      */
    Post.prototype.show = function() {
      if (this._element != null) {
        return $(this._element).fadeIn();
      }
    };
    Post.prototype.is_self = function() {
      return this._data["user"]["id"] === Hello["id"];
    };
    Post.prototype.is_user_protected = function() {
      return this._data["user"]["protected"];
    };
    Post.prototype.is_response = function() {
      return this._data["in_reply_to_status_id_str"] != null;
    };
    Post.prototype.has_location = function() {
      return this._data["geo"] != null;
    };
    Post.prototype.get_response_post = function(cb) {
      this._get({
        action: 'post',
        error: '',
        params: {
          pid: this._data["in_reply_to_status_id_str"]
        },
        success: __bind(function(data) {
          if (cb != null) {
            return cb(data);
          }
        }, this)
      });
      return null;
    };
    /*
       Renders the post
      */
    Post.prototype.render = function() {
      var base, deletehide, haslocation, html, is_retweet, is_retweet_by_me, is_retweet_flag, isprotected, post, responseto, retweet_user_image, selftag;
      this._element = null;
      post = this._data;
      base = this._data;
      is_retweet = false;
      is_retweet_by_me = post.retweeted;
      if (is_retweet_by_me) {
        is_retweet = true;
      }
      if (post.retweeted_status != null) {
        is_retweet = true;
        post = post.retweeted_status;
      }
      selftag = this.is_self() ? "self" : "";
      deletehide = this.is_self() ? "" : "hide";
      isprotected = this.is_user_protected() ? "active" : "";
      responseto = this.is_response() ? "active" : "";
      haslocation = this.has_location() ? "active" : "";
      is_retweet_flag = is_retweet ? "retweet" : "";
      retweet_user_image = is_retweet ? "<img src='" + base.user.profile_image_url + "' class='original-picture' />" : "";
      html = "<div class='tweet " + selftag + " " + is_retweet_flag + "' style='display:none;' data-postid='" + post.world_post_id + "'>              <div class='picture-container'>                <img class='picture' src='" + post.user.profile_image_url + "' />                " + retweet_user_image + "              </div>              <ul class='actions'>                  <li class='act-retweet'><span></span></li>                  <li class='act-reply'><span></span></li>                  <li class='act-delete " + deletehide + "'><span></span></li>               </ul>              <div class='bubble'>                <div class='retweet-flag'></div>                <div class='content'>                  <div class='user'>                    <div class='location-pin " + haslocation + "'></div>                    <div class='response-to " + responseto + "'></div>                    <div class='protected " + isprotected + "'></div>                    <span class='screen_name'>" + post.user.screen_name + "</span>                    <span class='name'>" + post.user.name + "</span>                    <div class='retweet-info'>shared by <span class='screen_name'>" + base.user.screen_name + "</span> <span class='name'>" + base.user.name + "</span></div>                  </div>                  <div class='description'>" + (World.Utils.ParsePostContent(post.text)) + "</div>                  <a class='time' data-time='" + post.world_post_time + "' title='" + post.created_at + "' href='javascript:;'></a>                </div>              </div>                         </div>";
      this._element = $(html);
      $(this._element).data('object', this);
      $(this._element).find(".act-delete").click(__bind(function() {
        return this.remove();
      }, this));
      $(this._element).find(".act-retweet").click(__bind(function() {
        return this.share();
      }, this));
      $(this._element).find(".act-reply").click(__bind(function() {
        return this.render_replyto_dialog();
      }, this));
      $(this._element).find(".content").dblclick(__bind(function() {
        return $.facebox(World.Utils.FormatJson(JSON.stringify(this._data, null, "\t")), "scrollable");
      }, this));
      $(this._element).find(".response-to").click(__bind(function() {
        return this.render_responseto_dialog();
      }, this));
      if (this.has_location()) {
        $(this._element).find(".location-pin").attr("title", post["place"]["full_name"] + ", " + post["place"]["country"]).click(__bind(function() {
          return this.render_location_map();
        }, this));
      }
      return this._element;
    };
    Post.prototype.render_replyto_dialog = function() {
      var form, self, tdiff2;
      self = this._data;
      tdiff2 = World.Utils.TimeDifference(self.world_post_time);
      form = $(" <div class='replyto'>                  <div>                    <h5>Reply to</h5>                    <br />                    <form method='post' action='/provider/reply' >                      <textarea name='reply_message'>@" + self.user.screen_name + " </textarea>                      <input type='button' value='Send' class='btn primary' />                      <input type='hidden' value='" + self.world_post_id + "' name='id' />                      <input type='hidden' value='" + self.world_post_type + "' name='type' />                      <input type='hidden' value='' name='authenticity_token' />                    </form>                  </div>                  <div class='clearfix'></div>                                    <div class='responseto'>                  <img src='" + self.user.profile_image_url + "' class='profile-pic'>                  <div>                    <span class='screen_name'>" + self.user.screen_name + "</span>                     <span class='name'>" + self.user.name + "</span>                    <br />                    " + (World.Utils.ParsePostContent(self.text)) + "                    <a class='time' data-time='" + self.world_post_time + "' title='" + self.created_at + "' href='javascript:;'>" + tdiff2 + "</a>                  </div>                  <div class='clearfix'></div>                </div>                ");
      form.find("input[name=authenticity_token]").val($("meta[name=csrf-token]").attr("content"));
      form.find(".btn").click(function() {
        var frm;
        frm = $(this).closest("form");
        return $.post(frm.attr("action"), frm.serialize(), function(data) {
          $(".posts").trigger("stream.update");
          $.facebox.close();
          return true;
        });
      });
      return $.facebox(form, "scrollable");
    };
    Post.prototype.render_responseto_dialog = function() {
      return this.get_response_post(__bind(function(post) {
        var self, tdiff, tdiff2;
        self = this._data;
        tdiff = World.Utils.TimeDifference(post.world_post_time);
        tdiff2 = World.Utils.TimeDifference(self.world_post_time);
        return $.facebox(" <div class='responseto'>                  <img src='" + post.user.profile_image_url + "' class='profile-pic'>                  <div>                    <span class='screen_name'>" + post.user.screen_name + "</span>                     <span class='name'>" + post.user.name + "</span>                    <br>                    " + (World.Utils.ParsePostContent(post.text)) + "                    <a class='time' data-time='" + post.world_post_time + "' title='" + post.created_at + "' href='javascript:;'>" + tdiff + "</a>                  </div>                  <div class='clearfix'></div>                  <hr />                  <span style='position:relative;float:left;top:-17px;font-weight: bold; font-size:11px;background: white;padding-right:5px;'>Was replied by:</span><div class='clearfix'></div>                  <div class='responseto'>                  <img src='" + self.user.profile_image_url + "' class='profile-pic'>                  <div>                    <span class='screen_name'>" + self.user.screen_name + "</span>                     <span class='name'>" + self.user.name + "</span>                    <br>                    " + (World.Utils.ParsePostContent(self.text)) + "                    <a class='time' data-time='" + self.world_post_time + "' title='" + self.created_at + "' href='javascript:;'>" + tdiff2 + "</a>                  </div>                  <div class='clearfix'></div>                </div>                ", "scrollable");
      }, this));
    };
    Post.prototype.render_location_map = function() {
      var cache_server, map, marker, place, post, tdiff;
      cache_server = "";
      post = this._data;
      tdiff = World.Utils.TimeDifference(post.world_post_time);
      $.facebox(" <div class='location'>                  <img src='" + cache_server + post.user.profile_image_url + "' class='profile-pic'>                  <div>                    <span class='screen_name'>" + post.user.screen_name + "</span>                     <span class='name'>" + post.user.name + "</span>                    <br>                    " + (World.Utils.ParsePostContent(post.text)) + "                    <a class='time' data-time='" + post.world_post_time + "' title='" + post.created_at + "' href='javascript:;'>" + tdiff + "</a>                  </div>                  <div class='clearfix'></div>                </div>                <div id='map' style='width:500px;height:400px;'></div>", "scrollable");
      place = new google.maps.LatLng(this._data["geo"]["coordinates"][0], this._data["geo"]["coordinates"][1]);
      map = new google.maps.Map(document.getElementById('map'), {
        "zoom": 16,
        center: place,
        "mapTypeId": google.maps.MapTypeId.ROADMAP
      });
      return marker = new google.maps.Marker({
        map: map,
        draggable: false,
        annimation: google.maps.Animation.DROP,
        position: place
      });
    };
    /*
       Creates a GET request to the specified source.
        
       @param {Object} options
      */
    Post.prototype._get = function(options) {
      var action, error_c, id, parms, success_c, ty;
      action = options["action"];
      success_c = options["success"];
      error_c = options["error"];
      id = this._data["world_post_id"];
      ty = this._data["world_post_type"];
      parms = options["params"] || {};
      parms["id"] = parms["id"] || id;
      parms["type"] = ty;
      return $.get(this._provider_url + action, parms, __bind(function(data) {
        if (data.error === false) {
          if (success_c != null) {
            return success_c(data["data"]);
          }
        } else {
          if (error_c != null) {
            return error_c(data["data"]);
          } else if (typeof error_c === "string") {
            return alert(World.Utils.GetMessage(error_callback));
          }
        }
      }, this));
    };
    /*
       Creates a POST request to the specified source.
        
       @param {Object} options
      */
    Post.prototype._post = function() {
      var action, error_c, id, parms, success_c, ty;
      action = options["action"];
      success_c = options["success"];
      error_c = options["error"];
      id = this._data["world_post_id"];
      ty = this._data["world_post_type"];
      parms = options["params"] || {};
      parms["id"] = parms["id"] || id;
      parms["type"] = ty;
      return $.get(this._provider_url + action, parms, __bind(function(data) {
        if (data.error === false) {
          if (success_c != null) {
            return success_c(data["data"]);
          }
        } else {
          if (error_c != null) {
            return error_c(data["data"]);
          } else if (typeof error_c === "string") {
            return alert(World.Utils.GetMessage(error_callback));
          }
        }
      }, this));
    };
    return Post;
  })();
}).call(this);
