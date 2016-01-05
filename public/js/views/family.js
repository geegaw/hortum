'use strict';
define([
    "jquery",
    "underscore",
    'backbone',
    'loadCSS', 
    '../collections/plants',
    "views/components/pagination",
    'text!templates/family.html',
    'text!templates/plant-info.html'
],
function($, _, Backbone, loadCSS, Plants, PaginationView, familyTemplate, plantInfoTemplate){
    var FamilyView = Backbone.View.extend({
        el: 'main',
        template: _.template(familyTemplate),
        collection: new Plants(),
        initialize: function(){
            _.bindAll(this, 'renderPlantResults');
        },
        render: function(){
            loadCSS("/css/plants.css");
            this.$el.html(this.template({
                family: this.collection.family
            }));
        },
        renderPlants: function(){
            this.renderPlantResults();

            var pagination = new PaginationView({
                perPage: 25,
                collection: this.collection,
                $el: this.$('.paginationArea'),
                callBack: this.renderPlantResults,
            });
            pagination.render();
        },
        renderPlantResults: function(){
            var tmpl = _.template(plantInfoTemplate);
            this.$('.results').html(tmpl({
                plants: this.collection.toJSON()
            }));
        }
    });
    return FamilyView;
});