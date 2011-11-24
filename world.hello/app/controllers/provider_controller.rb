require "rubygems"
require "bundler/setup"
require "date"

require "twitter"
require "open-uri"
require "yajl"

# TODO Change static methods to dynamic uri based calls to the proxy client. 
# Hence requesting /provide/home_timeline calls Twitter::Client.home_timeline

class ProviderController < ApplicationController
  @@Images = Hash.new
  
  before_filter :configure
  
  def post
      unless params[:pid] then return render :json => render_error("No post id provided") end  
      render :json => (message cache_profile_picture normalize_post Twitter.status(params[:pid])).to_json
  end
  
  def latest
    @Timeline = message normalize_timeline Twitter.home_timeline :contributor_details => true, :include_entities => true
    render :json => @Timeline.to_json
  end
  
  def since
    unless params[:id] then return render :json => render_error("No last post id provided") end  
    @Timeline = message normalize_timeline Twitter.home_timeline :since_id => params[:id], :contributor_details => true, :include_entities => true
    render :json => @Timeline.to_json  
  end
  
  def page
    unless params[:id] then return render :json => render_error("No max post id provided") end
    @Timeline = message normalize_timeline Twitter.home_timeline :max_id => params[:id]
    render :json => @Timeline.to_json
  end

  def update
    unless params[:post] && params[:post].length < 140 then return render :json => render_error("No post provided") end
    render :json => (message Twitter.update(params[:post])).to_json
  end

  def delete
    unless params[:id] then return render :json => render_error("No post id provided") end
    begin
      render :json => (message Twitter.status_destroy(params[:id])).to_json
    rescue Twitter::NotFound => ex
      render :json => render_error(ex.http_headers["status"])
    end
  end
  
  def reply 
    unless params[:id] then return render :json => render_error("No post id provided") end
    unless params[:reply_message] && params[:reply_message].length < 140 then return render :json => render_error("No reply message provided") end
    
    options = {}
    options[:in_reply_to_status_id] = params[:id].to_i
    
    render :json => (message cache_profile_picture normalize_post Twitter.update(params[:reply_message], options)).to_json
  end

  def favorite
    unless params[:id] then return render :json => render_error("No post id provided") end
    render :json => (message Twitter.favorite_create(params[:id])).to_json
  end
  
  def unfavorite
    unless params[:id] then return render :json => render_error("No post id provided") end
    render :json => (message Twitter.favorite_destroy(params[:id])).to_json
  end
  
  def favorites
    unless params[:id] then return render :json => render_error("No post id provided") end
    render :json => (message cache_profile_pictures Twitter.favorites).to_json
  end

  def share
    unless params[:id] then return render :json => render_error("No post id provided") end
    render :json => (message Twitter.retweet(params[:id])).to_json 
  end
  
  def unshare
    unless params[:id] then return render :json => render_error("No post id provided") end
    render :json => (message Twitter.retweet(params[:id])).to_json 
  end
  
  def retweets
    render :json => (message cache_profile_pictures Twitter.retweets_of_me).to_json
  end
  
  def mentions
    render :json => (message cache_profile_pictures Twitter.mentions).to_json
  end
  
  def me
    render :json => (message Twitter.verify_credentials).to_json  
  end
  
  private 
  def message data
    wrap = Hash.new
    
    wrap['data'] = data
    wrap['error']= false
    wrap['time'] = Time.now.to_i
    
    return wrap
  end
  
  private
  def configure
      if session[:user] == nil 
        return 
      end
      provider = session[:user].user_provider.find_all { |el| el.provider == "twitter" }
      if provider.length == 0
        return 
      end
      
      provider = provider[0]
      
      
      Twitter.configure do |config|
        config.oauth_token  = provider[:token]
        config.oauth_token_secret = provider[:secret]
      end
      
      client = Twitter::Client.new
      @current_user = client.verify_credentials
      
      return client
  end
  
  private
  def normalize_timeline timeline
    timeline = cache_profile_pictures timeline
    timeline.each { |tweet| 
      tweet = normalize_post tweet
      if tweet.retweeted_status
        tweet.retweeted_status = normalize_post tweet.retweeted_status
      end
    }
    return timeline;
  end
  
  private 
  def normalize_post post
    post.world_post_id   = post.id_str
    post.world_post_type = "tw"
    post.world_post_time = DateTime.strptime(post.created_at, "%a %b %d %H:%M:%S %z %Y").to_i
    return post
  end
  
  private 
  def cache_profile_pictures timeline
    timeline.each { |tweet| 
      tweet = cache_profile_picture tweet
    }
    
    return timeline
  end
  
  private
  def cache_profile_picture tweet
     
         image = tweet.user.profile_image_url.sub("_normal","_bigger"); 
         
         if @@Images.has_key? image
           tweet.user.profile_image_url = @@Images[image]
         else
         open(@config["base_cache"] + "fetch?file="+image) { |f| 
          f.each_line {|line| 
             tweet.user.profile_image_url = line;
             @@Images[image] = line;
          }  
         } 
         end
         
         # Process retweet image
         if tweet.retweeted_status 
           image = tweet.retweeted_status.user.profile_image_url.sub("_normal", "_bigger")
           if @@Images.has_key? image
            tweet.retweeted_status.user.profile_image_url = @@Images[image]
           else
             open(@config["base_cache"] + "fetch?file="+image) { |f| 
              f.each_line {|line| 
                 tweet.retweeted_status.user.profile_image_url = line;
                 @@Images[image] = line;
              }  
             } 
           end
         end
         return tweet
  end
  
  private
  def render_error (message)
    error = Hash.new
    error["id_error"] = 0
    error["message"] = message
    msg = message error
    msg['error'] = true
    return msg
  end
  
end
