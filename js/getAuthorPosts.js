(function () {
    function displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');

        if (results.length) {
            results.forEach(result => {
                createTile(result, searchResults);
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

    const authorName = getQueryVariable('name');

    const results = Object.values(window.store).filter(x => x.author === authorName);
    displaySearchResults(results);
})();
