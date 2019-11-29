module Jekyll
  class AuthorPageGenerator < Generator
    safe true

    def generate(site)
      authors = site.posts.docs.flat_map { |post| post.data['author'] || [] }.to_set
      authors.each do |author|
        site.pages << AuthorPage.new(site, site.source, author)
      end
    end
  end

  class AuthorPage < Page
    def initialize(site, base, author)
      @site = site
      @base = base
      @dir  = File.join('author', author)
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'author.html')
      self.data['author'] = author
      self.data['title'] = "#{author}"
    end
  end
end
