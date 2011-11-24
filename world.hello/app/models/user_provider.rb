class UserProvider < ActiveRecord::Base
   attr_accessible :provider, :user_id, :token, :secret
   
   belongs_to :user
end
