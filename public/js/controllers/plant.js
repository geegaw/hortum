'use strict';
define(["../views/plant"], function(PlantView) {
    var PlantCtrl = function(id){
        this.id = id;
        this.view = new PlantView();
        this.view.model.set({id: id});
        this.plant = null;

        this.init = function(){
            var self = this;
            self.view.model.fetch().then(function(){
                self.plant = self.view.model;
                console.log(self.plant);
                self.view.render();
            });
        }

        this.init();
    }
    return PlantCtrl;
});