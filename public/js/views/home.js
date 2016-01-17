'use strict';
define(["jquery", "underscore", 'backbone', 'loadCSS', 'views/components/search', 'text!templates/home.html',],
function($, _, Backbone, loadCSS, SearchView, homeTemplate){
    var HomeView = Backbone.View.extend({
        el: 'main',
        template: _.template(homeTemplate),
        render: function(){
            loadCSS("/css/home.css");
            this.$el.html(this.template());

            var searchView = new SearchView();
            searchView.setElement( this.$(".search-area") );
            searchView.render();
        }
    });
    return HomeView;
});