try {
    window.localStorage.removeItem("outdated-browser");
} catch (err) {
    // ignore
}
function outdatedBrowserMarker() {
    try {
        window.console.warn('Outdated / Unsupported browser detected');
        // fallback for < IE7
        // replace root message, in case the outdated-browser message does not work and not visible
        var rootElement = document.getElementById("root");
        if (rootElement) {
            rootElement.innerHTML = rootElement.innerHTML +
            '<p style="font-family: sans-serif; text-align: center; text-transform: uppercase">This web application may not support your browser</p>' +
            '<p style="font-family: sans-serif; text-align: center; "><b><a href="https://browser-update.org/update-browser.html">Update your browser</a></b> to view this resource correctly' +
                "<br/>or <b>dismiss the message</b> and continue as it works</p>";
        }
        window.localStorage.setItem("outdated-browser", "true");
    } catch (err) {
        // ignore
    }
}
var imgTag = '<img src="/outdated-pixel.png" style="visibility: hidden;" height="0" width="0" onload="outdatedBrowserMarker()" />';
outdatedBrowserRework({
    fullScreen: true,
    backgroundColor: '#1a283a',
    textColor: 'white',
    browserSupport: {
        // see https://caniuse.com/#search=proxy
        // see https://caniuse.com/#feat=es6
        // (Hookstate needs Map and Set, which was supported by most of the browsers before ES6.
        // However this App needs other stuff, like Array.from, Object.values, etc.)
        'Chrome': 54,
        'Edge': 15,
        'Safari': { major: 10, minor: 1 },
        'Mobile Safari': { major: 10, minor: 3 },
        'Firefox': 54,
        'Opera': 41,
        'Vivaldi': { major: 2, minor: 7 }, // do not really know the minimal version, put the latest as of August 2019
        'Yandex': { major: 19, minor: 9 }, // do not really know the minimal version, put the latest as of August 2019
        'IE': false
    },
    messages: {
        en: {
            outOfDate: (imgTag + "This web application requires newer version of your browser"),
            unsupported: (imgTag + "This web application may not support your browser"),
            update: {
                web: ("<b>Update your browser</b> to view this resource correctly" +
                "<br/>or <b>dismiss the message</b> and continue as it works"),
                googlePlay: ("<b>Update your browser</b> to view this resource correctly" +
                "<br/>or <b>dismiss the message</b> and continue as it works"),
                appStore: ("<b>Update iOS from the Settings App</b> to view this resource correctly" +
                "<br/>or <b>dismiss the message</b> and continue as it works")
            },
            url: "https://browser-update.org/update-browser.html",
            callToAction: 'Update browser',
            close: "Close"
        }
    }
});
