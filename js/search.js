fetch("/json/posts.json")
    .then(response => response.json())
    .then(store => {
        (function () {
            function displaySearchResults(results) {
                const searchResults = document.getElementById('search-results');

                if (results.length) {
                    results.forEach(result => {
                        const item = store[result.ref];
                        createTile(item, searchResults);
                    });
                } else {
                    //TODO komunikat o braku wyników
                    searchResults.innerHTML = '<li>Brak wyników wyszukiwania</li>';
                }
            }

            function getQueryVariable(variable) {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get(variable);
            }

            const searchTerm = getQueryVariable('query');

            if (searchTerm) {
                document.getElementById('search-box').setAttribute("value", searchTerm);

                const idx = lunr(function () {
                    this.field('id');
                    this.field('title', {boost: 10});
                    this.field('tags');
                    this.field('content');

                    for (let key in store) {
                        this.add({
                            'id': key,
                            'title': store[key].title,
                            'tags': store[key].tags,
                            'content': store[key].content
                        });
                    }
                });

                const results = idx.search(searchTerm);
                displaySearchResults(results);
            }
        })();
    });


