'use strict';
define(["jquery", "underscore", 'backbone', 'loadCSS', '../models/plant', 'text!templates/plant.html'],
function($, _, Backbone, loadCSS, Plant, plantTemplate){
    var PlantView = Backbone.View.extend({
        el: 'main',
        template: _.template(plantTemplate),
        model: new Plant(),
        render: function(){
            loadCSS("/css/plant.css");
            this.$el.html(this.template(this.model.toJSON()));
        }
    });
    return PlantView;
});