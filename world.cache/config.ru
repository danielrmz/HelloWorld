# require ::File.expand_path('../config/environment',  __FILE__)
require ::File.expand_path('../server.rb', __FILE__)

run Sinatra::Application
