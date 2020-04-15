---
---
fetch("/json/posts.json")
    .then(response => response.json())
    .then(store => {
        function displayResults(results) {
            const container = document.getElementById("recommended-posts-desktop");
            const containerMobile = document.getElementById("recommended-posts-mobile");
            if (results.length) {
                results
                    .slice(1, 6)
                    .forEach(result => {
                        const item = store[result.ref];
                        const listElement = document.createElement('li');
                        const anchor = document.createElement('a');
                        const postTitle = document.createTextNode(item.title);
                        listElement.classList.add('sidebar-post');
                        listElement.classList.add('no-breaking-word');
                        anchor.setAttribute('href', item.url);
                        anchor.appendChild(postTitle);
                        listElement.appendChild(anchor);
                        container.appendChild(listElement);
                        containerMobile.appendChild(listElement.cloneNode(true));
                    });
            }
        }

        const tags = "{{ post.tags | join: ' ' }}";
        const idx = lunr(function () {
            this.field('tags');

            for (let key in store) {
                this.add({
                    'id': key,
                    'title': store[key].title,
                    'tags': store[key].tags,
                });
            }
        });
        const results = idx.search(tags);
        displayResults(results);
    })
