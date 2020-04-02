(function () {
    function displaySearchResults(results, store) {
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

            for (let key in window.store) {
                this.add({
                    'id': key,
                    'title': window.store[key].title,
                    'tags': window.store[key].tags,
                    'content': window.store[key].content
                });
            }
        });

        const results = idx.search(searchTerm);
        displaySearchResults(results, window.store);
    }
})();
