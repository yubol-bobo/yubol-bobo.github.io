#!/bin/bash
export GEM_HOME="/Users/bobo/.gem/ruby/3.4.0"
export PATH="/Users/bobo/Library/Python/3.9/bin:/Users/bobo/.gem/ruby/3.4.0/bin:/opt/homebrew/Library/Homebrew/vendor/portable-ruby/3.4.7/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/local/bin"
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
cd "/Users/bobo/Library/CloudStorage/Dropbox/02. Research/Github/yubol-bobo.github.io"
exec /opt/homebrew/Library/Homebrew/vendor/portable-ruby/3.4.7/bin/ruby -S bundle exec jekyll serve --host 0.0.0.0 --port 4000
