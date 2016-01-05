require.config({
    baseUrl: "/js",
    paths: {
        "backbone": "components/backbone/backbone-min",
        "jquery": "components/jquery/dist/jquery.min",
        "text": 'components/requirejs-text/text',
        "underscore": "components/underscore/underscore-min",
        "loadCSS": "components/loadcss/loadCSS",
    },
    shim: {
        "loadCSS": { exports: "loadCSS" },
    },
    deps: ['app']
});