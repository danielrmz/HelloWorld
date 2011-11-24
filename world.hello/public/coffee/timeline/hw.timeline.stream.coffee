class World.Timeline.Stream 
  ###
   Represents a collection of posts, feed items etc.
    
   @constructor
   @param {HTMLElement} container Container of the stream
   @param {string} provider_url Service url to fetch for feed items.
   @param {Object=} options
  ###
  constructor: (container, provider_url, options) ->
    
    if provider_url == ""
      throw new Error(World.Utils.GetMessage("Stream_NoProviderSpecified"));
    
    
    @_container  = container;
    @_provider_url = provider_url;
    
    @render();
  
  #  
  # Properties
  #
  
  _container: null
  _provider_url: ""
  _items: []
  _infinite_scroll_enabled: true
  
  #
  # Static Methods
  #
  
  @Post: () ->
  
  #
  # Instance Methods
  #
  
  ###
   Fetches new items or the ones specified by the page argument
  ###
  fetch: () ->
    childs = $(@_container).children();
    last   = 0;
    
    if childs.size() > 0 
      last = childs.first()
      if last?
        last = last.data("object").get_id();
      else 
        last = 0
    
    action = if last == 0 then 'latest' else 'since'
    $.get @_provider_url + "/" + action, 
          { id: last }, 
          (data) => 
            if data.error == false
              @render_posts data["data"], (action == 'latest')
            else
              alert data["data"]["message"]
    
    
  ###
   Starts the polling for new items on the stream
   
   @param {number} fetch_interval Time in seconds the stream will fetch/look for new items.
   @return {boolean} False indicates it is already started.
  ###  
  start: (fetch_interval) ->
    if !fetch_interval or isNaN(fetch_interval) 
      throw new Exception(World.Utils.GetMessage("Stream_NoFetchIntervalSpecified"));
    
    if @_interval_h? 
      return false
    
    this._interval_h = setInterval (() => 
      this.fetch()
      this.updateTimes()
    ) , fetch_interval * 1000
    
    $(@_container).bind("stream.update", () => this.fetch()).addClass("posts")
    
    @fetch() # initial fetch
    return true;
    
  
  ###
   Stops the current polling if exists
    
   @return {boolean} Returns true if it was able to stop the polling.
  ###  
  stop: () ->
    if !@_interval_h 
      return false
    
    clearInterval @_interval_h
    @_interval_h = null
    return true
  
  ###
  ###
  updateTimes: () ->
    $(".time").each () ->
      post_time = $(this).attr "data-time"
      $(this).html World.Utils.TimeDifference(post_time)
  
  ###
   Renders the current stream elements, establishes ui behaviors.
  ###
  render: () ->
    
    $(@_container).infinitescroll {
                                    navSelector  : "div.navigation",   # selector for the paged navigation (it will be hidden)
                                    nextSelector : "div.navigation a:first", # selector for the NEXT link (to page 2)
                                    itemSelector : "",      # selector for all items you'll retrieve
                                    dataType: "json",
                                    loadingText: "",
                                    appendCallback: false,
                                    pathParse: (arg1, arg2) => 
                                      last_tweet = jQuery(".tweet").last()
                                      if last_tweet?
                                        last_tweet_id = last_tweet.data("object").get_id();
                                        return @_provider_url + "/page/" + last_tweet_id;
                                      else
                                        return ""
                                  }, 
                                  (items) => 
                                      items = $.parseJSON items;
                                      if items.error == false
                                        @render_posts items["data"], true
                                      else 
                                        alert items["data"]["message"]
    
  
  ###
   Renders the stream posts accordingly
    
   @param {Array.<Object>} posts
   @param {boolean=} append
  ###
  render_posts: (posts, append) ->
    i = if append then 0 else posts.length - 1
    displayed=[]
    while (if !append then i >= 0 else i < posts.length)
      ps = posts[i]
 
      post = new World.Timeline.Post(ps, @_provider_url.toString() + '/item/{post_type}/{post_id}/' );
        
      # Avoid readding it twice if it already exists in the dom.
      exists = $(@_container).find("*[data-postid="+post.get_id()+"]");
      if exists.size() > 0 
        if append then i++ else  i--
        continue
        
        
      $(@_container)[if append then "append" else "prepend"](post.render());
      post.show()
      
      displayed.push ps
      
      if append then i++ else  i--
    
    this.updateTimes()
    
    if append == false and World.Utils.Notifier.HasPermission() && displayed.length > 0
        if displayed.length == 1
          World.Utils.Notifier.Notify(displayed[0]["user"]["profile_image_url"], displayed[0]["user"]["screen_name"] + " says,", displayed[0]["text"]);
        else
          World.Utils.Notifier.Notify("", "Hello World", "There are new unread posts");  
        
    
