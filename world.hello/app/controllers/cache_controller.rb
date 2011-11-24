require "digest/sha1"
require "open-uri"


class CacheController < ActionController::Base
  
  
  # Public: Fetches and caches locally the specified image
  # 
  # file - The absolute uri of the image to cache.
  # 
  # Returns the hashed uri to use.
  def fetch
    
    falseImage = "http://" + request.host + ":" + request.port.to_s + "/cache/404.png"
    image = params[:file]
    if image == "" || image == nil
       render :text => falseImage 
       return
    end
    
    image = image.lstrip.rstrip
  
    id    = Digest::SHA1.hexdigest(image)
    ext   = File.extname(image).downcase
  
    if ext != ".png" && ext != ".jpg" 
      return render :text => falseImage
    end
    
    filepath = Rails.root.join("public", "files", id + ext)
    fileurl  = "http://" + request.host + ":" + request.port.to_s + "/cache/" + id + ext;
    
    if File.exist? filepath 
      return render :text => fileurl 
    end
    
    download image, filepath
  
    return render :text => fileurl 
  end
  
  # Public: Gets the cached image from the local server
  # 
  # id  - Represents the hashed filename
  # ext - Represents the extension of the file
  # 
  # Returns the image blob
  def get 
    expires_in 12.hours, :public => true
    
    if params[:id] == "false"
      send_data Rails.root.join("public", "files", "404.png"), :type => "image/png", :disposition => "inline"
      return 
    end
    
    filepath = Rails.root.join( "public", "files", File.basename(params[:id]) + "." + params[:ext] )
    
    if File.exists? filepath
      
      if params[:ext]  == "jpg" 
        content_type = 'image/jpeg' 
      end
      if params[:ext]  == "png" 
        content_type = 'image/png'
      end
      
      return send_data File.read(filepath), :type => content_type, :disposition => "inline"
    end
    
    render :nothing => true
  end
  
  
  private
  def download full_url, to_here
    writeOut = open(to_here, "wb")
    writeOut.write(open(full_url).read)
    writeOut.close
  end

end