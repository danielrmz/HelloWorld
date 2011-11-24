class ApplicationController < ActionController::Base
  protect_from_forgery
  
  before_filter :set_controller_and_action_names
  before_filter :authenticate_user!
  before_filter :set_config
  
  def set_controller_and_action_names
      @current_controller = controller_name
      @current_action     = action_name
  end
  
  def set_config 
      @config = Hash.new
      @config["i18n"] = "en"
      @config["dev"]  = Rails.env.development?
      @config["user"] = user_signed_in? ? current_user.id : 0
      @config["name"] = ""
      @config["is_authenticated"] = user_signed_in?
      @config["base_static"] = "http://" + request.host + ":" + request.port.to_s + "/"
      @config["base_domain"] = "http://" + request.host + ":" + request.port.to_s + "/"
      @config["base_cache"]  = url_for(:controller=>"cache") + "/"
      @config["start"] = Time.now.to_i
      @config["current_module"] = controller_name
      @config["current_action"] = action_name
      @config["method"]  = request.request_method
      @config["version"] = "0"
  end
    
end
