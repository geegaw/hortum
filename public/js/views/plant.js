'use strict';
define(["jquery", "underscore", 'backbone', '../models/plant', 'text!templates/plant.html'],
function($, _, Backbone, Plant, plantTemplate){
    var PlantView = Backbone.View.extend({
        el: 'main',
        template: _.template(plantTemplate),
        model: new Plant(),
        render: function(){
            this.$el.html(this.template(this.model.toJSON()));
        }
    });
    return PlantView;
});