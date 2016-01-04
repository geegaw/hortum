'use strict';
define(["jquery", "underscore", 'backbone', 'text!templates/home.html',],
function($, _, Backbone, homeTemplate){
    var HomeView = Backbone.View.extend({
        el: 'main',
        template: _.template(homeTemplate),
        render: function(){
            this.$el.html(this.template());
        }
    });
    return HomeView;
});