class CustomTile extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const title = this.getAttribute('title');
        const authorName = this.getAttribute('author-name');
        const authorUrl = this.getAttribute('author-url');
        const date = this.getAttribute('date');
        const url = this.getAttribute('url');
        const image = this.getAttribute('image');
        const authorImage = this.getAttribute('author-image');
        const content = this.getAttribute('content');

        this.innerHTML = `
                <div class="col-15 post-animation search-result-tile">
                    <div class="col-2-3">
                        <a href="${url}">
                            <img class="highlight-image" src="${image}" alt="postimage"/>
                        </a>
                    </div>
                    <div class="col-1-3 big-post-tile-content">
                        <a href="${url}">
                            <p class="post-title no-breaking-word">
                               ${title}
                            </p>
                            <p class="post-description no-breaking-word">
                                ${content}
                            </p>
                        </a>
                        <div class="tile-author">
                            <a href="${authorUrl}" class="author-name">
                                <img class="small-author-image" src="${authorImage}" alt="author">
                            </a>
                            <div class="post-info">
                                <a href="${authorUrl}" class="author-name">${authorName}</a>
                                <span>${date}</span>
                            </div>
                        </div>
                    </div>
                </div>
        `
    }
}

window.customElements.define('custom-tile', CustomTile);
