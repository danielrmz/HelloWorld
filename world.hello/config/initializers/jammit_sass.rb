
require 'haml/util'
require 'sass/engine'

module Jammit
  module Helper
    SASS_TIMESTAMPS = {}

    def process(dirr)
      unless Rails.env.production?
        paths = Dir[Rails.root.join(dirr)].select do |path|
          next if path =~ %r{/_[^/]+$} # skip partials
          t = File.mtime(path)
          if SASS_TIMESTAMPS[path] == t
            false
          else
            SASS_TIMESTAMPS[path] = t
          end
        end
        paths.each do |path|
          Rails.logger.info("Compiling #{path} with SASS.")
          engine = Sass::Engine.new(
            File.read(path),
            :load_paths => [Rails.root.join('public/stylesheets')],
            :cache      => false,
            :syntax     => :scss
          )
          File.open(path.sub(/scss$/, 'css'), 'w') { |f| f.write(engine.render) }
        end
      end
    end

    def include_stylesheets_with_sass(*packages)
      
      [
        'public/stylesheets/common/*.scss',
        'public/stylesheets/auth/*.scss'
      ].each { |path| process(path) }
      
      include_stylesheets_without_sass(*packages)
    end

    alias_method_chain :include_stylesheets, :sass
  end
end