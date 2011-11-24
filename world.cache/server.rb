require "bundler/setup"
require "sinatra"
require "digest/sha1"
require "open-uri"

set :environment, :production
set :server, %w[thin mongrel webrick]
set :port, 4321
set :static, true
set :public, "public"

use Rack::Auth::Basic do |username, password|
	username == "admin" && password == "secret"
end

def download full_url, to_here
	writeOut = open(to_here, "wb")
	writeOut.write(open(full_url).read)
	writeOut.close
end

inMemoryMap = Hash.new 

get '/ping' do
	"pong"
end

get '/' do
	image = params[:file]
	if image == "" || image == nil
		return "false"
	end
	
	image = image.lstrip.rstrip

	if inMemoryMap.has_key? image
		return inMemoryMap[image]
	end

	id    = Digest::SHA1.hexdigest(image)
	ext   = File.extname(image).downcase

	if ext != ".png" && ext != ".jpg" 
		return "false"
	end
	
	filepath = "files/" + id + ext
	
	if File.exist? "public/" + filepath 
		return filepath
	end
	
	download image, "public/" + filepath

	inMemoryMap[image] = filepath

	return filepath
end

get '/false' do
	content_type 'image/png'
	response['Cache-Control'] = "public, max-age=60"
	return File.read("404.png")
end 

get '/afiles/:id' do 
	response['Cache-Control'] = "public, max-age=60"
	filepath = "files/" + File.basename(params[:id])
	if File.exists? filepath
		ext = File.extname(filepath).downcase
		if ext == ".jpg" 
			content_type 'image/jpeg' 
		end
		if ext == ".png" 
			content_type 'image/png'
		end
		return File.read(filepath)
	end
	return ""
end
