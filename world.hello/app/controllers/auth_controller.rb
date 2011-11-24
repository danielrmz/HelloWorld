class AuthController < ApplicationController
  
  def index
    @callback_url = "http://www.ismayel.dotcloud.com/oauth/callback"
    @consumer = OAuth::Consumer.new(@consumer_key, @consumer_secret, :site => "http://twitter.com")
    
    @request_token = @consumer.get_request_token(:oauth_callback => @callback_url)
    session[:request_token] = @request_token
    redirect_to @request_token.authorize_url(:oauth_callback => @callback_url)
    
  end

  def callback
    @token = session[:request_token].get_access_token
    @access_token = @token.token
    @access_secret= @token.secret #session[:request_token].get_access_secret
  end
  
  def login
    
  end
  
end
