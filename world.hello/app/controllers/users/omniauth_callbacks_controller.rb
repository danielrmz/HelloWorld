
class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController

  def twitter
    
    # You need to implement the method below in your model
    @user = User.find_for_twitter_oauth(env["omniauth.auth"], current_user)
    
    if @user.persisted?
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Twitter"
      session[:user] = @user
      sign_in @user, :event => :authentication
      redirect_to '/users/edit'
    else
      session["devise.twitter_data"] = env["omniauth.auth"].except("extra")
      redirect_to new_user_registration_url
    end
  end

end