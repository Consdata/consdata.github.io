(function () {
    function displaySearchResults(results, store) {
        const searchResults = document.getElementById('search-results');

        if (results.length) { // Are there any results?
            let appendString = '';

            for (let i = 0; i < results.length; i++) {  // Iterate over the results
                const item = store[results[i].ref];
                const listItem = document.createElement('li');
                const anchor = document.createElement('a');
                const title = document.createElement('h3');
                const content = document.createElement('p');
                const postInfoContainer = document.createElement('div');
                const image = document.createElement('img');
                const author = document.createElement('p');
                const date = document.createElement('p');

                listItem.append(anchor, postInfoContainer);
                searchResults.appendChild(listItem);
                appendString += '<li><a href="' + item.url + '"><h3>' + item.title + '</h3>';
                appendString += '<p>' + item.content.substring(0, 150) + '...</p></div></a>';
                appendString += '<div class="tile-author"><img class="small-author-image" src="/assets/img/authors/' + item.image + '">';
                appendString += '<p>' + item.author + '<br/>' + item.date + '</p></div></li>';
            }

            searchResults.innerHTML = appendString;
        } else {
            searchResults.innerHTML = '<li>Brak wyników wyszukiwania</li>';
        }
    }

    function getQueryVariable(variable) {
        const query = window.location.search.substring(1);
        const vars = query.split('&');

        for (let i = 0; i < vars.length; i++) {
            const pair = vars[i].split('=');

            if (pair[0] === variable) {
                return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
            }
        }
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
