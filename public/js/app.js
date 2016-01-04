'use strict';

define([
    'backbone',
    'routes'
], function (Backbone, HortumRouter) {
    new HortumRouter();
    Backbone.history.start({ pushState: true });
});