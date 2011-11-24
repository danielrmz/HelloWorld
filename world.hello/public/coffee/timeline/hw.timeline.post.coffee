###
 The base Post Class
 should provide the basic definition for different types of posts
 
 @author Daniel Ramirez <hello@danielrmz.com>
###
class World.Timeline.Post 

  ###
   Represents a single post, 
   contains all of it functions.
    
   @constructor
   @param {HTMLElement} element
   @param {string} provider_url Template url of a specific item /provider/{post_id}/{action}
   @param {Object} data
  ###
  constructor: (data, provider_url) ->
    if !data 
      throw new Error(World.Utils.GetMessage("Post_NoDataProvided"));
    
    if !data["world_post_id"] 
      throw new Error(World.Utils.GetMessage("Post_PostIdNotFound"));
    
    if !provider_url or provider_url == "" 
      throw new Error(World.Utils.GetMessage("Post_NoProviderSpecified"));
    
    @_data         = data;
    @_provider_url = provider_url.replace("{post_id}", data["world_post_id"]).replace("{post_type}", data["world_post_type"]);
  
  
  # Properties
  _provider_url = ""
  _element = null
  _data = {}
  
  # Public methods
  get_id: () -> return @_data["world_post_id"]
  
  ###
   Removes the post
  ###
  remove: () ->
    @_get 
      action: 'delete'
      success: () => $(@_element).fadeOut( () -> $(this).remove() )
      error: "Post_CantDelete"
              

  ###
   Shares the post
  ###
  share: () ->
    @_get 
      action: 'share', 
      error: 'Post_CantShare',
      success: () => alert 'Shared!'
          
  
  ###
   Unshares the post
  ###
  unshare: () ->
    @_get  
      action: 'unshare', 
      error: 'Post_CantUnshare',
      success: () => alert 'UnShared!'
          
  
  ###
   Favorites a post
  ###
  favorite: () ->
    @_get  
      action: 'favorite', 
      error: 'Post_CantFavorite',
      success: () => alert 'Favorited!'
          
  
  ###
    Unfavorites a post
  ### 
  unfavorite: () ->
    @_get  
      action: '/unfavorite', 
      error: 'Post_CantUnfavorite',
      success: () => alert 'UnFavorite!'
        
  
  ###
   Displays an element on screen
  ###
  show: () ->
    if @_element?
      $(@_element).fadeIn()
    
  # 
  # Post data info methods
  #
  is_self: () ->
    return @_data["user"]["id"] == Hello["id"]
  
  is_user_protected: () ->
    return @_data["user"]["protected"]
    
  is_response: () ->
    return @_data["in_reply_to_status_id_str"]?
  
  has_location: () ->
    return @_data["geo"]?
  
  get_response_post: (cb) ->
    @_get
      action: 'post'
      error: '',
      params: 
        pid: @_data["in_reply_to_status_id_str"]
      success: (data) => 
        if cb?
          cb(data)
      
    return null
  
  ###
   Renders the post
  ###
  render: () -> 
  
    @_element = null
    post = @_data
    base = @_data
    is_retweet  = false
    is_retweet_by_me = post.retweeted
    
    if is_retweet_by_me 
      is_retweet = true
    
    if post.retweeted_status?
      is_retweet = true
      post = post.retweeted_status
    
    # Get template
    selftag     = if @is_self() then "self" else ""
    deletehide  = if @is_self() then "" else "hide"
    isprotected   = if @is_user_protected() then "active" else ""
    responseto  = if @is_response() then "active" else ""
    haslocation = if @has_location() then "active" else ""
    is_retweet_flag = if is_retweet then "retweet" else ""
    retweet_user_image = if is_retweet then "<img src='#{base.user.profile_image_url}' class='original-picture' />" else ""
    
    html = "<div class='tweet #{selftag} #{is_retweet_flag}' style='display:none;' data-postid='#{post.world_post_id}'>
              <div class='picture-container'>
                <img class='picture' src='#{post.user.profile_image_url}' />
                #{retweet_user_image}
              </div>
              <ul class='actions'>
                  <li class='act-retweet'><span></span></li>
                  <li class='act-reply'><span></span></li>
                  <li class='act-delete #{deletehide}'><span></span></li> 
              </ul>
              <div class='bubble'>
                <div class='retweet-flag'></div>
                <div class='content'>
                  <div class='user'>
                    <div class='location-pin #{haslocation}'></div>
                    <div class='response-to #{responseto}'></div>
                    <div class='protected #{isprotected}'></div>
                    <span class='screen_name'>#{post.user.screen_name}</span>
                    <span class='name'>#{post.user.name}</span>
                    <div class='retweet-info'>shared by <span class='screen_name'>#{base.user.screen_name}</span> <span class='name'>#{base.user.name}</span></div>
                  </div>
                  <div class='description'>#{World.Utils.ParsePostContent(post.text)}</div>
                  <a class='time' data-time='#{post.world_post_time}' title='#{post.created_at}' href='javascript:;'></a>
                </div>
              </div>
              
           </div>"        
              
    
    @_element = $(html);
    
    # Create element
    $(@_element).data('object', this);
    
    # Bind events
    $(@_element).find(".act-delete").click  () => @remove()
    $(@_element).find(".act-retweet").click () => @share() 
    $(@_element).find(".act-reply").click () => @render_replyto_dialog()
    $(@_element).find(".content").dblclick  () => $.facebox (World.Utils.FormatJson JSON.stringify @_data, null, "\t"), "scrollable"
    $(@_element).find(".response-to").click () => @render_responseto_dialog()
    if @has_location() 
      $(@_element).find(".location-pin")
                  .attr("title", post["place"]["full_name"] + ", " + post["place"]["country"])
                  .click () => @render_location_map()
                    
    return @_element
  
  render_replyto_dialog: () ->
      self = @_data
      
      tdiff2 = World.Utils.TimeDifference self.world_post_time
      
      form = $(" <div class='replyto'>
                  <div>
                    <h5>Reply to</h5>
                    <br />
                    <form method='post' action='/provider/reply' >
                      <textarea name='reply_message'>@#{self.user.screen_name} </textarea>
                      <input type='button' value='Send' class='btn primary' />
                      <input type='hidden' value='#{self.world_post_id}' name='id' />
                      <input type='hidden' value='#{self.world_post_type}' name='type' />
                      <input type='hidden' value='' name='authenticity_token' />
                    </form>
                  </div>
                  <div class='clearfix'></div>
                  
                  <div class='responseto'>
                  <img src='#{self.user.profile_image_url}' class='profile-pic'>
                  <div>
                    <span class='screen_name'>#{self.user.screen_name}</span> 
                    <span class='name'>#{self.user.name}</span>
                    <br />
                    #{World.Utils.ParsePostContent(self.text)}
                    <a class='time' data-time='#{self.world_post_time}' title='#{self.created_at}' href='javascript:;'>#{tdiff2}</a>
                  </div>
                  <div class='clearfix'></div>
                </div>
                ")
      form.find("input[name=authenticity_token]").val($("meta[name=csrf-token]").attr("content"))
      form.find(".btn").click () -> 
        frm = $(this).closest "form" 
        $.post frm.attr("action"), 
               frm.serialize(), 
               (data) -> 
                  $(".posts").trigger("stream.update")
                  $.facebox.close()
                  return true
               
                  
      $.facebox form, "scrollable"
  
  
  render_responseto_dialog: () ->
    @get_response_post (post) =>
      self = @_data
      
      tdiff = World.Utils.TimeDifference post.world_post_time
      tdiff2 = World.Utils.TimeDifference self.world_post_time
      
      $.facebox " <div class='responseto'>
                  <img src='#{post.user.profile_image_url}' class='profile-pic'>
                  <div>
                    <span class='screen_name'>#{post.user.screen_name}</span> 
                    <span class='name'>#{post.user.name}</span>
                    <br>
                    #{World.Utils.ParsePostContent(post.text)}
                    <a class='time' data-time='#{post.world_post_time}' title='#{post.created_at}' href='javascript:;'>#{tdiff}</a>
                  </div>
                  <div class='clearfix'></div>
                  <hr />
                  <span style='position:relative;float:left;top:-17px;font-weight: bold; font-size:11px;background: white;padding-right:5px;'>Was replied by:</span><div class='clearfix'></div>
                  <div class='responseto'>
                  <img src='#{self.user.profile_image_url}' class='profile-pic'>
                  <div>
                    <span class='screen_name'>#{self.user.screen_name}</span> 
                    <span class='name'>#{self.user.name}</span>
                    <br>
                    #{World.Utils.ParsePostContent(self.text)}
                    <a class='time' data-time='#{self.world_post_time}' title='#{self.created_at}' href='javascript:;'>#{tdiff2}</a>
                  </div>
                  <div class='clearfix'></div>
                </div>
                ", "scrollable"
      #$.facebox (World.Utils.FormatJson JSON.stringify data, null, "\t"), "scrollable"
  
  render_location_map: () ->
    cache_server= ""#World.Config["base_cache"]
    post = @_data
    tdiff = World.Utils.TimeDifference post.world_post_time
    
    $.facebox " <div class='location'>
                  <img src='#{cache_server}#{post.user.profile_image_url}' class='profile-pic'>
                  <div>
                    <span class='screen_name'>#{post.user.screen_name}</span> 
                    <span class='name'>#{post.user.name}</span>
                    <br>
                    #{World.Utils.ParsePostContent(post.text)}
                    <a class='time' data-time='#{post.world_post_time}' title='#{post.created_at}' href='javascript:;'>#{tdiff}</a>
                  </div>
                  <div class='clearfix'></div>
                </div>
                <div id='map' style='width:500px;height:400px;'></div>", "scrollable"
    place = new google.maps.LatLng(@_data["geo"]["coordinates"][0], @_data["geo"]["coordinates"][1])
    map = new google.maps.Map(document.getElementById('map'), {"zoom":16, center: place , "mapTypeId": google.maps.MapTypeId.ROADMAP })
    marker = new google.maps.Marker({ map: map, draggable: false, annimation: google.maps.Animation.DROP, position: place})
    
    
    
    
    
    
    
    
  ###
   Creates a GET request to the specified source.
    
   @param {Object} options
  ###
  _get: (options) ->
    action   = options["action"];
    success_c= options["success"];
    error_c  = options["error"];
    
    id = @_data["world_post_id"];
    ty = @_data["world_post_type"];
    
    parms = options["params"] || {};
    parms["id"] = parms["id"] || id;
    parms["type"] = ty;
    
    $.get @_provider_url + action, 
          parms, 
          (data) =>
             if data.error == false
              if success_c?
                success_c(data["data"]);
             else 
                if error_c?
                  error_c(data["data"]);
                else if typeof(error_c) == "string"
                  alert World.Utils.GetMessage(error_callback)
        
        # TODO: Log
      
    
  
  
  ###
   Creates a POST request to the specified source.
    
   @param {Object} options
  ###
  _post: () -> 
    action   = options["action"];
    success_c= options["success"];
    error_c  = options["error"];
    
    id = @_data["world_post_id"];
    ty = @_data["world_post_type"];
    
    parms = options["params"] || {};
    parms["id"] = parms["id"] || id;
    parms["type"] = ty;
    
    $.get @_provider_url + action, 
          parms, 
          (data) =>
             if data.error == false
                if success_c?
                  success_c(data["data"]);
             else 
                if error_c?
                  error_c(data["data"]);
                else if typeof(error_c) == "string"
                  alert World.Utils.GetMessage(error_callback)
        
        # TODO: Log