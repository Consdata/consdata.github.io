```bash
mkdir -p "$HOME/.jekyll/tmp_bundle" \
&& docker run \
    --name consdata-sites \
    --rm \
    -it \
    -e JEKYLL_UID=$UID \
    -p 4000:4000 \
    -p 35729:35729 \
    --volume="$HOME/.jekyll/tmp_bundle:/usr/local/bundle" \
    --volume="$PWD:/srv/jekyll" \
    jekyll/jekyll:3.8 bash -c 'bundle install && jekyll serve --livereload'
```