require 'pp'

class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
  devise :omniauthable
  
  has_many :user_provider

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :twitter_id
  
  def self.find_for_twitter_oauth(access_token, signed_in_resource=nil)
    
    data = access_token['extra']['user_hash']
    user = nil
    
    if user = User.find_by_twitter_id(data["id_str"])
      authentication = UserProvider.find_by_provider_and_user_id(access_token['provider'], data['id_str'])
      unless authentication 
        authentication = UserProvider.create(:provider => access_token['provider'], :user_id => user.id, :token => access_token['credentials']['token'], :secret => access_token['credentials']['secret'])
      end
    else # Create a user with a stub password. 
      user = User.create!(:email => data["id_str"] + "@twitter.com", :password => Devise.friendly_token[0,20], :twitter_id => data["id_str"], :is_new => true) 
      authentication = UserProvider.create(:provider => access_token['provider'], :user_id => user.id, :token => access_token['credentials']['token'], :secret => access_token['credentials']['secret'])
    end
   
    return user
    
  end
  
  def update_with_password(params={})
    params.delete(:current_password)
    self.update_without_password(params)
  end 

   # Update record attributes without asking for the current password. Never allow to
   # change the current password
   def update_without_password(params={})
      result = update_attributes(params)
      clean_up_passwords
      result
   end
end
