---
---
const language = '{{site.active_lang}}';
const jsonPath = language === 'en' ? '/en/json/posts.json' : '/json/posts.json';
fetch(jsonPath)
    .then(response => response.json())
    .then(store => {
        (function () {
            function displaySearchResults(results) {
                const searchResults = document.getElementById('search-results');

                if (results.length) {
                    results.forEach(result => {
                        const item = store[result.ref];
                        searchResults.innerHTML += `
                            <custom-tile 
                                title="${item.title}" 
                                url="${item.url}"
                                author-name="${item.author}"
                                author-image="${'/assets/img/authors/' + item.image}"
                                author-url="${item.authorUrl}"
                                image="${item.highlight}"
                                date="${getFormattedDate(item.date)}"
                                content="${item.content.split(' ').slice(0, 30).join(' ') + '...'}"
                            ></custom-tile>
                        `
                    });
                } else {
                    searchResults.innerHTML = `
                        <h1>
                            Brak wyników wyszukiwania :(
                        </h1>`;
                }
            }

            function getQueryVariable(variable) {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get(variable);
            }

            function getFormattedDate(date) {
                const dateAsArray = date.split('-');
                let months;
                if (language === 'pl') {
                    months = {
                        '01': 'stycznia',
                        '02': 'lutego',
                        '03': 'marca',
                        '04': 'kwietnia',
                        '05': 'maja',
                        '06': 'czerwca',
                        '07': 'lipca',
                        '08': 'sierpnia',
                        '09': 'września',
                        '10': 'października',
                        '11': 'listopada',
                        '12': 'grudnia'
                    };
                } else {
                    months = {
                        '01': 'Jan',
                        '02': 'Feb',
                        '03': 'Mar',
                        '04': 'Apr',
                        '05': 'May',
                        '06': 'Jun',
                        '07': 'Jul',
                        '08': 'Aug',
                        '09': 'Sep',
                        '10': 'Oct',
                        '11': 'Nov',
                        '12': 'Dec'
                    };
                }
                return dateAsArray[0] + " " + months[dateAsArray[1]] + " " + dateAsArray[2];
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
                            'content': store[key].content,
                            'path': store[key].path
                        });
                    }
                });

                const results = idx.search(searchTerm);
                displaySearchResults(results);
            }
        })();
    });


