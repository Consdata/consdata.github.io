function loadScriptAsync(scriptSrc, callback) {
    if (typeof callback !== 'function') {
        throw new Error('Not a valid callback for async script load');
    }
    const script = document.createElement('script');
    script.onload = callback;
    script.src = scriptSrc;
    document.head.appendChild(script);
}

loadScriptAsync('https://www.googletagmanager.com/gtag/js?id={{ site.google_analytics }}', function () {
    window['ga-disable-{{ site.google_analytics }}'] = window.doNotTrack === "1" || navigator.doNotTrack === "1" || navigator.doNotTrack === "yes" || navigator.msDoNotTrack === "1";
    window.dataLayer = window.dataLayer || [];

    const gtag = () => dataLayer.push(arguments);

    gtag('js', new Date());
    gtag('config', '{{ site.google_analytics }}', {'anonymize_ip': true});
})
