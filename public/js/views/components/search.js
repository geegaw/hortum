"use strict";
define([
    "jquery", 
    "underscore", 
    "backbone", 
    "views/components/pagination",
    "text!templates/components/search/search.html",
    "text!templates/components/search/filters.html",
    "text!templates/plant-info.html"
],
function($, _, Backbone, PaginationView, searchTemplate, filtersTemplate, plantInfoTemplate){
    var SearchView = Backbone.View.extend({
        template: _.template(searchTemplate),
        total: 0,
        initialize: function(options){
            _.bindAll(this, "fetch", "renderSearch", "_renderFacets", "_renderResults");
        },
        render: function(){
            this.$el.html(this.template());
            this.fetch();
        },
        renderSearch: function(searchResponse){
            console.log(searchResponse);
            if (searchResponse){
                this.total = searchResponse.total;
                this._renderFacets(searchResponse.aggregations);
                this._renderResults(searchResponse.results);
                this.$(".search_query__total").html(searchResponse.total);
            }
        },
        _renderFacets: function(facets){
            var tmpl = _.template(filtersTemplate);
            var imageCount = facets.images.value;
            delete(facets.images);
            
            var filters = this._getFilters()

console.log(filters)
            this.$(".search__filters").html(tmpl({
                filters: filters,
                facets: facets,
                imageCount: imageCount
            }));
        },
        _renderResults: function(results){
            var plants = [];
            _.each(results, function(plant){
                plants.push(plant._source);
            })
            var tmpl = _.template(plantInfoTemplate);
            this.$(".search__results__results").html(tmpl({
                plants: plants
            }));

            var pagination = new PaginationView({
                perPage: 25,
                collection: this,
                $el: this.$(".search__results__pagination"),
                callBack: this.renderSearch,
            });
            pagination.render();
        },
        events: {
            "click .filter__filter__label"  : "showBuckets",
            "click .search_query_query_go"   : "fetch",
            "click .filter__filter__bucket" : "fetch",
        },
        showBuckets:function(e){
            var self = this;
            var $this = $(e.currentTarget);
            var $parent = $this.parents(".filter__filter:first");
            if (self.$(".filter__filter.open").length && !$parent.hasClass("open")){
                self.$(".filter__filter.open").toggleClass("open").find(".filter__filter__facets").slideToggle();
            }
            $parent.toggleClass("open").find(".filter__filter__facets").slideToggle();
        },
        fetch: function(e){
            var self = this;
            var q = $.trim(self.$(".search_query_query").val());
            var filters = self._getFilters();
            return $.get( "/search/", { q: q, filters: filters } ).success(function(response){
                self.renderSearch( response );
            })
            .fail(function(response){
                console.log(response);
            });
        },
        _getFilters: function(){
            var self = this;
            var filters = {};
            this.$(".filter__filter__bucket:checked").each(function(){
                var data = $(this).data();
                filters[ data.facet ] = filters[ data.facet ] ? filters[ data.facet ] : [];
                filters[ data.facet ].push( data.value );
            });
            return filters;
        }
    });
    return SearchView;
});