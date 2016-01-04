'use strict';
define(['backbone'], function(Backbone) {
    var Plant = Backbone.Model.extend({
        urlRoot: "/api/plant/",
    })
    return Plant;
});