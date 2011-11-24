#!/usr/bin/env ruby
require 'yaml'
require 'json'

env = JSON.parse(File.read('/home/dotcloud/environment.json'))

prod_db = "/home/dotcloud/current/config/database.yml"

config = {}
config["production"] = {}
config["production"]["host"] = env['DOTCLOUD_DB_MYSQL_HOST']
config["production"]["user"] = env['DOTCLOUD_DB_MYSQL_LOGIN']
config["production"]["password"] = env['DOTCLOUD_DB_MYSQL_PASSWORD']
config["production"]["port"] = env['DOTCLOUD_DB_MYSQL_PORT'].to_i
config["production"]["adapter"] = "mysql2"
config["production"]["database"] = "helloworld"
config["production"]["pool"] = 5
config["production"]["timeout"] = 5000

File.open(prod_db, "w") do |out|
  YAML.dump(config, out)
end
